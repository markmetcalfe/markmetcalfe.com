import { COUNTRIES } from "./countries";
import { containsProfanity } from "../../shared/profanity";

const MAX_POSSIBLE_SCORE = COUNTRIES.length * 100;
const MAX_ROWS = 200;

export interface LeaderboardEntry {
  name: string;
  score: number;
}

// Never bound to a public route — only reachable via the LEADERBOARD
// binding, called by GameRoom (submit) and the worker's fetch handler
// (top10). The score a room submits is always server-computed, so this
// object only has to guard against a malformed/oversized name.
export class Leaderboard implements DurableObject {
  private readonly state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
    state.storage.sql.exec(
      `CREATE TABLE IF NOT EXISTS scores (
        name TEXT NOT NULL,
        score INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      )`,
    );
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/submit" && request.method === "POST") {
      const body = (await request.json()) as {
        name?: unknown;
        score?: unknown;
      };
      const name =
        typeof body.name === "string"
          ? body.name.trim().slice(0, 24)
          : "";
      const score = body.score;
      if (
        !name ||
        containsProfanity(name) ||
        typeof score !== "number" ||
        !Number.isInteger(score) ||
        score < 0 ||
        score > MAX_POSSIBLE_SCORE
      ) {
        return new Response("Invalid entry", { status: 400 });
      }
      this.state.storage.sql.exec(
        "INSERT INTO scores (name, score, created_at) VALUES (?, ?, ?)",
        name,
        score,
        Date.now(),
      );
      this.prune();
      return new Response(null, { status: 204 });
    }

    if (url.pathname === "/top10" && request.method === "GET") {
      const rows = [
        ...this.state.storage.sql.exec(
          "SELECT name, score FROM scores ORDER BY score DESC LIMIT 10",
        ),
      ] as unknown as LeaderboardEntry[];
      return new Response(JSON.stringify(rows), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404 });
  }

  private prune(): void {
    this.state.storage.sql.exec(
      `DELETE FROM scores WHERE rowid NOT IN (
        SELECT rowid FROM scores ORDER BY score DESC LIMIT ?
      )`,
      MAX_ROWS,
    );
  }
}
