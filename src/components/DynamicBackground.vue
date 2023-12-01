<template>
  <div class="dynamicbackground">
    <video
      v-show="showVideo"
      autoplay
      muted
      loop
      class="dynamicbackground dynamicbackground-video"
    >
      <source :src="currentVideoSrc" type="video/mp4" />
    </video>
    <div
      class="dynamicbackground dynamicbackground-placeholder"
      :style="`background-image: url('${placeholderImage}')`"
    />
    <div class="dynamicbackground dynamicbackground-overlay" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import placeholderImage from './placeholder-background'

export default defineComponent({
  name: 'DynamicBackground',

  data() {
    return {
      videos: ['bg1', 'bg2', 'bg3'],
      currentVideoNum: 0,
      showVideo: true,
      placeholderImage,
    }
  },

  computed: {
    currentVideo(): string {
      return this.videos[this.currentVideoNum]
    },

    currentVideoSrc(): string {
      return `/background/${this.currentVideo}.mp4`
    },
  },

  mounted() {
    if (localStorage.getItem('is_playwright_test')) {
      this.showVideo = false
      console.debug('Playwright test is running, dont show video')
      return
    }

    console.debug(`Playing video: ${this.currentVideo}`)
    const secondsPerVideo = 20
    setInterval(() => {
      if (this.currentVideoNum + 1 >= this.videos.length) {
        this.currentVideoNum = 0
      } else {
        this.currentVideoNum++
      }
      console.debug(`Playing video: ${this.currentVideo}`)
    }, secondsPerVideo * 1000)
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

  &-placeholder {
    background-image: url('/background/placeholder.jpg');
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-position: center;
    z-index: -100;
  }

  &-video {
    min-width: 100vw;
    min-height: 100vh;
    object-fit: fill;
    z-index: -50;
  }

  &-overlay {
    min-width: 100vw;
    min-height: 100vh;
    background: rgb(0 0 0 / 20%);
    z-index: -10;
  }
}
</style>
