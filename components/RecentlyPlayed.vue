<template>
  <a
    ref="noopener noreferrer"
    :href="track?.url"
    target="_blank"
    title="Play track (new tab)"
    :aria-label="
      track ? `Play ${track?.name} by ${track?.artist} in a new tab` : ''
    "
    class="recentlyplayed"
    :class="{ 'recentlyplayed-loading': !track }"
  >
    <div class="recentlyplayed-cover">
      <img
        v-if="track"
        :src="track.image"
        :aria-label="`${track.album} album art`"
      >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 500 500"
      >
        <circle
          class="svg-light"
          cx="250"
          cy="250"
          r="250"
        />
        <circle
          class="svg-dark"
          cx="250"
          cy="250"
          r="80.3"
        />
        <circle
          class="svg-light"
          cx="250"
          cy="250"
          r="63.6"
        />
        <circle
          class="svg-dark"
          cx="250"
          cy="250"
          r="21.8"
        />
      </svg>
    </div>
    <div
      v-if="track"
      class="recentlyplayed-info"
      data-testid="recentlyplayed-info"
    >
      <h3 class="recentlyplayed-name">{{ track.name }}</h3>
      <p class="recentlyplayed-artist">{{ track.artist }}</p>
      <p class="recentlyplayed-time">Played on {{ formattedTime }}</p>
    </div>
    <div
      v-else
      class="recentlyplayed-info"
    >
      <h3 class="recentlyplayed-name">Loading recently played...</h3>
    </div>
  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Track {
  name: string
  artist: string
  album: string
  image: string
  timestamp: string
  url: string
}

const { data: track } = await useFetch<Track>('/api/get-last-played', { server: false })

const formattedTime = computed(() => {
  if (!track.value) return ''
  return new Intl.DateTimeFormat('en-NZ', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(track.value.timestamp))
})
</script>

<style lang="scss" scoped>
@use "~/variables" as vars;

$height-desktop: 4rem;
$height-mobile: 3.5rem;

.recentlyplayed {
  display: flex;
  align-items: center;
  text-align: left;
  color: var(--color-light);
  background-color: var(--color-dark);
  border: var(--color-light) 1px solid;

  @include vars.desktop-only {
    height: $height-desktop;
    padding: 0.75rem;
  }

  @include vars.mobile-only {
    height: $height-mobile;
    padding: 0.5rem;
    font-size: 0.9rem;
  }

  &:visited {
    color: inherit;
    border: inherit;
  }

  &:not(.recentlyplayed-loading):hover {
    color: var(--color-highlight);
    border: var(--color-highlight) 1px solid;
  }

  &-cover {
    display: inline-block;
    flex-shrink: 0;
    overflow: hidden;
    transform-origin: center;

    @include vars.desktop-only {
      width: $height-desktop;
      height: $height-desktop;
    }

    @include vars.mobile-only {
      width: $height-mobile;
      height: $height-mobile;
    }

    & > * {
      position: absolute;
      width: inherit;
      height: inherit;
    }

    & img {
      z-index: 100;
    }

    & svg {
      & .svg-dark {
        fill: var(--color-dark);
      }

      & .svg-light {
        fill: var(--color-disabled);
      }
    }
  }

  &:hover &-cover {
    border-radius: 50%;
    animation: spin 1.818s linear infinite; // Spins at 33 RPM
  }

  &-info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: inherit;

    @include vars.desktop-only {
      max-width: 354px;
      margin-left: 1rem;
    }

    @include vars.mobile-only {
      max-width: 228px;
      margin-left: 0.5rem;
    }
  }

  & h3,
  & p {
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  & h3 {
    font-size: inherit;
  }

  &-loading {
    cursor: inherit;
    color: var(--color-disabled);
    border: var(--color-disabled) 1px solid;

    & h3 {
      font-weight: 300;
      font-style: italic;
    }
  }

  &-time {
    font-style: italic;

    @include vars.desktop-only {
      font-size: 0.85rem;
    }

    @include vars.mobile-only {
      font-size: 0.7rem;
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
