<template>
  <div
    class="dynamicbackground-wrapper"
    :style="{ filter: blurString }"
  >
    <div
      class="dynamicbackground"
      :style="{
        filter: filterString,
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { isSafari } from "react-device-detect";
import { Renderer } from "@visuals/util/renderer";

const visualsStore = useVisualsStore();
const renderer = ref<Renderer | undefined>(undefined);

const filterString = computed(() => {
  const filters = visualsStore.filters;
  if (!filters.enabled) {
    return "";
  }
  const filterValues = {
    brightness: `${filters.brightness / 100}`,
    contrast: `${filters.contrast}%`,
    saturate: `${filters.saturate}%`,
  };
  return Object.entries(filterValues)
    .map(([key, value]) => `${key}(${value})`)
    .join(" ");
});

const blurString = computed(() => {
  const filters = visualsStore.filters;
  if (!filters.enabled) {
    return "";
  }
  return `blur(${filters.blur}px)`;
});

onMounted(() => {
  setTimeout(
    () => {
      const rendererInstance = new Renderer(
        document.querySelector(".dynamicbackground")!,
      );
      visualsStore.setRenderer(rendererInstance);
      rendererInstance.initialise();
      renderer.value = rendererInstance;
    },
    isSafari ? 500 : 100, // Give Safari more time to init
  );
});

onUnmounted(() => {
  renderer.value?.cleanUp();
});
</script>

<style lang="scss">
.dynamicbackground-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  min-width: 100vw;
  min-height: 100vh;
  z-index: -100;
}

.dynamicbackground {
  width: 100%;
  height: 100%;
  transition: opacity 0.4s;
  cursor: pointer;
}
</style>
