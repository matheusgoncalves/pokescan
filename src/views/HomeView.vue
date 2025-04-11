<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { getPokemons } from '@/api/pokeapi'
  import type { Pokemon } from '@/api/pokeapi'

  const pokemons = ref<Pokemon[]>([])

  onMounted(async () => {
    pokemons.value = await getPokemons()
  })
</script>

<template>
  <div class="d-flex flex-wrap justify-content-center">
    <div v-for="pokemon in pokemons" :key="pokemon.id" class="d-flex flex-column border border-3 border-solid border-secondary rounded-5 p-3 m-3">
      <div class="d-flex justify-content-center align-items-end p-4 bg-secondary-subtle rounded-5" style="width: 160px; height: 160px;">
        <img
          v-if="pokemon.sprites?.other?.['showdown']?.front_default"
          :src="pokemon.sprites?.other?.['showdown']?.front_default"
          :alt="pokemon.name"
          style="max-width: 100%;"
        />
      </div>

      <div class="mt-3">
        <p>#{{ String(pokemon.order).padStart(4, '0') }}</p>
        <p class="text-capitalize">{{ pokemon.name }}</p>

        <div v-for="type in pokemon.types" :key="type.type.name" class="d-inline-flex align-items-center">
          <p class="text-capitalize px-3 py-1 me-2 mb-0 rounded-5 bg-dark-subtle" style="font-size: 14px;">{{ type.type.name }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
