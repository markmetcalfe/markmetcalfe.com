<template>
  <PageCard back-button-page="/visuals">
    <template #title>Edit Shapes</template>

    <DropdownSelect v-model="selectedShapeIndex" :options="geometryItems" />

    <div class="editshapes-settings">
      <DropdownSelect
        label="Type"
        :model-value="selectedShape.type.getName()"
        :options="geometryTypes"
        @change="setShapeType"
      />

      <TextField v-model="selectedShape.color" label="Colour" />

      <div class="editshapes-toggles">
        <ToggleSwitch v-model="selectedShape.solid" label="Solid" />

        <ToggleSwitch
          v-model="selectedShape.reverseRotation"
          label="Reverse Rotation"
        />
      </div>

      <TextField
        label="Radius"
        type="number"
        :model-value="selectedShape.radius.toFixed(0)"
        @update:model-value="
          (radius: string | number) =>
            (selectedShape.radius = parseFloat(radius.toString()))
        "
      />

      <TextField v-model="selectedShape.detail" label="Detail" type="number" />
    </div>

    <div class="editshapes-buttons">
      <LinkButton text="Add" @click="addShape">
        <font-awesome-icon icon="fa-solid fa-plus" />
      </LinkButton>
      <LinkButton
        text="Delete"
        :style="{
          visibility:
            visualsStore.geometryConfig.length > 1 ? undefined : 'hidden',
        }"
        @click="deleteShape"
      >
        <font-awesome-icon icon="fa-solid fa-trash" style="max-height: 21px" />
      </LinkButton>
      <LinkButton text="Save" @click="save">
        <font-awesome-icon icon="fa-regular fa-floppy-disk" />
      </LinkButton>
    </div>
  </PageCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import PageCard from '../components/PageCard.vue'
import { useVisualsStore } from '../stores/visuals'
import {
  GeometryAttributes,
  geometryClasses,
  getGeometryClassFromName,
} from '../3d/geometry'
import { getColorName } from '../util/color'
import LinkButton from '../components/LinkButton.vue'
import ToggleSwitch from '../components/ToggleSwitch.vue'
import DropdownSelect from '../components/DropdownSelect.vue'
import TextField from '../components/TextField.vue'
import { useSiteStore } from '../stores/site'

const siteStore = useSiteStore()
const visualsStore = useVisualsStore()

const loading = ref(false)
const selectedShapeIndex = ref(0)

const selectedShape = computed(() => {
  return visualsStore.geometryConfig[selectedShapeIndex.value]
})

const geometryItems = computed(() => {
  return visualsStore.geometryConfig.map((geometry, index) => ({
    value: index,
    label: getShapeName(geometry),
  }))
})

const geometryTypes = computed(() => {
  return geometryClasses.map(geometryClass => ({
    value: geometryClass.getName(),
    label: geometryClass.getName(),
  }))
})

const getShapeName = (shape: GeometryAttributes): string => {
  return `${getColorName(shape.color)} ${shape.type.getName()}`
}

const setShapeType = (name: string | number): void => {
  selectedShape.value.type = getGeometryClassFromName(name.toString())
}

const addShape = (): void => {
  visualsStore.addRandomGeometryConfig()
  selectedShapeIndex.value = visualsStore.geometryConfig.length - 1
}

const deleteShape = (): void => {
  const shapeToDelete = selectedShapeIndex.value
  if (selectedShapeIndex.value > 0) {
    selectedShapeIndex.value = selectedShapeIndex.value - 1
  }
  visualsStore.deleteGeometryConfig(shapeToDelete)
}

const save = (): void => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 250)
  visualsStore.generateGeometry()
}

onMounted(() => {
  siteStore.hideBackgroundIfMobile()

  visualsStore.setListener('onRandomise', () => {
    selectedShapeIndex.value = 0
  })
})

onUnmounted(() => {
  visualsStore.removeListener('onRandomise')
})
</script>

<style lang="scss">
.editshapes {
  &-settings {
    padding: 1rem 0;

    & > * {
      padding: 0.5rem 0;
    }
  }

  &-buttons,
  &-toggles {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }
}
</style>
