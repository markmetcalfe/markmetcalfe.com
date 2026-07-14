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
  | { type: "score_submitted" }
  | { type: "error"; message: string };

export interface RoomEvent {
  kind: "correct" | "no_guess" | "error";
  text: string;
}

// Mirrors the server's SOLO_TIME_BONUS_SECONDS / SOLO_SKIP_PENALTY_SECONDS
// (api/countries/src/game-room.ts) purely so the timer can be nudged
// optimistically -- the server's next per-second "timer" broadcast is
// still what actually corrects/confirms it.
const SOLO_TIME_BONUS_SECONDS = 10;
const SOLO_SKIP_PENALTY_SECONDS = 10;

// WebSocket must not be wrapped in Vue reactivity (breaks the object).
let _ws: WebSocket | null = null;

// Connection details kept outside store state (like `_ws`) purely so
// reconnect logic can re-dial without the caller passing them again.
let _roomId: string | null = null;
let _apiBase = "";
let _manualDisconnect = true;
let _reconnectTimer: ReturnType<typeof setTimeout> | null = null;
const RECONNECT_DELAY_MS = 1500;

// Mobile browsers (iOS Safari in particular) frequently suspend or drop
// WebSocket connections when the tab is backgrounded or the screen locks
// -- e.g. the host switching apps to paste the room link into a messaging
// app. Without reconnecting, that client silently stops receiving further
// broadcasts (including other players joining) until a manual reload.
let _visibilityHandler: (() => void) | null = null;
let _pageshowHandler: (() => void) | null = null;

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
      scoreSubmitted: false,
      scoreSubmitError: "",
      soloMode: false,
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
        _roomId = roomId;
        _apiBase = apiBase;
        _manualDisconnect = false;
        this._dial();

        if (!_visibilityHandler) {
          _visibilityHandler = () => {
            if (
              document.visibilityState === "visible" &&
              !_manualDisconnect &&
              _ws?.readyState !== WebSocket.OPEN &&
              _ws?.readyState !== WebSocket.CONNECTING
            ) {
              this._dial();
            }
          };
          document.addEventListener(
            "visibilitychange",
            _visibilityHandler,
          );
        }
        if (!_pageshowHandler) {
          _pageshowHandler = () => _visibilityHandler?.();
          window.addEventListener("pageshow", _pageshowHandler);
        }
      },

      _dial() {
        if (!_roomId) {
          return;
        }
        if (_reconnectTimer) {
          clearTimeout(_reconnectTimer);
          _reconnectTimer = null;
        }
        const wsBase = _apiBase
          ? _apiBase.replace(/^http/, "ws")
          : `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`;
        const socket = new WebSocket(
          `${wsBase}/api/countries/ws/${_roomId}`,
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
          if (!_manualDisconnect && !_reconnectTimer) {
            _reconnectTimer = setTimeout(() => {
              _reconnectTimer = null;
              this._dial();
            }, RECONNECT_DELAY_MS);
          }
        });
        _ws = socket;
      },

      disconnect() {
        _manualDisconnect = true;
        if (_visibilityHandler) {
          document.removeEventListener(
            "visibilitychange",
            _visibilityHandler,
          );
          _visibilityHandler = null;
        }
        if (_pageshowHandler) {
          window.removeEventListener("pageshow", _pageshowHandler);
          _pageshowHandler = null;
        }
        if (_reconnectTimer) {
          clearTimeout(_reconnectTimer);
          _reconnectTimer = null;
        }
        _roomId = null;
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

      startGame(roundLength: number, solo = false) {
        this.soloMode = solo;
        this.send({
          type: "start_game",
          round_length: roundLength,
          solo,
        });
      },

      submitGuess(text: string) {
        this.lastGuessCorrect = null;
        this.send({ type: "guess", text });
      },

      submitSkip() {
        // Optimistic -- the server applies the same penalty immediately
        // too, but its next per-second "timer" broadcast is what actually
        // confirms/corrects this value.
        if (this.soloMode) {
          this.timeLeft = Math.max(
            0,
            this.timeLeft - SOLO_SKIP_PENALTY_SECONDS,
          );
        }
        this.send({ type: "skip" });
      },

      submitScore(name: string) {
        this.scoreSubmitted = false;
        this.scoreSubmitError = "";
        this.send({ type: "submit_score", name });
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
            // Optimistic, same as the skip penalty above -- corrected by
            // the next "timer" broadcast regardless.
            if (msg.correct && this.soloMode) {
              this.timeLeft += SOLO_TIME_BONUS_SECONDS;
            }
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
            this.lastGuessCorrect = null;
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
            this.scoreSubmitted = false;
            this.scoreSubmitError = "";
            break;

          case "score_submitted":
            this.scoreSubmitted = true;
            break;

          case "error":
            this.scoreSubmitError = msg.message;
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
        this.scoreSubmitted = false;
        this.scoreSubmitError = "";
        this.soloMode = false;
      },
    },
  },
);
