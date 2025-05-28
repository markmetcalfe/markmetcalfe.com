export default defineNuxtRouteMiddleware((to, from) => {
  const toDepth = to.path.match(/\/[^/]+?/g)?.length ?? 0
  const fromDepth = from.path.match(/\/[^/]+?/g)?.length ?? 0
  const transitionName = fromDepth > toDepth ? 'slide-left' : 'slide-right'
  from.meta.pageTransition = { name: transitionName }
  to.meta.pageTransition = { name: transitionName }
})
