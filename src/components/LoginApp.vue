<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <form @submit.prevent="submit" class="bg-white p-6 rounded shadow w-80">
      <h1 class="text-lg mb-4 font-semibold">Iniciar Sesión</h1>
      <input v-model="correo" type="email" placeholder="Correo" class="border px-2 py-1 rounded w-full mb-3" />
      <input v-model="clave" type="password" placeholder="Contraseña" class="border px-2 py-1 rounded w-full mb-3" />
      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded w-full">Ingresar</button>
      <p class="text-red-600 mt-2">{{ error }}</p>
      <p class="mt-2 text-center" v-if="loader">Cargando...</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
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

const router = useRouter()
const correo = ref('')
const clave = ref('')
const error = ref('')
const loader = ref(false)

const submit = async () => {
  loader.value = true
  error.value = ''
  const { data, error: err } = await supa.auth.signInWithPassword({
    email: correo.value.trim(),
    password: clave.value
  })
  loader.value = false
  if (err || !data.session) {
    error.value = 'Credenciales inválidas.'
    return
  }
  if (!isAuthorized(data.user.email)) {
    await supa.auth.signOut()
    error.value = 'Acceso no autorizado'
    return
  }
  router.push('/dashboard')
}
</script>
