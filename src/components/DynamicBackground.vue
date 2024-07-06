<template>
  <div>
    <div
      v-show="store.renderer"
      class="dynamicbackground-3d"
      :style="{
        opacity: dimBackground ? 0.66 : 1,
      }"
    />
    <div class="dynamicbackground-black" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ThreeJSRenderer } from '../3d'
import { useRendererSettingsStore } from '../stores/renderer-settings'

export default defineComponent({
  name: 'DynamicBackground',

  computed: {
    store() {
      return useRendererSettingsStore()
    },

    dimBackground(): boolean {
      return this.$route.fullPath !== '/demo'
    },
  },

  mounted() {
    setTimeout(() => {
      new ThreeJSRenderer(document.querySelector('.dynamicbackground-3d')!)
    }, 100)
  },

  unmounted() {
    this.store.renderer?.cleanUp()
  },
})
</script>

<style lang="scss">
@import '../variables';

.dynamicbackground {
  &-3d {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    min-width: 100vw;
    min-height: 100vh;
    z-index: -1;
    transition: opacity 0.4s;
  }

  &-black {
    position: fixed;
    top: 0;
    left: 0;
    min-width: 100vw;
    min-height: 100vh;
    background-color: black;
    z-index: -2;
  }
}
</style>
