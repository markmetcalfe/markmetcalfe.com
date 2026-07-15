<template>
  <div class="waitingroomscreen">
    <AttractMap />
    <h1 class="waitingroomscreen-heading">Country Guesser</h1>
    <p class="waitingroomscreen-desc">
      A country will be highlighted on the map — type its name before
      the clock runs out. Stuck? Letters get revealed over time, and
      you can skip (with a small penalty)
    </p>
    <RoomLobby />
    <LinkButton
      v-if="store.players.length < 2"
      text="Leaderboard"
      large
      @click="emit('show-leaderboard')"
    >
      <Icon name="bx:trophy" />
    </LinkButton>
  </div>
</template>

<script setup lang="ts">
const store = useCountryGuesserRoomStore();

const emit = defineEmits<{ "show-leaderboard": [] }>();
</script>

<style lang="scss">
.waitingroomscreen {
  position: relative;
  z-index: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  gap: 1.25rem;
  padding: 5rem 1.5rem 2rem;
  text-align: center;

  &-heading {
    font-size: 1.8rem;
    font-weight: 400;
  }

  &-desc {
    max-width: 480px;
    color: var(--color-light);
  }
}
</style>
