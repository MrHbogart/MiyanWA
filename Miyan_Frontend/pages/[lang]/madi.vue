<script setup>
import MiyanMadiView from '~/views/MiyanMadi/MiyanMadi.vue'

definePageMeta({
  pageTheme: {
    group: 'MiyanMadi',
    view: 'MiyanMadiLanding',
  },
})
</script>

<template>
  <MiyanMadiView>
    <NuxtPage />
  </MiyanMadiView>
</template>
