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
]
