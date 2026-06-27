export default {
  async fetch(request: Request) {
    const visitorIp = request.headers.get("CF-Connecting-IP");

    const homeDomain = "home.markmetcalfe.com";
    const dnsResponse = await fetch(`https://cloudflare-dns.com/dns-query?name=${homeDomain}`, {
      headers: {
        accept: "application/dns-json",
      },
    });
    const dnsData = (await dnsResponse.json()) as DNSResponse;
    const homeIp = dnsData.Answer[0].data;
    const isConnected = visitorIp === homeIp || visitorIp === "::1";

    const response = {
      isConnected,
      yourIp: visitorIp,
      homeIp,
    };

    return new Response(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
};
