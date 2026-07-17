import { buildLocalDevProxy } from "./dev-proxy";

const isPlaywrightTest = process.env.IS_PLAYWRIGHT === "1";
const isApiLocal = process.env.API_LOCAL === "1";
const siteDomain = "markmetcalfe.com";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: [
    "./modules/countries",
    "./modules/doodle",
    "./modules/minecraft",
    "./modules/network-status",
    "./modules/pulsar",
    "./modules/resume",
    "./modules/sequencer",
    "./modules/visuals",
  ],
  modules: [
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/test-utils",
    "@pinia/nuxt",
  ],
  devtools: { enabled: !isPlaywrightTest },
  runtimeConfig: {
    public: {
      isPlaywrightTest,
    },
  },
  app: {
    head: {
      title: "Mark Metcalfe",
      htmlAttrs: {
        lang: "en",
      },
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.svg" },
      ],
    },
  },
  appConfig: {
    siteDomain: "markmetcalfe.com",
    mailtoLink: "mailto:mark@markmetcalfe.com",
  },
  compatibilityDate: "2025-05-28",
  routeRules: {
    "/**": { trailingSlash: false },
  },
  icon: {
    clientBundle: {
      scan: true,
      includeCustomCollections: true,
    },
    customCollections: [
      {
        prefix: "custom",
        dir: "./assets/icons",
      },
    ],
  },
  pinia: {
    storesDirs: ["stores"],
  },
  nitro: {
    devProxy: isApiLocal
      ? buildLocalDevProxy()
      : {
          "/api": {
            target: `https://${siteDomain}/api`,
            changeOrigin: true,
            prependPath: true,
          },
        },
  },
});
