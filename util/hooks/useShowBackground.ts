import { useVisualsStore } from '~/stores/visuals'

export const useShowBackground = () => {
  const visualsStore = useVisualsStore()

  onMounted(() => {
    visualsStore.start()
  })
}
