import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/document/:filename',
      name: 'document',
      component: () => import('../views/DocumentView.vue'),
      props: true
    },
    {
      path: '/relations',
      name: 'relations',
      component: () => import('../views/RelationsExplorerView.vue')
    }
  ],
})

export default router
