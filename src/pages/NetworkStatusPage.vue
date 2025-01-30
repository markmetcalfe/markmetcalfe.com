<template>
  <PageCard back-button-page="/">
    <template #title>Connection Status</template>
    <div>
      <p v-if="isConnected === true" class="networkstatus green">
        Connected To Local Network
      </p>
      <p v-else-if="isConnected === false" class="networkstatus red">
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
@use '../variables' as vars;

.networkstatus {
  font-weight: bold;
  padding-bottom: 1rem;

  @include vars.desktop-only {
    font-size: 1.75rem;
  }

  @include vars.mobile-only {
    font-size: 1.25rem;
  }
}
</style>
