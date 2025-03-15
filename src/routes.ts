import { RouteRecordRaw } from 'vue-router'
import { isVizshun } from './util/site'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'HomePage',
    component: () =>
      import(/* webpackChunkName: "home" */ './pages/HomePage.vue'),
  },
  {
    path: '/card',
    name: 'CardPage',
    meta: {
      title: 'Social Preview Card',
    },
    component: () =>
      import(/* webpackChunkName: "home" */ './pages/HomePage.vue'),
  },
  {
    path: '/visuals',
    name: 'VisualsPage',
    meta: {
      title: 'Visuals',
    },
    component: () =>
      import(/* webpackChunkName: "visuals" */ './pages/VisualsPage.vue'),
  },
  {
    path: '/visuals/shapes',
    name: 'EditShapesPage',
    meta: {
      title: 'Edit Shapes',
    },
    component: () =>
      import(/* webpackChunkName: "editshapes" */ './pages/EditShapesPage.vue'),
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
  ...(!isVizshun()
    ? [
        {
          path: '/status',
          name: 'NetworkStatusPage',
          meta: {
            title: 'Network Status',
          },
          component: () =>
            import(
              /* webpackChunkName: "status" */ './pages/NetworkStatusPage.vue'
            ),
        },
        {
          path: '/minecraft',
          name: 'MinecraftPage',
          meta: {
            title: 'Minecraft',
          },
          component: () =>
            import(
              /* webpackChunkName: "minecraft" */ './pages/MinecraftPage.vue'
            ),
        },
      ]
    : []),
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
