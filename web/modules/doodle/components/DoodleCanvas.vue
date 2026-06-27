<template>
  <div class="doodlecanvas">
    <div class="doodlecanvas-wrap">
      <canvas
        ref="canvasEl"
        class="doodlecanvas-el"
        :class="{ 'doodlecanvas-el-active': store.amIDrawing }"
        width="800"
        height="600"
      />
    </div>

    <!-- Toolbar shown only for the current drawer -->
    <div v-if="store.amIDrawing" class="doodlecanvas-toolbar">
      <div class="doodlecanvas-toolbar-colors">
        <button
          v-for="color in COLORS"
          :key="color"
          :class="[
            'doodlecanvas-color',
            { 'doodlecanvas-color-active': store.drawColor === color },
          ]"
          :style="{ background: color }"
          :title="color"
          @click="store.drawColor = color"
        />
      </div>

      <div class="doodlecanvas-toolbar-sizes">
        <button
          v-for="size in SIZES"
          :key="size"
          :class="['doodlecanvas-size', { 'doodlecanvas-size-active': store.drawSize === size }]"
          :title="`Size ${size}`"
          @click="store.drawSize = size"
        >
          <span
            class="doodlecanvas-size-dot"
            :style="{ width: `${size}px`, height: `${size}px` }"
          />
        </button>
      </div>

      <div class="doodlecanvas-toolbar-actions">
        <LinkButton text="Eraser" @click="eraser">
          <Icon name="bx:eraser" />
        </LinkButton>
        <LinkButton text="Clear" @click="store.clearCanvas()">
          <Icon name="bx:trash" />
        </LinkButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DrawEvent } from "@doodle/stores/doodle";

const store = useDoodleStore();

const COLORS = [
  "#000000",
  "#6b7280",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#ffffff",
  "#854d0e",
];
const SIZES = [3, 8, 16, 26];

const canvasEl = ref<HTMLCanvasElement>();
let ctx: CanvasRenderingContext2D | null = null;
let isDrawing = false;

function applyEvent(event: DrawEvent): void {
  if (!ctx || !canvasEl.value) {
    return;
  }
  const c = canvasEl.value;
  switch (event.kind) {
    case "begin":
      ctx.beginPath();
      ctx.moveTo(event.x * c.width, event.y * c.height);
      ctx.strokeStyle = event.color;
      ctx.lineWidth = event.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      break;
    case "move":
      ctx.lineTo(event.x * c.width, event.y * c.height);
      ctx.stroke();
      break;
    case "end":
      ctx.closePath();
      break;
    case "clear":
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, c.width, c.height);
      break;
  }
}

function replayHistory(history: DrawEvent[]): void {
  if (!ctx || !canvasEl.value) {
    return;
  }
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasEl.value.width, canvasEl.value.height);
  for (const ev of history) {
    applyEvent(ev);
  }
}

function normPos(e: MouseEvent | Touch): { x: number; y: number } {
  const c = canvasEl.value!;
  const rect = c.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) * (c.width / rect.width)) / c.width,
    y: ((e.clientY - rect.top) * (c.height / rect.height)) / c.height,
  };
}

function onStart(pos: { x: number; y: number }): void {
  if (!store.amIDrawing) {
    return;
  }
  isDrawing = true;
  const event: DrawEvent = { kind: "begin", ...pos, color: store.drawColor, size: store.drawSize };
  applyEvent(event);
  store.sendDraw(event);
}

function onMove(pos: { x: number; y: number }): void {
  if (!isDrawing || !store.amIDrawing) {
    return;
  }
  const event: DrawEvent = { kind: "move", ...pos };
  applyEvent(event);
  store.sendDraw(event);
}

function onEnd(): void {
  if (!isDrawing) {
    return;
  }
  isDrawing = false;
  const event: DrawEvent = { kind: "end" };
  applyEvent(event);
  store.sendDraw(event);
}

function eraser(): void {
  store.drawColor = "#ffffff";
  store.drawSize = 24;
}

onMounted(() => {
  const c = canvasEl.value!;
  ctx = c.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, c.width, c.height);

  store.registerCanvasCallbacks(
    event => applyEvent(event),
    history => replayHistory(history),
  );

  // Mouse
  c.addEventListener("mousedown", e => onStart(normPos(e)));
  c.addEventListener("mousemove", e => onMove(normPos(e)));
  c.addEventListener("mouseup", onEnd);
  c.addEventListener("mouseleave", onEnd);

  // Touch
  c.addEventListener(
    "touchstart",
    e => {
      e.preventDefault();
      onStart(normPos(e.touches[0]!));
    },
    { passive: false },
  );
  c.addEventListener(
    "touchmove",
    e => {
      e.preventDefault();
      onMove(normPos(e.touches[0]!));
    },
    { passive: false },
  );
  c.addEventListener(
    "touchend",
    e => {
      e.preventDefault();
      onEnd();
    },
    { passive: false },
  );
});

onUnmounted(() => {
  store.unregisterCanvasCallbacks();
});
</script>

<style lang="scss">
@use "/variables" as vars;

.doodlecanvas {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;

  &-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #111;
    overflow: hidden;
  }

  &-el {
    display: block;
    max-width: 100%;
    max-height: 100%;
    cursor: default;
    touch-action: none;
    border: 1px solid var(--color-highlight);

    &-active {
      cursor: crosshair;
    }
  }

  &-toolbar {
    display: flex;
    height: 35px;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
    padding: 0.6rem 1rem;
    border-top: 1px solid var(--color-light);
    flex-shrink: 0;

    @include vars.mobile-only {
      padding: 0.4rem 0.6rem;
      gap: 0.5rem;
    }
  }

  &-toolbar-colors {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  &-color {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    cursor: pointer;
    padding: 0;
    border: 1px solid var(--color-light);
    transition: transform 100ms;
    outline: 2px solid transparent;
    outline-offset: 2px;

    &:hover {
      transform: scale(1.15);
    }

    &-active {
      outline-color: var(--color-highlight);
    }
  }

  &-toolbar-sizes {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &-size {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-light);
    border-radius: 50%;
    cursor: pointer;
    padding: 0;
    background: none;
    transition: border-color 100ms;

    &-active {
      border-color: var(--color-highlight);
    }

    &-dot {
      background: var(--color-light);
      border-radius: 50%;
    }
  }

  &-toolbar-actions {
    display: flex;
    gap: 0.5rem;
    margin-left: auto;
  }

  &-action {
    background: none;
    border: 1px solid var(--color-light);
    color: var(--color-light);
    border-radius: 4px;
    font-size: 0.8rem;
    padding: 0.25rem 0.6rem;
    cursor: pointer;
    transition: border-color 150ms;

    &:hover {
      border-color: var(--color-highlight);
      color: var(--color-highlight);
    }
  }
}
</style>
