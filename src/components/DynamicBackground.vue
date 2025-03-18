<template>
  <div>
    <div class="dynamicbackground" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Renderer } from '../3d'
import { useVisualsStore } from '../stores/visuals'
import { isSafari } from '../util/site'

export default defineComponent({
  name: 'DynamicBackground',

  data(): { renderer: Renderer | undefined } {
    return {
      renderer: undefined,
    }
  },

  computed: {
    visualsStore() {
      return useVisualsStore()
    },
  },

  mounted() {
    setTimeout(
      () => {
        const renderer = new Renderer(
          document.querySelector('.dynamicbackground')!,
        )
        this.visualsStore.setRenderer(renderer)
        renderer.initialise()
        this.renderer = renderer
      },
      isSafari() ? 300 : 100, // Give Safari more time to init
    )
  },

  unmounted() {
    this.renderer?.cleanUp()
  },
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
