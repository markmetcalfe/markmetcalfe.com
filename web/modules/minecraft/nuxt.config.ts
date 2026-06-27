import { fileURLToPath } from "url";

export default defineNuxtConfig({
  alias: { "@minecraft": fileURLToPath(new URL(".", import.meta.url)) },
});
