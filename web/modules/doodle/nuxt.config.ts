import { fileURLToPath } from "url";

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      doodleApiUrl:
        process.env.NODE_ENV === "development"
          ? "http://localhost:8788"
          : "",
    },
  },
  alias: { "@doodle": fileURLToPath(new URL(".", import.meta.url)) },
});
