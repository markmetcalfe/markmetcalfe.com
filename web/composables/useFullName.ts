export function useFullName() {
  return useSiteDomain() === "markometcalfe.com"
    ? "Marko Metcalfe"
    : "Mark Metcalfe";
}
