import { buildLocalDevProxy } from './dev-proxy'

const isPlaywrightTest = process.env.IS_PLAYWRIGHT === '1'
const isApiLocal = process.env.API_LOCAL === '1'
const siteDomain = 'markmetcalfe.com'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: [
    './modules/doodle',
    './modules/minecraft',
    './modules/network-status',
    './modules/resume',
    './modules/sequencer',
    './modules/visuals',
  ],
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/test-utils',
    '@pinia/nuxt',
  ],
  devtools: { enabled: true },
  app: {
    head: {
      title: 'Mark Metcalfe',
      htmlAttrs: {
        lang: 'en',
      },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.svg' },
      ],
    },
  },
  appConfig: {
    siteDomain: 'markmetcalfe.com',
    mailtoLink: 'mailto:mark@markmetcalfe.com',
  },
  compatibilityDate: '2025-05-28',
  eslint: {
    config: {
      stylistic: {
        quotes: 'single',
        semi: false,
      },
    },
  },
  icon: {
    clientBundle: {
      scan: true,
      includeCustomCollections: true,
    },
    customCollections: [
      {
        prefix: 'custom',
        dir: './assets/icons',
      },
    ],
  },
  pinia: {
    storesDirs: ['stores'],
  },
  ...(isPlaywrightTest
    ? {}
    : {
        nitro: {
          devProxy: isApiLocal
            ? buildLocalDevProxy()
            : {
                '/api': {
                  target: `https://${siteDomain}/api`,
                  changeOrigin: true,
                  prependPath: true,
                },
              },
        },
      }),
})
