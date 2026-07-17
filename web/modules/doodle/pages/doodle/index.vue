<template>
  <span />
</template>

<script setup lang="ts">
useSeoMeta({
  title: "Doodle - Mark Metcalfe",
  ogTitle: "Doodle - Mark Metcalfe",
  description: "A multiplayer drawing and guessing game",
  ogDescription: "A multiplayer drawing and guessing game",
  ogImage: "https://markmetcalfe.com/doodle-social-card.jpg?v=1",
});

useHideDynamicBackground();

onBeforeMount(async () => {
  const res = await fetch("/api/doodle/rooms", { method: "POST" });
  const { roomId } = (await res.json()) as { roomId: string };
  await navigateTo(`/doodle/${roomId}`);
});
</script>
