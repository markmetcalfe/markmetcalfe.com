<template>
  <PageCard back-button-page="/">
    <template #title>
      Not Found
    </template>
    <p>The page you're looking for isn't here 😞</p>
    <p class="no-padding">
      Please <a :href="mailtoLink">contact me</a> if you think this is an
      error
    </p>
  </PageCard>
</template>

<script setup lang="ts">
import PageCard from '~/components/PageCard.vue'

const { mailtoLink } = useAppConfig()
</script>
