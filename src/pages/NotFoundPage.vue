<template>
  <PageCard back-button-page="/">
    <template #title>Not Found</template>
    <p>The page you're looking for isn't here 😞</p>
    <p class="no-padding">
      Please <a :href="getMailtoLink()">contact me</a> if you think this is an
      error
    </p>
  </PageCard>
</template>

<script setup lang="ts">
import PageCard from '../components/PageCard.vue'
import { getMailtoLink } from '../util/site'
</script>
