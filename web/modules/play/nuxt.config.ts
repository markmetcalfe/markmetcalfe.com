import { fileURLToPath } from "url";

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      playApiUrl:
        process.env.NODE_ENV === "development"
          ? "http://localhost:8791"
          : "",
    },
  },
  alias: { "@play": fileURLToPath(new URL(".", import.meta.url)) },
});
