import { defineStore } from "pinia";

// ── Types ─────────────────────────────────────────────────────────────────────

export type GamePhase = "waiting" | "drawing" | "round_end" | "game_end";

export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
}

export type DrawEvent =
  | { kind: "begin"; x: number; y: number; color: string; size: number }
  | { kind: "move"; x: number; y: number }
  | { kind: "end" }
  | { kind: "clear" };

export interface DoodleMessage {
  type: "chat" | "system" | "correct";
  name?: string;
  text: string;
}

type ServerMessage =
  | { type: "you_are"; id: string }
  | { type: "state"; state: StatePayload }
  | { type: "player_joined"; player: Player; players: Player[] }
  | { type: "player_left"; playerId: string; players: Player[] }
  | { type: "draw"; event: DrawEvent }
  | { type: "chat"; playerId: string; name: string; text: string }
  | { type: "correct_guess"; playerId: string; name: string; points: number }
  | {
      type: "round_start";
      drawer: Player;
      hint: string;
      timeLeft: number;
      round: number;
      totalRounds: number;
    }
  | { type: "round_end"; word: string; players: Player[] }
  | { type: "game_end"; players: Player[] }
  | { type: "timer"; timeLeft: number }
  | { type: "hint_update"; hint: string }
  | { type: "your_word"; word: string }
  | { type: "word_suggested"; playerId: string }
  | { type: "error"; message: string };

interface StatePayload {
  phase: GamePhase;
  players: Player[];
  currentDrawerId?: string;
  wordHint?: string;
  roundNumber: number;
  totalRounds: number;
  timeLeft: number;
  drawHistory: DrawEvent[];
  suggestedWordPlayerIds: string[];
}

// ── Module-level non-reactive singletons ─────────────────────────────────────
// WebSocket must not be wrapped in Vue reactivity (breaks the object).
// Canvas callbacks are DOM-side and don't need to be reactive either.

let _ws: WebSocket | null = null;
let _onDraw: ((event: DrawEvent) => void) | null = null;
let _onReset: ((history: DrawEvent[]) => void) | null = null;

// ── Store ─────────────────────────────────────────────────────────────────────

export const useDoodleStore = defineStore("doodle", {
  state: () => ({
    myId: "",
    myName: "",
    myWord: "",
    connected: false,
    phase: "waiting" as GamePhase,
    players: [] as Player[],
    currentDrawerId: "",
    wordHint: "",
    roundNumber: 0,
    totalRounds: 0,
    timeLeft: 0,
    drawHistory: [] as DrawEvent[],
    correctGuessers: [] as string[],
    suggestedWordPlayerIds: [] as string[],
    messages: [] as DoodleMessage[],
    drawColor: "#000000",
    drawSize: 3,
    roundLength: 70,
  }),

  getters: {
    amIDrawing: state => state.phase === "drawing" && state.currentDrawerId === state.myId,
    me: state => state.players.find(p => p.id === state.myId),
    isHost: state => state.players.find(p => p.id === state.myId)?.isHost ?? false,
    formattedHint: state => state.wordHint.split("").join(" "),
    iHaveSubmittedWord: state => state.suggestedWordPlayerIds.includes(state.myId),
  },

  actions: {
    // Called by DoodleCanvas on mount/unmount to wire up direct canvas callbacks
    registerCanvasCallbacks(
      drawCb: (event: DrawEvent) => void,
      resetCb: (history: DrawEvent[]) => void,
    ) {
      _onDraw = drawCb;
      _onReset = resetCb;
    },

    unregisterCanvasCallbacks() {
      _onDraw = null;
      _onReset = null;
    },

    connect(roomId: string, apiBase: string) {
      this._closeWs();
      const wsBase = apiBase
        ? apiBase.replace(/^http/, "ws")
        : `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`;
      const socket = new WebSocket(`${wsBase}/api/doodle/ws/${roomId}`);

      socket.addEventListener("message", event => {
        try {
          this._handleMessage(JSON.parse(event.data as string) as ServerMessage);
        } catch {
          console.error("Failed to parse WS message");
        }
      });
      socket.addEventListener("open", () => {
        this.connected = true;
      });
      socket.addEventListener("close", () => {
        this.connected = false;
        this._addMessage({ type: "system", text: "Disconnected. Refresh to reconnect." });
      });
      socket.addEventListener("error", () => {
        this._addMessage({ type: "system", text: "Connection error." });
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

    sendDraw(event: DrawEvent) {
      this.send({ type: "draw", event });
    },

    clearCanvas() {
      this.drawHistory = [];
      _onReset?.([]);
      this.send({ type: "draw", event: { kind: "clear" } as DrawEvent });
    },

    startGame() {
      this.send({ type: "start_game", round_length: this.roundLength });
    },

    suggestWord(word: string) {
      this.send({ type: "suggest_word", word });
    },

    sendGuessOrChat(text: string) {
      if (!text.trim()) {
        return;
      }
      if (this.phase === "drawing" && this.currentDrawerId !== this.myId) {
        this.send({ type: "guess", text: text.trim() });
      } else {
        this.send({ type: "chat", text: text.trim() });
      }
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
          this.currentDrawerId = msg.state.currentDrawerId ?? "";
          this.wordHint = msg.state.wordHint ?? "";
          this.roundNumber = msg.state.roundNumber;
          this.totalRounds = msg.state.totalRounds;
          this.timeLeft = msg.state.timeLeft;
          this.drawHistory = msg.state.drawHistory;
          this.suggestedWordPlayerIds = msg.state.suggestedWordPlayerIds ?? [];
          this.correctGuessers = [];
          this.myWord = "";
          _onReset?.(this.drawHistory);
          break;

        case "player_joined":
          this.players = msg.players;
          this._addMessage({ type: "system", text: `${msg.player.name} joined` });
          break;

        case "player_left":
          this.players = msg.players;
          this._addMessage({ type: "system", text: "A player left" });
          break;

        case "draw":
          _onDraw?.(msg.event);
          if (msg.event.kind !== "end") {
            this.drawHistory.push(msg.event);
          }
          break;

        case "timer":
          this.timeLeft = msg.timeLeft;
          break;

        case "hint_update":
          this.wordHint = msg.hint;
          break;

        case "chat":
          this._addMessage({ type: "chat", name: msg.name, text: msg.text });
          break;

        case "correct_guess": {
          this.correctGuessers.push(msg.playerId);
          const p = this.players.find(pl => pl.id === msg.playerId);
          if (p) {
            p.score += msg.points;
          }
          this._addMessage({ type: "correct", text: `${msg.name} guessed it! +${msg.points}` });
          break;
        }

        case "round_start":
          this.phase = "drawing";
          this.currentDrawerId = msg.drawer.id;
          this.wordHint = msg.hint;
          this.timeLeft = msg.timeLeft;
          this.roundNumber = msg.round;
          this.totalRounds = msg.totalRounds;
          this.drawHistory = [];
          this.correctGuessers = [];
          this.myWord = "";
          _onReset?.([]);
          this._addMessage({ type: "system", text: `${msg.drawer.name} is drawing!` });
          break;

        case "your_word":
          this.myWord = msg.word;
          this._addMessage({ type: "system", text: `Your word: "${msg.word}"` });
          break;

        case "word_suggested":
          if (!this.suggestedWordPlayerIds.includes(msg.playerId)) {
            this.suggestedWordPlayerIds.push(msg.playerId);
          }
          break;

        case "round_end":
          this.phase = "round_end";
          this.players = msg.players;
          this.wordHint = msg.word;
          break;

        case "game_end":
          this.phase = "game_end";
          this.players = msg.players;
          break;

        case "error":
          this._addMessage({ type: "system", text: `Error: ${msg.message}` });
          break;
      }
    },

    _addMessage(msg: DoodleMessage) {
      this.messages.push(msg);
      if (this.messages.length > 200) {
        this.messages.shift();
      }
    },

    _closeWs() {
      _ws?.close();
      _ws = null;
      this.connected = false;
    },

    _resetState() {
      this.myId = "";
      this.myWord = "";
      this.phase = "waiting";
      this.players = [];
      this.currentDrawerId = "";
      this.wordHint = "";
      this.roundNumber = 0;
      this.totalRounds = 0;
      this.timeLeft = 0;
      this.drawHistory = [];
      this.correctGuessers = [];
      this.suggestedWordPlayerIds = [];
      this.messages = [];
    },
  },
});
