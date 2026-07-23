import { fileURLToPath } from "url";

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      countryGuesserApiUrl:
        process.env.NODE_ENV === "development"
          ? "http://localhost:8787"
          : "",
    },
  },
  alias: {
    "@countries": fileURLToPath(new URL(".", import.meta.url)),
  },
});
