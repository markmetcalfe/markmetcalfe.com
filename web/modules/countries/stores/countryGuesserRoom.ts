import { defineStore } from "pinia";

export type RoomPhase = "waiting" | "playing" | "round_end";

export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  correctGuesses: number;
  skips: number;
}

interface RoomState {
  phase: RoomPhase;
  players: Player[];
  roundLength: number;
  timeLeft: number;
  currentHint?: string;
  guessedCodes: string[];
  donePlayerIds: string[];
}

type ServerMessage =
  | { type: "you_are"; id: string }
  | { type: "state"; state: RoomState }
  | { type: "player_joined"; player: Player; players: Player[] }
  | { type: "player_left"; playerId: string; players: Player[] }
  | { type: "guess_result"; correct: boolean }
  | {
      type: "correct_guess";
      playerId: string;
      name: string;
      points: number;
      code: string;
      countryName: string;
    }
  | {
      type: "target_start";
      code: string;
      hint: string;
      guessedCodes: string[];
    }
  | { type: "hint_update"; hint: string }
  | { type: "no_guess"; code: string; countryName: string }
  | {
      type: "player_done";
      playerId: string;
      correct: boolean;
      donePlayerIds: string[];
    }
  | { type: "timer"; timeLeft: number }
  | { type: "round_end"; players: Player[]; guessedCodes: string[] }
  | { type: "error"; message: string };

export interface RoomEvent {
  kind: "correct" | "no_guess" | "error";
  text: string;
}

// WebSocket must not be wrapped in Vue reactivity (breaks the object).
let _ws: WebSocket | null = null;

export const useCountryGuesserRoomStore = defineStore(
  "countryGuesserRoom",
  {
    state: () => ({
      myId: "",
      myName: "",
      connected: false,
      phase: "waiting" as RoomPhase,
      players: [] as Player[],
      roundLength: 300,
      timeLeft: 0,
      currentCode: "",
      hint: "",
      guessedCodes: [] as string[],
      donePlayerIds: [] as string[],
      lastGuessCorrect: null as boolean | null,
      events: [] as RoomEvent[],
    }),

    getters: {
      me: state => state.players.find(p => p.id === state.myId),
      isHost: state =>
        state.players.find(p => p.id === state.myId)?.isHost ?? false,
      amIDone: state => state.donePlayerIds.includes(state.myId),
    },

    actions: {
      connect(roomId: string, apiBase: string) {
        this._closeWs();
        const wsBase = apiBase
          ? apiBase.replace(/^http/, "ws")
          : `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`;
        const socket = new WebSocket(
          `${wsBase}/api/countries/ws/${roomId}`,
        );

        socket.addEventListener("message", event => {
          try {
            this._handleMessage(
              JSON.parse(event.data as string) as ServerMessage,
            );
          } catch {
            console.error("Failed to parse WS message");
          }
        });
        socket.addEventListener("open", () => {
          this.connected = true;
        });
        socket.addEventListener("close", () => {
          this.connected = false;
        });
        _ws = socket;
      },

      disconnect() {
        this._closeWs();
        this._resetState();
      },

      send(msg: Record<string, unknown>) {
        if (_ws?.readyState === WebSocket.OPEN) {
          _ws.send(JSON.stringify(msg));
        }
      },

      join(name: string) {
        this.myName = name;
        this.send({ type: "join", name });
      },

      startGame(roundLength: number) {
        this.send({ type: "start_game", round_length: roundLength });
      },

      submitGuess(text: string) {
        this.lastGuessCorrect = null;
        this.send({ type: "guess", text });
      },

      submitSkip() {
        this.send({ type: "skip" });
      },

      _handleMessage(msg: ServerMessage) {
        switch (msg.type) {
          case "you_are":
            this.myId = msg.id;
            if (this.myName) {
              this.send({ type: "join", name: this.myName });
            }
            break;

          case "state":
            this.phase = msg.state.phase;
            this.players = msg.state.players;
            this.roundLength = msg.state.roundLength;
            this.timeLeft = msg.state.timeLeft;
            this.hint = msg.state.currentHint ?? "";
            this.guessedCodes = msg.state.guessedCodes;
            this.donePlayerIds = msg.state.donePlayerIds;
            break;

          case "player_joined":
            this.players = msg.players;
            break;

          case "player_left":
            this.players = msg.players;
            break;

          case "guess_result":
            this.lastGuessCorrect = msg.correct;
            break;

          case "correct_guess": {
            const p = this.players.find(pl => pl.id === msg.playerId);
            if (p) {
              p.score += msg.points;
            }
            if (!this.guessedCodes.includes(msg.code)) {
              this.guessedCodes.push(msg.code);
            }
            this._addEvent({
              kind: "correct",
              text: `${msg.name} guessed ${msg.countryName}! +${msg.points}`,
            });
            break;
          }

          case "player_done":
            this.donePlayerIds = msg.donePlayerIds;
            break;

          case "target_start":
            this.phase = "playing";
            this.currentCode = msg.code;
            this.hint = msg.hint;
            this.guessedCodes = msg.guessedCodes;
            this.donePlayerIds = [];
            break;

          case "hint_update":
            this.hint = msg.hint;
            break;

          case "no_guess":
            this._addEvent({
              kind: "no_guess",
              text: `Nobody guessed ${msg.countryName}`,
            });
            break;

          case "timer":
            this.timeLeft = msg.timeLeft;
            break;

          case "round_end":
            this.phase = "round_end";
            this.players = msg.players;
            this.guessedCodes = msg.guessedCodes;
            this.currentCode = "";
            break;

          case "error":
            this._addEvent({ kind: "error", text: msg.message });
            break;
        }
      },

      _addEvent(event: RoomEvent) {
        this.events.push(event);
        if (this.events.length > 50) {
          this.events.shift();
        }
      },

      _closeWs() {
        _ws?.close();
        _ws = null;
        this.connected = false;
      },

      _resetState() {
        this.myId = "";
        this.phase = "waiting";
        this.players = [];
        this.timeLeft = 0;
        this.currentCode = "";
        this.hint = "";
        this.guessedCodes = [];
        this.donePlayerIds = [];
        this.lastGuessCorrect = null;
        this.events = [];
      },
    },
  },
);
