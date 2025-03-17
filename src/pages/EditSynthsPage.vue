<template>
  <PageCard back-button-page="/sequencer">
    <template #title>Edit Synths</template>

    <div v-if="sequencerStore.allInstruments" class="editsynths">
      <div class="editsynths-select">
        <DropdownSelect
          v-model="selectedSynthId"
          :options="
            sequencerStore.allInstruments.map(instrument => ({
              value: instrument.getId(),
              label: instrument.name,
            }))
          "
        />

        <LinkButton
          v-if="selectedSynthId"
          text="Copy"
          hide-text
          @click="copyInstrument"
        >
          <font-awesome-icon icon="fa-regular fa-copy" />
        </LinkButton>

        <LinkButton
          v-if="selectedSynth?.canDelete()"
          text="Delete"
          hide-text
          @click="deleteInstrument"
        >
          <font-awesome-icon icon="fa-solid fa-trash" />
        </LinkButton>
      </div>

      <div v-if="selectedSynth" class="editsynths-settings">
        <TextField v-model="selectedSynth.name" label="Label" />

        <DropdownSelect
          v-if="selectedSynth.canSetNote()"
          v-model="selectedSynth.note"
          :options="
            Object.entries(notes).map(([value, label]) => ({ value, label }))
          "
          label="Note"
        />

        <Fader
          v-if="selectedSynth.canSetNote()"
          v-model="selectedSynth.octave"
          :min="1"
          :max="8"
          label="Octave"
        />

        <Fader
          v-model="selectedSynth.duration"
          :min="1"
          :max="64"
          label="Duration"
        />

        <Fader
          v-for="[key, label] in Object.entries({
            attack: 'Attack',
            decay: 'Decay',
            sustain: 'Sustain',
            release: 'Release',
          })"
          :key="key"
          :model-value="
            selectedSynth.getEnvelopeValue(key as keyof Synth['envelope'])
          "
          :label="label"
          :min="0.001"
          :max="1"
          :decimal-places="3"
          @update:model-value="
            (value: number) =>
              selectedSynth?.setEnvelopeValue(
                key as keyof Synth['envelope'],
                value,
              )
          "
        />
      </div>
    </div>
  </PageCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSequencerStore } from '../stores/sequencer'
import PageCard from '../components/PageCard.vue'
import DropdownSelect from '../components/DropdownSelect.vue'
import TextField from '../components/TextField.vue'
import Fader from '../components/Fader.vue'
import { Synth } from '../tone/synths'
import { notes } from '../tone'
import LinkButton from '../components/LinkButton.vue'

const sequencerStore = useSequencerStore()
sequencerStore.init()

const selectedSynthId = ref(sequencerStore.allInstruments![0].getId())
const selectedSynth = computed(() =>
  sequencerStore.getInstrument(selectedSynthId.value),
)

const copyInstrument = () => {
  const copy = sequencerStore.copyInstrument(selectedSynthId.value)
  selectedSynthId.value = copy.getId()
}

const deleteInstrument = () => {
  sequencerStore.deleteInstrument(selectedSynthId.value)
  const lastIndex = sequencerStore.allInstruments!.length - 1
  selectedSynthId.value = sequencerStore.allInstruments![lastIndex].getId()
}
</script>

<style lang="scss">
.editsynths {
  &-select {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &-settings {
    padding: 1rem 0;

    & > * {
      padding: 0.5rem 0;
    }
  }
}
</style>
