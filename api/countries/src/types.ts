export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  correctGuesses: number;
  skips: number;
}

export type RoomPhase = "waiting" | "playing" | "round_end";

export interface RoomState {
  phase: RoomPhase;
  players: Player[];
  roundLength: number;
  timeLeft: number;
  currentHint?: string;
  guessedCodes: string[];
  donePlayerIds: string[];
}

export type ClientMessage =
  | { type: "join"; name: string }
  | { type: "start_game"; round_length?: number }
  | { type: "guess"; text: string }
  | { type: "skip" };

export type ServerMessage =
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
  | {
      type: "round_end";
      players: Player[];
      guessedCodes: string[];
    }
  | { type: "error"; message: string };
