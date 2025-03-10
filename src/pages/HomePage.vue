<template>
  <PageCard
    v-show="!isHidden"
    :background-opacity="opaqueBackground ? 1 : 0"
    :show-border="opaqueBackground"
  >
    <div class="home">
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
          <div class="home-header-about">
            <p v-if="isVizshun()"><span>></span> Visual Artist</p>
            <p v-if="isVizshun()"><span>></span> DJ</p>
            <p v-else><span>></span> Developer</p>
            <p><span>></span> Digital Wizard</p>
          </div>
        </div>
      </section>
      <section v-if="!isCardPreview()" class="home-links">
        <template v-if="isVizshun()">
          <LinkButton
            text="Instagram"
            href="https://instagram.com/_vizshun"
            icon="fab fa-instagram"
            color="#e1306c"
            external
          />
          <LinkButton
            text="Soundcloud"
            href="https://soundcloud.com/vizshun"
            icon="fab fa-soundcloud"
            color="#f26f23"
            external
          />
        </template>
        <template v-else>
          <LinkButton
            text="GitHub"
            href="https://github.com/markmetcalfe"
            icon="fab fa-github"
            color="#191717"
            external
          />
          <LinkButton
            text="Resume"
            href="/Mark-Metcalfe-Resume.pdf"
            icon="fa-regular fa-file-lines"
            color="#f6b011"
            external
          />
          <LinkButton
            text="Email"
            :href="getMailtoLink()"
            icon="fa-regular fa-envelope"
            color="#fb4c2f"
            external
          />
          <LinkButton
            text="LinkedIn"
            href="https://www.linkedin.com/in/mark-metcalfe/"
            icon="fab fa-linkedin"
            color="#0077b5"
            external
          />
        </template>
        <LinkButton
          text="Visuals"
          href="/visuals"
          icon="fa-solid fa-eye"
          color="#0077b5"
        />
      </section>
      <div v-if="!isMobile() && !isCardPreview()" class="home-cornerbuttons">
        <button class="button-icon" title="See through" @click="toggleOpacity">
          <font-awesome-icon
            :icon="'fa-eye ' + (opaqueBackground ? 'fa-regular' : 'fa-solid')"
          />
        </button>
        <button
          class="button-icon"
          title="Randomise Background"
          @click="randomiseBackground"
        >
          <font-awesome-icon icon="fa-solid fa-dice" />
        </button>
        <button class="button-icon" title="Hide" @click="isHidden = true">
          <font-awesome-icon icon="fa-solid fa-xmark" />
        </button>
      </div>
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
import { getRandomInt } from '../util/random'
import { getRandomColor } from '../util/color'
import { GeometryAttributes, PartialSphere, Sphere } from '../3d/geometry'
import isMobile from 'is-mobile'
import { useRendererSettingsStore } from '../stores/renderer-settings'
export default defineComponent({
  name: 'HomePage',
  components: { PageCard, LinkButton },

  data(): {
    renderer: Renderer | undefined
    rendererZoomLevel: number
    geometryDefinition: GeometryAttributes[]
    geometryRotationSpeed: number
    opaqueBackground: boolean
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
      opaqueBackground: true,
      isHidden: false,
    }
  },

  mounted() {
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
    this.renderer?.cleanUp()
  },

  methods: {
    isVizshun,
    isCardPreview,
    isMobile,
    getMailtoLink,

    randomiseProfile() {
      this.renderer?.getGeometry()!.forEach(geometry => {
        geometry.setRotation(
          getRandomInt(0, 25),
          getRandomInt(0, 25),
          getRandomInt(0, 25),
        )
        geometry.setColor(...getRandomColor())
      })
    },

    randomiseBackground() {
      const backgroundSettings = useRendererSettingsStore()
      backgroundSettings.randomise()
    },

    toggleOpacity() {
      this.opaqueBackground = !this.opaqueBackground
    },
  },
})
</script>

<style lang="scss">
@use '../variables' as vars;

.home {
  &-header {
    display: flex;
    gap: 1rem;

    @include vars.desktop-only {
      margin-top: 3rem;
      margin-bottom: 1.5rem;
    }

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
      letter-spacing: -4px;
      margin: 0;
      text-align: left;

      @include vars.desktop-only {
        font-size: 5rem;
        line-height: 3.3rem;
      }

      @include vars.mobile-only {
        font-size: 3.25rem;
        line-height: 2.15rem;
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
      padding-top: 0.75rem;
      list-style: inside;
      display: grid;
      justify-items: start;

      @include vars.desktop-only {
        grid-template-columns: 1fr 1fr;
      }

      & p {
        padding: 0;
        margin: 0;
        font-weight: 300;

        & > span {
          color: var(--color-highlight);
        }

        @include vars.desktop-only {
          padding-top: 0.5rem;
          font-size: 1.25rem;
        }

        @include vars.mobile-only {
          font-size: 1rem;
        }
      }
    }
  }

  &-links {
    margin: 0;
    padding-top: 1rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  &-cornerbuttons {
    position: absolute;
    right: 0;
    top: 0;
    padding: 0.5rem 0.75rem;
    display: flex;
    gap: 0.5rem;
  }
}
</style>
