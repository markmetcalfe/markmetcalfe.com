export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  correctGuesses: number;
  skips: number;
  // Epoch ms since this player's connection dropped, or null while
  // connected. A disconnected player is kept (score, host status) until
  // the grace period elapses, so a brief reconnect resumes seamlessly.
  disconnectedAt: number | null;
}

export type RoomPhase = "waiting" | "playing" | "round_end";

export interface RoomState {
  phase: RoomPhase;
  mode: "multiplayer" | "solo";
  players: Player[];
  roundLength: number;
  timeLeft: number;
  // How long the most recently finished round actually took, wall-clock
  // -- server-computed so a client reconnecting straight into
  // "round_end" (never having seen the live "round_end" broadcast)
  // still gets an accurate value instead of guessing from its own
  // clock. Meaningless (but harmless) outside "round_end".
  elapsedSeconds: number;
  currentCode: string;
  currentHint?: string;
  guessedCodes: string[];
  donePlayerIds: string[];
}

export type ClientMessage =
  | { type: "join"; id: string; name: string }
  | { type: "start_game"; round_length?: number; solo?: boolean }
  | { type: "guess"; text: string }
  | { type: "skip" }
  | { type: "submit_score" }
  | { type: "return_to_lobby" };

export type ServerMessage =
  | { type: "state"; state: RoomState }
  | { type: "player_joined"; player: Player; players: Player[] }
  | { type: "player_left"; playerId: string; players: Player[] }
  | {
      type: "player_disconnected";
      playerId: string;
      players: Player[];
    }
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
      timeLeft: number;
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
      elapsedSeconds: number;
    }
  | { type: "score_submitted" }
  | { type: "error"; message: string }
  | { type: "ping" }
  | { type: "returned_to_lobby" };
