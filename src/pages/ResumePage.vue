<template>
  <PageCard back-button-page="/">
    <template #title>Resume</template>
    <p>
      Please <router-link to="/contact">contact me</router-link> for a copy of
      my latest resume
    </p>
  </PageCard>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PageCard from '../components/PageCard.vue'
export default defineComponent({
  name: 'ResumePage',
  components: { PageCard },
})
</script>
