<template>
  <PageCard back-button-page="/">
    <template #title>Not Found</template>
    <p>The page you're looking for isn't here 😞</p>
    <p>
      Please <router-link to="/contact">contact me</router-link> if you think
      this is an error
    </p>
  </PageCard>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PageCard from '../components/PageCard.vue'
export default defineComponent({
  name: 'NotFoundPage',
  components: { PageCard },
})
</script>
