# [markmetcalfe.io](https://markmetcalfe.io)

[![Playwright Tests](https://github.com/markmetcalfe/markmetcalfe.io/actions/workflows/playwright.yml/badge.svg)](https://github.com/markmetcalfe/markmetcalfe.io/actions/workflows/playwright.yml)

The code for my portfolio site located at [markmetcalfe.io](https://markmetcalfe.io)

Written in Vue 3 and Typescript, using the Vite vue framework.

## Tests

Playwright is used for automated end-to-end testing.
If you haven't installed playwright before, you will need to run
```
npx playwright install --with-deps chromium webkit
```
Before running `yarn run test`

## Commands

* Install: `yarn`

* Run development server: `yarn run dev`

* Production build: `yarn run build`

* Run tests: `yarn run test`

## Deployment

The main branch is automatically deployed by Cloudflare to a Cloudflare web instance.
