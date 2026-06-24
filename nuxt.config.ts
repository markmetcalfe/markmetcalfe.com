const isPlaywrightTest = process.env.IS_PLAYWRIGHT === '1'
const siteDomain = 'markmetcalfe.com'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
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
  runtimeConfig: {
    public: {
      // Set NUXT_PUBLIC_DOODLE_API_URL=http://localhost:8787 in .env for local dev
      doodleApiUrl: '',
    },
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
  ...(isPlaywrightTest
    ? {}
    : {
        nitro: {
          devProxy: {
            '/api': {
              target: `https://${siteDomain}/api`,
              changeOrigin: true,
              prependPath: true,
            },
          },
        },
      }),
})
