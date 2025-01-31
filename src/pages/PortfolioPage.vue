<template>
  <PageCard back-button-page="/">
    <template #title>My Work</template>
    <ButtonSection>
      <LinkButton
        v-if="isVizshun()"
        text="Instagram"
        href="https://instagram.com/vizshun.art"
        icon="fab fa-instagram"
        color="#e1306c"
        external
      />
      <LinkButton
        v-if="isVizshun()"
        text="Soundcloud"
        href="https://soundcloud.com/vizshun"
        icon="fab fa-soundcloud"
        color="#f26f23"
        external
      />
      <LinkButton
        v-if="!isVizshun()"
        text="GitHub"
        href="https://github.com/markmetcalfe"
        icon="fab fa-github"
        color="#191717"
        external
      />
      <LinkButton
        v-if="!isVizshun()"
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
import { isVizshun } from '../util/site'
export default defineComponent({
  name: 'PortfolioPage',
  components: { PageCard, ButtonSection, LinkButton },
  methods: { isVizshun },
})
</script>
