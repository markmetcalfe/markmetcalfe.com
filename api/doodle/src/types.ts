export type GamePhase = "waiting" | "drawing" | "round_end" | "game_end";

export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
}

export interface GameState {
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

export type DrawEvent =
  | { kind: "begin"; x: number; y: number; color: string; size: number }
  | { kind: "move"; x: number; y: number }
  | { kind: "end" }
  | { kind: "clear" };

export type ClientMessage =
  | { type: "join"; name: string }
  | { type: "start_game"; round_length?: number }
  | { type: "draw"; event: DrawEvent }
  | { type: "guess"; text: string }
  | { type: "chat"; text: string }
  | { type: "suggest_word"; word: string };

export type ServerMessage =
  | { type: "you_are"; id: string }
  | { type: "state"; state: GameState }
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
