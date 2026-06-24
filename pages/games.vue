<template>
  <PageCard
    back-button-page="/"
  >
    <template #title>
      Games
    </template>

    <div class="games">
      <DoodleEntry />
    </div>
  </PageCard>
</template>

<style lang="scss">
@use "~/variables" as vars;

.games {
  display: flex;
  flex-direction: column;
  align-items: center;

  @include vars.desktop-only {
    gap: 2rem;
    min-width: 250px;
  }

  @include vars.mobile-only {
    gap: 1.5rem;
  }
}
</style>
