import { fileURLToPath } from "url";
import { buildLocalDevProxy } from "../../dev-proxy";

function getDoodleDevUrl(): string {
  if (process.env.NODE_ENV !== "development") {
    return "";
  }
  const proxy = buildLocalDevProxy();
  const target = proxy["/api/doodle"]?.target;
  if (target) {
    return new URL(target).origin;
  }
  return "";
}

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      doodleApiUrl: getDoodleDevUrl(),
    },
  },
  alias: { "@doodle": fileURLToPath(new URL(".", import.meta.url)) },
});
