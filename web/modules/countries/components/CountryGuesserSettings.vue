<template>
  <template v-if="store.isHost">
    <DropdownSelect
      v-model="countryOrderModel"
      label="Country order"
      :options="countryOrderOptions"
      class="gamelobby-settings"
    />

    <RangeSlider
      v-model="gameLengthMinutes"
      label="Game length (min)"
      :min="1"
      :max="20"
      :step="1"
      class="gamelobby-settings"
    />
  </template>

  <template v-else>
    <p class="gamelobby-settings-readonly">
      Country order:
      <span class="gamelobby-settings-value">{{
        countryOrderLabel
      }}</span>
    </p>
    <p class="gamelobby-settings-readonly">
      Game length:
      <span class="gamelobby-settings-value"
        >{{ Math.round(store.roundLength / 60) }} min</span
      >
    </p>
  </template>
</template>

<script setup lang="ts">
import type { CountryOrder } from "@play/stores/playLobby";

// Proxies straight onto the store (the single source of truth, synced
// from the server) rather than a separate local ref -- a reload/reconnect
// then just shows whatever's already saved server-side for free, with
// nothing to resync by hand.
const store = usePlayLobbyStore();

const gameLengthMinutes = computed({
  get: () => Math.round(store.roundLength / 60),
  set: (value: number) =>
    store.updateSettings(value * 60, store.countryOrder),
});
const countryOrderModel = computed({
  get: () => store.countryOrder,
  set: (value: CountryOrder) =>
    store.updateSettings(store.roundLength, value),
});

const countryOrderOptions: { label: string; value: CountryOrder }[] =
  [
    { label: "Random", value: "random" },
    { label: "Alphabetical", value: "alphabetical" },
    { label: "Population", value: "population" },
    { label: "Size", value: "size" },
  ];

const countryOrderLabel = computed(
  () =>
    countryOrderOptions.find(o => o.value === store.countryOrder)
      ?.label ?? "Random",
);
</script>
