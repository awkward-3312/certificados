import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Buscar from '../views/Buscar.vue'
import Admin from '../views/Admin.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/buscar', name: 'Buscar', component: Buscar },
  { path: '/admin', name: 'Admin', component: Admin },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
