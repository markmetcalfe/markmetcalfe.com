<template>
  <PageCard>
    <section class="home-header">
      <h1>Mark Metcalfe</h1>
      <div class="photo-of-me">
        <img src="/me.png?v=2" />
      </div>
      <div class="home-header-about">
        <h3>Developer <span>/</span> VJ <span>/</span> Digital Wizard</h3>
      </div>
    </section>
    <ButtonSection>
      <LinkButton
        text="My Work"
        href="/portfolio"
        icon="fa-solid fa-laptop-code"
        color="rgb(0 0 0 / 50%)"
        text-color="#0f0"
        extra-padding
      />
      <LinkButton
        text="Contact Me"
        href="/contact"
        icon="fa-regular fa-comments"
        color="rgb(0 0 0 / 50%)"
        text-color="#0f0"
        extra-padding
      />
    </ButtonSection>
    <div v-if="store.renderer" class="home-demobutton">
      <button
        class="button-icon home-randomisebutton"
        title="Randomise Demo"
        @click="store.randomise"
      >
        <font-awesome-icon icon="fa-solid fa-dice" />
      </button>
      <router-link to="/demo" title="Demo Settings">
        <font-awesome-icon icon="fa-solid fa-gear" />
      </router-link>
    </div>
  </PageCard>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PageCard from '../components/PageCard.vue'
import ButtonSection from '../components/ButtonSection.vue'
import LinkButton from '../components/LinkButton.vue'
import { useRendererSettingsStore } from '../stores/renderer-settings'
export default defineComponent({
  name: 'HomePage',
  components: { PageCard, ButtonSection, LinkButton },
  computed: {
    store() {
      return useRendererSettingsStore()
    },
  },
})
</script>

<style lang="scss">
@import '../variables';

.home {
  &-header {
    @include desktop-only {
      margin-bottom: 1.5rem;
    }

    @include mobile-only {
      margin-bottom: 1rem;
    }

    h1 {
      display: block;
      position: relative;
      z-index: 100;
      text-transform: lowercase;
      font-weight: 400;
      letter-spacing: -3px;
      margin: 0;

      @include desktop-only {
        font-size: 5rem;
      }

      @include mobile-only {
        font-size: 3.25rem;
      }
    }

    .photo-of-me {
      display: inline-block;
      transform: translateZ(0);
      filter: contrast(190%) brightness(90%) grayscale(100%);

      @include desktop-only {
        height: 9rem;
        width: 9rem;
        margin: 1rem 0;
        font-size: 5.25rem;
      }

      @include mobile-only {
        height: 6.5rem;
        width: 6.5rem;
        margin: 0.5rem 0;
        font-size: 3.75rem;
      }

      img {
        border-radius: 50%;
        z-index: 200;
        width: inherit;
        height: inherit;
      }
    }

    &-about {
      @include desktop-only {
        margin: 0.75rem 0.5rem;
      }

      @include mobile-only {
        margin: 0.5rem 0;
      }

      h3 {
        font-weight: 300;

        @include desktop-only {
          margin: 0 0 1rem;
          font-size: 2rem;
        }

        @include mobile-only {
          margin: 0 0 0.75rem;
          font-size: 1.5rem;
        }

        span {
          opacity: 0.33;
        }
      }

      p {
        margin: 0;
        text-align: left;

        @include desktop-only {
          font-size: 1.35rem;
        }

        @include mobile-only {
          font-size: 0.9rem;
        }
      }
    }
  }

  &-demobutton {
    position: fixed;
    top: 0;
    right: 0;
    margin-right: 1rem;
    margin-top: 1rem;

    @include desktop-only {
      font-size: 2rem;
    }

    @include mobile-only {
      font-size: 1.5rem;
    }
  }

  &-randomisebutton {
    margin-right: 1rem;
  }
}
</style>
