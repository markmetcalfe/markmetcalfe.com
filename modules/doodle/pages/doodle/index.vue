<template>
  <span />
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const base = config.public.doodleApiUrl as string
const roomPromise = fetch(`${base}/api/doodle/rooms`, { method: 'POST' })

onBeforeMount(async () => {
  const res = await roomPromise
  const { roomId } = await res.json() as { roomId: string }
  await navigateTo(`/doodle/${roomId}`)
})
</script>
