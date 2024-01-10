import { defineStore } from 'pinia'

export interface RendererSettings {
  followCursor: boolean
  zoom: {
    min: number
    max: number
    current: number
  }
  autoZoom: {
    enabled: boolean
    speed: number
    direction: 'in' | 'out'
  }
  geometry: {
    radius: number
    detail: number
  }
  randomisation: {
    bpm: number
    lastTime: Date
    taps: Date[]
  }
}

const defaultSettings: RendererSettings = {
  followCursor: true,
  zoom: {
    min: -2,
    max: 7,
    current: 10,
  },
  autoZoom: {
    enabled: true,
    speed: 0.01,
    direction: 'out',
  },
  geometry: {
    radius: 5,
    detail: 100,
  },
  randomisation: {
    bpm: 140 / 4, // 1 bar of 140s dub
    lastTime: new Date(),
    taps: [],
  },
}

export const useRendererSettingsStore = defineStore('renderer-settings', {
  state: () => defaultSettings,
  actions: {
    zoomIn() {
      this.zoom.current += 0.1
    },
    zoomOut() {
      this.zoom.current -= 0.1
    },
    autoZoomTick() {
      if (!this.autoZoom.enabled) {
        return
      }

      if (this.zoom.current >= this.zoom.max) {
        this.autoZoom.direction = 'out'
      } else if (this.zoom.current <= this.zoom.min) {
        this.autoZoom.direction = 'in'
      }

      if (this.autoZoom.direction === 'in') {
        this.zoom.current += this.autoZoom.speed
      } else {
        this.zoom.current -= this.autoZoom.speed
      }
    },

    randomiseTick(callback: () => void) {
      const intervalMs = (60 / this.randomisation.bpm) * 1000
      if (
        new Date().getTime() >
        this.randomisation.lastTime.getTime() + intervalMs
      ) {
        callback()
        this.randomisation.lastTime = new Date()
      }
    },
    tap() {
      const now = new Date()

      // We only care about the latest 4 taps
      if (this.randomisation.taps.length >= 4) {
        this.randomisation.taps.shift()
      }

      // If the last tap was over 2 seconds ago we ignore all previous taps
      const lastTap =
        this.randomisation.taps[this.randomisation.taps.length - 1]
      if (lastTap && now.getTime() - lastTap.getTime() > 2000) {
        this.randomisation.taps = []
      }

      this.randomisation.taps.push(now)
      this.randomisation.lastTime = new Date(0) // Set last time to 0 to force randomisation

      if (this.randomisation.taps.length < 2) {
        return
      }

      const timesBetween = []
      for (let i = 1; i < this.randomisation.taps.length; i++) {
        const a = this.randomisation.taps[i - 1].getTime()
        const b = this.randomisation.taps[i].getTime()
        timesBetween.push(b - a)
      }

      const averageTimeBetween =
        timesBetween.reduce((a, b) => a + b) / timesBetween.length
      this.randomisation.bpm = (60 / averageTimeBetween) * 1000
    },
  },
})
