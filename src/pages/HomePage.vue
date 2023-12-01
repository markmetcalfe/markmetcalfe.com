<template>
  <PageCard>
    <section class="home-header">
      <h1>Mark Metcalfe</h1>
      <div class="imagebutton">
        <span class="imagebutton-image">
          <img src="/me.png" alt="Photo of Mark Metcalfe" />
        </span>
        <span class="imagebutton-button">
          <router-link to="/3d" aria-label="Play Animation">
            <font-awesome-icon icon="fa-solid fa-play" beat />
          </router-link>
        </span>
      </div>
      <div class="home-header-about">
        <h3>Developer • VJ • Digital Wizard</h3>
      </div>
    </section>
    <ButtonSection>
      <LinkButton
        text="My Work"
        href="/portfolio"
        icon="fa-solid fa-laptop-code"
        color="#620f95"
        extra-padding
      />
      <LinkButton
        text="Contact Me"
        href="/contact"
        icon="fa-regular fa-comments"
        color="#b41cac"
        extra-padding
      />
    </ButtonSection>
  </PageCard>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PageCard from '../components/PageCard.vue'
import ButtonSection from '../components/ButtonSection.vue'
import LinkButton from '../components/LinkButton.vue'
export default defineComponent({
  name: 'HomePage',
  components: { PageCard, ButtonSection, LinkButton },
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
      padding-bottom: 1rem;

      @include desktop-only {
        font-size: 5rem;
      }

      @include mobile-only {
        font-size: 3.25rem;
      }
    }

    .imagebutton {
      display: inline-block;
      transform: translateZ(0);

      @include desktop-only {
        height: 10.5rem;
        width: 10.5rem;
        font-size: 5.25rem;
      }

      @include mobile-only {
        height: 7.5rem;
        width: 7.5rem;
        font-size: 3.75rem;
      }

      &-image {
        position: absolute;
        top: 0;
        left: 0;
        width: inherit;
        height: inherit;

        img {
          border-radius: 50%;
          z-index: 200;
          width: inherit;
          height: inherit;
        }
      }

      &-button {
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0;
        transition: opacity 500ms ease-in-out;
        border-radius: 50%;
        width: inherit;
        height: inherit;
        background: var(--color-black);
        color: var(--color-green);

        a {
          width: inherit;
          height: inherit;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        svg {
          margin-left: 0.5rem;
        }

        &:hover {
          opacity: 1;
        }
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
}
</style>
