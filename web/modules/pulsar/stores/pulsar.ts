import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { TRACK_X, FULL_H, LOW_H } from "@pulsar/util/game";

export type GamePhase = "idle" | "playing" | "dead";

export interface ObstacleState {
  id: number;
  trackIndex: 0 | 1 | 2;
  z: number;
  height: "low" | "full";
  active: boolean;
}

const JUMP_HEIGHT = 4.5;
const SWITCH_SPEED = 5; // lerp t units per second (0→1 in 0.2s)
const JUMP_DURATION = 0.45; // seconds for full arc

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

export const usePulsarStore = defineStore("pulsar", () => {
  const phase = ref<GamePhase>("idle");
  const score = ref(0);
  const highScore = ref(0);
  const speed = ref(8);

  const targetTrack = ref<0 | 1 | 2>(1);
  const fromX = ref<number>(TRACK_X[1]);
  const toX = ref<number>(TRACK_X[1]);
  const laneT = ref(1.0);

  const isJumping = ref(false);
  const jumpT = ref(0);

  const obstacles = ref<ObstacleState[]>([]);

  let nextObstacleIn = 1.5;
  let obstacleId = 0;
  let speedTimer = 0;

  const playerX = computed(() => {
    const t = smoothstep(Math.min(laneT.value, 1));
    return fromX.value + (toX.value - fromX.value) * t;
  });

  const playerY = computed(() => {
    if (!isJumping.value) {
      return 0;
    }
    return Math.sin(jumpT.value * Math.PI) * JUMP_HEIGHT;
  });

  function startGame(): void {
    phase.value = "playing";
    score.value = 0;
    speed.value = 14;
    targetTrack.value = 1;
    fromX.value = TRACK_X[1];
    toX.value = TRACK_X[1];
    laneT.value = 1;
    isJumping.value = false;
    jumpT.value = 0;
    obstacles.value = [];
    nextObstacleIn = 0.6;
    obstacleId = 0;
    speedTimer = 0;
  }

  function tick(delta: number): void {
    if (phase.value !== "playing") {
      return;
    }

    score.value += Math.round(speed.value * delta * 10);

    speedTimer += delta;
    if (speedTimer >= 5) {
      speed.value = Math.min(speed.value + 0.8, 28);
      speedTimer = 0;
    }

    if (laneT.value < 1) {
      laneT.value = Math.min(1, laneT.value + delta * SWITCH_SPEED);
    }

    if (isJumping.value) {
      jumpT.value += delta / JUMP_DURATION;
      if (jumpT.value >= 1) {
        jumpT.value = 0;
        isJumping.value = false;
      }
    }

    for (const obs of obstacles.value) {
      obs.z += speed.value * delta;
    }
    obstacles.value = obstacles.value.filter(obs => obs.z < 14);

    nextObstacleIn -= delta;
    if (nextObstacleIn <= 0) {
      spawnObstacle();
      const baseGap = Math.max(0.4, 1.2 - (speed.value - 14) * 0.04);
      nextObstacleIn = baseGap * (0.7 + Math.random() * 0.6);
    }

    checkCollisions();
  }

  function spawnObstacle(): void {
    const blockedTracks = new Set(
      obstacles.value
        .filter(o => o.z > -22 && o.z < 0)
        .map(o => o.trackIndex),
    );

    const available = ([0, 1, 2] as const).filter(
      t => !blockedTracks.has(t),
    );
    if (available.length === 0) {
      return;
    }

    const trackIndex =
      available[Math.floor(Math.random() * available.length)]!;
    const height = Math.random() < 0.3 ? "low" : "full";

    obstacles.value.push({
      id: obstacleId++,
      trackIndex,
      z: -80,
      height,
      active: true,
    });
  }

  function checkCollisions(): void {
    const px = playerX.value;
    const py = playerY.value;

    for (const obs of obstacles.value) {
      if (!obs.active) {
        continue;
      }

      const obsX = TRACK_X[obs.trackIndex];
      const obsHeight = obs.height === "full" ? FULL_H : LOW_H;

      const xHit = Math.abs(px - obsX) < 1.8;
      const zHit = Math.abs(obs.z) < 2.1;
      const yHit = py < obsHeight;

      if (xHit && zHit && yHit) {
        obs.active = false;
        endGame();
        return;
      }
    }
  }

  function moveLeft(): void {
    if (phase.value !== "playing" || targetTrack.value === 0) {
      return;
    }
    fromX.value = playerX.value;
    targetTrack.value = (targetTrack.value - 1) as 0 | 1 | 2;
    toX.value = TRACK_X[targetTrack.value];
    laneT.value = 0;
  }

  function moveRight(): void {
    if (phase.value !== "playing" || targetTrack.value === 2) {
      return;
    }
    fromX.value = playerX.value;
    targetTrack.value = (targetTrack.value + 1) as 0 | 1 | 2;
    toX.value = TRACK_X[targetTrack.value];
    laneT.value = 0;
  }

  function jump(): void {
    if (phase.value !== "playing" || isJumping.value) {
      return;
    }
    isJumping.value = true;
    jumpT.value = 0;
  }

  function endGame(): void {
    phase.value = "dead";
    if (score.value > highScore.value) {
      highScore.value = score.value;
    }
  }

  return {
    phase,
    score,
    highScore,
    speed,
    targetTrack,
    isJumping,
    jumpT,
    obstacles,
    playerX,
    playerY,
    startGame,
    tick,
    moveLeft,
    moveRight,
    jump,
    endGame,
  };
});
