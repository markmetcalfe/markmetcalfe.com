<template>
  <span />
</template>

<script setup lang="ts">
onBeforeMount(async () => {
  const res = await fetch('/api/doodle/rooms', { method: 'POST' })
  const { roomId } = await res.json() as { roomId: string }
  await navigateTo(`/doodle/${roomId}`)
})
</script>
