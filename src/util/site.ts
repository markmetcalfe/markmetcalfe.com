export const isVizshun = () =>
  import.meta.env.VITE_SITE_NAME === 'vizshun' ||
  window.location.search.includes('vizshun')

export const isCardPreview = () => window.location.search.includes('card')

export const getSiteDomain = () =>
  isVizshun() ? 'vizshun.art' : 'markmetcalfe.com'
