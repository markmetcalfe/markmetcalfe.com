<template>
  <span />
</template>

<script setup lang="ts">
usePlayPageMeta();

onBeforeMount(async () => {
  const res = await fetch("/api/play/rooms", { method: "POST" });
  const { roomId } = (await res.json()) as { roomId: string };
  await navigateTo(`/play/${roomId}`);
});
</script>
