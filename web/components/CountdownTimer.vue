<template>
  <span :class="['countdowntimer', timerClass]">
    {{ timerLabel }}
    <Icon name="bx:stopwatch" class="countdowntimer-icon" />
  </span>
</template>

<script setup lang="ts">
import type { PolySynth, Synth } from "tone";

interface Props {
  secondsLeft: number;
}

const props = defineProps<Props>();

const timerLabel = computed(() => {
  if (props.secondsLeft < 60) {
    return props.secondsLeft;
  }
  const minutes = Math.floor(props.secondsLeft / 60);
  const seconds = props.secondsLeft % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
});

const timerClass = computed(() => {
  if (props.secondsLeft > 30) {
    return "countdowntimer-ok";
  }
  if (props.secondsLeft > 10) {
    return "countdowntimer-warn";
  }
  return "countdowntimer-danger";
});

// Ticking clock sound as time runs low. Callers only ever render this
// component while their own round/timer is actually live (both
// Country Guesser and Doodle v-if it away otherwise), so mount/unmount
// is all the "is this running" signal the tick needs.
let tickSynth: PolySynth<Synth> | undefined;
let tickTimer: ReturnType<typeof setTimeout> | undefined;

watch(
  () => props.secondsLeft,
  timeLeft => {
    clearTimeout(tickTimer);
    if (timeLeft >= 10 || timeLeft <= 0 || !tickSynth) {
      return;
    }
    const urgent = timeLeft < 5;
    tickSynth.triggerAttackRelease(urgent ? "A5" : "A4", "32n");
    const extraTicks =
      timeLeft < 3 ? [333, 666] : urgent ? [500] : [];
    extraTicks.forEach((delay, i) => {
      tickTimer = setTimeout(() => {
        tickSynth?.triggerAttackRelease(
          i % 2 === 0 ? "E5" : "A5",
          "32n",
        );
      }, delay);
    });
  },
);

onMounted(async () => {
  const Tone = await import("tone");
  tickSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "square" },
    envelope: {
      attack: 0.001,
      decay: 0.04,
      sustain: 0,
      release: 0.01,
    },
  }).toDestination();
  tickSynth.volume.value = -12;
});

onUnmounted(() => {
  clearTimeout(tickTimer);
  tickSynth?.dispose();
  tickSynth = undefined;
});
</script>

<style lang="scss">
.countdowntimer {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.2rem;
  font-size: 1.1rem;
  font-weight: 700;
  min-width: 42px;
  text-align: right;

  &-icon {
    font-size: 1.2em;
  }

  &-ok {
    color: var(--color-highlight);
  }

  &-warn {
    color: #ffb300;
  }

  &-danger {
    color: var(--color-error);
  }
}
</style>
