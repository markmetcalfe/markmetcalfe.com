<template>
  <div class="dynamicbackground">
    <div v-show="renderer" class="dynamicbackground dynamicbackground-3d" />
    <video
      v-show="renderer"
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
    <div class="dynamicbackground dynamicbackground-overlay-color" />
    <div class="dynamicbackground dynamicbackground-overlay-black" />
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

  &-placeholder {
    object-fit: cover;
    z-index: -5;
  }

  &-video {
    object-fit: cover;
    z-index: -4;
  }

  &-overlay {
    &-color {
      z-index: -3;
      animation: color-change 15s linear infinite;

      @keyframes color-change {
        0% {
          background: rgb(127 0 128 / 40%);
        }

        50% {
          background: rgb(0 0 255 / 40%);
        }

        100% {
          background: rgb(127 0 128 / 40%);
        }
      }
    }

    &-black {
      background: rgb(0 0 0 / 80%);
      z-index: -2;
    }
  }

  &-3d {
    z-index: -1;
  }
}
</style>
