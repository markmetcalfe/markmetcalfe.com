import { RouteRecordRaw } from 'vue-router'
import HomePage from './pages/HomePage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'HomePage',
    component: HomePage,
  },
  {
    path: '/card',
    name: 'BusinessCardPage',
    meta: {
      title: 'Business Card',
    },
    component: () =>
      import(
        /* webpackChunkName: "businesscard" */ './pages/BusinessCardPage.vue'
      ),
  },
  {
    path: '/contact',
    name: 'ContactPage',
    meta: {
      title: 'Contact',
    },
    component: () =>
      import(/* webpackChunkName: "contact" */ './pages/ContactPage.vue'),
  },
  {
    path: '/portfolio',
    name: 'PortfolioPage',
    meta: {
      title: 'My Work',
    },
    component: () =>
      import(/* webpackChunkName: "portfolio" */ './pages/PortfolioPage.vue'),
  },
  {
    path: '/privacy-policy',
    name: 'PrivacyPolicyPage',
    meta: {
      title: 'Privacy Policy',
    },
    component: () =>
      import(
        /* webpackChunkName: "privacypolicy" */ './pages/PrivacyPolicyPage.vue'
      ),
  },
  {
    path: '/terms-of-service',
    name: 'TermsOfServicePage',
    meta: {
      title: 'Terms of Service',
    },
    component: () =>
      import(/* webpackChunkName: "terms" */ './pages/TermsOfServicePage.vue'),
  },
  {
    path: '/minecraft',
    name: 'MinecraftPage',
    meta: {
      title: 'Minecraft',
    },
    component: () =>
      import(/* webpackChunkName: "minecraft" */ './pages/MinecraftPage.vue'),
  },
  {
    path: '/5xx',
    name: 'ServerErrorPage',
    meta: {
      title: 'Server Error',
    },
    component: () =>
      import(
        /* webpackChunkName: "servererror" */ './pages/ServerErrorPage.vue'
      ),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFoundPage',
    meta: {
      title: 'Not Found',
    },
    component: () =>
      import(/* webpackChunkName: "notfound" */ './pages/NotFoundPage.vue'),
  },
]

export default routes
