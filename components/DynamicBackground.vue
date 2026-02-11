<template>
  <div>
    <div
      class="dynamicbackground"
      :class="{ 'dynamicbackground--hidden': !visualsStore.visible }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { Renderer } from '~/util/3d/renderer'
import { useVisualsStore } from '~/stores/visuals'
import { useOnElementMounted } from '~/util/hooks/useOnElementMounted'

const visualsStore = useVisualsStore()
const renderer = ref<Renderer | undefined>(undefined)

useOnElementMounted(
  '.dynamicbackground',
  (element: HTMLElement) => {
    const rendererInstance = new Renderer(element)
    visualsStore.setRenderer(rendererInstance)
    rendererInstance.initialise()
    rendererInstance.start()
    renderer.value = rendererInstance
  },
)

onUnmounted(() => {
  renderer.value?.cleanUp()
})
</script>

<style lang="scss">
.dynamicbackground {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  min-width: 100vw;
  min-height: 100vh;
  z-index: -100;
  transition: opacity 0.4s;
  cursor: pointer;

  &--hidden {
    opacity: 0;
  }
}
</style>
