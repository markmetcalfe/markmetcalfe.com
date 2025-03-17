<template>
  <PageCard v-show="!isHidden">
    <div class="home" :class="{ 'home--card': isCardPreview() }">
      <section class="home-header">
        <div class="home-header-left">
          <div class="photo-of-me" @click="randomiseProfile">
            <img src="/me.png?v=6" />
            <div class="photo-of-me-bg" />
          </div>
        </div>
        <div class="home-header-right">
          <h1 v-if="isVizshun()" class="vizshun">Vizshun</h1>
          <h1 v-else class="mark">Mark Metcalfe</h1>
          <GridList
            class="home-header-about"
            large
            :items="
              isVizshun()
                ? ['Visual Artist', 'DJ', 'Digital Wizard']
                : ['Developer', 'Digital Wizard']
            "
          />
        </div>
      </section>
      <section v-if="!isCardPreview()" class="home-links">
        <template v-if="isVizshun()">
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
        </template>
        <template v-else>
          <LinkButton
            text="GitHub"
            href="https://github.com/markmetcalfe"
            external
            large
          >
            <font-awesome-icon icon="fab fa-github" />
          </LinkButton>
          <LinkButton
            text="Resume"
            href="/Mark-Metcalfe-Resume.pdf"
            external
            large
          >
            <font-awesome-icon icon="fa-regular fa-file-lines" />
          </LinkButton>
          <LinkButton text="Email" :href="getMailtoLink()" external large>
            <font-awesome-icon icon="fa-regular fa-envelope" />
          </LinkButton>
          <LinkButton
            text="LinkedIn"
            href="https://www.linkedin.com/in/mark-metcalfe/"
            external
            large
          >
            <font-awesome-icon icon="fab fa-linkedin" />
          </LinkButton>
        </template>
        <LinkButton text="Visuals" href="/visuals" large>
          <inline-svg src="/favicon.svg" />
        </LinkButton>
        <LinkButton text="Sequencer" href="/sequencer" large>
          <font-awesome-icon icon="fa-solid fa-music" />
        </LinkButton>
      </section>
    </div>
  </PageCard>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PageCard from '../components/PageCard.vue'
import LinkButton from '../components/LinkButton.vue'
import {
  getMailtoLink,
  isCardPreview,
  isPlaywrightTest,
  isVizshun,
} from '../util/site'
import { Renderer } from '../3d'
import { GeometryAttributes, PartialSphere, Sphere } from '../3d/geometry'
import { useVisualsStore } from '../stores/visuals'
import GridList from '../components/GridList.vue'
import { useSiteStore } from '../stores/site'

export default defineComponent({
  name: 'HomePage',
  components: { GridList, LinkButton, PageCard },

  data(): {
    renderer: Renderer | undefined
    rendererZoomLevel: number
    geometryDefinition: GeometryAttributes[]
    geometryRotationSpeed: number
    isHidden: boolean
  } {
    return {
      renderer: undefined,
      rendererZoomLevel: 11,
      geometryDefinition: [
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
      ],
      geometryRotationSpeed: 20,
      isHidden: false,
    }
  },

  computed: {
    siteStore() {
      return useSiteStore()
    },
  },

  mounted() {
    this.siteStore.showBackground()

    setTimeout(() => {
      this.renderer = new Renderer(document.querySelector('.photo-of-me-bg')!)
        .setGetDefaultGeometry(() => this.geometryDefinition)
        .setOnRenderTick(renderer =>
          renderer.getGeometry()!.forEach(geometry => geometry.rotate()),
        )
        .setOnInit(renderer => {
          if (isCardPreview() || isPlaywrightTest()) {
            return
          }
          renderer.getGeometry()!.forEach(geometry => {
            geometry.setRotationSpeed({
              x: this.geometryRotationSpeed,
              y: this.geometryRotationSpeed,
            })
          })
        })
        .setGetZoom(() => this.rendererZoomLevel)
        .initialise()
    }, 100)
  },

  unmounted() {
    setTimeout(() => {
      this.renderer?.cleanUp()
    }, 250)
  },

  methods: {
    isVizshun,
    isCardPreview,
    getMailtoLink,

    randomiseProfile() {
      this.renderer?.randomiseRotations()
      this.renderer?.randomiseColors()
    },

    randomiseBackground() {
      const backgroundSettings = useVisualsStore()
      backgroundSettings.randomise()
    },
  },
})
</script>

<style lang="scss">
@use '../variables' as vars;

.home {
  @include vars.desktop-only {
    padding: 1rem 0;
  }

  &--card {
    @include vars.desktop-only {
      padding: 1.5rem 0;
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

    h1 {
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

      &.vizshun {
        padding-top: 0.5rem;
      }

      &.mark {
        word-spacing: 1px;

        @include vars.desktop-only {
          width: 280px;
        }

        @include vars.mobile-only {
          width: 170px;
        }
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
