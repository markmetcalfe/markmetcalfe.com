<template>
  <PageCard back-button-page="/">
    <template #title>
      Connection Status
    </template>
    <div class="networkstatus">
      <p
        v-if="status === 'pending'"
        class="networkstatus-status networkstatus-loading"
      >
        Loading...
      </p>

      <template v-else-if="networkStatus?.isConnected === true">
        <p class="networkstatus-status networkstatus-success">
          Connected To Local Network
        </p>
        <p>Home IP: {{ networkStatus.homeIp }}</p>
        <p>Your IP: {{ networkStatus.yourIp }}</p>
      </template>

      <p
        v-else
        class="networkstatus-status networkstatus-error"
      >
        Not Connected To Local Network
      </p>

      <LinkButton
        text="Refresh"
        hide-text
        :disabled="status === 'pending'"
        @click="refresh()"
      >
        <Icon name="fa6-solid:rotate" />
      </LinkButton>
    </div>
  </PageCard>
</template>

<script setup lang="ts">
interface NetworkStatus {
  isConnected: boolean
  yourIp?: string
  homeIp?: string
}

const {
  data: networkStatus,
  status,
  refresh,
} = await useFetch<NetworkStatus>('/api/get-network-status', { server: false })
</script>

<style lang="scss">
@use "~/variables" as vars;

.networkstatus {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  & p {
    margin: 0;
    padding: 0;
  }

  @include vars.desktop-only {
    min-width: 425px;
  }

  @include vars.mobile-only {
    min-width: 312px;
  }

  &-status {
    font-weight: 600;

    @include vars.desktop-only {
      font-size: 1.75rem;
    }

    @include vars.mobile-only {
      font-size: 1.25rem;
    }
  }

  &-success {
    color: var(--color-highlight);
  }

  &-error {
    color: var(--color-error);
  }

  &-loading {
    color: var(--color-disabled);
  }
}
</style>
