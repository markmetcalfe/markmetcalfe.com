<template>
  <div class="businesscard-outer">
    <PageCard>
      <section class="businesscard">
        <div class="businesscard-column businesscard-photo-container">
          <img
            v-if="isVizshun()"
            src="/vizshun.png?v=1"
            alt="Photo of Vizshun"
          />
          <img v-else src="/me.png?v=6" alt="Photo of Mark Metcalfe" />
        </div>
        <div class="businesscard-column businesscard-content">
          <div class="businesscard-row">
            <h1 v-if="isVizshun()">vizshun</h1>
            <h1 v-else>mark metcalfe</h1>
          </div>
          <div class="businesscard-row">
            <h2 v-if="isVizshun()" class="light">
              Visual Artist <span>/</span> DJ
            </h2>
            <h2 v-else class="light">
              Developer <span>/</span> Digital Wizard
            </h2>
          </div>
          <div v-if="!isVizshun()" class="businesscard-row">
            <h2>markmetcalfe.com</h2>
          </div>
        </div>
      </section>
    </PageCard>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PageCard from '../components/PageCard.vue'
import { isVizshun } from '../util/site'
import { useRendererSettingsStore } from '../stores/renderer-settings'

export default defineComponent({
  name: 'CardPage',
  components: { PageCard },
  mounted() {
    const rendererStore = useRendererSettingsStore()

    rendererStore.setBeatMatchEnabled(false)
    rendererStore.setFollowCursor(false)

    const zoom = 2
    rendererStore.setMaxZoom(zoom)
    rendererStore.setMinZoom(zoom)
    rendererStore.setCurrentZoom(zoom)
  },
  methods: { isVizshun },
})
</script>

<style lang="scss">
.businesscard {
  padding: 5px;
  display: flex;
  place-content: center space-between;
  align-items: center;

  &-outer {
    & .pagecard-inner {
      width: fit-content;
    }
  }

  img {
    border-radius: 50%;
    height: 210px;
  }

  &-column {
    &:not(:first-child) {
      padding-left: 40px;
    }
  }

  &-row {
    line-height: initial;

    &:not(:first-child) {
      margin-top: 15px;
    }
  }

  &-content {
    width: min-content;
    display: flex;
    flex-flow: column nowrap;
    place-content: space-between space-between;
    align-items: center;
    justify-content: center;
    height: 200px;

    h1,
    h2 {
      white-space: nowrap;
    }

    h1 {
      font-weight: 400;
      font-size: 70px;
    }

    h2 {
      font-size: 35px;
      margin: 0;
    }

    h2.light {
      font-weight: 300;

      span {
        opacity: 0.33;
      }
    }

    p {
      font-size: 20px;
      margin: 0;
    }

    .center {
      text-align: center;
    }

    .justify {
      text-align: justify;
      text-justify: inter-word;
    }
  }
}
</style>
