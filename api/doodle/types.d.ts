import type { GameRoom } from "./src/game-room";

// See api/countries/types.d.ts for why this isn't `declare global`.
export interface Env {
  GAME_ROOMS: DurableObjectNamespace<GameRoom>;
  ROOM_LIST?: KVNamespace;
  IS_PLAYWRIGHT?: string;
}
