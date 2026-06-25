import { fileURLToPath } from 'url'

export default defineNuxtConfig({
  alias: { '@visuals': fileURLToPath(new URL('.', import.meta.url)) },
})
