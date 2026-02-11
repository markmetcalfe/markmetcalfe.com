import { useVisualsStore } from '~/stores/visuals'

export const useShowBackground = () => {
  const visualsStore = useVisualsStore()
  visualsStore.show()
}

export const useHideBackground = () => {
  const visualsStore = useVisualsStore()
  visualsStore.hide()
}
