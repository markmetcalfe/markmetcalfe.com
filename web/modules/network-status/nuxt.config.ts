import { fileURLToPath } from "url";

export default defineNuxtConfig({
  alias: {
    "@networkstatus": fileURLToPath(new URL(".", import.meta.url)),
  },
});
