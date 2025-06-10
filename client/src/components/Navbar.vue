<template>
  <nav class="bg-blue-600 text-white p-4 flex space-x-4">
    <RouterLink to="/" class="hover:underline">Inicio</RouterLink>
    <RouterLink to="/buscar" class="hover:underline">Buscar</RouterLink>
    <RouterLink to="/admin" class="hover:underline">Admin</RouterLink>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
