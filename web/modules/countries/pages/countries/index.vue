<template>
  <span />
</template>

<script setup lang="ts">
useSeoMeta({
  title: "Country Guesser - Mark Metcalfe",
  ogTitle: "Country Guesser - Mark Metcalfe",
  description:
    "A singleplayer and multiplayer country name guessing game",
  ogDescription:
    "A singleplayer and multiplayer country name guessing game",
  ogImage: "https://markmetcalfe.com/countries/social-card.jpg?v=1",
});

onBeforeMount(async () => {
  const res = await fetch("/api/countries/rooms", { method: "POST" });
  const { roomId } = (await res.json()) as { roomId: string };
  await navigateTo(`/countries/${roomId}`);
});
</script>
