import { fileURLToPath } from 'url'

export default defineNuxtConfig({
  alias: { '@doodle': fileURLToPath(new URL('.', import.meta.url)) },
})
