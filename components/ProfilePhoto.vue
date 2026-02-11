<template>
  <div
    class="profilephoto"
    @click="onClick"
  >
    <img src="/me.png?v=6">
    <div class="profilephoto-bg" />
    <div class="profilephoto-fallback">
      <img src="/me-bg.png">
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { Renderer } from '~/util/3d/renderer'
import { PartialSphere, Sphere } from '~/util/3d/geometry'
import { useOnElementMounted } from '~/util/hooks/useOnElementMounted'

const visualsStore = useVisualsStore()

const rendererZoomLevel = 12
const geometryDefinition = [
  {
    type: Sphere.getName(),
    color: 'rgb(0, 128, 0)',
    solid: false,
    radius: 5,
    detail: 80,
    reverseRotation: false,
  },
  {
    type: PartialSphere.getName(),
    color: 'rgb(0, 0, 255)',
    solid: false,
    radius: 5,
    detail: 90,
    reverseRotation: false,
  },
  {
    type: PartialSphere.getName(),
    color: 'rgb(255, 0, 0)',
    solid: false,
    radius: 5,
    detail: 100,
    reverseRotation: false,
  },
]
const geometryRotationSpeed = 20

const renderer = ref<Renderer | undefined>(undefined)

const onClick = (): void => {
  renderer.value?.randomiseRotations()
  renderer.value?.randomiseColors()
  visualsStore.randomise()
}

useOnElementMounted(
  '.profilephoto-bg',
  (element: HTMLElement) => {
    renderer.value = new Renderer(element)
      .setGetDefaultGeometry(() => geometryDefinition)
      .setOnRenderTick(renderer =>
        renderer.getGeometry()?.forEach(geometry => geometry.rotate()),
      )
      .setOnStart((renderer) => {
        renderer.getGeometry()?.forEach((geometry) => {
          geometry.setRotationSpeed({
            x: geometryRotationSpeed,
            y: geometryRotationSpeed,
          })
        })
      })
      .setGetZoom(() => rendererZoomLevel)
      .initialise()
      .start()

    renderer.value.getCanvasElement()?.style.setProperty('border-radius', '50%')
  },
)

onUnmounted(() => {
  setTimeout(() => {
    renderer.value?.cleanUp()
  }, 250)
})
</script>

<style lang="scss" scoped>
@use "~/variables" as vars;

.profilephoto {
  display: inline-block;
  transform: translateZ(0);
  cursor: pointer;

  @include vars.desktop-only {
    height: 10rem;
    width: 10rem;
  }

  @include vars.mobile-only {
    height: 8rem;
    width: 8rem;
  }

  &-bg, &-fallback {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 100;
    width: inherit;
    height: inherit;

    & > canvas {
      border-radius: 50%;
      width: inherit;
      height: inherit;
    }
  }

  img {
    position: absolute;
    left: 0;
    top: 0;
    border-radius: 50%;
    z-index: 200;
    width: inherit;
    height: inherit;
    border: var(--color-highlight) 1px solid;
    box-sizing: border-box;
  }

  &-fallback {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
    width: inherit;
    height: inherit;

    & > img {
      z-index: 0;
    }
  }

}
</style>
