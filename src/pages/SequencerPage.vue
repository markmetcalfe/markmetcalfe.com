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
      </div>

      <div class="sequencerpage-options">
        <BpmFader />
      </div>

      <div
        v-if="sequencerStore.allSynths && sequencerStore.usedSynths"
        class="sequencerpage-sequences"
      >
        <div class="sequencerpage-rowoptions">
          <div
            v-for="(_, rowIndex) in sequencerStore.grid"
            :key="'rowoptions-' + rowIndex"
            class="sequencerpage-rowoptions-wrapper"
          >
            <div class="sequencerpage-rowoptions-select">
              <DropdownSelect
                :model-value="sequencerStore.usedSynths[rowIndex].getId()"
                :options="synthOptions"
                @update:model-value="
                  (id: string) => sequencerStore.useSynth(rowIndex, id)
                "
              />
            </div>

            <LinkButton
              text="Delete Row"
              hide-text
              class="sequencerpage-rowoptions-button"
              :disabled="sequencerStore.gridRowCount < 2"
              @click="sequencerStore.deleteGridRow(rowIndex)"
            >
              <font-awesome-icon icon="fa-solid fa-trash" />
            </LinkButton>
          </div>

          <div class="sequencerpage-rowoptions-wrapper">
            <div class="sequencerpage-rowoptions-select">
              <DropdownSelect v-model="synthToAddId" :options="synthOptions" />
            </div>

            <LinkButton
              text="Add Row"
              hide-text
              class="sequencerpage-rowoptions-button"
              @click="sequencerStore.addGridRow(synthToAddId)"
            >
              <font-awesome-icon icon="fa-solid fa-plus" />
            </LinkButton>
          </div>
        </div>

        <div class="sequencerpage-grid">
          <div
            v-for="(row, rowIndex) in sequencerStore.grid"
            :key="'row-' + rowIndex"
            class="sequencerpage-row"
          >
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
          </div>
        </div>

        <div class="sequencerpage-columnoptions">
          <LinkButton
            text="Add Bar"
            hide-text
            @click="sequencerStore.addBars()"
          >
            <font-awesome-icon icon="fa-solid fa-plus" />
          </LinkButton>

          <LinkButton
            text="Delete Bar"
            :disabled="sequencerStore.barCount < 2"
            hide-text
            @click="sequencerStore.deleteBars()"
          >
            <font-awesome-icon icon="fa-solid fa-trash" />
          </LinkButton>
        </div>
      </div>

      <p v-if="isIOS() && sequencerStore.isPlaying" class="sequencerpage-info">
        Nothing playing? Take your phone off silent
      </p>
    </div>
  </PageCard>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { isIOS } from '../util/site'
import { useSequencerStore } from '../stores/sequencer'
import PageCard from '../components/PageCard.vue'
import LinkButton from '../components/LinkButton.vue'
import BpmFader from '../components/BpmFader.vue'
import DropdownSelect from '../components/DropdownSelect.vue'

const sequencerStore = useSequencerStore()
sequencerStore.init()

const synthToAddId = ref(sequencerStore.allSynths![0].getId())

const synthOptions = computed(() =>
  sequencerStore.allSynths!.map(synth => ({
    value: synth.getId(),
    label: synth.name,
  })),
)

onUnmounted(() => {
  if (sequencerStore.isPlaying && !sequencerStore.gridHasEntry) {
    sequencerStore.stop()
  }
})
</script>

<style lang="scss">
@use '../variables' as vars;

@mixin sequencer-row {
  @include vars.desktop-only {
    height: 2.25rem;
    padding: 0.5rem 0.25rem;
  }

  @include vars.mobile-only {
    height: 1.25rem;
    padding: 0.25rem 0.15rem;
  }
}

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

  &-sequences {
    display: flex;
  }

  &-rowoptions {
    display: flex;
    flex-direction: column;

    @include vars.desktop-only {
      padding-right: 0.25rem;
    }

    &-wrapper {
      display: flex;

      @include sequencer-row;
    }

    &-select {
      @include vars.desktop-only {
        min-width: 6rem;
        padding-right: 0.5rem;
      }

      @include vars.mobile-only {
        font-size: 0.75rem;
        min-width: 4.5rem;
        padding-right: 0.25rem;

        & .dropdownselect-selected-option {
          padding: 0.1rem 0.5rem;
        }

        & .dropdownselect-option {
          padding: 0.2rem 0.5rem;
        }
      }
    }

    &-button {
      @include vars.mobile-only {
        & button {
          padding: 0.45rem;
        }

        & .linkbutton-icon {
          font-size: 0.25rem;
          height: 0.25rem;
          width: 0.25rem;

          & svg {
            height: 0.75rem;
            width: 0.75rem;
          }
        }
      }
    }
  }

  &-grid {
    display: flex;
    flex-direction: column;
    overflow-x: scroll;

    @include vars.desktop-only {
      max-width: 75vw;
    }

    @include vars.mobile-only {
      max-width: calc(100vw - 225px);
    }
  }

  &-row {
    display: flex;
  }

  &-beat {
    display: flex;

    @include sequencer-row;

    @include vars.desktop-only {
      min-width: 2.75rem;
    }

    @include vars.mobile-only {
      min-width: 1.75rem;
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

  &-columnoptions {
    display: flex;
    place-content: center center;
    flex-direction: column;
    gap: 0.5rem;

    @include vars.desktop-only {
      padding-left: 1rem;
    }

    @include vars.mobile-only {
      padding-left: 0.5rem;
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
