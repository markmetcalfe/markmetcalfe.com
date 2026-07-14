import type {
  Player,
  RoomPhase,
  RoomState,
  ClientMessage,
  ServerMessage,
} from "./types";
import { COUNTRIES, isCorrectGuess, type Country } from "./countries";
import { containsProfanity } from "../../shared/profanity";

interface Session {
  ws: WebSocket;
  player: Player | null;
}

type AlarmMode = "idle" | "countdown";

interface GameData {
  phase: RoomPhase;
  mode: "multiplayer" | "solo";
  players: Player[];
  roundLength: number;
  timeLeft: number;
  queue: string[];
  guessedCodes: string[];
  currentCode: string;
  revealedIndices: number[];
  targetElapsed: number;
  // Players who have either guessed the current target correctly or
  // explicitly skipped it. Once every connected player is in here, the
  // room advances to the next target.
  donePlayerIds: string[];
  // Whether anyone has solved the current target yet — decides whether
  // advancing should reveal the answer to everyone (nobody got it) or
  // stay quiet (someone already did, and skippers don't get told).
  anyCorrectThisTarget: boolean;
  alarmMode: AlarmMode;
}

const CLUE_INTERVAL_SECONDS = 5;
const CLUE_REVEAL_CAP = 0.6;
const AUTO_ADVANCE_GRACE_SECONDS = 8;
const MIN_ROUND_LENGTH = 60;
const MAX_ROUND_LENGTH = 1200;
const SOLO_ROUND_LENGTH = 120;
const SOLO_TIME_BONUS_SECONDS = 10;
const SOLO_SKIP_PENALTY_SECONDS = 10;

function shuffledCodes(): string[] {
  const codes = COUNTRIES.map(c => c.code);
  for (let i = codes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [codes[i], codes[j]] = [codes[j] as string, codes[i] as string];
  }
  return codes;
}

function countryByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}

function letterCount(name: string): number {
  return name.split("").filter(ch => /[a-zA-Z]/.test(ch)).length;
}

function buildHint(name: string, revealedIndices: number[]): string {
  let letterIndex = -1;
  return name
    .split("")
    .map(ch => {
      if (!/[a-zA-Z]/.test(ch)) {
        return ch;
      }
      letterIndex++;
      return revealedIndices.includes(letterIndex) ? ch : "_";
    })
    .join("");
}

export class GameRoom implements DurableObject {
  private readonly state: DurableObjectState;
  private readonly env: Env;
  private sessions: Map<string, Session>;
  private game: GameData;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
    this.game = this.makeInitialState();
  }

  private makeInitialState(): GameData {
    return {
      phase: "waiting",
      mode: "multiplayer",
      players: [],
      roundLength: 300,
      timeLeft: 0,
      queue: [],
      guessedCodes: [],
      currentCode: "",
      revealedIndices: [],
      targetElapsed: 0,
      donePlayerIds: [],
      anyCorrectThisTarget: false,
      alarmMode: "idle",
    };
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket upgrade", {
        status: 426,
      });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    const playerId = crypto.randomUUID();

    this.sessions.set(playerId, { ws: server, player: null });
    server.accept();

    this.send(server, { type: "you_are", id: playerId });
    this.send(server, { type: "state", state: this.publicState() });

    server.addEventListener("message", event => {
      void (async () => {
        try {
          const msg = JSON.parse(
            event.data as string,
          ) as ClientMessage;
          await this.handleMessage(playerId, msg);
        } catch {
          this.send(server, {
            type: "error",
            message: "Invalid message format",
          });
        }
      })();
    });

    const cleanup = () => this.handleDisconnect(playerId);
    server.addEventListener("close", cleanup);
    server.addEventListener("error", cleanup);

    return new Response(null, { status: 101, webSocket: client });
  }

  async alarm(): Promise<void> {
    if (this.game.alarmMode !== "countdown") {
      return;
    }
    this.game.timeLeft--;
    if (this.game.timeLeft <= 0) {
      this.doEndRound();
      return;
    }
    this.game.targetElapsed++;
    this.maybeRevealOrAdvance();
    this.broadcast({ type: "timer", timeLeft: this.game.timeLeft });
    await this.state.storage.setAlarm(Date.now() + 1000);
  }

  private async handleMessage(
    playerId: string,
    msg: ClientMessage,
  ): Promise<void> {
    const session = this.sessions.get(playerId);
    if (!session) {
      return;
    }

    switch (msg.type) {
      case "join": {
        if (session.player) {
          return;
        }
        let name: string;
        if (msg.solo) {
          // Solo has no lobby and the name is never shown anywhere, so
          // it's assigned here rather than trusting (and validating) a
          // client-supplied one for no reason.
          name = "You";
        } else {
          name = msg.name.trim().slice(0, 24);
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
              message: "Name contains inappropriate language",
            });
            return;
          }
          // The profanity check above yields, so a second "join" for
          // this session may have already gone through while we were
          // awaiting.
          if (session.player) {
            return;
          }
        }
        const isHost = this.game.players.length === 0;
        const player: Player = {
          id: playerId,
          name,
          score: 0,
          isHost,
          correctGuesses: 0,
          skips: 0,
        };
        session.player = player;
        this.game.players.push(player);
        this.broadcast({
          type: "player_joined",
          player,
          players: this.game.players,
        });
        break;
      }

      case "start_game": {
        if (!session.player) {
          return;
        }
        // Solo mode is only honoured for an actual single-player room —
        // a real multiplayer room can't use it to dodge the 2-player
        // minimum below.
        const solo =
          msg.solo === true && this.game.players.length === 1;
        // "Host" is a multiplayer concept (who's allowed to start the
        // game for everyone else). A solo room has no one else to gate
        // against, and host status can otherwise be lost across a
        // reconnect (backgrounded tab, brief network drop) with nothing
        // left to re-elect it -- so solo restarts don't require it.
        if (!solo && !session.player.isHost) {
          this.send(session.ws, {
            type: "error",
            message: "Only the host can start the game",
          });
          return;
        }
        if (!solo && this.game.players.length < 2) {
          this.send(session.ws, {
            type: "error",
            message: "Need at least 2 players to start",
          });
          return;
        }
        if (this.game.phase === "playing") {
          this.send(session.ws, {
            type: "error",
            message: "Game already in progress",
          });
          return;
        }
        const roundLength = solo
          ? SOLO_ROUND_LENGTH
          : Math.min(
              MAX_ROUND_LENGTH,
              Math.max(MIN_ROUND_LENGTH, msg.round_length ?? 300),
            );
        this.doStartGame(roundLength, solo ? "solo" : "multiplayer");
        break;
      }

      case "guess": {
        if (this.game.phase !== "playing" || !session.player) {
          return;
        }
        if (this.game.donePlayerIds.includes(playerId)) {
          return;
        }
        const text = msg.text.trim().slice(0, 100);
        if (!text) {
          return;
        }
        const country = countryByCode(this.game.currentCode);
        if (!country) {
          return;
        }
        const correct = isCorrectGuess(country, text);
        this.send(session.ws, { type: "guess_result", correct });
        if (!correct) {
          return;
        }

        const points = Math.max(
          20,
          100 - 10 * this.game.revealedIndices.length,
        );
        session.player.score += points;
        session.player.correctGuesses++;
        this.game.anyCorrectThisTarget = true;
        if (this.game.mode === "solo") {
          this.game.timeLeft += SOLO_TIME_BONUS_SECONDS;
        }
        if (!this.game.guessedCodes.includes(country.code)) {
          this.game.guessedCodes.push(country.code);
        }
        this.broadcast({
          type: "correct_guess",
          playerId,
          name: session.player.name,
          points,
          code: country.code,
          countryName: country.name,
        });
        this.markPlayerDone(playerId, true);
        break;
      }

      case "skip": {
        if (this.game.phase !== "playing" || !session.player) {
          return;
        }
        if (this.game.donePlayerIds.includes(playerId)) {
          return;
        }
        session.player.skips++;
        if (this.game.mode === "solo") {
          this.game.timeLeft -= SOLO_SKIP_PENALTY_SECONDS;
        }
        this.markPlayerDone(playerId, false);
        break;
      }

      case "submit_score": {
        if (
          this.game.mode !== "solo" ||
          this.game.phase !== "round_end" ||
          !session.player
        ) {
          return;
        }
        const name = msg.name.trim().slice(0, 24);
        if (!name || (await containsProfanity(name))) {
          this.send(session.ws, {
            type: "error",
            message: "Name contains inappropriate language",
          });
          return;
        }
        void this.submitScore(session, name);
        break;
      }
    }
  }

  private async submitScore(
    session: Session,
    name: string,
  ): Promise<void> {
    const stub = this.env.LEADERBOARD.get(
      this.env.LEADERBOARD.idFromName("global"),
    );
    const res = await stub.fetch("http://leaderboard/submit", {
      method: "POST",
      body: JSON.stringify({
        name,
        score: session.player?.score ?? 0,
      }),
    });
    if (res.ok) {
      this.send(session.ws, { type: "score_submitted" });
    } else {
      this.send(session.ws, {
        type: "error",
        message: "Could not submit score",
      });
    }
  }

  // Every connected player must either guess the current target
  // correctly or explicitly skip it before the room advances together.
  private markPlayerDone(playerId: string, correct: boolean): void {
    if (this.game.donePlayerIds.includes(playerId)) {
      return;
    }
    this.game.donePlayerIds.push(playerId);
    this.broadcast({
      type: "player_done",
      playerId,
      correct,
      donePlayerIds: [...this.game.donePlayerIds],
    });
    this.maybeAdvanceIfAllDone();
  }

  private maybeAdvanceIfAllDone(): void {
    if (
      this.game.phase !== "playing" ||
      this.game.players.length === 0
    ) {
      return;
    }
    if (this.game.donePlayerIds.length < this.game.players.length) {
      return;
    }
    if (!this.game.anyCorrectThisTarget) {
      const country = countryByCode(this.game.currentCode);
      if (country) {
        this.broadcast({
          type: "no_guess",
          code: country.code,
          countryName: country.name,
        });
      }
    }
    this.advanceTarget();
  }

  private doStartGame(
    roundLength: number,
    mode: "multiplayer" | "solo",
  ): void {
    this.game.mode = mode;
    this.game.roundLength = roundLength;
    this.game.timeLeft = roundLength;
    this.game.queue = shuffledCodes();
    this.game.guessedCodes = [];
    this.game.players.forEach(p => {
      p.score = 0;
      p.correctGuesses = 0;
      p.skips = 0;
    });
    this.game.phase = "playing";
    this.game.alarmMode = "countdown";
    this.advanceTarget();
    void this.state.storage.setAlarm(Date.now() + 1000);
  }

  private maybeRevealOrAdvance(): void {
    const country = countryByCode(this.game.currentCode);
    if (!country) {
      return;
    }
    if (this.game.targetElapsed % CLUE_INTERVAL_SECONDS === 0) {
      this.revealLetter(country);
    }
    const cap = Math.ceil(
      letterCount(country.name) * CLUE_REVEAL_CAP,
    );
    const autoAdvanceAt =
      cap * CLUE_INTERVAL_SECONDS + AUTO_ADVANCE_GRACE_SECONDS;
    if (this.game.targetElapsed >= autoAdvanceAt) {
      // Safety net: force the room on even if some players never
      // guessed or skipped (e.g. gone AFK), so a stuck player can't
      // block everyone forever.
      if (!this.game.anyCorrectThisTarget) {
        this.broadcast({
          type: "no_guess",
          code: country.code,
          countryName: country.name,
        });
      }
      this.advanceTarget();
    }
  }

  private revealLetter(country: Country): void {
    const total = letterCount(country.name);
    const cap = Math.ceil(total * CLUE_REVEAL_CAP);
    if (this.game.revealedIndices.length >= cap) {
      return;
    }
    const hidden = Array.from({ length: total }, (_, i) => i).filter(
      i => !this.game.revealedIndices.includes(i),
    );
    if (hidden.length === 0) {
      return;
    }
    const idx = hidden[
      Math.floor(Math.random() * hidden.length)
    ] as number;
    this.game.revealedIndices.push(idx);
    this.broadcast({
      type: "hint_update",
      hint: buildHint(country.name, this.game.revealedIndices),
    });
  }

  private advanceTarget(): void {
    const next = this.game.queue.shift();
    if (!next) {
      this.doEndRound();
      return;
    }
    this.game.currentCode = next;
    this.game.revealedIndices = [];
    this.game.targetElapsed = 0;
    this.game.donePlayerIds = [];
    this.game.anyCorrectThisTarget = false;
    const country = countryByCode(next);
    if (!country) {
      this.advanceTarget();
      return;
    }
    this.broadcast({
      type: "target_start",
      code: next,
      hint: buildHint(country.name, []),
      guessedCodes: this.game.guessedCodes,
    });
  }

  // The room stays on the round-end screen indefinitely — it only
  // returns to active play once the host explicitly starts another
  // round (see "start_game" in handleMessage).
  private doEndRound(): void {
    this.game.phase = "round_end";
    this.game.alarmMode = "idle";
    const sorted = [...this.game.players].sort(
      (a, b) => b.score - a.score,
    );
    this.broadcast({
      type: "round_end",
      players: sorted,
      guessedCodes: this.game.guessedCodes,
    });
  }

  private handleDisconnect(playerId: string): void {
    const session = this.sessions.get(playerId);
    if (!session) {
      return;
    }
    this.sessions.delete(playerId);
    if (!session.player) {
      return;
    }

    this.game.players = this.game.players.filter(
      p => p.id !== playerId,
    );
    this.game.donePlayerIds = this.game.donePlayerIds.filter(
      id => id !== playerId,
    );
    if (session.player.isHost && this.game.players.length > 0) {
      (this.game.players[0] as Player).isHost = true;
    }
    this.broadcast({
      type: "player_left",
      playerId,
      players: this.game.players,
    });

    if (this.game.phase === "playing") {
      if (this.game.players.length < 2) {
        this.doEndRound();
      } else {
        // The player who left may have been the last one everyone
        // else was waiting on.
        this.maybeAdvanceIfAllDone();
      }
    }

    if (this.game.players.length === 0) {
      this.game = this.makeInitialState();
    }
  }

  private publicState(): RoomState {
    const country = countryByCode(this.game.currentCode);
    return {
      phase: this.game.phase,
      players: this.game.players,
      roundLength: this.game.roundLength,
      timeLeft: this.game.timeLeft,
      currentHint: country
        ? buildHint(country.name, this.game.revealedIndices)
        : undefined,
      guessedCodes: this.game.guessedCodes,
      donePlayerIds: this.game.donePlayerIds,
    };
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
}
