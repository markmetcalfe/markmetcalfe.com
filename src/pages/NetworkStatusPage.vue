<template>
  <PageCard back-button-page="/">
    <template #title>Connection Status</template>
    <div class="networkstatus">
      <p v-if="isConnected === true" class="networkstatus-connected">
        Connected To Local Network
      </p>
      <p v-else-if="isConnected === false" class="networkstatus-notconnected">
        Not Connected To Local Network
      </p>
      <p v-if="homeIp">Home IP: {{ homeIp }}</p>
      <p v-if="yourIp">Your IP: {{ yourIp }}</p>
    </div>
  </PageCard>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PageCard from '../components/PageCard.vue'
export default defineComponent({
  name: 'NetworkStatusPage',
  components: { PageCard },

  data(): {
    isConnected: boolean | undefined
    homeIp: string | undefined
    yourIp: string | undefined
  } {
    return {
      isConnected: undefined,
      homeIp: undefined,
      yourIp: undefined,
    }
  },

  async mounted() {
    try {
      const response = await fetch('/api/get-network-status')
      const responseBody = await response.json()
      this.isConnected = responseBody.isConnected
      this.homeIp = responseBody.homeIp
      this.yourIp = responseBody.yourIp
    } catch (error) {
      this.isConnected = false
    }
  },
})
</script>

<style lang="scss">
@import '../variables';

.networkstatus-connected,
.networkstatus-notconnected {
  font-weight: bold;
  padding-bottom: 1rem;

  @include desktop-only {
    font-size: 1.75rem;
  }

  @include mobile-only {
    font-size: 1.25rem;
  }
}

.networkstatus-connected {
  color: var(--color-green);
}

.networkstatus-notconnected {
  color: var(--color-red);
}
</style>
