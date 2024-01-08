<template>
  <div class="dynamicbackground">
    <div v-show="renderer" class="dynamicbackground dynamicbackground-3d" />
    <div class="dynamicbackground dynamicbackground-black" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ThreeJSRenderer } from '../3d'

export default defineComponent({
  name: 'DynamicBackground',

  data(): { renderer: ThreeJSRenderer | undefined } {
    return {
      renderer: undefined,
    }
  },

  mounted() {
    if (localStorage.getItem('is_playwright_test')) {
      console.debug(
        'Playwright test is running, dont render video or 3d canvas',
      )
      return
    }

    setTimeout(() => {
      this.renderer = new ThreeJSRenderer(
        document.querySelector('.dynamicbackground-3d')!,
      )
    }, 100)
  },

  unmounted() {
    this.renderer?.cleanUp()
  },
})
</script>

<style lang="scss">
@import '../variables';

.dynamicbackground {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -100;

  & > * {
    min-width: 100vw;
    min-height: 100vh;
  }

  &-black {
    background: rgb(0 0 0);
  }

  &-3d {
    opacity: 0.66;
    z-index: -1;
  }
}
</style>
