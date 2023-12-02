<template>
  <div class="dynamicbackground">
    <video
      v-show="showVideo"
      id="video"
      autoplay
      muted
      playsinline
      loop
      class="dynamicbackground dynamicbackground-video"
    >
      <source src="" type="video/mp4" />
    </video>
    <img
      class="dynamicbackground dynamicbackground-placeholder"
      :src="placeholderImage"
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
      videos: ['bg-1', 'bg-2', 'bg-3', 'bg-4'],
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

    document.body.addEventListener('click', this.nextVideo, true)
    this.playVideo()
    // Switch to the next video every 4 seconds
    setInterval(this.nextVideo, 4000)
  },

  unmounted() {
    document.body.removeEventListener('click', this.nextVideo, true)
  },

  methods: {
    playVideo() {
      const videoElement: HTMLVideoElement = document.getElementById(
        'video',
      ) as HTMLVideoElement
      videoElement.src = this.currentVideoSrc
      console.debug(`Playing video: ${this.currentVideo}`)
    },

    nextVideo() {
      if (this.currentVideoNum + 1 >= this.videos.length) {
        this.currentVideoNum = 0
      } else {
        this.currentVideoNum++
      }
      this.playVideo()
    },
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
    z-index: -100;
  }

  &-video {
    object-fit: cover;
    z-index: -50;
  }

  &-overlay {
    background: rgb(0 0 0 / 20%);
    z-index: -10;
  }
}
</style>
