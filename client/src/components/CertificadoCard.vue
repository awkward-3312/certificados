<template>
  <div class="border rounded p-4 shadow flex flex-col justify-between">
    <div>
      <h4 class="font-semibold mb-1">{{ certificado.laboratorio }}</h4>
      <p class="text-sm text-gray-600">{{ certificado.pais }} - {{ certificado.tipo_certificado }}</p>
      <p class="text-sm">Vence: <span :class="estaVencido ? 'text-red-600' : proximoAVencer ? 'text-orange-600' : 'text-green-600'">{{ certificado.fecha_vencimiento }}</span></p>
    </div>
    <a :href="certificado.archivo_pdf" target="_blank" class="text-blue-600 underline mt-2">Ver PDF</a>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ certificado: Object })
const hoy = new Date()
const fechaVenc = computed(() => new Date(props.certificado.fecha_vencimiento))
const estaVencido = computed(() => fechaVenc.value < hoy)
const proximoAVencer = computed(() => {
  const diff = (fechaVenc.value - hoy) / (1000 * 60 * 60 * 24)
  return diff >= 0 && diff <= 30
})
</script>
