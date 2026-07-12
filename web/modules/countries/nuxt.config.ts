import { fileURLToPath } from "url";
import { buildLocalDevProxy } from "../../dev-proxy";

function getCountryGuesserDevUrl(): string {
  if (process.env.NODE_ENV !== "development") {
    return "";
  }
  const proxy = buildLocalDevProxy();
  const target = proxy["/api/countries"]?.target;
  if (target) {
    return new URL(target).origin;
  }
  return "";
}

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      countryGuesserApiUrl: getCountryGuesserDevUrl(),
    },
  },
  alias: {
    "@countries": fileURLToPath(new URL(".", import.meta.url)),
  },
});
