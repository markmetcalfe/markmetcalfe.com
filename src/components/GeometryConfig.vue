<template>
  <div>
    <v-dialog
      v-model="dialogOpen"
      width="550"
      transition="dialog-bottom-transition"
      :scrim="false"
    >
      <template #activator="{ props }">
        <slot :modal-open="props"></slot>
      </template>
      <v-card>
        <v-toolbar color="background">
          <v-btn icon @click="dialogOpen = false">
            <v-icon color="primary">fas fa-xmark</v-icon>
          </v-btn>
          <v-toolbar-title color="primary">Edit Shapes</v-toolbar-title>
          <v-toolbar-items>
            <v-btn
              variant="text"
              color="primary"
              :loading="loading"
              @click="updateGeometryConfig"
              >Save</v-btn
            >
          </v-toolbar-items>

          <template #extension>
            <v-tabs
              v-model="activeTab"
              center-active
              show-arrows
              prev-icon="fas fa-caret-left"
              next-icon="fas fa-caret-right"
            >
              <v-tab
                v-for="(geometry, index) in config"
                :key="index"
                :value="index"
              >
                {{ getGeometryName(geometry) }}
              </v-tab>

              <v-btn
                variant="plain"
                color="primary"
                icon="fas fa-plus"
                size="small"
                class="align-self-center"
                @click="addNewGeometryConfig"
              />
            </v-tabs>
          </template>
        </v-toolbar>

        <v-window v-model="activeTab">
          <v-window-item
            v-for="(_, index) in store.geometryConfig"
            :key="index"
            :value="index"
          >
            <div class="geometryconfig-settings">
              <v-select
                :model-value="config[index].type.getName()"
                label="Select"
                :items="geometryTypes"
                @update:model-value="
                  (name: string) => setGeometryType(index, name)
                "
              >
                <template #prepend>
                  <label>Type</label>
                </template></v-select
              >

              <v-text-field
                v-model="config[index].color"
                single-line
                density="compact"
                type="text"
                hint="Can be any valid HTML colour value, e.g. 'green' or '#00ff00' or 'rgb(20,30,40)'"
                ><template #prepend>
                  <label>Colour</label>
                </template></v-text-field
              >

              <v-switch
                v-model="config[index].solid"
                label="Solid"
                color="primary"
                inset
                hide-details
              ></v-switch>

              <v-switch
                v-model="config[index].reverseRotation"
                label="Reverse Rotation"
                color="primary"
                inset
                hide-details
              ></v-switch>

              <v-text-field
                :model-value="config[index].radius.toFixed(0)"
                single-line
                density="compact"
                type="number"
                hint="The size of the object"
                @update:model-value="
                  (radius: string) =>
                    (config[index].radius = parseFloat(radius))
                "
                ><template #prepend>
                  <label>Radius</label>
                </template></v-text-field
              >

              <v-text-field
                v-model="config[index].detail"
                single-line
                density="compact"
                type="number"
                hint="Detail roughly correlates to how many polygons are rendered"
                ><template #prepend>
                  <label>Detail</label>
                </template></v-text-field
              >

              <div
                v-if="store.geometryConfig.length > 1"
                class="geometryconfig-settings-deletebtn"
              >
                <v-btn
                  color="#ff0000"
                  variant="outlined"
                  @click="deleteGeometryConfig(index)"
                  ><template #prepend
                    ><v-icon size="small">fas fa-trash</v-icon></template
                  >Delete</v-btn
                >
              </div>
            </div>
          </v-window-item>
        </v-window>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRendererSettingsStore } from '../stores/renderer-settings'
import {
  GeometryAttributes,
  geometryClasses,
  getGeometryClassFromName,
} from '../3d/geometry'
import { getColorName } from '../util/color'

export default defineComponent({
  name: 'GeometryConfig',

  data() {
    return {
      dialogOpen: false,
      loading: false,
      activeTab: '0',
    }
  },

  computed: {
    store() {
      return useRendererSettingsStore()
    },

    config() {
      return this.store.geometryConfig
    },

    geometryTypes() {
      return geometryClasses.map(geometryClass => geometryClass.getName())
    },
  },

  methods: {
    getGeometryName(geometry: GeometryAttributes) {
      return `${getColorName(geometry.color)} ${geometry.type.getName()}`
    },

    setGeometryType(index: number, name: string) {
      this.config[index].type = getGeometryClassFromName(name)
    },

    addNewGeometryConfig() {
      this.store.addRandomGeometryConfig()
      setTimeout(() => {
        this.activeTab = (this.store.geometryConfig.length - 1).toString()
      }, 50)
    },

    deleteGeometryConfig(index: number) {
      this.activeTab = (index - 1).toString()
      setTimeout(() => {
        this.store.deleteGeometryConfig(index)
      }, 50)
    },

    updateGeometryConfig() {
      this.loading = true
      setTimeout(() => {
        this.dialogOpen = false
        this.loading = false
      }, 250)
      this.store.generateGeometry()
    },
  },
})
</script>

<style lang="scss">
.geometryconfig {
  &-settings {
    padding: 1rem 1.5rem;

    &-deletebtn {
      padding-top: 0.5rem;
      display: flex;
      justify-content: center;
    }
  }
}

/* stylelint-disable selector-class-pattern */
.v-slide-group__next,
.v-slide-group__prev {
  font-size: 12px;
}

.v-overlay__content {
  border: var(--color-highlight) 1px solid;
}
</style>
