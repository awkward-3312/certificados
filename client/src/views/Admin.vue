<template>
  <div class="p-4">
    <h2 class="text-xl font-semibold mb-4">Administrar Certificados</h2>
    <form @submit.prevent="guardar" class="space-y-4 bg-white p-4 rounded shadow">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input v-model="form.laboratorio" placeholder="Laboratorio" class="border p-2 rounded" />
        <input v-model="form.direccion" placeholder="Dirección" class="border p-2 rounded" />
        <input v-model="form.pais" placeholder="País" class="border p-2 rounded" />
        <input v-model="form.tipo_producto" placeholder="Tipo de producto" class="border p-2 rounded" />
        <input v-model="form.forma_farmaceutica" placeholder="Forma farmacéutica" class="border p-2 rounded" />
        <input v-model="form.tipo_certificado" placeholder="Tipo de certificado" class="border p-2 rounded" />
        <input type="date" v-model="form.fecha_emision" class="border p-2 rounded" />
        <input type="date" v-model="form.fecha_vencimiento" class="border p-2 rounded" />
        <input v-model="form.archivo_pdf" placeholder="URL PDF" class="border p-2 rounded" />
      </div>
      <label class="flex items-center space-x-2">
        <input type="checkbox" v-model="form.activo" />
        <span>Activo</span>
      </label>
      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">{{ editando ? 'Actualizar' : 'Agregar' }}</button>
    </form>

    <div class="mt-8">
      <h3 class="font-semibold mb-2">Certificados</h3>
      <table class="min-w-full text-left border">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2">Laboratorio</th>
            <th class="p-2">País</th>
            <th class="p-2">Tipo</th>
            <th class="p-2">Vence</th>
            <th class="p-2">Activo</th>
            <th class="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in certificados" :key="c.id" class="border-t">
            <td class="p-2">{{ c.laboratorio }}</td>
            <td class="p-2">{{ c.pais }}</td>
            <td class="p-2">{{ c.tipo_certificado }}</td>
            <td class="p-2">{{ c.fecha_vencimiento }}</td>
            <td class="p-2">
              <span :class="c.activo ? 'text-green-600' : 'text-red-600'">
                {{ c.activo ? 'Sí' : 'No' }}
              </span>
            </td>
            <td class="p-2 space-x-2">
              <button class="text-blue-600" @click="editar(c)">Editar</button>
              <button class="text-red-600" @click="desactivar(c)">Desactivar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4 text-sm text-gray-700">
      Vigentes: {{ vigentes }} | Vencidos: {{ vencidos }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'

const certificados = ref([])
const form = ref({
  laboratorio: '',
  direccion: '',
  pais: '',
  tipo_producto: '',
  forma_farmaceutica: '',
  tipo_certificado: '',
  fecha_emision: '',
  fecha_vencimiento: '',
  archivo_pdf: '',
  activo: true,
})
const editando = ref(false)
let idEditando = null

async function cargar() {
  const { data } = await supabase.from('certificados').select('*').order('fecha_agregado', { ascending: false })
  certificados.value = data || []
}

async function guardar() {
  if (editando.value) {
    await supabase.from('certificados').update(form.value).eq('id', idEditando)
  } else {
    await supabase.from('certificados').insert(form.value)
  }
  form.value = { laboratorio: '', direccion: '', pais: '', tipo_producto: '', forma_farmaceutica: '', tipo_certificado: '', fecha_emision: '', fecha_vencimiento: '', archivo_pdf: '', activo: true }
  editando.value = false
  idEditando = null
  cargar()
}

function editar(c) {
  editando.value = true
  idEditando = c.id
  form.value = { ...c }
}

async function desactivar(c) {
  await supabase.from('certificados').update({ activo: false }).eq('id', c.id)
  cargar()
}

const vigentes = computed(() => certificados.value.filter(c => new Date(c.fecha_vencimiento) >= new Date()).length)
const vencidos = computed(() => certificados.value.length - vigentes.value)

onMounted(cargar)
</script>
