<template>
  <ModalDialog class="leaderboardmodal">
    <h2>Leaderboard</h2>

    <p v-if="loading" class="leaderboardmodal-status">
      Loading&hellip;
    </p>
    <p v-else-if="error" class="leaderboardmodal-status">
      Couldn't load the leaderboard.
    </p>
    <ol v-else class="leaderboardmodal-list">
      <li
        v-for="(entry, i) in entries"
        :key="i"
        class="leaderboardmodal-entry"
      >
        <span class="leaderboardmodal-rank">{{ i + 1 }}</span>
        <span class="leaderboardmodal-name">{{ entry.name }}</span>
        <span class="leaderboardmodal-score">{{ entry.score }}</span>
      </li>
      <li v-if="entries.length === 0" class="leaderboardmodal-status">
        No scores yet &mdash; be the first!
      </li>
    </ol>

    <p class="leaderboardmodal-personal">
      Your best: <span class="highlight">{{ highScore }}</span>
    </p>

    <LinkButton text="Close" @click="emit('close')" />
  </ModalDialog>
</template>

<script setup lang="ts">
interface LeaderboardEntry {
  name: string;
  score: number;
}

const emit = defineEmits<{ close: [] }>();

const { highScore } = useCountryGuesserHighScore();
const entries = ref<LeaderboardEntry[]>([]);
const loading = ref(true);
const error = ref(false);

onMounted(async () => {
  try {
    const res = await fetch("/api/countries/leaderboard");
    if (!res.ok) {
      throw new Error("Request failed");
    }
    entries.value = (await res.json()) as LeaderboardEntry[];
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="scss">
.leaderboardmodal {
  h2 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 400;
    text-align: center;
  }

  &-status {
    color: var(--color-light);
    text-align: center;
  }

  &-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    width: 100%;
    max-width: 280px;
    margin: 0;
    padding: 0;
  }

  &-entry {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    border: 1px solid var(--color-light);
    padding: 0.3rem 0.65rem;
    font-size: 0.9rem;
  }

  &-rank {
    color: var(--color-light);
    min-width: 1.2rem;
  }

  &-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &-score {
    font-weight: 600;
    color: var(--color-highlight);
  }

  &-personal {
    margin: 0;
    font-size: 0.9rem;
  }
}
</style>
