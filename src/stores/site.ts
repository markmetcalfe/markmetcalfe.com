import isMobile from 'is-mobile'
import { defineStore } from 'pinia'

export interface SiteStore {
  backgroundHidden: boolean
}

const initialState: SiteStore = {
  backgroundHidden: false,
}

export const useSiteStore = defineStore('site', {
  state: () => initialState,
  actions: {
    showBackground() {
      this.backgroundHidden = false
    },
    hideBackground() {
      this.backgroundHidden = true
    },
    hideBackgroundIfMobile() {
      if (isMobile()) {
        this.hideBackground()
      }
    },
    toggleBackground() {
      this.backgroundHidden = !this.backgroundHidden
    },
  },
})
