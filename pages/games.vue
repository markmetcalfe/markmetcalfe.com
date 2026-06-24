<template>
  <PageCard
    back-button-page="/"
  >
    <template #title>
      Games
    </template>

    <p class="disclaimer">
      These games are vibe coded and therefore may not be bug-free.
      <br>
      They exist purely just as a bit of fun for team building.
    </p>

    <div class="games">
      <LinkButton
        text="Doodle"
        href="/doodle"
        large
      >
        <Icon name="bx:paint" />
      </LinkButton>
    </div>
  </PageCard>
</template>

<style lang="scss">
@use "~/variables" as vars;

.disclaimer {
  text-align: center;
  opacity: 0.6;
  margin-bottom: 1.5rem;
}

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
