import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    name: 'Auth',
    path: '/',
    component: () => import('../pages/Auth/Auth.vue'),
  },
  {
    name: 'information',
    path: '/information',
    component: () => import('../pages/Information/Information.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;