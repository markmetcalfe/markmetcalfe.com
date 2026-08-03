// A stable per-browser identity, persisted so a reconnect (brief drop,
// backgrounded tab, or a full page reload) rejoins as the same player
// instead of losing score/host status to a freshly-minted one -- see
// the matching reconnect-by-id logic in api/play/src/lobby-room.ts and
// both games' game-room.ts. Shared by the play lobby and both games so
// a name only ever needs to be entered once.
const PLAYER_ID_KEY = "playerId";
const PLAYER_NAME_KEY = "playerName";

// These pages are ssr:false, but that only stops the server from
// rendering their output -- setup() still runs server-side on a direct
// (non-hydration) navigation, so anything touching localStorage must
// guard against that or it 500s.
export function getPersistentPlayerId(): string {
  if (!import.meta.client) {
    return "";
  }
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    // crypto.randomUUID() throws outside secure contexts (plain HTTP,
    // embedded webviews); getRandomValues has no such restriction.
    id = crypto.getRandomValues(new Uint32Array(4)).join("-");
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

export function getPersistentPlayerName(): string {
  if (!import.meta.client) {
    return "";
  }
  return localStorage.getItem(PLAYER_NAME_KEY) ?? "";
}

export function setPersistentPlayerName(name: string): void {
  if (!import.meta.client) {
    return;
  }
  localStorage.setItem(PLAYER_NAME_KEY, name);
}
