import { fileURLToPath } from 'url'

export default defineNuxtConfig({
  alias: { '@sequencer': fileURLToPath(new URL('.', import.meta.url)) },
})
