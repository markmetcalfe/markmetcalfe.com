<template>
  <PageCard back-button-page="/">
    <template #title>Step Sequencer</template>

    <div class="sequencerpage">
      <div class="sequencerpage-buttons">
        <LinkButton
          :text="sequencerStore.isPlaying ? 'Pause' : 'Play'"
          hide-text
          @click="sequencerStore.togglePlay"
        >
          <font-awesome-icon
            :icon="
              'fa-solid ' + (sequencerStore.isPlaying ? 'fa-pause' : 'fa-play')
            "
          />
        </LinkButton>

        <LinkButton href="/sequencer/synths" text="Edit Synths" hide-text>
          <font-awesome-icon icon="fa-solid fa-pen" style="max-height: 21px" />
        </LinkButton>

        <LinkButton
          text="Clear Grid"
          hide-text
          @click="sequencerStore.resetGrid"
        >
          <font-awesome-icon
            icon="fa-solid fa-trash"
            style="max-height: 21px"
          />
        </LinkButton>

        <LinkButton
          v-if="!isMobile()"
          text="Add Row"
          hide-text
          @click="sequencerStore.addGridRow"
        >
          <font-awesome-icon icon="fa-solid fa-plus" />
        </LinkButton>
      </div>

      <div class="sequencerpage-options">
        <BpmFader />
      </div>

      <div
        v-if="sequencerStore.allInstruments && sequencerStore.usedInstruments"
        class="sequencerpage-grid"
      >
        <div
          v-for="(row, rowIndex) in sequencerStore.grid"
          :key="'row-' + rowIndex"
          class="sequencerpage-row"
        >
          <div class="sequencerpage-row-select">
            <DropdownSelect
              :model-value="sequencerStore.usedInstruments[rowIndex].getId()"
              :options="
                sequencerStore.allInstruments.map(instrument => ({
                  value: instrument.getId(),
                  label: instrument.name,
                }))
              "
              @update:model-value="
                (id: string) => sequencerStore.useInstrument(rowIndex, id)
              "
            />
          </div>

          <div
            v-for="(beat, beatIndex) in row"
            :key="'beat-' + beatIndex + '-' + beatIndex"
            :class="[
              'sequencerpage-beat',
              {
                'sequencerpage-beat-on': beat,
                'sequencerpage-beat-off': !beat,
                'sequencerpage-beat-barstart':
                  sequencerStore.isBarStart(beatIndex),
                'sequencerpage-beat-playing':
                  sequencerStore.isBeatPlaying(beatIndex),
              },
            ]"
          >
            <button
              @click="sequencerStore.toggleBeat(rowIndex, beatIndex)"
            ></button>
          </div>

          <div v-if="!isMobile()" class="sequencerpage-row-delete">
            <LinkButton
              text="Delete Row"
              hide-text
              :style="
                sequencerStore.gridRowCount > 1
                  ? undefined
                  : 'visibility: hidden'
              "
              @click="sequencerStore.deleteGridRow(rowIndex)"
            >
              <font-awesome-icon icon="fa-solid fa-trash" />
            </LinkButton>
          </div>
        </div>
      </div>

      <p v-if="isNarrow()" class="sequencerpage-info">
        Rotate your device for a longer sequence grid
      </p>
    </div>
  </PageCard>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useSequencerStore } from '../stores/sequencer'
import PageCard from '../components/PageCard.vue'
import LinkButton from '../components/LinkButton.vue'
import BpmFader from '../components/BpmFader.vue'
import DropdownSelect from '../components/DropdownSelect.vue'
import isMobile from 'is-mobile'

const breakpoint = 650
const isNarrow = () => window.innerWidth < breakpoint
const getBarCount = () => (isNarrow() ? 2 : 4)

const sequencerStore = useSequencerStore()
sequencerStore.init(getBarCount())

const resizeListener = () => {
  sequencerStore.updateBarCount(getBarCount())
}
onMounted(() => {
  window.addEventListener('resize', resizeListener)
})
onUnmounted(() => {
  if (sequencerStore.isPlaying && !sequencerStore.gridHasEntry) {
    sequencerStore.stop()
  }
  window.removeEventListener('resize', resizeListener)
})
</script>

<style lang="scss">
@use '../variables' as vars;

.sequencerpage {
  &-buttons {
    display: flex;
    justify-content: center;

    @include vars.desktop-only {
      gap: 1rem;
      padding-bottom: 1rem;
    }

    @include vars.mobile-only {
      gap: 0.5rem;
      padding-bottom: 0.5rem;
    }
  }

  &-options {
    display: flex;
    justify-content: center;

    @include vars.desktop-only {
      gap: 1rem;
      padding-top: 0.5rem;
      padding-bottom: 1rem;
    }

    @include vars.mobile-only {
      gap: 0.5rem;
      padding-bottom: 0.5rem;
    }
  }

  &-grid {
    display: flex;
    flex-direction: column;
  }

  &-row {
    display: flex;
    justify-content: center;
    align-items: center;

    &-select {
      @include vars.desktop-only {
        width: 6rem;
        padding-right: 0.5rem;
      }

      @include vars.mobile-only {
        font-size: 0.75rem;
        width: 4.5rem;
        padding-right: 0.25rem;
      }
    }

    & .dropdownselect-selected-option {
      @include vars.mobile-only {
        padding: 0.1rem 0.5rem;
      }
    }

    &-delete {
      padding-left: 1rem;
    }
  }

  &-beat {
    display: flex;

    @include vars.desktop-only {
      width: 2.75rem;
      height: 2.25rem;
      padding: 0.5rem 0.25rem;
    }

    @include vars.mobile-only {
      width: 1.75rem;
      height: 1.25rem;
      padding: 0.25rem 0.15rem;
    }

    & button {
      width: 100%;
      height: 100%;
      border: var(--color-light) 1px solid;
      transition: none;
    }

    &-on button {
      background-color: var(--color-highlight);
    }

    &-off.sequencerpage-beat-playing button {
      background-color: var(--color-dark);
    }

    &-playing {
      background-color: var(--color-light);
    }

    &-barstart {
      @include vars.desktop-only {
        margin-left: 0.5rem;
      }

      @include vars.mobile-only {
        margin-left: 0.25rem;
      }
    }
  }

  &-info {
    @include vars.desktop-only {
      display: none;
    }

    @include vars.mobile-only {
      font-size: 0.8rem;
      margin-bottom: 0;
    }
  }
}
</style>
