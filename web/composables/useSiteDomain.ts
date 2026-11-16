// Local dev (localhost, 127.0.0.1, LAN/IPv6 IPs) shows the main domain.
const localHost = /^(localhost|[\d.]+|\[.*\])$/;

export function useSiteDomain() {
  const hostname = useRequestURL().hostname.replace(/^www\./, "");
  return localHost.test(hostname) ? "markmetcalfe.com" : hostname;
}
