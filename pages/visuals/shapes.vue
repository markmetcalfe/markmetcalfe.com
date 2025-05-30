<template>
  <PageCard back-button-page="/visuals">
    <template #title>
      Edit Shapes
    </template>

    <DropdownSelect
      v-model="selectedShapeIndex"
      :options="geometryItems"
    />

    <div class="editshapes-settings">
      <DropdownSelect
        v-model="selectedShape.type"
        label="Type"
        :options="geometryTypes"
      />

      <TextField
        v-model="selectedShape.color"
        label="Colour"
      />

      <div class="editshapes-toggles">
        <ToggleSwitch
          v-model="selectedShape.solid"
          label="Solid"
        />

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

      <TextField
        v-model="selectedShape.detail"
        label="Detail"
        type="number"
      />
    </div>

    <div class="editshapes-buttons">
      <LinkButton
        text="Add"
        @click="addShape"
      >
        <Icon name="bx:plus" />
      </LinkButton>
      <LinkButton
        text="Delete"
        :style="{
          visibility:
            visualsStore.geometryConfig.length > 1 ? undefined : 'hidden',
        }"
        @click="deleteShape"
      >
        <Icon name="bx:trash-alt" />
      </LinkButton>
      <LinkButton
        text="Save"
        @click="save"
      >
        <Icon name="bx:save" />
      </LinkButton>
    </div>
  </PageCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useVisualsStore } from '~/stores/visuals'
import { type GeometryAttributes, geometryClasses } from '~/util/3d/geometry'
import { getColorName } from '~/util/color'

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
  return `${getColorName(shape.color)} ${shape.type}`
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
