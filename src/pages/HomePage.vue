<template>
  <PageCard>
    <section class="home-header">
      <h1>Mark Metcalfe</h1>
      <img src="/me.jpg" alt="Photo of Mark Metcalfe" />
      <div class="home-header-about">
        <h3>Kia ora, I’m Mark 👋</h3>
        <p>
          I'm an ambitious and driven full-stack developer with valuable
          experience delivering high quality work in fast-paced contexts.
        </p>
      </div>
    </section>
    <ButtonSection>
      <LinkButton
        text="Contact"
        href="/contact"
        icon="fa-regular fa-envelope"
        color="#fb4c2f"
      />
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
        text="LinkedIn"
        href="https://www.linkedin.com/in/mark-metcalfe/"
        icon="fab fa-linkedin"
        color="#0077b5"
        external
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

    img {
      border-radius: 50%;

      @include desktop-only {
        height: 10.5rem;
      }
      @include mobile-only {
        height: 7.5rem;
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
