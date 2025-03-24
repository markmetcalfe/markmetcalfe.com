import { createApp } from 'vue'
import App from './App.vue'
import {
  createRouter,
  createWebHistory,
  RouteLocationNormalized,
} from 'vue-router'
import routes from './routes'
import addIcons from './icons'
import { createPinia } from 'pinia'
import '@fortawesome/fontawesome-free/css/all.css'
// @ts-expect-error Is a typescript module
import InlineSvg from 'vue-inline-svg'
import { isVizshun } from './util/site'
import { VueQueryPlugin } from '@tanstack/vue-query'

const pinia = createPinia()

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
router.beforeEach((to: RouteLocationNormalized, _, next) => {
  const siteName = isVizshun() ? 'Vizshun' : 'Mark Metcalfe'
  if (to.meta.title) {
    document.title = `${to.meta.title} - ${siteName}`
  } else {
    document.title = siteName
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

const app = createApp(App)

app.use(pinia)

app.use(addIcons)

app.use(router)

app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 30, // 30 minutes
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  },
})

app.component('InlineSvg', InlineSvg)

app.mount('#app')
