<template>
  <PageCard back-button-page="/">
    <template #title>Not Found</template>
    <p>The page you're looking for isn't here 😞</p>
    <p>
      Please <a :href="getMailtoLink()">contact me</a> if you think this is an
      error
    </p>
  </PageCard>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PageCard from '../components/PageCard.vue'
import { getMailtoLink } from '../util/site'

export default defineComponent({
  name: 'NotFoundPage',
  components: { PageCard },
  methods: { getMailtoLink },
})
</script>
