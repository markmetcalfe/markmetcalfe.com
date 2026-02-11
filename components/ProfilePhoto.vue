<template>
  <div
    class="profilephoto"
    @click="randomiseProfile"
  >
    <img src="/me.png?v=6">
    <div class="profilephoto-bg" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { isSafari } from 'react-device-detect'
import { Renderer } from '~/util/3d/renderer'
import { PartialSphere, Sphere } from '~/util/3d/geometry'

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

const randomiseProfile = (): void => {
  renderer.value?.randomiseRotations()
  renderer.value?.randomiseColors()
}

onMounted(() => {
  setTimeout(() => {
    const photoBgElement = document.querySelector(
      '.profilephoto-bg',
    ) as HTMLElement
    if (!photoBgElement) {
      return
    }
    renderer.value = new Renderer(photoBgElement)
      .setGetDefaultGeometry(() => geometryDefinition)
      .setOnRenderTick(renderer =>
        renderer.getGeometry()?.forEach(geometry => geometry.rotate()),
      )
      .setOnInit((renderer) => {
        renderer.getGeometry()?.forEach((geometry) => {
          geometry.setRotationSpeed({
            x: geometryRotationSpeed,
            y: geometryRotationSpeed,
          })
        })
      })
      .setGetZoom(() => rendererZoomLevel)
      .initialise()

    renderer.value.getCanvasElement()?.style.setProperty('border-radius', '50%')
  }, isSafari ? 500 : 100)
})

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

  &-bg {
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
}
</style>
