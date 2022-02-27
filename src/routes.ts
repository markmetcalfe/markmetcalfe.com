import HomePage from './pages/HomePage.vue'

export default [
  {
    path: '/',
    name: 'HomePage',
    component: HomePage,
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
    path: '/resume',
    name: 'ResumePage',
    meta: {
      title: 'Resume',
    },
    component: () =>
      import(/* webpackChunkName: "resume" */ './pages/ResumePage.vue'),
  },
]
