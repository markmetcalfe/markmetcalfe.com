import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all.js'

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

createApp(App).use(router).mount('#app')
