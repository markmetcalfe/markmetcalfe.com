import { fileURLToPath } from "url";

export default defineNuxtConfig({
  alias: { "@pulsar": fileURLToPath(new URL(".", import.meta.url)) },
});
