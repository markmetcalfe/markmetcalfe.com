<template>
  <PageCard back-button-page="/">
    <template #title>Connection Status</template>
    <div class="networkstatus">
      <p v-if="isLoading" class="networkstatus-status networkstatus-loading">
        Loading...
      </p>

      <template v-else-if="networkStatus?.isConnected === true">
        <p class="networkstatus-status networkstatus-success">
          Connected To Local Network
        </p>
        <p>Home IP: {{ networkStatus.homeIp }}</p>
        <p>Your IP: {{ networkStatus.yourIp }}</p>
      </template>

      <p v-else class="networkstatus-status networkstatus-error">
        Not Connected To Local Network
      </p>

      <LinkButton v-if="!isLoading" text="Refresh" hide-text @click="refetch()">
        <font-awesome-icon icon="fa-solid fa-rotate" />
      </LinkButton>
    </div>
  </PageCard>
</template>

<script setup lang="ts">
import LinkButton from '../components/LinkButton.vue'
import PageCard from '../components/PageCard.vue'
import { useGetNetworkStatus } from '../queries/network-status'

const { data: networkStatus, isLoading, refetch } = useGetNetworkStatus()
</script>

<style lang="scss">
@use '../variables' as vars;

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
