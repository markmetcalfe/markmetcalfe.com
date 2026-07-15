// Dev API URLs are baked in at server-start time as `http://localhost:<port>`
// (see dev-proxy.ts), which only resolves on the machine running the dev
// server. Swap in whatever host the page was actually loaded from (e.g. a
// LAN IP from --host) so other devices can reach it too.
export function getWsBase(apiBase: string): string {
  if (!apiBase) {
    return `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`;
  }
  const url = new URL(apiBase);
  url.hostname = window.location.hostname;
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.origin;
}
