<template>
  <div>
    <v-dialog
      v-model="dialogOpen"
      width="500"
      transition="dialog-bottom-transition"
      :scrim="false"
    >
      <template #activator="{ props }">
        <v-btn
          color="primary"
          variant="outlined"
          v-bind="props"
          aria-label="Configure Geometry Definitions"
          >Geometry Defintions</v-btn
        >
      </template>
      <v-card>
        <v-toolbar color="background">
          <v-btn icon @click="dialogOpen = false">
            <v-icon color="primary"
              ><font-awesome-icon icon="fas fa-xmark"
            /></v-icon>
          </v-btn>
          <v-toolbar-title color="primary"
            >Geometry Definitions</v-toolbar-title
          >
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
            <v-tabs v-model="tab">
              <v-tab
                v-for="(_, index) in store.geometry.config"
                :key="index"
                :value="index"
              >
                Object {{ index + 1 }}
              </v-tab>
            </v-tabs>
          </template>
        </v-toolbar>

        <v-window v-model="tab">
          <v-window-item
            v-for="(geometry, index) in store.geometry.config"
            :key="index"
            :value="index"
          >
            <div class="geometryconfig-settings">
              <v-select
                v-model="config[index].type"
                label="Select"
                :items="Object.values(geometryTypes)"
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
                hint="Can be any valid HTML colour value, e.g. 'green' or '#00ff00'"
                ><template #prepend>
                  <label>Colour</label>
                </template></v-text-field
              >

              <v-text-field
                v-model="config[index].radius"
                single-line
                density="compact"
                type="number"
                hint="The size of the object"
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
import { storeToRefs } from 'pinia'
import { geometryTypes } from '../3d/geometry'

export default defineComponent({
  name: 'GeometryConfig',

  data() {
    const store = storeToRefs(useRendererSettingsStore())

    return {
      dialogOpen: false,
      loading: false,
      tab: '0',
      config: store.geometry.value.config,
      geometryTypes,
    }
  },

  computed: {
    store() {
      return useRendererSettingsStore()
    },
  },

  methods: {
    updateGeometryConfig() {
      this.loading = true
      this.store.destroyRenderer?.()
      setTimeout(() => {
        this.store
          .initialiseRenderer?.()
          .then(() => {
            this.dialogOpen = false
            this.loading = false
          })
          .catch(() => {
            this.dialogOpen = false
            this.loading = false
          })
      }, 500)
    },
  },
})
</script>

<style lang="scss">
@import '../variables';

.geometryconfig {
  &-settings {
    padding: 1rem 1.5rem;
  }
}
</style>
