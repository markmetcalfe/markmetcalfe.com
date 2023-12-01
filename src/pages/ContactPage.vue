<template>
  <PageCard back-button-page="/">
    <template #title>Contact</template>
    <ButtonSection>
      <LinkButton
        text="Email"
        href="mailto:mark@markmetcalfe.com"
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
      <LinkButton
        text="Instagram"
        href="https://instagram.com/markus_ratboy"
        icon="fab fa-instagram"
        color="#e1306c"
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
