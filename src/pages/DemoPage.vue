<template>
  <PageCard v-show="!isFullscreen" back-button-page="/">
    <template #title>3D Demo</template>

    <div class="demopage">
      <p v-if="store.isMobile">View this on desktop for more options</p>

      <div class="demopage-settings">
        <GeometryConfig />

        <v-switch
          v-if="store.isDesktop"
          v-model="settings.followCursor"
          label="Follow Cursor"
          color="primary"
          inset
          hide-details
        ></v-switch>

        <v-select
          v-model="settings.autoZoom.mode"
          label="Select"
          :items="autoZoomOptions"
        >
          <template #prepend>
            <label>Auto Zoom Mode</label>
          </template></v-select
        >

        <v-slider
          v-show="!autoZoomDisabled"
          v-model="settings.zoom.min"
          color="primary"
          class="align-center"
          :min="-10"
          :max="20"
          hide-details
        >
          <template #prepend>
            <label for="settings-zoom-min">Min Zoom</label>
          </template>
          <template #append>
            <v-text-field
              id="settings-zoom-min"
              v-model="settings.zoom.min"
              hide-details
              single-line
              density="compact"
              type="number"
              style="width: 100px"
            ></v-text-field>
          </template>
        </v-slider>

        <v-slider
          v-show="!autoZoomDisabled"
          v-model="settings.zoom.max"
          color="primary"
          class="align-center"
          :min="-10"
          :max="20"
          hide-details
        >
          <template #prepend>
            <label for="settings-zoom-max">Max Zoom</label>
          </template>
          <template #append>
            <v-text-field
              id="settings-zoom-max"
              v-model="settings.zoom.max"
              hide-details
              single-line
              density="compact"
              type="number"
              style="width: 100px"
            ></v-text-field>
          </template>
        </v-slider>

        <v-slider
          v-model="settings.zoom.current"
          color="primary"
          class="align-center"
          :min="-10"
          :max="20"
          hide-details
        >
          <template #prepend>
            <label for="settings-zoom-current">Current Zoom</label>
          </template>
          <template #append>
            <v-text-field
              id="settings-zoom-current"
              v-model="settings.zoom.current"
              hide-details
              single-line
              density="compact"
              type="number"
              style="width: 100px"
            ></v-text-field>
          </template>
        </v-slider>

        <v-slider
          v-model="settings.randomisation.bpm"
          color="primary"
          class="align-center"
          :min="0"
          :max="200"
          hide-details
        >
          <template #prepend>
            <label for="settings-randomisation-bpm">BPM</label>
          </template>
          <template #append>
            <v-btn
              color="primary"
              variant="outlined"
              size="small"
              style="margin-right: 1rem"
              @click="store.tap"
              >Tap</v-btn
            >
            <v-text-field
              id="settings-randomisation-bpm"
              v-model="settings.randomisation.bpm"
              hide-details
              single-line
              density="compact"
              type="number"
              style="width: 100px"
            ></v-text-field>
          </template>
        </v-slider>
      </div>

      <p v-if="store.isDesktop">Scroll to zoom in and out</p>
      <p v-if="store.isDesktop">
        When fullscreen, click to beatmatch the randomisation
      </p>

      <p>
        <v-btn
          v-if="store.isDesktop"
          color="primary"
          variant="flat"
          size="large"
          @click="requestFullscreen"
          ><template #prepend>
            <v-icon><font-awesome-icon icon="fas fa-play" /></v-icon> </template
          >Fullscreen</v-btn
        >
      </p>
    </div>
  </PageCard>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import GeometryConfig from '../components/GeometryConfig.vue'
import PageCard from '../components/PageCard.vue'
import { storeToRefs } from 'pinia'
import {
  AutoZoomMode,
  useRendererSettingsStore,
} from '../stores/renderer-settings'

export default defineComponent({
  name: 'DemoPage',
  components: { GeometryConfig, PageCard },

  data() {
    const store = storeToRefs(useRendererSettingsStore())

    return {
      isFullscreen: false,
      settings: store,
    }
  },

  computed: {
    store() {
      return useRendererSettingsStore()
    },

    autoZoomOptions() {
      return Object.values(AutoZoomMode)
    },
    autoZoomDisabled() {
      return this.store.autoZoom.mode === AutoZoomMode.DISABLED
    },
  },

  mounted() {
    document.addEventListener('fullscreenchange', () => this.fullscreenEvent())
  },

  unmounted() {
    document.removeEventListener('fullscreenchange', () =>
      this.fullscreenEvent(),
    )
    document.body.style.cursor = 'auto'
  },

  methods: {
    requestFullscreen() {
      document.body.requestFullscreen()
    },

    fullscreenEvent() {
      if (this.isFullscreen) {
        this.isFullscreen = false
        document.body.style.cursor = 'auto'
      } else {
        this.isFullscreen = true
        document.body.style.cursor = 'none'
      }
    },
  },
})
</script>

<style lang="scss">
@import '../variables';

.demopage {
  & > * {
    padding: 0.5rem 0;
  }

  & > *:first-child {
    padding-top: 0;
  }

  & > *:last-child {
    padding-bottom: 0;
  }

  &-settings {
    padding-bottom: 1.5rem;
  }

  @include desktop-only {
    min-width: 500px;
  }

  @include mobile-only {
    min-width: calc(95vw - 1rem);
  }
}
</style>
