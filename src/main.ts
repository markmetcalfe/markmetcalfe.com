import { createApp } from 'vue'
import App from './App.vue'
import {
  createRouter,
  createWebHistory,
  RouteLocationNormalized,
} from 'vue-router'
import routes from './routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
router.beforeEach((to: RouteLocationNormalized, _, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - Mark Metcalfe`
  } else {
    document.title = 'Mark Metcalfe'
  }
  next()
})
router.afterEach(
  (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
    if (!from.name) {
      to.meta.transition = null
    } else {
      const toDepth = to.path.match(/\/[^/]+?/g)?.length ?? 0
      const fromDepth = from.path.match(/\/[^/]+?/g)?.length ?? 0
      to.meta.transition = fromDepth > toDepth ? 'slide-left' : 'slide-right'
    }
  },
)

createApp(App).use(router).mount('#app')
