<template>
  <GameLobby v-if="!store.startedGame" />
  <CountryGuesserGame v-else-if="store.startedGame === 'countries'" />
  <DoodleGame v-else-if="store.startedGame === 'doodle'" />
</template>

<script setup lang="ts">
definePageMeta({ ssr: false });

const route = useRoute();
const config = useRuntimeConfig();
const store = usePlayLobbyStore();

usePlayPageMeta();

// Covers the whole page's lifetime (lobby and both games) -- called
// once here rather than per-component, since each component's own
// onUnmounted would otherwise fight over the same shared visibility
// state (see useDynamicBackground.ts).
useHideDynamicBackground();
useFixMobileViewport();

const roomId = computed(() => route.params.room as string);

// The WS connection spans the whole page's lifetime -- lobby and
// gameplay both -- rather than being owned by GameLobby, since it needs
// to survive GameLobby unmounting once a game starts (see
// store.startedGame above) and remounting later on "Back to Lobby".
onMounted(() => {
  store.connect(roomId.value, config.public.playApiUrl as string);
});

onUnmounted(() => {
  store.disconnect();
});
</script>
