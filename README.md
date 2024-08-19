# [markmetcalfe.com](https://markmetcalfe.com)

[![Playwright Tests](https://github.com/markmetcalfe/markmetcalfe.com/actions/workflows/playwright.yml/badge.svg)](https://github.com/markmetcalfe/markmetcalfe.com/actions/workflows/playwright.yml)

The code for my portfolio site located at [markmetcalfe.com](https://markmetcalfe.com)

Written in Vue 3 and Typescript, using the Vite vue framework.

## Tests

Playwright is used for automated end-to-end testing.
If you haven't installed playwright before, you will need to run `pnpm playwright install` before running `pnpm run test`

## Commands

- Install: `pnpm install`

- Run development server: `pnpm run dev`

- Production build: `pnpm run build`

- Run tests: `pnpm run test`

## Deployment

The master branch is automatically deployed by Cloudflare to a Cloudflare web instance.
