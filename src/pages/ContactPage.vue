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
