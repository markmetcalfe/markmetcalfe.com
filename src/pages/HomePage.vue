<template>
  <PageCard>
    <section class="home-header">
      <h1>Mark Metcalfe</h1>
      <div class="photo">
        <img src="/me.png" />
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

    .photo {
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

      img {
        border-radius: 50%;
        z-index: 200;
        opacity: 0.9;
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
}
</style>
