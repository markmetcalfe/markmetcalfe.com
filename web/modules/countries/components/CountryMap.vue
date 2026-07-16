<template>
  <div
    class="countrymap"
    :class="{ 'countrymap-complete': props.complete }"
  >
    <div ref="mapContainerRef" class="countrymap-canvas" />
  </div>
</template>

<script setup lang="ts">
import "maplibre-gl/dist/maplibre-gl.css";
import type { Map as MapLibreMap } from "maplibre-gl";
import type {
  ExpressionSpecification,
  StyleSpecification,
} from "@maplibre/maplibre-gl-style-spec";
import colorConvert from "color-convert";

interface Props {
  targetCode?: string | null;
  guessedCodes: string[];
  complete?: boolean;
  invertBase?: boolean;
  highlightTarget?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  targetCode: null,
  complete: false,
  invertBase: false,
  highlightTarget: true,
});

const mapContainerRef = ref<HTMLDivElement>();

const SOURCE_ID = "countries";
const FILL_LAYER = "countries-fill";
const LINE_LAYER = "countries-line";

type Role = "default" | "guessed" | "target";

// Fixed screen-pixel padding around a targeted country's bounds, so it
// never sits flush against the container edges. The world-view fit
// deliberately uses no padding -- edge to edge is the desired look
// there.
const COUNTRY_FIT_PADDING = 24;

// The view gradually pulls back from a freshly targeted country to the
// full map over this many milliseconds, giving surrounding geography
// away as a passive clue the longer a country goes unguessed.
const ZOOM_OUT_DURATION_MS = 60000;

// A round's zoom-out stops this many zoom levels short of the full
// world view (worldZoom), so guessing never pulls back all the way to
// the whole map -- just enough surrounding geography to be a clue.
const ZOOM_OUT_MARGIN = 2.5;

// Eases the round's zoom-out fast at first (most noticeable for a
// small country starting at a tight zoom) and gradually slows toward
// the end, rather than moving at a constant rate throughout.
function zoomOutEasing(t: number): number {
  return 1 - (1 - t) ** 3;
}

// On the round-end recap, the camera eases in a bit closer than the
// normal "whole world fits" zoom (so the globe reads as a globe, not
// a distant dot) and keeps slowly spinning afterward, so every
// guessed/highlighted country scrolls into view over time.
const COMPLETE_ZOOM_OFFSET = 1.8;
const COMPLETE_ZOOM_TRANSITION_MS = 3000;
const ROTATION_DEGREES_PER_SECOND = 8;

// While spinning, latitude also wanders (rather than holding the
// round's last latitude) so different parts of the globe -- Europe,
// Antarctica, the Pacific -- scroll into view over time, not just an
// unchanging band. Two sine waves of independent (randomized per
// round) period are layered so the drift reads as meandering rather
// than a single obvious back-and-forth sweep; both start at zero so
// the wander eases in smoothly from the round's actual last latitude
// instead of jumping to it.
const LAT_WANDER_RANGE_DEGREES = 40;
const LAT_WANDER_PERIOD_MS_MIN = 15000;
const LAT_WANDER_PERIOD_MS_MAX = 30000;
const LAT_CLAMP_DEGREES = 80;

// How long one flash cycle (highlight -> dark -> highlight) takes,
// both for the actively-guessed target and for the round-end recap.
const PULSE_PERIOD_MS = 1800;

const GUESSED_FILL = "#b3ffb3";

let map: MapLibreMap | null = null;
let resizeObserver: ResizeObserver | null = null;
let styleLoaded = false;
let rafId: number | null = null;

let colorDark = "#000";
let colorLight = "#fff";
let colorHighlight = "#0f0";
let highlightRgb: [number, number, number] = [0, 255, 0];
let highlightDarkRgb: [number, number, number] = [0, 90, 0];

const boundsByCode = new Map<
  string,
  [number, number, number, number]
>();
let worldBounds: [number, number, number, number] | null = null;
// The zoom level at which the whole map fits the container -- cached
// once so the round's zoom-out can hold the target country centered
// (a fixed center, animating zoom only) instead of re-centering on the
// world's overall midpoint.
let worldZoom = 0;
let guessedSet = new Set<string>();

// Starting point + timestamp for the round-end zoom-out/rotation,
// captured once when `complete` turns on so frame() can interpolate
// the zoom-out and keep spinning the longitude indefinitely afterward.
let completeAnimStart: number | null = null;
let completeAnimFromZoom = 0;
let completeAnimFromLng = 0;
let completeAnimFromLat = 0;
let completeAnimLatPeriodA = LAT_WANDER_PERIOD_MS_MIN;
let completeAnimLatPeriodB = LAT_WANDER_PERIOD_MS_MAX;

function scheduleFrame() {
  if (rafId !== null) {
    return;
  }
  rafId = requestAnimationFrame(frame);
}

// Drives, off one shared color/timestamp per frame: the current
// target's flash while it's being guessed, every guessed country's
// flash (in sync) once the round ends, and the round-end camera
// zoom-out/rotation.
function frame(now: number) {
  rafId = null;
  let stillAnimating = false;
  const color = pulseColorAt(now);
  if (props.targetCode && props.highlightTarget) {
    map?.setFeatureState(
      { source: SOURCE_ID, id: props.targetCode },
      { pulseColor: color },
    );
    stillAnimating = true;
  }
  if (props.complete && guessedSet.size > 0) {
    for (const code of guessedSet) {
      map?.setFeatureState(
        { source: SOURCE_ID, id: code },
        { pulseColor: color },
      );
    }
    stillAnimating = true;
  }
  if (props.complete && completeAnimStart !== null && map) {
    const elapsed = now - completeAnimStart;
    const zoomT = Math.min(1, elapsed / COMPLETE_ZOOM_TRANSITION_MS);
    const eased = 1 - (1 - zoomT) ** 3;
    const targetZoom = worldZoom + COMPLETE_ZOOM_OFFSET;
    const zoom =
      completeAnimFromZoom +
      (targetZoom - completeAnimFromZoom) * eased;
    const lng =
      completeAnimFromLng +
      (ROTATION_DEGREES_PER_SECOND * elapsed) / 1000;
    const latWander =
      LAT_WANDER_RANGE_DEGREES *
      (0.6 *
        Math.sin((2 * Math.PI * elapsed) / completeAnimLatPeriodA) +
        0.4 *
          Math.sin((2 * Math.PI * elapsed) / completeAnimLatPeriodB));
    const lat = Math.max(
      -LAT_CLAMP_DEGREES,
      Math.min(LAT_CLAMP_DEGREES, completeAnimFromLat + latWander),
    );
    map.jumpTo({ center: [lng, lat], zoom });
    stillAnimating = true;
  }
  if (stillAnimating) {
    map?.triggerRepaint();
    scheduleFrame();
  }
}

// An ease-in-out loop between the highlight color and a darkened
// version of it, one cycle every PULSE_PERIOD_MS.
function pulseColorAt(now: number): string {
  const t =
    0.5 + 0.5 * Math.cos((now / PULSE_PERIOD_MS) * Math.PI * 2);
  const rgb = highlightRgb.map((c, i) =>
    Math.round(c + ((highlightDarkRgb[i] ?? c) - c) * t),
  );
  return `rgb(${rgb.join(",")})`;
}

function roleFor(code: string): Role {
  if (code === props.targetCode && props.highlightTarget) {
    return "target";
  }
  return guessedSet.has(code) ? "guessed" : "default";
}

// Sets a code's role, and -- for target/guessed-while-complete, the
// two roles a pulse applies to -- an initial pulseColor too, so
// there's no one-frame flash of an unset color before the next
// scheduleFrame() tick lands.
function applyRole(code: string) {
  if (!map || !styleLoaded) {
    return;
  }
  const role = roleFor(code);
  const state: Record<string, unknown> = { role };
  if (role === "target" || (role === "guessed" && props.complete)) {
    state.pulseColor = pulseColorAt(performance.now());
  }
  map.setFeatureState({ source: SOURCE_ID, id: code }, state);
}

// Captures the camera's current position as the round-end zoom-out's
// starting point -- only once per round-end, so re-entering this (e.g.
// an unrelated invertBase change while already complete) doesn't
// restart the transition or jump the rotation.
function startCompleteRotationIfNeeded() {
  if (!map || !props.complete || completeAnimStart !== null) {
    return;
  }
  completeAnimStart = performance.now();
  completeAnimFromZoom = map.getZoom();
  const center = map.getCenter();
  completeAnimFromLng = center.lng;
  completeAnimFromLat = center.lat;
  completeAnimLatPeriodA =
    LAT_WANDER_PERIOD_MS_MIN +
    Math.random() *
      (LAT_WANDER_PERIOD_MS_MAX - LAT_WANDER_PERIOD_MS_MIN);
  completeAnimLatPeriodB =
    LAT_WANDER_PERIOD_MS_MIN +
    Math.random() *
      (LAT_WANDER_PERIOD_MS_MAX - LAT_WANDER_PERIOD_MS_MIN);
}

// Kicks off (or re-syncs) the flash loop. Called whenever the target
// or `complete` changes, and once more at mount in case the map mounts
// straight into an active target or an already-complete round (e.g. a
// reconnect).
function startPulseIfNeeded() {
  if (!map || !styleLoaded) {
    return;
  }
  if (props.targetCode && props.highlightTarget) {
    applyRole(props.targetCode);
  }
  if (props.complete) {
    for (const code of guessedSet) {
      applyRole(code);
    }
    startCompleteRotationIfNeeded();
  } else {
    completeAnimStart = null;
  }
  scheduleFrame();
}

function baseColor() {
  return props.invertBase ? colorDark : colorLight;
}

function borderColor() {
  return props.invertBase ? colorLight : colorDark;
}

// The target flashes between the highlight color and a darkened
// version of it while being guessed. Guessed countries are a flat
// light green while play continues (a progress indicator), then flash
// the same way as the target once the round ends -- see
// startPulseIfNeeded/frame.
function fillColorExpression(): ExpressionSpecification {
  return [
    "case",
    ["==", ["feature-state", "role"], "target"],
    ["feature-state", "pulseColor"],
    ["==", ["feature-state", "role"], "guessed"],
    props.complete ? ["feature-state", "pulseColor"] : GUESSED_FILL,
    baseColor(),
  ];
}

function lineColorExpression(): ExpressionSpecification {
  return [
    "case",
    ["==", ["feature-state", "role"], "target"],
    ["feature-state", "pulseColor"],
    ["==", ["feature-state", "role"], "guessed"],
    props.complete ? ["feature-state", "pulseColor"] : borderColor(),
    borderColor(),
  ];
}

// Thin at the world view, thicker the closer in a country is framed.
const LINE_WIDTH_EXPRESSION: ExpressionSpecification = [
  "interpolate",
  ["linear"],
  ["zoom"],
  1,
  0.5,
  4,
  1.2,
  8,
  3,
];

function updatePaint() {
  if (!map || !styleLoaded) {
    return;
  }
  map.setPaintProperty(
    FILL_LAYER,
    "fill-color",
    fillColorExpression(),
  );
  map.setPaintProperty(
    LINE_LAYER,
    "line-color",
    lineColorExpression(),
  );
}

function buildStyle(): StyleSpecification {
  return {
    version: 8,
    // A real rotating sphere at low zoom, smoothly flattening to
    // Mercator as the camera moves in tight on a single country.
    projection: { type: "globe" },
    sources: {
      [SOURCE_ID]: {
        type: "geojson",
        data: "/countries/world.geojson",
        promoteId: "code",
      },
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: { "background-color": colorDark },
      },
      {
        id: FILL_LAYER,
        type: "fill",
        source: SOURCE_ID,
        paint: { "fill-color": fillColorExpression() },
      },
      {
        id: LINE_LAYER,
        type: "line",
        source: SOURCE_ID,
        paint: {
          "line-color": lineColorExpression(),
          "line-width": LINE_WIDTH_EXPRESSION,
        },
      },
    ],
  };
}

// Snaps straight to the target country, then eases the zoom back out
// over ZOOM_OUT_DURATION_MS -- stopping ZOOM_OUT_MARGIN levels short of
// the full map, keeping the country centered throughout (a fixed
// center, only zoom changes) rather than drifting toward the world's
// overall midpoint.
// A country's own fitBounds zoom can already be at or below the
// round's zoom-out target (e.g. Russia, whose bounds barely fit closer
// than the whole world already) -- easeTo-ing to that target would
// then zoom *in*. Skip the animation entirely rather than do that;
// holding still is preferable to zooming the wrong way.
function startZoomOutAnimation() {
  if (!map) {
    return;
  }
  const targetZoom = worldZoom + ZOOM_OUT_MARGIN;
  if (targetZoom >= map.getZoom()) {
    return;
  }
  map.easeTo({
    center: map.getCenter(),
    zoom: targetZoom,
    duration: ZOOM_OUT_DURATION_MS,
    easing: zoomOutEasing,
  });
}

function focusCountry(code: string) {
  if (!map) {
    return;
  }
  const bounds = boundsByCode.get(code);
  if (bounds) {
    map.fitBounds(bounds, {
      padding: COUNTRY_FIT_PADDING,
      duration: 0,
    });
  }
  startZoomOutAnimation();
}

function resetZoom() {
  if (!map || !worldBounds) {
    return;
  }
  map.fitBounds(worldBounds, { duration: 0 });
}

function geometryBounds(geometry: {
  type: string;
  coordinates: unknown;
}): [number, number, number, number] {
  const rings =
    geometry.type === "MultiPolygon"
      ? (geometry.coordinates as number[][][][]).map(poly => poly[0])
      : [(geometry.coordinates as number[][][])[0]];
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const ring of rings) {
    for (const [x, y] of ring ?? []) {
      if (x === undefined || y === undefined) {
        continue;
      }
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
  return [minX, minY, maxX, maxY];
}

onMounted(async () => {
  if (!mapContainerRef.value) {
    return;
  }

  const styles = getComputedStyle(document.documentElement);
  colorDark =
    styles.getPropertyValue("--color-dark").trim() || "#000";
  colorLight =
    styles.getPropertyValue("--color-light").trim() || "#fff";
  colorHighlight =
    styles.getPropertyValue("--color-highlight").trim() || "#0f0";
  highlightRgb = colorConvert.hex.rgb(
    colorHighlight.replace("#", ""),
  );
  highlightDarkRgb = highlightRgb.map(c => Math.round(c * 0.35)) as [
    number,
    number,
    number,
  ];

  const [{ default: maplibregl }, geo] = await Promise.all([
    import("maplibre-gl"),
    fetch("/countries/world.geojson").then(res => res.json()),
  ]);

  const features = geo.features as {
    properties: {
      code?: string;
      zoomBounds?: [number, number, number, number];
    };
    geometry: { type: string; coordinates: unknown };
  }[];
  for (const feature of features) {
    const { code, zoomBounds } = feature.properties;
    if (code && zoomBounds) {
      boundsByCode.set(code, zoomBounds);
    }
    // worldBounds covers every landmass on the map (not just the
    // guessable ones), so the zoomed-out view includes e.g. Greenland
    // and Antarctica-adjacent territory too.
    const [w, s, e, n] = geometryBounds(feature.geometry);
    if (!worldBounds) {
      worldBounds = [w, s, e, n];
    } else {
      worldBounds[0] = Math.min(worldBounds[0], w);
      worldBounds[1] = Math.min(worldBounds[1], s);
      worldBounds[2] = Math.max(worldBounds[2], e);
      worldBounds[3] = Math.max(worldBounds[3], n);
    }
  }

  guessedSet = new Set(props.guessedCodes);

  const initialBounds =
    (props.targetCode && boundsByCode.get(props.targetCode)) ||
    worldBounds ||
    undefined;

  map = new maplibregl.Map({
    container: mapContainerRef.value,
    style: buildStyle(),
    bounds: initialBounds,
    fitBoundsOptions: {
      padding: props.targetCode ? COUNTRY_FIT_PADDING : 0,
    },
    interactive: false,
    attributionControl: false,
  });

  if (worldBounds) {
    worldZoom =
      map.cameraForBounds(worldBounds)?.zoom ?? map.getZoom();
  }

  map.on("load", () => {
    styleLoaded = true;
    updatePaint();
    for (const code of guessedSet) {
      applyRole(code);
    }
    startPulseIfNeeded();
    if (props.targetCode) {
      startZoomOutAnimation();
    }
  });

  resizeObserver = new ResizeObserver(() => map?.resize());
  resizeObserver.observe(mapContainerRef.value);
});

onUnmounted(() => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
  }
  resizeObserver?.disconnect();
  map?.remove();
  map = null;
});

watch(
  () => props.targetCode,
  (code, previousCode) => {
    if (!map) {
      return;
    }
    if (previousCode) {
      applyRole(previousCode);
    }
    if (code) {
      focusCountry(code);
      startPulseIfNeeded();
    } else {
      resetZoom();
    }
  },
);

watch(
  () => props.guessedCodes,
  next => {
    if (!map || !styleLoaded) {
      return;
    }
    const nextSet = new Set(next);
    const changed = new Set<string>();
    for (const code of nextSet) {
      if (!guessedSet.has(code)) {
        changed.add(code);
      }
    }
    for (const code of guessedSet) {
      if (!nextSet.has(code)) {
        changed.add(code);
      }
    }
    guessedSet = nextSet;
    for (const code of changed) {
      applyRole(code);
    }
  },
  { deep: true },
);

watch(
  () => [props.complete, props.invertBase],
  () => {
    updatePaint();
    startPulseIfNeeded();
  },
);
</script>

<style lang="scss">
.countrymap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  min-height: 0;
  width: 100%;

  &-canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
}
</style>
