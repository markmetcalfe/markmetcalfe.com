<template>
  <div>
    <div class="dynamicbackground-3d" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Renderer } from '../3d'
import { useRendererSettingsStore } from '../stores/renderer-settings'

export default defineComponent({
  name: 'DynamicBackground',

  data(): { renderer: Renderer | undefined } {
    return {
      renderer: undefined,
    }
  },

  computed: {
    store() {
      return useRendererSettingsStore()
    },
  },

  mounted() {
    this.$nextTick(() => {
      const renderer = new Renderer(
        document.querySelector('.dynamicbackground-3d')!,
      )
      this.store.setRenderer(renderer)
      renderer.initialise()
      this.renderer = renderer
    })
  },

  unmounted() {
    this.renderer?.cleanUp()
  },
})
</script>

<style lang="scss">
.dynamicbackground {
  &-3d {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    min-width: 100vw;
    min-height: 100vh;
    z-index: -100;
    transition: opacity 0.4s;
  }
}
</style>
