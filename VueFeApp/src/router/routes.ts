import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('pages/HomeView.vue'),
  },

  {
    path: '/category/:slug',
    component: () => import('pages/CategoryView.vue'),
  },
  {
    path: '/actors',
    component: () => import('pages/ActorsView.vue'),
  },
  {
    path: '/actor/:id',
    component: () => import('pages/ActorDetailView.vue'),
  },
  {
    path: '/search',
    component: () => import('pages/SearchView.vue'),
  },
  {
    path: '/payment-return',
    component: () => import('pages/PaymentReturnView.vue'),
  },
  {
    path: '/profile',
    component: () => import('pages/ProfileView.vue'),
  },
  {
    path: '/watch/:slug',
    component: () => import('pages/WatchView.vue'),
  },
  {
    path: '/movie/:slug',
    component: () => import('pages/MovieDetailView.vue'),
  },
  {
    path: '/login',
    component: () => import('pages/LoginView.vue'),
  },
  {
    path: '/register',
    component: () => import('pages/RegisterView.vue'),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
