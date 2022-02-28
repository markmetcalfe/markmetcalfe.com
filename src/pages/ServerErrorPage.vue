<template>
  <PageCard back-button-page="/">
    <template #title>Server Error</template>
    <p>Whoops - something has gone wrong 🤯</p>
    <p>
      Please <router-link to="/contact">contact me</router-link> so I can fix it
    </p>
  </PageCard>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PageCard from '../components/PageCard.vue'
export default defineComponent({
  name: 'ServerErrorPage',
  components: { PageCard },
})
</script>
