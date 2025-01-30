<template>
  <PageCard back-button-page="/">
    <template #title>Contact</template>
    <ButtonSection>
      <LinkButton
        v-if="isVizshun()"
        text="Instagram"
        href="https://instagram.com/vizshun.nz"
        icon="fab fa-instagram"
        color="#e1306c"
        external
      />
      <LinkButton
        v-if="!isVizshun()"
        text="Email"
        href="mailto:mark@markmetcalfe.com"
        icon="fa-regular fa-envelope"
        color="#fb4c2f"
        external
      />
      <LinkButton
        v-if="!isVizshun()"
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
import { isVizshun } from '../util/site'
export default defineComponent({
  name: 'ContactPage',
  components: { PageCard, ButtonSection, LinkButton },
  methods: { isVizshun },
})
</script>
