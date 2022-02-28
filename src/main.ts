import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import '@fortawesome/fontawesome-free/css/all.css'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
router.beforeEach((to, _, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - Mark Metcalfe`
  } else {
    document.title = 'Mark Metcalfe'
  }
  next()
})
router.afterEach((to, from) => {
  const toDepth = to.path.match(/\/[^/]+?/g)?.length ?? 0
  const fromDepth = from.path.match(/\/[^/]+?/g)?.length ?? 0
  to.meta.transition = fromDepth > toDepth ? 'slide-left' : 'slide-right'
})

createApp(App).use(router).mount('#app')
