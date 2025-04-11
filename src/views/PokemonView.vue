<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { fetchPokemonDetails } from '@/api/pokeapi.ts';
  import type { Pokemon } from '@/api/pokeapi';

  // Rota da aplicação
  const route = useRoute()

  const pokemon = ref<Pokemon | null>(null)

  // Lista de sprites para iterar
  const sprites = computed(() => {
    if (!pokemon.value) return [];

    // Filtra apenas as propriedades que são URLs de imagens (strings) e não são objetos internos
    return Object.entries(pokemon.value.sprites)
      .filter(([key, value]) =>
        typeof value === 'string' && true && !key.includes('other')
      )
      .map(([key, url]) => ({
        key,
        url: typeof url === 'string' ? url : undefined,
      }));
  });

  // Função para buscar as informações do Pokémon
  const loadPokemon = async () => {
    const query = route.params.query as string; // Para obter o parâmetro "query" da rota

    try {
      pokemon.value = await fetchPokemonDetails(query);
    } catch (err) {
      console.error('Erro ao buscar os dados do Pokémon:', err);
    }
  }

  onMounted(() => {
    loadPokemon()
  })
</script>

<template>
  <div v-if="pokemon" class="d-flex flex-column gap-4 p-5 bg-secondary-subtle" style="min-height: 100vh; border-top-left-radius: 80px; border-top-right-radius: 80px;">
    <!-- Navegação entre pokémons -->
    <div class="d-flex justify-content-between">
      <div class="d-flex justify-content-start align-items-center">
        <span>Pokémon anterior</span>
      </div>

      <div class="d-flex justify-content-center align-items-center gap-2 text-capitalize">
        <span class="text-secondary">#{{ String(pokemon.id).padStart(4, '0') }}</span>
        <span>{{ pokemon.name }}</span>
      </div>

      <div class="d-flex justify-content-end align-items-center">
        <span>Próximo pokémon</span>
      </div>
    </div>

    <!-- Sprite e informações principais do pokémon -->
    <div class="d-flex justify-content-center gap-5 m-4">
      <div
        class="border border-3 border-solid border-secondary rounded-5 bg-body p-3 col-12 col-md-6"
        style="width: fit-content"
      >
        <div
          class="d-flex justify-content-center align-items-end p-4 bg-secondary-subtle rounded-5"
          style="width: 168px; min-width: 168px; max-width: 160px; height: 160px"
        >
          <img
            v-if="pokemon.sprites?.other?.['showdown']?.front_default"
            :src="pokemon.sprites?.other?.['showdown']?.front_default"
            :alt="pokemon.name"
            style="max-width: 100%; max-height: 100%"
          />
        </div>
      </div>

      <div class="d-flex flex-column gap-2 col-12 col-md-6">
        <div class="d-flex gap-2">
          <span style="width: 64px">Espécie:</span>
          <span class="text-capitalize">{{ pokemon.species.name }}</span>
        </div>

        <div class="d-flex gap-2">
          <span style="width: 64px">Tipos:</span>

          <div
            v-for="type in pokemon.types"
            :key="type.type.name"
            class="d-inline-flex align-items-center"
          >
            <p
              class="text-capitalize px-3 py-1 me-2 mb-0 rounded-5 bg-dark-subtle"
              style="font-size: 14px"
            >
              {{ type.type.name }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Ataques do pokémon -->
    <div class="d-flex flex-column gap-2">
      <h6>Ataques</h6>

      <div class="d-flex flex-wrap gap-2">
        <span
          v-for="ability in pokemon.abilities"
          :key="ability.ability.name"
          class="d-flex align-items-center text-capitalize"
          style="width: 96px; font-size: 14px"
        >
          {{ ability.ability.name }}
        </span>
      </div>
    </div>

    <!-- Outras sprites do pokémon -->
    <div class="d-flex flex-column mt-4" v-if="pokemon">
      <h6>Sprites</h6>

      <div class="d-flex flex-wrap gap-4 justify-content-center">
        <div
          v-for="sprite in sprites"
          :key="sprite.key"
          class="d-flex flex-column align-items-center"
        >
          <div
            class="border border-3 border-solid border-secondary rounded-5 bg-body p-3 col-12 col-md-6"
            style="width: fit-content"
          >
            <div
              class="d-flex justify-content-center align-items-end bg-secondary-subtle rounded-5"
              style="width: 100px; min-width: 100px; max-width: 96px; height: 100px"
            >
          <img
            :src="sprite.url"
            :alt="`Sprite de ${pokemon.name}`"
            style="max-width: 96px; max-height: 96px"
          />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
