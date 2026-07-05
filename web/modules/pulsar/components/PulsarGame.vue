<template>
  <div ref="containerRef" class="pulsar-game">
    <Transition name="pulsar-fade">
      <div v-if="store.phase === 'playing'" class="pulsar-hud">
        <span class="pulsar-hud-score">{{
          store.score.toLocaleString()
        }}</span>
      </div>
    </Transition>

    <ModalDialog v-if="store.phase === 'idle'">
      <h2 class="pulsar-screen-title">Pulsar</h2>
      <p class="pulsar-screen-sub">
        Navigate through space — avoid all obstacles
      </p>
      <ul class="pulsar-screen-controls">
        <li>← → or A / D to switch lanes</li>
        <li>↑ or Space to jump over low obstacles</li>
        <li>Swipe left / right / up on mobile</li>
      </ul>
      <LinkButton text="Play" large @click="store.startGame()">
        <Icon name="bx:play" />
      </LinkButton>
    </ModalDialog>

    <ModalDialog v-if="store.phase === 'dead'">
      <h2 class="pulsar-screen-title">Game Over</h2>
      <p class="pulsar-screen-score">
        {{ store.score.toLocaleString() }}
      </p>
      <p v-if="store.highScore > 0" class="pulsar-screen-best">
        Best: {{ store.highScore.toLocaleString() }}
      </p>
      <LinkButton text="Play Again" large @click="store.startGame()">
        <Icon name="bx:play" />
      </LinkButton>
    </ModalDialog>
  </div>
</template>

<script setup lang="ts">
import type { ObstacleData } from "@pulsar/util/game";
import { PulsarRenderer } from "@pulsar/util/game";

const store = usePulsarStore();
const containerRef = ref<HTMLElement>();

let game: PulsarRenderer | null = null;
let rafId = 0;
let lastTime = 0;
let prevPhase = store.phase;

usePulsarSound();

function gameLoop(time: number) {
  const delta = Math.min((time - lastTime) / 1000, 0.05);
  lastTime = time;

  const wasPlaying = prevPhase === "playing";
  const nowDead = store.phase === "dead";

  store.tick(delta);

  if (wasPlaying && store.phase === "dead" && !nowDead) {
    game?.flashCrash();
  }
  prevPhase = store.phase;

  game?.render(
    store.playerX,
    store.playerY,
    store.obstacles as ObstacleData[],
    delta,
  );

  rafId = requestAnimationFrame(gameLoop);
}

function handleKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case "ArrowLeft":
    case "a":
    case "A":
      e.preventDefault();
      store.moveLeft();
      break;
    case "ArrowRight":
    case "d":
    case "D":
      e.preventDefault();
      store.moveRight();
      break;
    case "ArrowUp":
    case " ":
      e.preventDefault();
      if (store.phase !== "playing") {
        store.startGame();
      } else {
        store.jump();
      }
      break;
    case "Enter":
      if (store.phase !== "playing") {
        store.startGame();
      }
      break;
  }
}

let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0]!.clientX;
  touchStartY = e.touches[0]!.clientY;
}

function handleTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0]!.clientX - touchStartX;
  const dy = e.changedTouches[0]!.clientY - touchStartY;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (Math.max(absDx, absDy) < 20) {
    if (store.phase !== "playing") {
      store.startGame();
    }
    return;
  }

  if (absDx > absDy) {
    if (dx < 0) {
      store.moveLeft();
    } else {
      store.moveRight();
    }
  } else if (dy < 0) {
    if (store.phase === "playing") {
      store.jump();
    } else {
      store.startGame();
    }
  }
}

onMounted(() => {
  if (!containerRef.value) {
    return;
  }

  game = new PulsarRenderer(containerRef.value);
  game.initialise();

  window.addEventListener("keydown", handleKeydown);
  containerRef.value.addEventListener(
    "touchstart",
    handleTouchStart,
    {
      passive: true,
    },
  );
  containerRef.value.addEventListener("touchend", handleTouchEnd, {
    passive: true,
  });

  rafId = requestAnimationFrame(time => {
    lastTime = time;
    rafId = requestAnimationFrame(gameLoop);
  });
});

onUnmounted(() => {
  cancelAnimationFrame(rafId);
  game?.cleanUp();
  game = null;
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<style lang="scss">
@use "/variables" as vars;

.pulsar-game {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: default;

  canvas {
    display: block;
    width: 100% !important;
    height: 100% !important;
  }
}

.pulsar-hud {
  position: absolute;
  top: 1rem;
  right: 1.25rem;
  pointer-events: none;
  z-index: 10;

  &-score {
    font-family: monospace;
    font-size: 2rem;
    font-weight: bold;
    color: #0f0;
    text-shadow:
      0 0 8px #0c0,
      0 0 16px #0a0;
  }
}

.pulsar-screen {
  &-score {
    font-family: monospace;
    font-size: 3rem;
    font-weight: bold;
    color: #0f0;
    text-shadow: 0 0 10px #0c0;
    margin: 0;
  }

  &-best {
    font-family: monospace;
    font-size: 1.1rem;
    color: #595;
    margin: 0;
  }

  &-sub {
    color: #8c8;
    font-size: 1rem;
    margin: 0;
  }

  &-controls {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    color: #383;
    font-size: 0.85rem;

    @include vars.mobile-only {
      font-size: 0.8rem;
    }
  }
}

.pulsar-fade-enter-active,
.pulsar-fade-leave-active {
  transition: opacity 0.3s ease;
}

.pulsar-fade-enter-from,
.pulsar-fade-leave-to {
  opacity: 0;
}
</style>
