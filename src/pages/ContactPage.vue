<template>
  <PageCard back-button-page="/">
    <template #title>Contact Me</template>
    <ButtonSection>
      <LinkButton
        text="Messenger"
        href="https://m.me/mark.ls.metcalfe"
        icon="fab fa-facebook-messenger"
        color="#0078ff"
        external
      />
      <LinkButton
        text="WhatsApp"
        href="https://wa.me/64278746968"
        icon="fab fa-whatsapp"
        color="#25D366"
        external
      />
      <LinkButton
        text="Email"
        href="mailto:mark@markmetcalfe.com"
        icon="fa-regular fa-envelope"
        color="#fb4c2f"
        external
      />
      <LinkButton
        text="Phone"
        href="sms:***REMOVED***"
        icon="fa-solid fa-mobile-screen-button"
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
  name: 'ContactPage',
  components: { PageCard, ButtonSection, LinkButton },
})
</script>

<style lang="scss">
.homeHeader {
  margin-bottom: 3vmin;

  h1 {
    display: block;
    font-size: 9vmin;
    line-height: 11vmin;
    margin: -2.2vmin;
    padding: 2.2vmin;
    margin-bottom: 0;
    position: relative;
    z-index: 100;
    text-transform: lowercase;
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
      font-weight: 500;
    }

    p {
      font-size: 2.5vmin;
      line-height: 3.5vmin;
      margin: 0;
      text-align: left;
    }
  }
}
</style>
