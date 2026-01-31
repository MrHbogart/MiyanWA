<script setup>
import MiyanBereshtView from '~/views/MiyanBeresht/MiyanBeresht.vue'

definePageMeta({
  pageTheme: {
    group: 'MiyanBeresht',
    view: 'MiyanBereshtLanding',
  },
})
</script>

<template>
  <MiyanBereshtView>
    <NuxtPage />
  </MiyanBereshtView>
</template>
