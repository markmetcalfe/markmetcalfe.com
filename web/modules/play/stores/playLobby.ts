import { defineStore } from "pinia";
import {
  getPersistentPlayerId,
  setPersistentPlayerName,
} from "../composables/usePersistentPlayer";

export type Game = "countries" | "doodle";

export type CountryOrder =
  | "random"
  | "alphabetical"
  | "population"
  | "size";

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  disconnectedAt: number | null;
}

interface LobbyState {
  players: Player[];
  selectedGame: Game;
  roundLength: number;
  countryOrder: CountryOrder;
  doodleSubmittedWordPlayerIds: string[];
  startedGame: Game | null;
}

type ServerMessage =
  | { type: "state"; state: LobbyState }
  | { type: "player_joined"; player: Player; players: Player[] }
  | { type: "player_left"; playerId: string; players: Player[] }
  | {
      type: "player_disconnected";
      playerId: string;
      players: Player[];
    }
  | { type: "game_selected"; game: Game }
  | {
      type: "settings_update";
      round_length: number;
      country_order: CountryOrder;
    }
  | { type: "word_submitted"; playerId: string }
  | { type: "game_starting"; game: Game }
  | { type: "returned_to_lobby" }
  | { type: "error"; message: string }
  | { type: "ping" };

// WebSocket must not be wrapped in Vue reactivity (breaks the object).
let _ws: WebSocket | null = null;

// Tracks the in-flight name-prompt "join" so its "player_joined"/"error"
// response can be routed back to the caller -- see countryGuesserRoom.ts,
// which this connect/reconnect handling is ported from.
let _joinResolver: {
  resolve: () => void;
  reject: (message: string) => void;
} | null = null;

// Same idea, for the in-flight "submit_word" -- lets DoodleSettings show
// a rejected word's error right under the submit box instead of it
// landing in the page-wide errorMessage banner.
let _wordResolver: {
  resolve: () => void;
  reject: (message: string) => void;
} | null = null;

let _roomId: string | null = null;
let _apiBase = "";
let _manualDisconnect = true;
let _reconnectTimer: ReturnType<typeof setTimeout> | null = null;
const RECONNECT_DELAY_MS = 1500;

let _visibilityHandler: (() => void) | null = null;
let _pageshowHandler: (() => void) | null = null;

export const usePlayLobbyStore = defineStore("playLobby", {
  state: () => ({
    myId: "",
    myName: "",
    connected: false,
    players: [] as Player[],
    selectedGame: "countries" as Game,
    roundLength: 300,
    countryOrder: "random" as CountryOrder,
    doodleSubmittedWordPlayerIds: [] as string[],
    mySubmittedWord: false,
    // Non-null once a game has started (from the initial "state" sync
    // for anyone joining/reconnecting after the fact, or "game_starting"
    // for anyone already connected) -- the lobby page watches this to
    // swap from the lobby UI to the matching game component in place.
    startedGame: null as Game | null,
    errorMessage: "",
  }),

  getters: {
    isHost: state =>
      state.players.find(p => p.id === state.myId)?.isHost ?? false,
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
      const wsBase = getWsBase(_apiBase);
      const socket = new WebSocket(
        `${wsBase}/api/play/ws/${_roomId}`,
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
        this.myId = getPersistentPlayerId();
        if (this.myName) {
          this.send({
            type: "join",
            id: this.myId,
            name: this.myName,
          });
        }
      });
      socket.addEventListener("close", () => {
        this.connected = false;
        if (_joinResolver) {
          const { reject } = _joinResolver;
          _joinResolver = null;
          reject("Disconnected. Refresh to reconnect.");
        }
        if (_wordResolver) {
          const { reject } = _wordResolver;
          _wordResolver = null;
          reject("Disconnected. Refresh to reconnect.");
        }
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

    // Resolves once the server confirms the join ("player_joined" for
    // this player), or rejects with the server's error message.
    join(name: string): Promise<void> {
      this.myId = getPersistentPlayerId();
      this.myName = name;
      setPersistentPlayerName(name);
      return new Promise((resolve, reject) => {
        _joinResolver = { resolve, reject };
        this.send({ type: "join", id: this.myId, name });
      });
    },

    selectGame(game: Game) {
      this.send({ type: "select_game", game });
    },

    updateSettings(roundLength: number, countryOrder: CountryOrder) {
      this.send({
        type: "update_settings",
        round_length: roundLength,
        country_order: countryOrder,
      });
    },

    // Resolves once the server confirms the word ("word_submitted" for
    // this player), or rejects with the server's error message.
    submitWord(word: string): Promise<void> {
      return new Promise((resolve, reject) => {
        _wordResolver = { resolve, reject };
        this.send({ type: "submit_word", word });
      });
    },

    startGame() {
      this.send({ type: "start_game" });
    },

    returnToLobby() {
      this.send({ type: "return_to_lobby" });
    },

    _handleMessage(msg: ServerMessage) {
      switch (msg.type) {
        case "state":
          this.players = msg.state.players;
          this.selectedGame = msg.state.selectedGame;
          this.roundLength = msg.state.roundLength;
          this.countryOrder = msg.state.countryOrder;
          this.doodleSubmittedWordPlayerIds =
            msg.state.doodleSubmittedWordPlayerIds;
          this.mySubmittedWord =
            this.doodleSubmittedWordPlayerIds.includes(this.myId);
          this.startedGame = msg.state.startedGame;
          break;

        case "player_joined":
          this.players = msg.players;
          if (_joinResolver && msg.player.id === this.myId) {
            const { resolve } = _joinResolver;
            _joinResolver = null;
            resolve();
          }
          break;

        case "player_left":
          this.players = msg.players;
          break;

        case "player_disconnected":
          this.players = msg.players;
          break;

        case "game_selected":
          this.selectedGame = msg.game;
          break;

        case "settings_update":
          this.roundLength = msg.round_length;
          this.countryOrder = msg.country_order;
          break;

        case "word_submitted":
          if (
            !this.doodleSubmittedWordPlayerIds.includes(msg.playerId)
          ) {
            this.doodleSubmittedWordPlayerIds.push(msg.playerId);
          }
          if (msg.playerId === this.myId) {
            this.mySubmittedWord = true;
            if (_wordResolver) {
              const { resolve } = _wordResolver;
              _wordResolver = null;
              resolve();
            }
          }
          break;

        case "game_starting":
          this.startedGame = msg.game;
          break;

        case "returned_to_lobby":
          this.startedGame = null;
          break;

        case "ping":
          break;

        case "error":
          if (_joinResolver) {
            const { reject } = _joinResolver;
            _joinResolver = null;
            reject(msg.message);
          } else if (_wordResolver) {
            const { reject } = _wordResolver;
            _wordResolver = null;
            reject(msg.message);
          } else {
            this.errorMessage = msg.message;
          }
          break;
      }
    },

    _closeWs() {
      _ws?.close();
      _ws = null;
      this.connected = false;
    },

    _resetState() {
      this.myId = "";
      this.players = [];
      this.doodleSubmittedWordPlayerIds = [];
      this.mySubmittedWord = false;
      this.startedGame = null;
      this.errorMessage = "";
    },
  },
});
