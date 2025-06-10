<template>
  <div class="flex flex-col md:flex-row md:items-end gap-2">
    <input v-model="local.laboratorio" placeholder="Laboratorio" class="border p-2 rounded" />
    <input v-model="local.pais" placeholder="País" class="border p-2 rounded" />
    <input v-model="local.tipo" placeholder="Tipo" class="border p-2 rounded" />
    <select v-model="local.vigentes" class="border p-2 rounded">
      <option value="todos">Todos</option>
      <option value="vigentes">Vigentes</option>
      <option value="vencidos">Vencidos</option>
    </select>
    <button @click="emitir" class="bg-blue-600 text-white px-4 py-2 rounded">Filtrar</button>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
const emit = defineEmits(['filtrar'])
const local = reactive({ laboratorio: '', pais: '', tipo: '', vigentes: 'todos' })
function emitir() {
  emit('filtrar', { ...local })
}
</script>
