#!/usr/bin/env bash
set -euo pipefail

trap 'kill 0' EXIT

port=8787
inspector_port=9229

while IFS= read -r config; do
  npx wrangler dev --config "$config" --port "$port" --inspector-port "$inspector_port" &
  port=$((port + 1))
  inspector_port=$((inspector_port + 1))
done < <(find . -mindepth 2 -maxdepth 2 -name 'wrangler.jsonc' -not -path '*/node_modules/*' | sort)

wait
