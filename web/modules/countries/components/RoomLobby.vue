<template>
  <div class="roomlobby">
    <AttractMap />
    <h3 class="roomlobby-heading">Waiting for players&hellip;</h3>

    <div class="roomlobby-players">
      <div
        v-for="player in store.players"
        :key="player.id"
        class="roomlobby-player"
      >
        <span class="roomlobby-player-name">{{ player.name }}</span>
        <span v-if="player.isHost" class="highlight">host</span>
      </div>
    </div>

    <div class="roomlobby-invite">
      <span class="roomlobby-invite-url">{{ displayRoomUrl }}</span>
      <LinkButton
        :text="copied ? 'Copied!' : 'Copy Link'"
        small
        @click="copyLink"
      >
        <Icon v-if="copied" name="bx:check" />
        <Icon v-else name="bx:copy" />
      </LinkButton>
    </div>

    <RangeSlider
      v-if="store.isHost"
      v-model="gameLengthMinutes"
      label="Game length (min)"
      :min="1"
      :max="20"
      :step="1"
      class="roomlobby-settings"
    />

    <LinkButton
      v-if="store.isHost"
      :text="
        store.players.length < 2
          ? 'Need at least 2 players'
          : 'Start Game'
      "
      :disabled="store.players.length < 2"
      @click="store.startGame(gameLengthMinutes * 60)"
    >
      <Icon name="bx:play" />
    </LinkButton>
    <p v-else class="roomlobby-waiting">
      Waiting for the host to start&hellip;
    </p>
  </div>
</template>

<script setup lang="ts">
import isMobile from "is-mobile";

const store = useCountryGuesserRoomStore();
const copied = ref(false);
const gameLengthMinutes = ref(5);

const roomUrl = computed(() =>
  typeof window !== "undefined" ? window.location.href : "",
);
const displayRoomUrl = computed(() =>
  isMobile()
    ? roomUrl.value.replace(/^https?:\/\//, "")
    : roomUrl.value,
);

function copyLink() {
  void navigator.clipboard.writeText(roomUrl.value).then(() => {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  });
}
</script>

<style lang="scss">
.roomlobby {
  position: relative;
  z-index: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 1.5rem;
  padding: 2rem;
  text-align: center;

  &-heading {
    font-size: 1.4rem;
    font-weight: 400;
  }

  &-players {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    min-width: 200px;
  }

  &-player {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    border: 1px solid var(--color-light);
    padding: 0.4rem 0.75rem;
    font-size: 0.95rem;

    &-name {
      font-weight: 500;
    }
  }

  &-invite {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    border: 1px solid var(--color-light);
    padding: 0.5rem 0.75rem;
    max-width: 480px;
    width: 100%;
    box-sizing: border-box;

    &-url {
      flex: 1;
      font-size: 0.8rem;
      color: var(--color-light);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: left;
    }
  }

  &-settings {
    width: 100%;
    max-width: 280px;
  }

  &-waiting {
    color: var(--color-light);
    font-size: 0.9rem;
  }
}
</style>
