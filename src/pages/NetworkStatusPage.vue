<template>
  <PageCard back-button-page="/">
    <template #title>Connection Status</template>
    <div>
      <p v-if="isConnected === true" class="networkstatus success">
        Connected To Local Network
      </p>
      <p
        v-else-if="isConnected === false"
        class="networkstatus error no-padding"
      >
        Not Connected To Local Network
      </p>
      <p v-if="homeIp">Home IP: {{ homeIp }}</p>
      <p v-if="yourIp" class="no-padding">Your IP: {{ yourIp }}</p>
    </div>
  </PageCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageCard from '../components/PageCard.vue'

const isConnected = ref<boolean | undefined>(undefined)
const homeIp = ref<string | undefined>(undefined)
const yourIp = ref<string | undefined>(undefined)

onMounted(async () => {
  try {
    const response = await fetch('/api/get-network-status')
    const responseBody = await response.json()
    isConnected.value = responseBody.isConnected
    homeIp.value = responseBody.homeIp
    yourIp.value = responseBody.yourIp
  } catch (error) {
    isConnected.value = false
  }
})
</script>

<style lang="scss">
@use '../variables' as vars;

.networkstatus {
  font-weight: 600;

  @include vars.desktop-only {
    font-size: 1.75rem;
  }

  @include vars.mobile-only {
    font-size: 1.25rem;
  }
}
</style>
