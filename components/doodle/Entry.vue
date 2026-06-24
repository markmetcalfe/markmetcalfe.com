<template>
  <section class="games-doodle">
    <h2 class="games-doodle-heading">
      Doodle
    </h2>
    <LinkButton
      text="New Game"
      @click="createRoom"
    >
      <Icon name="bx:pencil" />
    </LinkButton>

    <div
      v-if="rooms.length > 0"
      class="games-doodle-rooms"
    >
      <h3 class="games-doodle-rooms-heading">
        Active Games
      </h3>
      <div
        v-for="room in rooms"
        :key="room.id"
        class="games-doodle-room"
      >
        <span class="games-doodle-room-info">
          {{ room.playerCount }} {{ room.playerCount === 1 ? 'player' : 'players' }}
          &middot;
          <span :class="room.phase === 'waiting' ? 'highlight' : 'games-doodle-room-playing'">
            {{ room.phase === 'waiting' ? 'Waiting' : 'Playing' }}
          </span>
        </span>
        <button
          class="games-doodle-room-join"
          @click="navigateTo(`/doodle/${room.id}`)"
        >
          Join
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()

interface RoomSummary {
  id: string
  playerCount: number
  phase: string
}

const rooms = ref<RoomSummary[]>([])

onMounted(async () => {
  try {
    const base = config.public.doodleApiUrl as string
    const res = await fetch(`${base}/api/doodle/rooms`)
    const data = await res.json() as RoomSummary[]
    rooms.value = data.filter(r => r.playerCount > 0)
  }
  catch {
    // room list is optional — silently skip if unavailable
  }
})

async function createRoom() {
  const base = config.public.doodleApiUrl as string
  const res = await fetch(`${base}/api/doodle/rooms`, { method: 'POST' })
  const { roomId } = await res.json() as { roomId: string }
  await navigateTo(`/doodle/${roomId}`)
}
</script>

<style lang="scss">
@use "~/variables" as vars;

.games-doodle {
  display: flex;
  flex-direction: column;
  align-items: center;

  @include vars.desktop-only {
    gap: 2rem;
  }

  @include vars.mobile-only {
    gap: 1.5rem;
  }

  &-heading {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
  }

  &-rooms {
    width: 100%;
    max-width: 380px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    &-heading {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--color-disabled);
      margin-bottom: 0.25rem;
      font-weight: 400;
    }
  }

  &-room {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid var(--color-disabled);
    border-radius: 4px;
    padding: 0.6rem 0.9rem;

    &-info {
      font-size: 0.9rem;
      color: var(--color-disabled);
    }

    &-playing {
      color: var(--color-error);
    }

    &-join {
      background: none;
      border: 1px solid var(--color-highlight);
      color: var(--color-highlight);
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
      padding: 0.25rem 0.75rem;
      transition: background 200ms, color 200ms;

      &:hover {
        background: var(--color-highlight);
        color: var(--color-dark);
      }
    }
  }
}
</style>
