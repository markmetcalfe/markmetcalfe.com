import { defineStore } from 'pinia'

export interface RendererSettings {
  maxZoom: number
  minZoom: number
  currentZoom: number
  autoZoom: boolean
  autoZoomSpeed: number
  geometryRadius: number
  geometryDetail: number
  randomisationPerMinute: number
}

const settings: RendererSettings = {
  maxZoom: 7,
  minZoom: -2,
  currentZoom: 10,
  autoZoom: true,
  autoZoomSpeed: 0.01,
  geometryRadius: 5,
  geometryDetail: 100,
  randomisationPerMinute: 130,
}

export const useRendererSettingsStore = defineStore('renderer-settings', {
  state: () => ({ settings }),
})
