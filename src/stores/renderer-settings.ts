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
  },
})
