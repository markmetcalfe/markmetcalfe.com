<template>
  <div>
    <PageCard back-button-page="/">
      <template #title>
        Error {{ error?.statusCode }}
      </template>
      <p>Something has gone wrong 🤯</p>
      <p class="no-padding">
        Please <a :href="mailtoLink">contact me</a> so I can fix it
      </p>
    </PageCard>
    <DynamicBackground />
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps({
  error: Object as () => NuxtError,
})

const { mailtoLink } = useAppConfig()
</script>
