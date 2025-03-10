<template>
  <PageCard
    v-show="!isFullscreen"
    back-button-page="/"
    :background-opacity="isMobile() ? 0.5 : 1"
  >
    <template #title>3D Visuals</template>

    <div class="visualspage">
      <div class="visualspage-buttons">
        <v-btn
          color="primary"
          variant="flat"
          :size="isMobile() ? 'small' : undefined"
          @click="store.randomise"
          ><template #prepend>
            <v-icon><font-awesome-icon icon="fas fa-dice" /></v-icon> </template
          >Randomise</v-btn
        >
        <GeometryConfig v-slot="{ modalOpen }">
          <v-btn
            color="primary"
            variant="flat"
            v-bind="modalOpen"
            :size="isMobile() ? 'small' : undefined"
            ><template #prepend>
              <v-icon
                ><font-awesome-icon icon="fas fa-shapes"
              /></v-icon> </template
            >Edit Shapes</v-btn
          >
        </GeometryConfig>
        <v-btn
          v-if="!isMobile()"
          color="primary"
          variant="flat"
          @click="requestFullscreen"
          ><template #prepend>
            <v-icon><font-awesome-icon icon="fas fa-play" /></v-icon> </template
          >Fullscreen</v-btn
        >
      </div>

      <div class="visualspage-sliders">
        <v-switch
          v-if="!isMobile()"
          v-model="settings.followCursor"
          label="Follow Cursor"
          color="primary"
          inset
          hide-details
        ></v-switch>

        <v-slider
          :model-value="settings.zoom.current"
          color="primary"
          class="align-center"
          :min="-10"
          :max="20"
          :ripple="false"
          hide-details
          @update:model-value="store.setCurrentZoom"
        >
          <template #prepend>
            <label for="settings-zoom-current">Current Zoom</label>
          </template>
          <template #append>
            <v-text-field
              id="settings-zoom-current"
              :model-value="settings.zoom.current.toFixed(2)"
              hide-details
              single-line
              density="compact"
              type="number"
              style="width: 100px"
              @update:model-value="
                (value: string) => store.setCurrentZoom(parseFloat(value))
              "
            ></v-text-field>
          </template>
        </v-slider>

        <v-slider
          :model-value="settings.rotationSpeed.x"
          color="primary"
          class="align-center"
          :min="0"
          :max="100"
          :ripple="false"
          hide-details
          @update:model-value="store.setXRotationSpeed"
        >
          <template #prepend>
            <label for="settings-randomisation-x-rotation-speed">{{
              isMobile() ? 'X Rotation' : 'X-Axis Rotation Speed'
            }}</label>
          </template>
          <template #append>
            <v-text-field
              id="settings-randomisation-x-rotation-speed"
              :model-value="settings.rotationSpeed.x.toFixed(0)"
              hide-details
              single-line
              density="compact"
              type="number"
              style="width: 100px"
              @update:model-value="
                (value: string) => store.setXRotationSpeed(parseFloat(value))
              "
            ></v-text-field>
          </template>
        </v-slider>

        <v-slider
          :model-value="settings.rotationSpeed.y"
          color="primary"
          class="align-center"
          :min="0"
          :max="100"
          :ripple="false"
          hide-details
          @update:model-value="store.setYRotationSpeed"
        >
          <template #prepend>
            <label for="settings-randomisation-y-rotation-speed">{{
              isMobile() ? 'Y Rotation' : 'Y-Axis Rotation Speed'
            }}</label>
          </template>
          <template #append>
            <v-text-field
              id="settings-randomisation-y-rotation-speed"
              :model-value="settings.rotationSpeed.y.toFixed(0)"
              hide-details
              single-line
              density="compact"
              type="number"
              style="width: 100px"
              @update:model-value="
                (value: string) => store.setYRotationSpeed(parseFloat(value))
              "
            ></v-text-field>
          </template>
        </v-slider>

        <div class="visualspage-cols-two">
          <v-switch
            :model-value="settings.beatMatch.enabled"
            label="Beat Matching"
            color="primary"
            inset
            hide-details
            @update:model-value="store.setBeatMatchEnabled"
          ></v-switch>

          <v-switch
            v-model="settings.beatMatch.randomizeColors"
            :disabled="!settings.beatMatch.enabled"
            label="Colour Changes"
            color="primary"
            inset
            hide-details
          ></v-switch>
        </div>

        <v-slider
          v-model="settings.beatMatch.bpm"
          :disabled="!settings.beatMatch.enabled"
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
              :disabled="!settings.beatMatch.enabled"
              color="primary"
              variant="outlined"
              size="small"
              style="margin-right: 1rem"
              :ripple="false"
              @click="store.tapBpm"
              >Tap</v-btn
            >
            <v-text-field
              id="settings-randomisation-bpm"
              :model-value="settings.beatMatch.bpm.toFixed(0)"
              :disabled="!settings.beatMatch.enabled"
              hide-details
              single-line
              density="compact"
              type="number"
              style="width: 100px"
              @update:model-value="
                (value: string) => (store.beatMatch.bpm = parseFloat(value))
              "
            ></v-text-field>
          </template>
        </v-slider>

        <v-select
          v-model="settings.autoZoom.mode"
          label="Select"
          :items="autoZoomOptions"
          density="comfortable"
        >
          <template #prepend>
            <label>Auto Zoom Mode</label>
          </template></v-select
        >

        <v-slider
          :disabled="autoZoomDisabled"
          :model-value="settings.zoom.min"
          color="primary"
          class="align-center"
          :min="-10"
          :max="20"
          :ripple="false"
          hide-details
          @update:model-value="store.setMinZoom"
        >
          <template #prepend>
            <label for="settings-zoom-min">Min Zoom</label>
          </template>
          <template #append>
            <v-text-field
              id="settings-zoom-min"
              :disabled="autoZoomDisabled"
              :model-value="settings.zoom.min.toFixed(2)"
              hide-details
              single-line
              density="compact"
              type="number"
              style="width: 100px"
              @update:model-value="
                (value: string) => (store.zoom.min = parseFloat(value))
              "
            ></v-text-field>
          </template>
        </v-slider>

        <v-slider
          :disabled="autoZoomDisabled"
          :model-value="settings.zoom.max"
          color="primary"
          class="align-center"
          :min="-10"
          :max="20"
          :ripple="false"
          hide-details
          @update:model-value="store.setMaxZoom"
        >
          <template #prepend>
            <label for="settings-zoom-max">Max Zoom</label>
          </template>
          <template #append>
            <v-text-field
              id="settings-zoom-max"
              :disabled="autoZoomDisabled"
              :model-value="settings.zoom.max.toFixed(2)"
              hide-details
              single-line
              density="compact"
              type="number"
              style="width: 100px"
              @update:model-value="
                (value: string) => store.setMaxZoom(parseFloat(value))
              "
            ></v-text-field>
          </template>
        </v-slider>

        <v-slider
          :disabled="!autoZoomIsSmooth"
          :model-value="settings.autoZoom.speed * 1000"
          color="primary"
          class="align-center"
          :min="0"
          :max="100"
          hide-details
          @update:model-value="
            (value: number) => (store.autoZoom.speed = value / 1000)
          "
        >
          <template #prepend>
            <label for="settings-autozoom-speed">Zoom Speed</label>
          </template>
          <template #append>
            <v-text-field
              id="settings-autozoom-speed"
              :disabled="!autoZoomIsSmooth"
              :model-value="(settings.autoZoom.speed * 1000).toFixed(0)"
              hide-details
              single-line
              density="compact"
              type="number"
              style="width: 100px"
              @update:model-value="
                (value: string) =>
                  (store.autoZoom.speed = parseFloat(value) / 1000)
              "
            ></v-text-field>
          </template>
        </v-slider>
      </div>

      <div v-if="!isMobile()" class="visualspage-footnote">
        <p>Scroll to zoom in and out</p>
        <p>Click to randomise the geometry</p>
        <p>Press Space to beatmatch the randomisation</p>
      </div>
    </div>
  </PageCard>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import GeometryConfig from '../components/GeometryConfig.vue'
import PageCard from '../components/PageCard.vue'
import { isMobile } from 'is-mobile'
import { storeToRefs } from 'pinia'
import {
  AutoZoomMode,
  useRendererSettingsStore,
} from '../stores/renderer-settings'

export default defineComponent({
  name: 'VisualsPage',
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
      if (this.store.beatMatch.enabled) {
        return Object.values(AutoZoomMode)
      } else {
        return [AutoZoomMode.DISABLED, AutoZoomMode.SMOOTH]
      }
    },
    autoZoomDisabled() {
      return this.store.autoZoom.mode === AutoZoomMode.DISABLED
    },
    autoZoomIsSmooth() {
      return this.store.autoZoom.mode === AutoZoomMode.SMOOTH
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
    isMobile,

    requestFullscreen() {
      document.body.requestFullscreen()
    },

    fullscreenEvent() {
      const dynamicBackground = document.querySelector(
        '.dynamicbackground',
      ) as HTMLElement
      if (this.isFullscreen) {
        this.isFullscreen = false
        document.body.style.cursor = ''
        dynamicBackground.style.cursor = ''
      } else {
        this.isFullscreen = true
        document.body.style.cursor = 'none'
        dynamicBackground.style.cursor = 'none'
      }
    },
  },
})
</script>

<style lang="scss">
@use '../variables' as vars;

.visualspage {
  &-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
    margin-bottom: 1rem;
  }

  &-sliders {
    .v-input {
      margin: 2px 0;
    }

    // stylelint-disable-next-line selector-class-pattern
    .v-input__details {
      display: none;
    }

    // stylelint-disable-next-line selector-class-pattern
    .v-slider.v-input--horizontal {
      margin-inline: 0 !important;
    }

    .v-switch {
      .v-label {
        opacity: 1;
      }
    }
  }

  &-footnote {
    padding-top: 1.5rem;
  }

  @include vars.desktop-only {
    min-width: 500px;

    &-cols {
      &-two {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
    }
  }
}
</style>
