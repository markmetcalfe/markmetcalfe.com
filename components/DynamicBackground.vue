<template>
  <div>
    <div class="dynamicbackground" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { isSafari } from 'react-device-detect'
import { Renderer } from '~/util/3d/renderer'
import { useVisualsStore } from '~/stores/visuals'

const visualsStore = useVisualsStore()
const renderer = ref<Renderer | undefined>(undefined)

onMounted(() => {
  setTimeout(
    () => {
      const rendererInstance = new Renderer(
        document.querySelector('.dynamicbackground')!,
      )
      visualsStore.setRenderer(rendererInstance)
      rendererInstance.initialise()
      renderer.value = rendererInstance
    },
    isSafari ? 300 : 100, // Give Safari more time to init
  )
})

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
}
</style>
