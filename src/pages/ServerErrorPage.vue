<template>
  <PageCard back-button-page="/">
    <template #title>Server Error</template>
    <p>Whoops - something has gone wrong 🤯</p>
    <p class="no-padding">
      Please <a :href="getMailtoLink()">contact me</a> so I can fix it
    </p>
  </PageCard>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PageCard from '../components/PageCard.vue'
import { getMailtoLink } from '../util/site'

export default defineComponent({
  name: 'ServerErrorPage',
  components: { PageCard },
  methods: { getMailtoLink },
})
</script>
