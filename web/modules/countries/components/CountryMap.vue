<template>
  <div
    ref="containerRef"
    class="countrymap"
    :class="{ 'countrymap-complete': props.complete }"
  >
    <canvas ref="canvasRef" class="countrymap-canvas" />
  </div>
</template>

<script setup lang="ts">
import { COUNTRIES } from "../data/countries";

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

const containerRef = ref<HTMLDivElement>();
const canvasRef = ref<HTMLCanvasElement>();
let ctx: CanvasRenderingContext2D | null = null;

type Box = { minX: number; minY: number; maxX: number; maxY: number };
type ViewBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};
type Camera = ViewBox;

// A country piece rendered on the canvas. `circle` is set for <circle>
// leaves (which need a dynamic radius override when active); `path` is
// a pre-built Path2D for everything else (only <path> appears
// otherwise in this map).
interface Piece {
  codes: string[];
  hidden: boolean;
  strokeWidth: number;
  circle: { cx: number; cy: number; r: number } | null;
  path: Path2D | null;
}

let baseViewBox: ViewBox | null = null;
let pieces: Piece[] = [];
const zoomStartByCode = new Map<
  string,
  { cx: number; cy: number; width: number; height: number }
>();
let colorDark = "#000";
let colorLight = "#fff";
let colorHighlight = "#0f0";

// A target country is zoomed so it fills at least half of the view
// (in width and/or height) rather than being shown at true relative
// size, so tiny countries aren't nearly invisible next to huge ones.
const ZOOM_PADDING_FACTOR = 1.6;

// After the initial zoom-in, the view gradually pulls back out to the
// full map over this many milliseconds, giving surrounding geography
// away as a passive clue the longer a country goes unguessed.
const ZOOM_OUT_DURATION_MS = 60000;

// Classes whose elements are hidden (opacity 0) in the source map
// unless they're the current target or already guessed — small marker
// circles drawn over disputed/limited-recognition territories (e.g.
// Kosovo) rather than full landmass shapes.
const HIDDEN_BY_DEFAULT_CLASSES = new Set([
  "unxx",
  "subxx",
  "noxx",
  "circlexx",
]);
const RELEVANT_TYPE_CLASSES = new Set([
  "landxx",
  "unxx",
  "subxx",
  "antxx",
  "limitxx",
  "noxx",
  "circlexx",
]);

let camera: Camera = { x: 0, y: 0, width: 1, height: 1 };
let zoomTween: {
  cx: number;
  cy: number;
  fromWidth: number;
  fromHeight: number;
  toWidth: number;
  toHeight: number;
  startTime: number;
} | null = null;
let rafId: number | null = null;
let resizeObserver: ResizeObserver | null = null;

function scheduleFrame() {
  if (rafId !== null) {
    return;
  }
  rafId = requestAnimationFrame(frame);
}

function frame(now: number) {
  rafId = null;
  let stillAnimating = false;
  if (zoomTween) {
    const t = Math.min(
      1,
      (now - zoomTween.startTime) / ZOOM_OUT_DURATION_MS,
    );
    const width =
      zoomTween.fromWidth +
      (zoomTween.toWidth - zoomTween.fromWidth) * t;
    const height =
      zoomTween.fromHeight +
      (zoomTween.toHeight - zoomTween.fromHeight) * t;
    camera = {
      x: zoomTween.cx - width / 2,
      y: zoomTween.cy - height / 2,
      width,
      height,
    };
    if (t < 1) {
      stillAnimating = true;
    } else {
      zoomTween = null;
    }
  }
  // The target's pulse animation needs a continuous redraw loop too.
  if (props.targetCode && props.highlightTarget) {
    stillAnimating = true;
  }
  draw(now);
  if (stillAnimating) {
    scheduleFrame();
  }
}

// Matches the CSS `countrymap-pulse` keyframes this replaces: a 1s
// ease-in-out loop between fill-opacity 1 and 0.75.
function pulseFactor(now: number): number {
  return 0.875 + 0.125 * Math.cos((now / 1000) * Math.PI * 2);
}

function draw(now: number) {
  if (!ctx || !canvasRef.value) {
    return;
  }
  const canvas = canvasRef.value;
  const cw = canvas.width;
  const ch = canvas.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, cw, ch);
  if (camera.width <= 0 || camera.height <= 0) {
    return;
  }
  const scale = Math.min(cw / camera.width, ch / camera.height);
  const offsetX = (cw - camera.width * scale) / 2 - camera.x * scale;
  const offsetY = (ch - camera.height * scale) / 2 - camera.y * scale;
  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);

  const guessedSet = new Set(props.guessedCodes);
  const pulse = props.highlightTarget ? pulseFactor(now) : 1;

  for (const piece of pieces) {
    const isTarget = piece.codes.includes(props.targetCode ?? "");
    const isGuessed = piece.codes.some(code => guessedSet.has(code));
    if (!isTarget && !isGuessed && piece.hidden) {
      continue;
    }
    const highlighted = isTarget && props.highlightTarget;

    const stroke = highlighted
      ? colorHighlight
      : props.invertBase
        ? colorLight
        : colorDark;
    const strokeWidth = highlighted ? 1 : piece.strokeWidth;
    const fill = highlighted
      ? colorHighlight
      : isGuessed
        ? props.complete
          ? colorHighlight
          : "#b3ffb3"
        : props.invertBase
          ? colorDark
          : "#fff";

    if (piece.circle) {
      const isActive = highlighted || isGuessed;
      const r = isActive ? 15 : piece.circle.r;
      const alpha = isActive ? 0.35 : 1;
      const shape = new Path2D();
      shape.arc(piece.circle.cx, piece.circle.cy, r, 0, Math.PI * 2);
      ctx.globalAlpha = highlighted ? alpha * pulse : alpha;
      ctx.fillStyle = fill;
      ctx.fill(shape);
      ctx.globalAlpha = alpha;
      if (strokeWidth > 0) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;
        ctx.stroke(shape);
      }
      ctx.globalAlpha = 1;
    } else if (piece.path) {
      ctx.globalAlpha = highlighted ? pulse : 1;
      ctx.fillStyle = fill;
      ctx.fill(piece.path, "evenodd");
      ctx.globalAlpha = 1;
      if (strokeWidth > 0) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;
        ctx.stroke(piece.path);
      }
    }
  }
}

function resizeCanvas() {
  const canvas = canvasRef.value;
  const container = containerRef.value;
  if (!canvas || !container) {
    return;
  }
  const dpr = window.devicePixelRatio || 1;
  const width = container.clientWidth;
  const height = container.clientHeight;
  if (width === 0 || height === 0) {
    return;
  }
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  draw(performance.now());
}

function setCamera(box: ViewBox) {
  zoomTween = null;
  camera = {
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
  };
}

function zoomToCountry(code: string) {
  const start = zoomStartByCode.get(code);
  if (!start || !baseViewBox) {
    return;
  }
  camera = {
    x: start.cx - start.width / 2,
    y: start.cy - start.height / 2,
    width: start.width,
    height: start.height,
  };
  const baseAspect = baseViewBox.width / baseViewBox.height;
  const endHeight = baseViewBox.height;
  const endWidth = endHeight * baseAspect;
  zoomTween = {
    cx: start.cx,
    cy: start.cy,
    fromWidth: start.width,
    fromHeight: start.height,
    toWidth: endWidth,
    toHeight: endHeight,
    startTime: performance.now(),
  };
  scheduleFrame();
}

function resetZoom() {
  if (!baseViewBox) {
    return;
  }
  setCamera(baseViewBox);
  draw(performance.now());
}

function boundingBoxOf(elements: Element[]): Box | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  elements.forEach(el => {
    const bbox = (el as SVGGraphicsElement).getBBox();
    if (bbox.width === 0 && bbox.height === 0) {
      return;
    }
    minX = Math.min(minX, bbox.x);
    minY = Math.min(minY, bbox.y);
    maxX = Math.max(maxX, bbox.x + bbox.width);
    maxY = Math.max(maxY, bbox.y + bbox.height);
  });
  return Number.isFinite(minX) ? { minX, minY, maxX, maxY } : null;
}

// A handful of countries (e.g. Kiribati) have territory split across
// opposite edges of this equirectangular map because they straddle the
// antimeridian. Unioning every piece's bbox would produce a "zoom" box
// almost as wide as the whole map. Zoom to the single largest piece
// instead — every piece still gets colored in when guessed/targeted,
// this only affects what the camera frames.
function largestPieceBoundingBox(elements: Element[]): Box | null {
  let best: Box | null = null;
  let bestArea = -1;
  elements.forEach(el => {
    const tag = el.tagName.toLowerCase();
    if (tag !== "path" && tag !== "circle") {
      return;
    }
    const bbox = (el as SVGGraphicsElement).getBBox();
    const area = bbox.width * bbox.height;
    if (area <= 0 || area <= bestArea) {
      return;
    }
    bestArea = area;
    best = {
      minX: bbox.x,
      minY: bbox.y,
      maxX: bbox.x + bbox.width,
      maxY: bbox.y + bbox.height,
    };
  });
  return best;
}

function classesOf(el: Element): string[] {
  return (el.getAttribute("class") ?? "")
    .split(/\s+/)
    .filter(Boolean);
}

// Class-based CSS styling in the source map is set on a country's
// outer <g> (or directly on a lone <path>/<circle>); children with no
// class of their own inherit it. Walk up to find whichever element
// actually carries the type class.
function effectiveClasses(
  leaf: Element,
  root: SVGSVGElement,
): string[] {
  let el: Element | null = leaf;
  while (el && el !== root) {
    const own = classesOf(el);
    if (own.length > 0) {
      return own;
    }
    el = el.parentElement;
  }
  return [];
}

function strokeWidthFor(classes: string[]): number {
  if (classes.includes("coastxx")) {
    return 0.3;
  }
  if (classes.includes("landxx")) {
    return 0.5;
  }
  if (classes.includes("unxx") || classes.includes("subxx")) {
    return 0.3;
  }
  return 0;
}

function selectCountryElements(
  root: SVGSVGElement,
  code: string,
): Element[] {
  const escaped = CSS.escape(code);
  return Array.from(
    root.querySelectorAll(`#${escaped}, #${escaped} *, .${escaped}`),
  );
}

// Fetches the map, stages it in an off-screen (but still rendered, so
// getBBox() works) SVG element just long enough to measure geometry
// and read path/circle data, then discards the SVG entirely — the
// canvas never touches the DOM again after this.
async function setup() {
  const res = await fetch("/countries/world.svg");
  const markup = await res.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(markup, "image/svg+xml");
  const svgRoot = doc.documentElement as unknown as SVGSVGElement;

  const staging = document.createElement("div");
  staging.style.cssText =
    "position:fixed;left:-99999px;top:-99999px;width:1px;height:1px;overflow:hidden;";
  document.body.appendChild(staging);
  staging.appendChild(svgRoot);

  try {
    const candidates = Array.from(
      svgRoot.querySelectorAll(".landxx, .unxx, .subxx"),
    );
    const box = boundingBoxOf(candidates);
    if (box) {
      const padding = 10;
      baseViewBox = {
        x: box.minX - padding,
        y: box.minY - padding,
        width: box.maxX - box.minX + padding * 2,
        height: box.maxY - box.minY + padding * 2,
      };
    }

    const codeByElement = new Map<Element, string[]>();
    for (const country of COUNTRIES) {
      const matched = selectCountryElements(svgRoot, country.code);
      matched.forEach(el => {
        const list = codeByElement.get(el) ?? [];
        list.push(country.code);
        codeByElement.set(el, list);
      });
      const zoomBox =
        largestPieceBoundingBox(matched) ?? boundingBoxOf(matched);
      if (zoomBox && baseViewBox) {
        const baseAspect = baseViewBox.width / baseViewBox.height;
        const countryWidth = zoomBox.maxX - zoomBox.minX;
        const countryHeight = zoomBox.maxY - zoomBox.minY;
        let width = countryWidth * ZOOM_PADDING_FACTOR;
        let height = countryHeight * ZOOM_PADDING_FACTOR;
        if (width / height > baseAspect) {
          height = width / baseAspect;
        } else {
          width = height * baseAspect;
        }
        zoomStartByCode.set(country.code, {
          cx: (zoomBox.minX + zoomBox.maxX) / 2,
          cy: (zoomBox.minY + zoomBox.maxY) / 2,
          width,
          height,
        });
      }
    }

    const leaves = svgRoot.querySelectorAll("path, circle");
    const built: Piece[] = [];
    leaves.forEach(leaf => {
      const classes = effectiveClasses(leaf, svgRoot);
      if (!classes.some(c => RELEVANT_TYPE_CLASSES.has(c))) {
        return;
      }
      const codes = codeByElement.get(leaf) ?? [];
      const hidden = classes.some(c =>
        HIDDEN_BY_DEFAULT_CLASSES.has(c),
      );
      const strokeWidth = strokeWidthFor(classes);
      if (leaf.tagName.toLowerCase() === "circle") {
        built.push({
          codes,
          hidden,
          strokeWidth,
          circle: {
            cx: Number(leaf.getAttribute("cx") ?? 0),
            cy: Number(leaf.getAttribute("cy") ?? 0),
            r: Number(leaf.getAttribute("r") ?? 0),
          },
          path: null,
        });
        return;
      }
      const d = leaf.getAttribute("d");
      if (!d) {
        return;
      }
      built.push({
        codes,
        hidden,
        strokeWidth,
        circle: null,
        path: new Path2D(d),
      });
    });
    pieces = built;
  } finally {
    staging.remove();
  }
}

onMounted(async () => {
  const canvas = canvasRef.value;
  if (!canvas) {
    return;
  }
  ctx = canvas.getContext("2d");
  const styles = getComputedStyle(document.documentElement);
  colorDark =
    styles.getPropertyValue("--color-dark").trim() || "#000";
  colorLight =
    styles.getPropertyValue("--color-light").trim() || "#fff";
  colorHighlight =
    styles.getPropertyValue("--color-highlight").trim() || "#0f0";

  await setup();
  resetZoom();
  if (props.targetCode) {
    zoomToCountry(props.targetCode);
  }

  resizeObserver = new ResizeObserver(resizeCanvas);
  if (containerRef.value) {
    resizeObserver.observe(containerRef.value);
  }
  resizeCanvas();
});

onUnmounted(() => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
  }
  resizeObserver?.disconnect();
});

watch(
  () => props.targetCode,
  code => {
    if (code) {
      zoomToCountry(code);
    } else {
      resetZoom();
    }
    scheduleFrame();
  },
);

watch(
  () => [props.guessedCodes.length, props.complete],
  () => draw(performance.now()),
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
