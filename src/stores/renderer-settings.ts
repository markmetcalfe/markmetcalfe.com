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
  followCursor: boolean
}

const settings: RendererSettings = {
  maxZoom: 7,
  minZoom: -2,
  currentZoom: 10,
  autoZoom: true,
  autoZoomSpeed: 0.01,
  geometryRadius: 5,
  geometryDetail: 100,
  randomisationPerMinute: 140 / 4, // 1 bar of 140s dub
  followCursor: true,
}

export const useRendererSettingsStore = defineStore('renderer-settings', {
  state: () => ({ settings }),
})
