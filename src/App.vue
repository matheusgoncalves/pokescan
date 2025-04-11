<script setup lang="ts">
  import AppLogotype from '@/components/AppLogotype.vue'
</script>

<template>
  <div class="container w-full">
    <header class="d-flex justify-content-center py-5">
      <router-link to="/">
        <AppLogotype style="max-width: 460px;"/>
      </router-link>
    </header>

    <main class="my-0">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
</style>
