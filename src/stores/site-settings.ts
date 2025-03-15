import { defineStore } from 'pinia'

export interface SiteSettings {
  backgroundHidden: boolean
}

const defaultSettings: SiteSettings = {
  backgroundHidden: false,
}

export const useSiteSettingsStore = defineStore('site-settings', {
  state: () => defaultSettings,
  actions: {
    toggleBackground() {
      this.backgroundHidden = !this.backgroundHidden
    },
  },
})
