import { DurableObject } from "cloudflare:workers";
import type { Env } from "../types";
import type {
  GamePhase,
  Player,
  DrawEvent,
  GameState,
  ClientMessage,
  ServerMessage,
} from "./types";
import { WORDS } from "./words";
import {
  containsProfanity,
  censorText,
} from "../../shared/profanity";

interface Session {
  ws: WebSocket;
  player: Player | null;
}

type AlarmMode = "idle" | "countdown" | "post_round";

interface GameData {
  phase: GamePhase;
  players: Player[];
  drawOrder: string[];
  currentDrawerIndex: number;
  currentWord: string;
  wordHint: string;
  roundNumber: number;
  totalRounds: number;
  timeLeft: number;
  drawHistory: DrawEvent[];
  correctGuessers: Set<string>;
  alarmMode: AlarmMode;
  transitionTimer: number;
  roundLength: number;
  suggestedWords: Record<string, string>;
  wordPool: string[];
  wordPoolIndex: number;
}

// See api/countries/src/game-room.ts for why this extends the
// RPC-branded base class instead of just `implements DurableObject`.
export class GameRoom extends DurableObject<Env> {
  private readonly state: DurableObjectState;
  private sessions: Map<string, Session>;
  private game: GameData;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.state = state;
    this.sessions = new Map();
    this.game = this.makeInitialState();
  }

  private makeInitialState(): GameData {
    return {
      phase: "waiting",
      players: [],
      drawOrder: [],
      currentDrawerIndex: 0,
      currentWord: "",
      wordHint: "",
      roundNumber: 0,
      totalRounds: 0,
      timeLeft: 0,
      drawHistory: [],
      correctGuessers: new Set(),
      alarmMode: "idle",
      transitionTimer: 0,
      roundLength: 70,
      suggestedWords: {},
      wordPool: [],
      wordPoolIndex: 0,
    };
  }

  // Called via RPC (see seedRoom() in index.ts) from api/play's
  // LobbyRoom when its host starts a Doodle room -- pre-adds them as
  // the first (host) player, and carries over any words submitted in
  // the lobby, before anyone connects. See GameRoom.seed() in
  // api/countries/src/game-room.ts for why this needs to happen before
  // the host's own WebSocket connects rather than after.
  seed(
    hostId: string,
    hostName: string,
    suggestedWords: Record<string, string>,
  ): void {
    if (this.game.players.length > 0) {
      return;
    }
    const player: Player = {
      id: hostId,
      name: hostName,
      score: 0,
      isHost: true,
    };
    this.game.players.push(player);
    Object.assign(this.game.suggestedWords, suggestedWords);
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket upgrade", {
        status: 426,
      });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    // Purely an internal handle for this socket in `sessions` -- player
    // identity is the client-supplied, localStorage-persisted id carried
    // on every "join" (see the "join" case below), not this.
    const connectionId = crypto.randomUUID();

    this.sessions.set(connectionId, { ws: server, player: null });
    server.accept();

    this.sendFullState(server, connectionId);

    server.addEventListener("message", event => {
      void (async () => {
        try {
          const msg = JSON.parse(
            event.data as string,
          ) as ClientMessage;
          await this.handleMessage(connectionId, msg);
        } catch {
          this.send(server, {
            type: "error",
            message: "Invalid message format",
          });
        }
      })();
    });

    const cleanup = () => this.handleDisconnect(connectionId);
    server.addEventListener("close", cleanup);
    server.addEventListener("error", cleanup);

    return new Response(null, { status: 101, webSocket: client });
  }

  async alarm(): Promise<void> {
    if (this.game.alarmMode === "countdown") {
      // The passive per-second decrement races against however long a
      // Chromatic snapshot takes to reach mid-round -- e.g. the "Doodle
      // Gameplay" snapshot showed 30 or 29 left depending on whether a
      // tick landed before or after it (same class of flakiness as
      // Country Guesser's clue reveal, see `clueIntervalSeconds` in its
      // game-room.ts). No doodle e2e test relies on a round timing out
      // -- both rounds always end via a correct guess -- so the clock
      // (and hint-letter reveal below, tied to the same tick) is frozen
      // entirely under Playwright instead.
      if (this.env.IS_PLAYWRIGHT === "1") {
        return;
      }

      this.game.timeLeft--;

      if (this.game.timeLeft === 60 || this.game.timeLeft === 30) {
        this.revealHintLetter();
      }

      if (this.game.timeLeft <= 0) {
        this.doEndRound();
      } else {
        this.broadcast({
          type: "timer",
          timeLeft: this.game.timeLeft,
        });
        await this.state.storage.setAlarm(Date.now() + 1000);
      }
      return;
    }

    if (this.game.alarmMode === "post_round") {
      this.game.transitionTimer--;
      if (this.game.transitionTimer <= 0) {
        if (this.game.roundNumber >= this.game.totalRounds) {
          this.doEndGame();
        } else {
          this.game.roundNumber++;
          this.game.currentDrawerIndex =
            (this.game.currentDrawerIndex + 1) %
            this.game.drawOrder.length;
          this.game.phase = "drawing";
          this.game.alarmMode = "countdown";
          this.doStartRound();
        }
      } else {
        await this.state.storage.setAlarm(Date.now() + 1000);
      }
    }
  }

  private async handleMessage(
    connectionId: string,
    msg: ClientMessage,
  ): Promise<void> {
    const session = this.sessions.get(connectionId);
    if (!session) {
      return;
    }

    switch (msg.type) {
      case "join": {
        if (session.player) {
          return;
        }

        // Reconnecting -- msg.id is the client's localStorage-persisted
        // id. Reattach to the existing player instead of creating a
        // duplicate; this is also how a host pre-registered by seed()
        // (see below) picks up their real connection.
        const existing = this.game.players.find(p => p.id === msg.id);
        if (existing) {
          for (const [otherId, otherSession] of this.sessions) {
            if (
              otherId !== connectionId &&
              otherSession.player === existing
            ) {
              otherSession.ws.close();
              this.sessions.delete(otherId);
            }
          }
          session.player = existing;
          this.broadcast({
            type: "player_joined",
            player: existing,
            players: this.game.players,
          });
          this.updateRoomListing();
          break;
        }

        const name = msg.name.trim().slice(0, 24);
        if (!name) {
          this.send(session.ws, {
            type: "error",
            message: "Name cannot be empty",
          });
          return;
        }
        if (await containsProfanity(name)) {
          this.send(session.ws, {
            type: "error",
            message: "This name cannot be used",
          });
          return;
        }
        // The profanity check above yields, so a second "join" for this
        // session may have already gone through while we were awaiting.
        if (session.player) {
          return;
        }
        const isHost = this.game.players.length === 0;
        const player: Player = {
          id: msg.id,
          name,
          score: 0,
          isHost,
        };
        session.player = player;
        this.game.players.push(player);
        this.broadcast({
          type: "player_joined",
          player,
          players: this.game.players,
        });
        this.updateRoomListing();
        break;
      }

      case "start_game": {
        if (!session.player?.isHost) {
          this.send(session.ws, {
            type: "error",
            message: "Only the host can start the game",
          });
          return;
        }
        if (this.game.players.length < 2) {
          this.send(session.ws, {
            type: "error",
            message: "Need at least 2 players to start",
          });
          return;
        }
        if (this.game.phase !== "waiting") {
          this.send(session.ws, {
            type: "error",
            message: "Game already in progress",
          });
          return;
        }
        this.doStartGame(msg.round_length);
        break;
      }

      case "draw": {
        if (this.game.phase !== "drawing") {
          return;
        }
        if (
          !session.player ||
          session.player.id !== this.currentDrawerId()
        ) {
          return;
        }
        const { event } = msg;
        if (event.kind === "clear") {
          this.game.drawHistory = [];
        } else {
          this.game.drawHistory.push(event);
          if (this.game.drawHistory.length > 2000) {
            this.game.drawHistory =
              this.game.drawHistory.slice(-1600);
          }
        }
        this.broadcast({ type: "draw", event }, connectionId);
        break;
      }

      case "guess": {
        if (this.game.phase !== "drawing") {
          return;
        }
        if (!session.player) {
          return;
        }
        const playerId = session.player.id;
        if (playerId === this.currentDrawerId()) {
          return;
        }
        if (this.game.correctGuessers.has(playerId)) {
          return;
        }

        const text = msg.text.trim().slice(0, 100);
        if (!text) {
          return;
        }

        const isCorrect =
          text.toLowerCase() === this.game.currentWord.toLowerCase();
        if (isCorrect) {
          this.game.correctGuessers.add(playerId);
          const points = Math.max(
            50,
            Math.floor(this.game.timeLeft * 2),
          );
          session.player.score += points;

          const drawerSession = this.findSessionByPlayerId(
            this.currentDrawerId(),
          );
          if (drawerSession?.player) {
            drawerSession.player.score += 25;
          }

          this.broadcast({
            type: "correct_guess",
            playerId,
            name: session.player.name,
            points,
          });

          const remaining = this.game.players.filter(
            p =>
              p.id !== this.currentDrawerId() &&
              !this.game.correctGuessers.has(p.id),
          );
          if (remaining.length === 0) {
            this.doEndRound();
          }
        } else {
          this.broadcast({
            type: "chat",
            playerId,
            name: session.player.name,
            text: await censorText(
              text,
              this.env.IS_PLAYWRIGHT === "1",
            ),
          });
        }
        break;
      }

      case "chat": {
        if (!session.player) {
          return;
        }
        const text = msg.text.trim().slice(0, 100);
        if (!text) {
          return;
        }
        this.broadcast({
          type: "chat",
          playerId: session.player.id,
          name: session.player.name,
          text: await censorText(
            text,
            this.env.IS_PLAYWRIGHT === "1",
          ),
        });
        break;
      }

      case "suggest_word": {
        if (!session.player) {
          return;
        }
        const playerId = session.player.id;
        if (this.game.phase !== "waiting") {
          this.send(session.ws, {
            type: "error",
            message: "Can only suggest a word before the game starts",
          });
          return;
        }
        if (this.game.suggestedWords[playerId]) {
          this.send(session.ws, {
            type: "error",
            message: "You have already suggested a word",
          });
          return;
        }
        const word = msg.word.trim().slice(0, 15);
        if (word.length < 3) {
          this.send(session.ws, {
            type: "error",
            message: "Word must be at least 3 characters",
          });
          return;
        }
        if (await containsProfanity(word)) {
          this.send(session.ws, {
            type: "error",
            message: "Word contains inappropriate language",
          });
          return;
        }
        // The profanity check above yields, so this player may have
        // already suggested a word while we were awaiting.
        if (this.game.suggestedWords[playerId]) {
          return;
        }
        this.game.suggestedWords[playerId] = word;
        this.broadcast({ type: "word_suggested", playerId });
        break;
      }
    }
  }

  private doStartGame(roundLength?: number): void {
    this.game.roundLength = roundLength ?? 70;
    this.game.drawOrder = this.game.players.map(p => p.id);
    this.game.currentDrawerIndex = 0;
    this.game.totalRounds = this.game.drawOrder.length;
    this.game.roundNumber = 1;
    this.game.players.forEach(p => {
      p.score = 0;
    });
    this.game.phase = "drawing";
    this.game.alarmMode = "countdown";
    // Each player draws the word they suggested; fall back to a random word if they didn't suggest one
    this.game.wordPool = this.game.drawOrder.map(
      playerId =>
        this.game.suggestedWords[playerId] ??
        (WORDS[Math.floor(Math.random() * WORDS.length)] as string),
    );
    this.game.wordPoolIndex = 0;
    this.doStartRound();
  }

  private doStartRound(): void {
    const word =
      this.game.wordPoolIndex < this.game.wordPool.length
        ? (this.game.wordPool[this.game.wordPoolIndex++] as string)
        : (WORDS[Math.floor(Math.random() * WORDS.length)] as string);
    this.game.currentWord = word;
    this.game.wordHint = word.replace(/[^ ]/g, "_");
    this.game.timeLeft = this.game.roundLength;
    this.game.drawHistory = [];
    this.game.correctGuessers = new Set();

    const drawerId = this.currentDrawerId();
    const drawer = this.game.players.find(p => p.id === drawerId)!;

    this.broadcast({
      type: "round_start",
      drawer,
      hint: this.game.wordHint,
      timeLeft: this.game.timeLeft,
      round: this.game.roundNumber,
      totalRounds: this.game.totalRounds,
    });

    const drawerSession = this.findSessionByPlayerId(drawerId);
    if (drawerSession) {
      this.send(drawerSession.ws, {
        type: "your_word",
        word: this.game.currentWord,
      });
    }

    void this.state.storage.setAlarm(Date.now() + 1000);
  }

  private doEndRound(): void {
    this.game.phase = "round_end";
    this.game.alarmMode = "post_round";
    this.game.transitionTimer = 5;
    this.broadcast({
      type: "round_end",
      word: this.game.currentWord,
      players: [...this.game.players],
    });
    void this.state.storage.setAlarm(Date.now() + 1000);
  }

  private doSkipRound(): void {
    if (this.game.players.length === 0) {
      return;
    }
    if (this.game.roundNumber >= this.game.totalRounds) {
      this.doEndGame();
      return;
    }
    this.game.roundNumber++;
    this.game.currentDrawerIndex =
      (this.game.currentDrawerIndex + 1) % this.game.drawOrder.length;
    this.game.phase = "drawing";
    this.game.alarmMode = "countdown";
    this.doStartRound();
  }

  // The room stays on the game-over screen indefinitely -- players leave
  // via "Back to Lobby" (see web/modules/doodle/components/GameResult.vue)
  // rather than the room resetting itself back to "waiting" in place.
  private doEndGame(): void {
    this.game.phase = "game_end";
    this.game.alarmMode = "idle";
    const sorted = [...this.game.players].sort(
      (a, b) => b.score - a.score,
    );
    this.broadcast({ type: "game_end", players: sorted });
  }

  private revealHintLetter(): void {
    const word = this.game.currentWord;
    const hint = this.game.wordHint.split("");
    const hidden = hint
      .map((c, i) => (c === "_" ? i : -1))
      .filter(i => i !== -1);
    if (hidden.length === 0) {
      return;
    }
    const idx = hidden[
      Math.floor(Math.random() * hidden.length)
    ] as number;
    hint[idx] = word[idx] as string;
    this.game.wordHint = hint.join("");
    this.broadcast({ type: "hint_update", hint: this.game.wordHint });
  }

  private handleDisconnect(connectionId: string): void {
    const session = this.sessions.get(connectionId);
    if (!session) {
      return;
    }
    this.sessions.delete(connectionId);
    if (!session.player) {
      return;
    }
    const playerId = session.player.id;

    this.game.players = this.game.players.filter(
      p => p.id !== playerId,
    );
    if (session.player.isHost && this.game.players.length > 0) {
      (this.game.players[0] as Player).isHost = true;
    }
    this.broadcast({
      type: "player_left",
      playerId,
      players: this.game.players,
    });

    if (this.game.phase === "drawing") {
      if (this.game.players.length < 2) {
        this.doEndGame();
      } else if (playerId === this.currentDrawerId()) {
        this.doSkipRound();
      }
    }

    if (this.game.players.length === 0) {
      this.game = this.makeInitialState();
    }

    this.updateRoomListing();
  }

  private currentDrawerId(): string {
    return this.game.drawOrder[this.game.currentDrawerIndex] ?? "";
  }

  private findSessionByPlayerId(
    playerId: string,
  ): Session | undefined {
    for (const session of this.sessions.values()) {
      if (session.player?.id === playerId) {
        return session;
      }
    }
    return undefined;
  }

  private sendFullState(ws: WebSocket, forPlayerId: string): void {
    const state: GameState = {
      phase: this.game.phase,
      players: this.game.players,
      currentDrawerId: this.currentDrawerId() || undefined,
      wordHint: this.game.wordHint || undefined,
      roundNumber: this.game.roundNumber,
      totalRounds: this.game.totalRounds,
      timeLeft: this.game.timeLeft,
      drawHistory: this.game.drawHistory,
      suggestedWordPlayerIds: Object.keys(this.game.suggestedWords),
    };
    this.send(ws, { type: "state", state });
    if (
      this.game.phase === "drawing" &&
      forPlayerId === this.currentDrawerId()
    ) {
      this.send(ws, {
        type: "your_word",
        word: this.game.currentWord,
      });
    }
  }

  private send(ws: WebSocket, msg: ServerMessage): void {
    try {
      ws.send(JSON.stringify(msg));
    } catch {
      /* connection closed */
    }
  }

  private broadcast(msg: ServerMessage, excludeId?: string): void {
    for (const [id, session] of this.sessions) {
      if (id !== excludeId && session.player) {
        this.send(session.ws, msg);
      }
    }
  }

  private updateRoomListing(): void {
    if (!this.env.ROOM_LIST) {
      return;
    }
    void this.env.ROOM_LIST.put(
      `room:${this.state.id.toString()}`,
      JSON.stringify({
        playerCount: this.game.players.length,
        phase: this.game.phase,
      }),
      { expirationTtl: 3600 },
    );
  }
}
