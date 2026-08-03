import type { GameRoom } from "./src/game-room";

// Deliberately not `declare global` -- api/*/types.d.ts across this repo
// all declare an `Env` shape, and since `tsc --noEmit` (see api/package.json)
// type-checks every module as one program, a global augmentation here
// would merge (and collide) with every other module's `Env` instead of
// staying scoped to this one. Each file that needs this type imports it
// explicitly instead (see src/index.ts and src/game-room.ts).
export interface Env {
  GAME_ROOMS: DurableObjectNamespace<GameRoom>;
  LEADERBOARD: DurableObjectNamespace;
  ENVIRONMENT: string;
  IS_PLAYWRIGHT?: string;
}
