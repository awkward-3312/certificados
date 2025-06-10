<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-blue-600 text-white p-4 flex justify-between items-center">
      <h1 class="text-xl font-semibold">Repositorio de Certificados</h1>
      <button @click="logout" class="bg-blue-800 px-3 py-1 rounded">Cerrar sesión</button>
    </header>
    <main class="p-4 overflow-x-auto">
      <div class="flex flex-wrap gap-4 mb-4">
        <input v-model="search" type="text" placeholder="Buscar..." class="border px-2 py-1 rounded w-full sm:w-auto" />
        <select v-model="filterPais" class="border px-2 py-1 rounded">
          <option value="">Todos los países</option>
          <option v-for="p in paises" :key="p" :value="p">{{ p }}</option>
        </select>
        <select v-model="filterTipoProducto" class="border px-2 py-1 rounded">
          <option value="">Todos los productos</option>
          <option v-for="p in productos" :key="p" :value="p">{{ p }}</option>
        </select>
        <select v-model="filterTipoCertificado" class="border px-2 py-1 rounded">
          <option value="">Todos los certificados</option>
          <option v-for="c in certificadosTipos" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div v-if="loading" class="text-center">Cargando...</div>
      <div class="overflow-x-auto mt-4" v-if="!loading">
        <table class="min-w-full bg-white text-sm">
          <thead class="bg-gray-200">
            <tr>
              <th class="px-3 py-2 text-left">Laboratorio</th>
              <th class="px-3 py-2 text-left">País</th>
              <th class="px-3 py-2 text-left">Tipo Producto</th>
              <th class="px-3 py-2 text-left">Forma Farmacéutica</th>
              <th class="px-3 py-2 text-left">Tipo Certificado</th>
              <th class="px-3 py-2 text-left">Fecha Emisión</th>
              <th class="px-3 py-2 text-left">Fecha Vencimiento</th>
              <th class="px-3 py-2 text-left">Estado</th>
              <th class="px-3 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in paginated" :key="row.id" :class="rowClass(row)">
              <td>{{ row.laboratorio || '' }}</td>
              <td>{{ row.pais || '' }}</td>
              <td>{{ row.tipo_producto || '' }}</td>
              <td>{{ row.forma_farmaceutica || '' }}</td>
              <td>{{ row.tipo_certificado || '' }}</td>
              <td>{{ row.fecha_emision ? formatDate(row.fecha_emision) : '' }}</td>
              <td>{{ row.fecha_vencimiento ? formatDate(row.fecha_vencimiento) : '' }}</td>
              <td class="text-lg">{{ stateIcon(row) }}</td>
              <td>
                <button class="text-blue-600 mr-2" @click="verPdf(row.archivo_pdf)">Ver</button>
                <button class="text-green-600" @click="descargarPdf(row.archivo_pdf)">Descargar</button>
              </td>
            </tr>
            <tr v-if="filtrados.length === 0">
              <td colspan="9" class="text-center py-4">No hay certificados disponibles</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-4 flex justify-center" v-if="totalPages > 1">
        <button class="px-2" @click="page--" :disabled="page === 1">Anterior</button>
        <span class="px-2">{{ page }} / {{ totalPages }}</span>
        <button class="px-2" @click="page++" :disabled="page === totalPages">Siguiente</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supa } from '../supabaseClient'

const router = useRouter()

const certificados = ref([])
const search = ref(localStorage.getItem('search') || '')
const filterPais = ref(localStorage.getItem('filterPais') || '')
const filterTipoProducto = ref(localStorage.getItem('filterTipoProducto') || '')
const filterTipoCertificado = ref(localStorage.getItem('filterTipoCertificado') || '')
const loading = ref(false)
const page = ref(1)
const pageSize = 10

watch([search, filterPais, filterTipoProducto, filterTipoCertificado], () => {
  localStorage.setItem('search', search.value)
  localStorage.setItem('filterPais', filterPais.value)
  localStorage.setItem('filterTipoProducto', filterTipoProducto.value)
  localStorage.setItem('filterTipoCertificado', filterTipoCertificado.value)
  page.value = 1
})

const paises = computed(() => [...new Set(certificados.value.map(r => r.pais).filter(Boolean))])
const productos = computed(() => [...new Set(certificados.value.map(r => r.tipo_producto).filter(Boolean))])
const certificadosTipos = computed(() => [...new Set(certificados.value.map(r => r.tipo_certificado).filter(Boolean))])

const filtrados = computed(() => {
  return certificados.value.filter(row => {
    const texto = `${row.laboratorio || ''} ${row.pais || ''} ${row.tipo_producto || ''} ${row.forma_farmaceutica || ''} ${row.tipo_certificado || ''}`.toLowerCase()
    const matchSearch = !search.value || texto.includes(search.value.toLowerCase())
    const matchPais = !filterPais.value || row.pais === filterPais.value
    const matchProd = !filterTipoProducto.value || row.tipo_producto === filterTipoProducto.value
    const matchCert = !filterTipoCertificado.value || row.tipo_certificado === filterTipoCertificado.value
    return matchSearch && matchPais && matchProd && matchCert
  })
})

const totalPages = computed(() => Math.ceil(filtrados.value.length / pageSize))
const paginated = computed(() => filtrados.value.slice((page.value - 1) * pageSize, page.value * pageSize))

function stateIcon(row) {
  const cls = rowClass(row)
  if (cls === 'valido') return '🟢'
  if (cls === 'por-vencer') return '🟡'
  if (cls === 'expirado') return '🔴'
  return ''
}

function rowClass(row) {
  const hoy = new Date()
  const limite = 30 * 24 * 60 * 60 * 1000
  const vto = row.fecha_vencimiento ? new Date(row.fecha_vencimiento) : null
  if (!vto) return ''
  const diff = vto - hoy
  if (diff < 0) return 'expirado'
  if (diff <= limite) return 'por-vencer'
  return 'valido'
}

function formatDate(str) {
  const d = new Date(str)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${d.getFullYear()}`
}

function verPdf(url) {
  window.open(url, '_blank')
}

function descargarPdf(url) {
  const a = document.createElement('a')
  a.href = url
  a.download = ''
  a.click()
}

async function loadCertificados() {
  loading.value = true
  const { data, error } = await supa
    .from('dataBase')
    .select('*')
    .order('fecha_emision', { ascending: false })
  loading.value = false
  if (!error) {
    certificados.value = data || []
  }
}

async function logout() {
  await supa.auth.signOut()
  router.push('/login')
}

onMounted(loadCertificados)
</script>

<style scoped>
.valido { background-color: #d1fae5; }
.por-vencer { background-color: #fef9c3; }
.expirado { background-color: #fee2e2; }
</style>
