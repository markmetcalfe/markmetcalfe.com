export const isVizshun = () =>
  import.meta.env.VITE_SITE_NAME === 'vizshun' ||
  window.location.search === '?vizshun'

export const getSiteDomain = () =>
  isVizshun() ? 'vizshun.art' : 'markmetcalfe.com'
