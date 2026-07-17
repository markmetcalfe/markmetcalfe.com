// The webServer `url` health checks (playwright.config.ts) only prove a
// GET through the dev proxy succeeds once. The very first POST from an
// actual test (room creation) can still race the proxy's connection
// pool to the freshly-started wrangler dev workers and fail outright --
// this primes that exact path a few times, sequentially, before any
// test worker starts hammering it concurrently.
export default async function globalSetup() {
  const baseUrl = "http://localhost:3001";
  for (let i = 0; i < 3; i++) {
    try {
      await fetch(`${baseUrl}/api/countries/rooms`, { method: "POST" });
    } catch {
      // Best-effort warm-up -- a real failure here still surfaces
      // through the tests themselves.
    }
  }
}
