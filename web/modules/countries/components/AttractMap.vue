<template>
  <div class="attractmap">
    <CountryMap
      :target-code="targetCode"
      :guessed-codes="[]"
      invert-base
      :highlight-target="false"
    />
  </div>
</template>

<script setup lang="ts">
import { COUNTRIES } from "../data/countries";

// How long each country stays focused before the preview jumps to
// another one. Shorter than CountryMap's own zoom-out duration so the
// background always looks mid-transition rather than settling fully.
const CYCLE_INTERVAL_MS = 7000;

const targetCode = ref<string | null>(null);
let timer: ReturnType<typeof setInterval> | undefined;

function focusRandomCountry() {
  const previous = targetCode.value;
  let next = previous;
  while (next === previous) {
    const country =
      COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    next = country?.code ?? null;
  }
  targetCode.value = next;
}

onMounted(() => {
  focusRandomCountry();
  timer = setInterval(focusRandomCountry, CYCLE_INTERVAL_MS);
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<style lang="scss">
.attractmap {
  position: fixed;
  inset: 0;
  display: flex;
  opacity: 0.25;
  pointer-events: none;
  z-index: -1;
}
</style>
