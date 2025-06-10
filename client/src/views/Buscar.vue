<template>
  <div class="p-4">
    <FiltroCertificados @filtrar="filtrar" />
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
      <CertificadoCard
        v-for="cert in certificadosFiltrados"
        :key="cert.id"
        :certificado="cert"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'
import FiltroCertificados from '../components/FiltroCertificados.vue'
import CertificadoCard from '../components/CertificadoCard.vue'

const certificados = ref([])
const filtros = ref({ laboratorio: '', pais: '', tipo: '', vigentes: 'todos' })

async function cargarCertificados() {
  const { data } = await supabase
    .from('certificados')
    .select('*')
    .order('fecha_vencimiento', { ascending: true })
  certificados.value = data || []
}

function filtrar(nuevosFiltros) {
  filtros.value = nuevosFiltros
}

const certificadosFiltrados = computed(() => {
  return certificados.value.filter(c => {
    const matchLab = filtros.value.laboratorio === '' || c.laboratorio.toLowerCase().includes(filtros.value.laboratorio.toLowerCase())
    const matchPais = filtros.value.pais === '' || c.pais.toLowerCase().includes(filtros.value.pais.toLowerCase())
    const matchTipo = filtros.value.tipo === '' || c.tipo_certificado.toLowerCase().includes(filtros.value.tipo.toLowerCase())
    const hoy = new Date()
    const vigente = new Date(c.fecha_vencimiento) >= hoy
    if (filtros.value.vigentes === 'vigentes' && !vigente) return false
    if (filtros.value.vigentes === 'vencidos' && vigente) return false
    return matchLab && matchPais && matchTipo
  })
})

onMounted(cargarCertificados)
</script>
