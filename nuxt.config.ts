const isVizshun = process.env.IS_VIZSHUN === '1'
const isPlaywrightTest = process.env.IS_PLAYWRIGHT === '1'
const siteDomain = isVizshun ? 'vizshun.art' : 'markmetcalfe.com'

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
      title: isVizshun ? 'Vizshun' : 'Mark Metcalfe',
      htmlAttrs: {
        lang: 'en',
      },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.svg' },
      ],
    },
  },
  appConfig: {
    isVizshun,
    siteDomain,
    mailtoLink: 'mailto:mark@markmetcalfe.com',
  },
  compatibilityDate: '2024-11-01',
  eslint: {
    config: {
      stylistic: {
        quotes: 'single',
        semi: false,
      },
    },
  },
  icon: {
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
