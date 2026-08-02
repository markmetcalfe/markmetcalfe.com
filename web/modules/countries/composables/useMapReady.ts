// Shared across CountryMap instances (rather than per-instance state) so
// the page can key its dynamic-background visibility off "has any map on
// this page rendered its first frame yet" regardless of which one is
// currently mounted -- the lobby's AttractMap-wrapped map, or gameplay's
// own. Never reset back to false: once the page has shown a real map
// frame, later remounts (e.g. lobby -> gameplay) shouldn't re-flash it.
const ready = ref(false);

export function useMapReady() {
  return ready;
}
