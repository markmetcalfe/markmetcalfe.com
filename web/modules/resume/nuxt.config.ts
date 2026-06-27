import { fileURLToPath } from "url";

export default defineNuxtConfig({
  alias: { "@resume": fileURLToPath(new URL(".", import.meta.url)) },
});
