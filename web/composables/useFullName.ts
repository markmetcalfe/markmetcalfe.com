export function useFullName() {
  const hostname = useRequestURL().hostname.replace(/^www\./, "");
  return hostname === "markometcalfe.com"
    ? "Marko Metcalfe"
    : "Mark Metcalfe";
}
