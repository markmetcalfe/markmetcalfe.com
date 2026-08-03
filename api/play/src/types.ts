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
  // Epoch ms since this player's connection dropped, or null while
  // connected -- see api/countries/src/game-room.ts, which this mirrors.
  disconnectedAt: number | null;
}

export interface LobbyState {
  players: Player[];
  selectedGame: Game;
  roundLength: number;
  countryOrder: CountryOrder;
  // Who's submitted a Doodle word -- never the words themselves, same
  // as api/doodle's own lobby never revealed them to other players.
  doodleSubmittedWordPlayerIds: string[];
  // Set once the host starts a game, so a client connecting (or
  // reconnecting) after the fact -- not just one live for the
  // "game_starting" broadcast -- still knows to render that game
  // instead of the lobby. Cleared by "return_to_lobby".
  startedGame: Game | null;
}

export type ClientMessage =
  | { type: "join"; id: string; name: string }
  | { type: "select_game"; game: Game }
  | {
      type: "update_settings";
      round_length: number;
      country_order: CountryOrder;
    }
  | { type: "submit_word"; word: string }
  | { type: "start_game" }
  | { type: "return_to_lobby" };

export type ServerMessage =
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
