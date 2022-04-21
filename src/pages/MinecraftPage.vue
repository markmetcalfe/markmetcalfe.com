<template>
  <PageCard>
    <template #title>minecraft.markmetcalfe.io</template>
    <div>
      <p><strong>A Private Minecraft Server</strong></p>
      <p>Compatible with both Bedrock and Java editions</p>
      <p>
        Please <router-link to="/contact">contact me</router-link> to be
        whitelisted
      </p>
      <p>Server IP: <strong>minecraft.markmetcalfe.io</strong></p>
    </div>
    <ButtonSection>
      <LinkButton
        text="Creative Map"
        href="/minecraft/maps/creative"
        icon="fa-solid fa-map-marked-alt"
      />
      <LinkButton
        text="Survival Map"
        href="/minecraft/maps/survival"
        icon="fa-solid fa-map-marked-alt"
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
  name: 'MinecraftPage',
  components: { PageCard, ButtonSection, LinkButton },
})
</script>
