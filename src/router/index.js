import { createRouter, createWebHistory } from 'vue-router'
import LoginApp from '../components/LoginApp.vue'
import DashboardApp from '../components/DashboardApp.vue'
import { supa } from '../supabaseClient'

const ALLOWED_EMAILS = [
  'betza@certificate.com',
  'ingrid@certificate.com',
  'asly@certificate.com',
  'karen@certificate.com'
]

function isAuthorized(email) {
  return ALLOWED_EMAILS.includes((email || '').toLowerCase())
}

async function getSession() {
  const { data } = await supa.auth.getSession()
  return data.session
}

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', component: LoginApp },
  { path: '/dashboard', component: DashboardApp }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  if (to.path === '/login') {
    return next()
  }
  const session = await getSession()
  if (!session || !isAuthorized(session.user.email)) {
    return next('/login')
  }
  next()
})

export default router
