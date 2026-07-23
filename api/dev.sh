#!/usr/bin/env bash
set -euo pipefail

trap 'kill 0' EXIT

pkill -f "wrangler dev" 2>/dev/null || true

is_playwright=0
[ "${IS_PLAYWRIGHT:-}" = "1" ] && is_playwright=1

# If updating here, also update playwright.nginx.conf and web/nuxt.config.ts
npx wrangler dev --config countries/wrangler.jsonc --port 8787 --ip 0.0.0.0 --inspector-port 9229 --var "IS_PLAYWRIGHT:$is_playwright" &
npx wrangler dev --config doodle/wrangler.jsonc --port 8788 --ip 0.0.0.0 --inspector-port 9230 --var "IS_PLAYWRIGHT:$is_playwright" &
npx wrangler dev --config network-status/wrangler.jsonc --port 8789 --ip 0.0.0.0 --inspector-port 9231 --var "IS_PLAYWRIGHT:$is_playwright" &
npx wrangler dev --config resume/wrangler.jsonc --port 8790 --ip 0.0.0.0 --inspector-port 9232 --var "IS_PLAYWRIGHT:$is_playwright" &

wait
