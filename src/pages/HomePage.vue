<template>
  <PageCard
    class="home"
    :class="{ 'home-cardpreview': isCardPreview() }"
    :background-hidden="!isCardPreview()"
  >
    <div
      class="home-container"
      :class="{ 'home-container-card': isCardPreview() }"
    >
      <section class="home-header">
        <div class="home-header-left">
          <div class="photo-of-me" @click="randomiseProfile">
            <img src="/me.png?v=6" />
            <div class="photo-of-me-bg" />
          </div>
        </div>
        <div
          class="home-header-right"
          :class="{
            'home-header-vizshun': isVizshun(),
            'home-header-mark': !isVizshun(),
          }"
        >
          <h1>{{ isVizshun() ? 'Vizshun' : 'Mark Metcalfe' }}</h1>
          <ul>
            <li v-if="isVizshun()">Visual Artist</li>
            <li v-if="isVizshun()">DJ</li>
            <li v-else>Developer</li>
            <li>Digital Wizard</li>
          </ul>
        </div>
      </section>
    </div>

    <template v-if="!isCardPreview()">
      <SectionBlock title="Projects">
        <LinkButton text="Visuals" href="/visuals" large>
          <inline-svg src="/favicon.svg" />
        </LinkButton>
        <LinkButton text="Sequencer" href="/sequencer" large>
          <font-awesome-icon icon="fa-solid fa-music" />
        </LinkButton>
      </SectionBlock>

      <SectionBlock v-if="isVizshun()" title="Links">
        <LinkButton
          text="Instagram"
          href="https://instagram.com/_vizshun"
          external
          large
        >
          <font-awesome-icon icon="fab fa-instagram" />
        </LinkButton>
        <LinkButton
          text="Soundcloud"
          href="https://soundcloud.com/vizshun"
          external
          large
        >
          <font-awesome-icon icon="fab fa-soundcloud" />
        </LinkButton>
      </SectionBlock>

      <SectionBlock v-else title="Links">
        <LinkButton
          text="GitHub"
          href="https://github.com/markmetcalfe"
          external
          large
          hide-text
        >
          <font-awesome-icon icon="fab fa-github" />
        </LinkButton>
        <LinkButton
          text="LinkedIn"
          href="https://www.linkedin.com/in/mark-metcalfe/"
          external
          large
          hide-text
        >
          <font-awesome-icon icon="fab fa-linkedin" />
        </LinkButton>
        <LinkButton
          text="Email"
          :href="getMailtoLink()"
          external
          large
          hide-text
        >
          <font-awesome-icon icon="fa-regular fa-envelope" />
        </LinkButton>
        <LinkButton
          text="Resume"
          href="/Mark-Metcalfe-Resume.pdf"
          external
          large
        >
          <font-awesome-icon icon="fa-regular fa-file-lines" />
        </LinkButton>
      </SectionBlock>

      <SectionBlock title="Recently Played">
        <RecentlyPlayed />
      </SectionBlock>
    </template>
  </PageCard>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import PageCard from '../components/PageCard.vue'
import LinkButton from '../components/LinkButton.vue'
import {
  getMailtoLink,
  isCardPreview,
  isPlaywrightTest,
  isVizshun,
} from '../util/site'
import { Renderer } from '../3d'
import { PartialSphere, Sphere } from '../3d/geometry'
import SectionBlock from '../components/SectionBlock.vue'
import RecentlyPlayed from '../components/RecentlyPlayed.vue'

const rendererZoomLevel = 11
const geometryDefinition = [
  {
    type: Sphere,
    color: 'rgb(0, 128, 0)',
    solid: false,
    radius: 5,
    detail: 80,
    reverseRotation: false,
  },
  {
    type: PartialSphere,
    color: 'rgb(0, 0, 255)',
    solid: false,
    radius: 5,
    detail: 90,
    reverseRotation: false,
  },
  {
    type: PartialSphere,
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
        .setOnInit(renderer => {
          if (isCardPreview() || isPlaywrightTest()) {
            return
          }
          renderer.getGeometry()?.forEach(geometry => {
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
@use '../variables' as vars;

.home {
  & .pagecard-inner {
    padding: 0;
    margin: 1rem;
  }

  &-cardpreview {
    & .pagecard-inner {
      padding: 2rem 4rem;
    }
  }

  &-container {
    @include vars.desktop-only {
      padding: 1rem 0;
    }

    @include vars.mobile-only {
      padding-bottom: 0.5rem;
    }

    &-card {
      @include vars.desktop-only {
        padding: 1.5rem 0;
      }
    }
  }

  &-header {
    display: flex;
    gap: 1rem;

    &-left,
    &-right {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
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
        transform: scale(1.1, 1);
      }

      @include vars.mobile-only {
        font-size: 3.25rem;
        line-height: 2.15rem;
        letter-spacing: -5px;
        transform: scale(1.05, 1);
      }
    }

    & ul {
      display: flex;
      flex-wrap: wrap;
      list-style: inside;
      align-items: start;
      margin: 0;
      padding: 0;

      @include vars.desktop-only {
        gap: 1rem;
      }

      @include vars.mobile-only {
        flex-direction: column;
        gap: 0.5rem;
      }
    }

    & li {
      padding: 0;
      margin: 0;
      font-weight: 300;

      /* Workaround for Safari */
      list-style-type: none;

      &::marker {
        display: none;
      }

      &::before {
        content: '> ';
        color: var(--color-highlight);
      }

      @include vars.desktop-only {
        font-size: 1.25rem;
      }

      @include vars.mobile-only {
        font-size: 1rem;
      }
    }

    &-vizshun {
      @include vars.desktop-only {
        width: 243px;
      }

      @include vars.mobile-only {
        width: 152px;
      }

      & h1 {
        padding-top: 0.5rem;
      }
    }

    &-mark {
      & ul {
        justify-content: space-between;
      }

      @include vars.desktop-only {
        width: 280px;
      }

      @include vars.mobile-only {
        width: 170px;
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
        font-size: 5.25rem;
      }

      @include vars.mobile-only {
        height: 8.25rem;
        width: 8.25rem;
        font-size: 3.75rem;
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

    &-about {
      & li {
        @include vars.desktop-only {
          padding-top: 0.75rem;
        }

        @include vars.mobile-only {
          padding-top: 0.4rem;
        }
      }
    }
  }

  &-links {
    margin: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;

    @include vars.desktop-only {
      padding-top: 2.5rem;
    }

    @include vars.mobile-only {
      padding-top: 1.5rem;
    }
  }
}
</style>
