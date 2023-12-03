<template>
  <div class="dynamicbackground">
    <div v-show="render" class="dynamicbackground dynamicbackground-3d" />
    <video
      v-show="render"
      autoplay
      muted
      playsinline
      loop
      class="dynamicbackground dynamicbackground-video"
    >
      <source src="/background/video.mp4" type="video/mp4" />
    </video>
    <img
      class="dynamicbackground dynamicbackground-placeholder"
      src="/background/placeholder.jpg"
    />
    <div class="dynamicbackground dynamicbackground-overlay" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { cleanUp, initRenderer } from '../3d/main'

export default defineComponent({
  name: 'DynamicBackground',

  data() {
    return {
      render: true,
    }
  },

  mounted() {
    if (localStorage.getItem('is_playwright_test')) {
      this.render = false
      console.debug(
        'Playwright test is running, dont render video or 3d canvas',
      )
      return
    }

    initRenderer(document.querySelector('.dynamicbackground-3d')!)
  },

  unmounted() {
    if (this.render) {
      cleanUp()
    }
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

  &-placeholder {
    object-fit: cover;
    z-index: -4;
  }

  &-video {
    object-fit: cover;
    z-index: -3;
  }

  &-overlay {
    background: rgb(0 0 0 / 85%);
    z-index: -2;
  }

  &-3d {
    z-index: -1;
  }
}
</style>
