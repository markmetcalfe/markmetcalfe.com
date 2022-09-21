<template>
  <div class="businesscard-outer">
    <PageCard>
      <section class="businesscard">
        <div class="businesscard-column businesscard-photo-container">
          <img src="/me.jpg" alt="Photo of Mark Metcalfe" />
        </div>
        <div class="businesscard-column businesscard-content">
          <div class="businesscard-row">
            <h1>mark metcalfe</h1>
          </div>
          <div class="businesscard-row">
            <h2 class="light">Full Stack Developer</h2>
          </div>
          <div class="businesscard-row">
            <h2>markmetcalfe.io</h2>
          </div>
        </div>
      </section>
    </PageCard>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PageCard from '../components/PageCard.vue'
export default defineComponent({
  name: 'CardPage',
  components: { PageCard },
})
</script>

<style lang="scss">
.businesscard {
  padding: 5px;
  display: flex;
  align-content: center;
  justify-content: space-between;
  align-items: center;

  &-outer {
    & .pagecard-inner {
      width: fit-content;
    }
  }

  img {
    border-radius: 50%;
    height: 250px;
  }

  &-column {
    line-height: 0;

    &:not(:first-child) {
      padding-left: 40px;
    }
  }

  &-content {
    width: min-content;
    display: flex;
    flex-flow: column nowrap;
    align-content: space-between;
    justify-content: space-between;
    align-items: center;
    height: 200px;

    h1,
    h2 {
      margin: 0;
      white-space: nowrap;
      line-height: 100%;
    }

    h1 {
      font-weight: 400;
      font-size: 70px;
    }

    h2 {
      font-size: 35px;
    }

    h2.light {
      font-weight: 300;
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
