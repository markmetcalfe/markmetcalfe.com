# [markmetcalfe.com](https://markmetcalfe.com)

[![Playwright Tests](https://github.com/markmetcalfe/markmetcalfe.com/actions/workflows/playwright.yml/badge.svg)](https://github.com/markmetcalfe/markmetcalfe.com/actions/workflows/playwright.yml)

The source code for my personal portfolio site at [markmetcalfe.com](https://markmetcalfe.com).

## What it contains

The site is a portfolio and creative playground, including:

- **Home page** — landing page with an interactive 3D visuals background
- **Resume** — dynamically fetched from the `@markmetcalfe/resume` package
- **Visuals** — interactive generative graphics using Three.js
- **Doodle** — a multiplayer drawing and guessing game
- **Sequencer** — a browser-based music sequencer built with Tone.js

## Architecture

The repo is split into two sub-projects:

### `web/`

The frontend, built with:

- [Nuxt.js](https://nuxt.com/) (Vue 3 framework)
- [Vue 3](https://vuejs.org/) with [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) (via Nuxt)
- [Pinia](https://pinia.vuejs.org/) for state management
- [Three.js](https://threejs.org/) and [Tone.js](https://tonejs.github.io/) for creative features

Features are organised as Nuxt modules under `web/modules/`.

### `api/`

A set of [Cloudflare Workers](https://workers.cloudflare.com/) managed with [Wrangler](https://developers.cloudflare.com/workers/wrangler/). Each worker lives in its own subdirectory (`doodle/`, `network-status/`, `resume/`) and has its own `wrangler.jsonc` config.

## Development

1. Install dependencies in both sub-projects:

```sh
cd web && npm install
cd ../api && npm install
```

2. Start the development server (from the `web/` directory). This also starts the API workers locally:

```sh
npm run dev:api
```

## Testing

Playwright is used for end-to-end testing. Tests live in `web/tests/e2e/`.

Install Playwright browsers if you haven't already:

```sh
npx playwright install
```

Run the tests (from the `web/` directory):

```sh
npm run test
```

## Deployment

The `main` branch is automatically deployed by Cloudflare Pages (frontend) and Cloudflare Workers (API).
