export const isVizshun = () =>
  import.meta.env.VITE_SITE_NAME === 'vizshun' ||
  window.location.search.includes('?vizshun')

export const isCardPreview = () =>
  document.title.startsWith('Social Preview Card')

export const isPlaywrightTest = () => localStorage.getItem('is_playwright_test')

export const getSiteDomain = () =>
  isVizshun() ? 'vizshun.art' : 'markmetcalfe.com'

export const getMailtoLink = () => 'mailto:mark@markmetcalfe.com'
