export const useOnElementMounted = (querySelector: string, callback: (element: HTMLElement) => void) => {
  onMounted(() => {
    const observer = new MutationObserver(() => {
      const element = document.querySelector(querySelector) as HTMLElement
      if (element) {
        observer.disconnect()
        callback(element)
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
  })
}
