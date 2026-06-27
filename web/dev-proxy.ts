/// <reference types="node" />
import { existsSync, readdirSync, readFileSync } from "node:fs";

export function buildLocalDevProxy() {
  const proxy: Record<string, { target: string; changeOrigin: boolean }> = {};
  let port = 8787;

  const dirs = readdirSync("../api", { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name !== "node_modules")
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const { name } of dirs) {
    const configPath = `../api/${name}/wrangler.jsonc`;
    if (!existsSync(configPath)) {
      continue;
    }

    const jsonc = readFileSync(configPath, "utf-8")
      .replace(/\/\/[^\n]*/g, "")
      .replace(/,(\s*[}\]])/g, "$1");
    const route = JSON.parse(jsonc).routes?.[0];
    if (!route) {
      continue;
    }

    const path = "/" + route.pattern.slice(route.zone_name.length + 1).replace(/\/?\*$/, "");
    proxy[path] = { target: `http://localhost:${port}${path}`, changeOrigin: true };
    port++;
  }

  return proxy;
}
