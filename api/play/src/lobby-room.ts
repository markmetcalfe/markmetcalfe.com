import type { Env } from "../types";
import type {
  Player,
  LobbyState,
  Game,
  CountryOrder,
  ClientMessage,
  ServerMessage,
} from "./types";
import { containsProfanity } from "../../shared/profanity";

interface Session {
  ws: WebSocket;
  player: Player | null;
}

interface LobbyData {
  players: Player[];
  selectedGame: Game;
  roundLength: number;
  countryOrder: CountryOrder;
  doodleSuggestedWords: Record<string, string>;
  // Non-null once the host starts a game -- doubles as the guard
  // against a host double-clicking "Start" before the seed RPC (and
  // the game_starting broadcast it gates) has completed, and as what a
  // (re)connecting client uses to know a game's already under way
  // instead of showing the lobby. Cleared by "return_to_lobby".
  startedGame: Game | null;
}

const VALID_COUNTRY_ORDERS: CountryOrder[] = [
  "random",
  "alphabetical",
  "population",
  "size",
];
const MIN_ROUND_LENGTH = 30;
const MAX_ROUND_LENGTH = 1200;
const DEFAULT_ROUND_LENGTH = 300;

// See api/countries/src/game-room.ts, which this lobby's disconnect
// handling is ported from -- same reasoning applies here.
const KEEPALIVE_INTERVAL_SECONDS = 25;
const GRACE_PERIOD_MS = 5000;
const PLAYWRIGHT_GRACE_PERIOD_MS = 0;

export class LobbyRoom implements DurableObject {
  private readonly state: DurableObjectState;
  private readonly env: Env;
  private sessions: Map<string, Session>;
  private lobby: LobbyData;
  // The short room code from the URL (e.g. "abc123") -- distinct from
  // `state.id`, which is this DO's own internal identifier and can't be
  // turned back into that code. Needed so seedRoom() below can address
  // the *same* room in the target game's Worker.
  private roomId = "";

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
    this.lobby = this.makeInitialState();
  }

  private get gracePeriodMs(): number {
    return this.env.IS_PLAYWRIGHT === "1"
      ? PLAYWRIGHT_GRACE_PERIOD_MS
      : GRACE_PERIOD_MS;
  }

  private makeInitialState(): LobbyData {
    return {
      players: [],
      selectedGame: "countries",
      roundLength: DEFAULT_ROUND_LENGTH,
      countryOrder: "random",
      doodleSuggestedWords: {},
      startedGame: null,
    };
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket upgrade", {
        status: 426,
      });
    }
    this.roomId = new URL(request.url).pathname.slice(
      "/api/play/ws/".length,
    );

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    const connectionId = crypto.randomUUID();

    this.sessions.set(connectionId, { ws: server, player: null });
    server.accept();

    this.send(server, { type: "state", state: this.publicState() });
    this.scheduleIdleAlarm();

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
    this.sweepDisconnectedPlayers();
    if (
      this.sessions.size > 0 ||
      this.lobby.players.some(p => p.disconnectedAt !== null)
    ) {
      if (this.sessions.size > 0) {
        this.broadcast({ type: "ping" });
      }
      this.scheduleIdleAlarm();
    }
  }

  private scheduleIdleAlarm(): void {
    const now = Date.now();
    let delayMs = KEEPALIVE_INTERVAL_SECONDS * 1000;
    for (const p of this.lobby.players) {
      if (p.disconnectedAt !== null) {
        delayMs = Math.min(
          delayMs,
          Math.max(p.disconnectedAt + this.gracePeriodMs - now, 0),
        );
      }
    }
    void this.state.storage.setAlarm(now + delayMs);
  }

  private sweepDisconnectedPlayers(): void {
    const now = Date.now();
    const remaining = this.lobby.players.filter(
      p =>
        p.disconnectedAt === null ||
        now - p.disconnectedAt < this.gracePeriodMs,
    );
    if (remaining.length === this.lobby.players.length) {
      return;
    }
    const removed = this.lobby.players.filter(
      p => !remaining.includes(p),
    );
    this.lobby.players = remaining;
    if (
      removed.some(p => p.isHost) &&
      remaining.length > 0 &&
      !remaining.some(p => p.isHost)
    ) {
      (remaining[0] as Player).isHost = true;
    }
    for (const player of removed) {
      this.broadcast({
        type: "player_left",
        playerId: player.id,
        players: remaining,
      });
    }
    if (remaining.length === 0) {
      this.lobby = this.makeInitialState();
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

        const existing = this.lobby.players.find(
          p => p.id === msg.id,
        );
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
          existing.disconnectedAt = null;
          session.player = existing;
          this.broadcast({
            type: "player_joined",
            player: existing,
            players: this.lobby.players,
          });
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
        if (session.player) {
          return;
        }
        const isHost = this.lobby.players.length === 0;
        const player: Player = {
          id: msg.id,
          name,
          isHost,
          disconnectedAt: null,
        };
        session.player = player;
        this.lobby.players.push(player);
        this.broadcast({
          type: "player_joined",
          player,
          players: this.lobby.players,
        });
        break;
      }

      case "select_game": {
        if (!session.player?.isHost) {
          return;
        }
        this.lobby.selectedGame = msg.game;
        this.broadcast({ type: "game_selected", game: msg.game });
        break;
      }

      case "update_settings": {
        if (!session.player?.isHost) {
          return;
        }
        this.lobby.roundLength = Math.min(
          MAX_ROUND_LENGTH,
          Math.max(MIN_ROUND_LENGTH, msg.round_length),
        );
        this.lobby.countryOrder = VALID_COUNTRY_ORDERS.includes(
          msg.country_order,
        )
          ? msg.country_order
          : "random";
        this.broadcast({
          type: "settings_update",
          round_length: this.lobby.roundLength,
          country_order: this.lobby.countryOrder,
        });
        break;
      }

      case "submit_word": {
        if (!session.player) {
          return;
        }
        if (this.lobby.doodleSuggestedWords[session.player.id]) {
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
        if (this.lobby.doodleSuggestedWords[session.player.id]) {
          return;
        }
        this.lobby.doodleSuggestedWords[session.player.id] = word;
        this.broadcast({
          type: "word_submitted",
          playerId: session.player.id,
        });
        break;
      }

      case "start_game": {
        if (!session.player?.isHost || this.lobby.startedGame) {
          return;
        }
        const solo = this.lobby.players.length < 2;
        if (this.lobby.selectedGame === "doodle" && solo) {
          this.send(session.ws, {
            type: "error",
            message: "Need at least 2 players to start",
          });
          return;
        }
        // Set before the seed RPC (not after) so a second "start_game"
        // arriving while it's in flight is rejected by the guard above
        // rather than double-seeding.
        this.lobby.startedGame = this.lobby.selectedGame;
        try {
          if (this.lobby.selectedGame === "countries") {
            await this.env.COUNTRIES.seedRoom({
              roomId: this.roomId,
              hostId: session.player.id,
              hostName: session.player.name,
            });
          } else {
            await this.env.DOODLE.seedRoom({
              roomId: this.roomId,
              hostId: session.player.id,
              hostName: session.player.name,
              suggestedWords: this.lobby.doodleSuggestedWords,
            });
          }
        } catch {
          this.lobby.startedGame = null;
          this.send(session.ws, {
            type: "error",
            message: "Could not start the game, try again",
          });
          return;
        }
        this.broadcast({
          type: "game_starting",
          game: this.lobby.selectedGame,
        });
        break;
      }

      // Any connected player can send everyone back to the lobby --
      // lower-stakes than starting a game, so unlike "start_game" this
      // isn't restricted to the host.
      case "return_to_lobby": {
        if (!session.player || !this.lobby.startedGame) {
          return;
        }
        this.lobby.startedGame = null;
        this.broadcast({ type: "returned_to_lobby" });
        break;
      }
    }
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
    session.player.disconnectedAt = Date.now();
    this.broadcast({
      type: "player_disconnected",
      playerId: session.player.id,
      players: this.lobby.players,
    });
    this.sweepDisconnectedPlayers();
    this.scheduleIdleAlarm();
  }

  private publicState(): LobbyState {
    return {
      players: this.lobby.players,
      selectedGame: this.lobby.selectedGame,
      roundLength: this.lobby.roundLength,
      countryOrder: this.lobby.countryOrder,
      doodleSubmittedWordPlayerIds: Object.keys(
        this.lobby.doodleSuggestedWords,
      ),
      startedGame: this.lobby.startedGame,
    };
  }

  private send(ws: WebSocket, msg: ServerMessage): void {
    try {
      ws.send(JSON.stringify(msg));
    } catch {
      /* connection closed */
    }
  }

  private broadcast(msg: ServerMessage): void {
    for (const session of this.sessions.values()) {
      if (session.player) {
        this.send(session.ws, msg);
      }
    }
  }
}
