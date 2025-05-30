<template>
  <PageCard class="home">
    <div
      class="home-container"
    >
      <section class="home-header">
        <div class="home-header-left">
          <div
            class="photo-of-me"
            @click="randomiseProfile"
          >
            <img src="/me.png?v=6">
            <div class="photo-of-me-bg" />
          </div>
        </div>
        <div class="home-header-right">
          <h1>Mark Metcalfe</h1>
          <div class="home-header-links">
            <a
              href="https://github.com/markmetcalfe"
              title="GitHub"
              target="_blank"
              rel="noopener noreferer"
            >
              <Icon name="bx:bxl-github" />
            </a>
            <a
              href="https://instagram.com/_vizshun"
              title="Instagram"
              target="_blank"
              rel="noopener noreferer"
            >
              <Icon name="bx:bxl-instagram" />
            </a>
            <a
              href="https://www.linkedin.com/in/mark-metcalfe/"
              title="LinkedIn"
              target="_blank"
              rel="noopener noreferer"
            >
              <Icon name="bx:bxl-linkedin-square" />
            </a>
            <a
              :href="mailtoLink"
              title="Email"
              target="_blank"
              rel="noopener noreferer"
            >
              <Icon name="bx:envelope" />
            </a>
          </div>
        </div>
      </section>
    </div>

    <SectionBlock title="About me">
      <div class="home-about-me">
        <p>
          I'm a software developer and visual artist who likes making cool experiences with code
        </p>
        <LinkButton
          text="Resume"
          href="/resume"
          large
        >
          <Icon name="bx:file" />
        </LinkButton>
      </div>
    </SectionBlock>

    <SectionBlock title="Projects">
      <LinkButton
        text="Visuals"
        href="/visuals"
        large
      >
        <Icon name="custom:octohedron" />
      </LinkButton>
      <LinkButton
        text="Sequencer"
        href="/sequencer"
        large
      >
        <Icon name="fad:waveform" />
      </LinkButton>
    </SectionBlock>

    <SectionBlock title="Recently Played">
      <RecentlyPlayed />
    </SectionBlock>
  </PageCard>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Renderer } from '~/util/3d/renderer'
import { PartialSphere, Sphere } from '~/util/3d/geometry'

const { mailtoLink } = useAppConfig()

const rendererZoomLevel = 11
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
      '.photo-of-me-bg',
    ) as HTMLElement
    if (photoBgElement) {
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
    }
  }, 100)
})

onUnmounted(() => {
  setTimeout(() => {
    renderer.value?.cleanUp()
  }, 250)
})
</script>

<style lang="scss">
@use "~/variables" as vars;

.home {
  & .pagecard-inner {
    padding: 0;
    margin: 1rem;
  }

  &-container {
    @include vars.desktop-only {
      padding: 1rem 0;
    }

    @include vars.mobile-only {
      padding-bottom: 0.5rem;
    }
  }

  &-about-me {
    display: flex;
    flex-wrap: wrap;
    text-align: left;

    @include vars.desktop-only {
      max-width: 450px;
      font-size: 1.1rem;
      gap: 0.75rem;
    }

    @include vars.mobile-only {
      max-width: 325px;
      font-size: 0.9rem;
      gap: 0.5rem;
    }

    p {
      margin: 0;
    }
  }

  &-header {
    display: flex;
    gap: 1rem;

    &-left,
    &-right {
      display: flex;
      flex-direction: column;

      @include vars.desktop-only {
        justify-content: space-between;
      }

      @include vars.mobile-only {
        justify-content: space-around;
        gap: 0.5rem;
      }
    }

    & h1 {
      display: block;
      position: relative;
      z-index: 100;
      text-transform: lowercase;
      font-weight: 500;
      transform-origin: left center;
      margin: 0;
      text-align: left;

      @include vars.desktop-only {
        font-size: 5rem;
        line-height: 3.3rem;
        letter-spacing: -8px;
        transform: scale(1, 0.9);
      }

      @include vars.mobile-only {
        font-size: 3.25rem;
        line-height: 2.15rem;
        letter-spacing: -5px;
        transform: scale(1, 0.95);
      }
    }

    &-right {
      & ul {
        justify-content: space-between;
      }

      @include vars.desktop-only {
        width: 280px;
      }

      @include vars.mobile-only {
        width: 180px;
      }

      & h1 {
        word-spacing: 1px;
      }
    }

    .photo-of-me {
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
      }
    }

    &-links {
      display: flex;
      gap: 1rem;

      a {
        color: var(--color-light);

        @include vars.desktop-only {
          font-size: 2rem;
        }

        @include vars.mobile-only {
          font-size: 1.75rem;
        }

        &:hover {
          color: var(--color-highlight);
        }
      }
    }
  }
}
</style>
