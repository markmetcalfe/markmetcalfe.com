<template>
  <PageCard back-button-page="/">
    <template #title>My Work</template>
    <ButtonSection>
      <LinkButton
        text="Instagram"
        href="https://instagram.com/markus_ratboy"
        icon="fab fa-instagram"
        color="#e1306c"
        external
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
    </ButtonSection>
  </PageCard>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PageCard from '../components/PageCard.vue'
import ButtonSection from '../components/ButtonSection.vue'
import LinkButton from '../components/LinkButton.vue'
export default defineComponent({
  name: 'PortfolioPage',
  components: { PageCard, ButtonSection, LinkButton },
})
</script>
