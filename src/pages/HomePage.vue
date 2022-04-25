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
        href="/resume"
        icon="fa-regular fa-file-lines"
        color="#f6b011"
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
.home {
  &-header {
    margin-bottom: 3vmin;

    h1 {
      display: block;
      font-size: 9.5vmin;
      line-height: 11vmin;
      margin: -2.2vmin;
      padding: 2.2vmin;
      margin-bottom: 0;
      position: relative;
      z-index: 100;
      text-transform: lowercase;
      font-weight: 400;
      letter-spacing: -3px;
    }

    img {
      border-radius: 50%;
      height: 20vmin;
    }

    &-about {
      margin: 1vmin;

      h3 {
        margin: 0 0 2vmin;
        font-size: 4vmin;
        line-height: 4vmin;
        font-weight: 300;
      }

      p {
        font-size: 2.5vmin;
        line-height: 3.5vmin;
        margin: 0;
        text-align: left;
      }
    }
  }
}
</style>
