<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import { getPokemons, searchPokemon } from '@/api/pokeapi';
  import type { Pokemon } from '@/api/pokeapi';
  import 'bootstrap-icons/font/bootstrap-icons.css';

  const pokemons = ref<Pokemon[]>([]);
  const offset = ref(0);
  const limit = 20;
  const loading = ref(false);
  const finished = ref(false);
  const searchQuery = ref('');
  const hasSearched = ref(false);

  // Função para gerenciar o carregamento e exibição dos pokémons
  const loadMorePokemons = async () => {
    if (loading.value || finished.value) {
      return;
    }

    loading.value = true;

    const newPokemons = await getPokemons(offset.value, limit);

    if (newPokemons.length === 0) {
      finished.value = true;
    } else {
      pokemons.value.push(...newPokemons);
      offset.value += limit;
    }

    loading.value = false;
  }

  // Função para gerenciar o scroll do usuário
  const handleScroll = () => {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const fullHeight = document.documentElement.scrollHeight;

    // Quando o usuário está a 200px do fim, mais pokémons são carregados
    if (scrollY + viewportHeight + 200 >= fullHeight) {
      loadMorePokemons();
    }
  }

  // Função para gerenciar a busca de pokémons
  async function handleSearch() {
    hasSearched.value = true;

    if (searchQuery.value.trim() === '') {
      pokemons.value = [];
      offset.value = 0;
      finished.value = false;
      await loadMorePokemons();
      return;
    }

    const result = await searchPokemon(searchQuery.value)
    if (result) {
      pokemons.value = [result]
    } else {
      pokemons.value = [];
    }
  }

  onMounted(async () => {
    await loadMorePokemons();
    window.addEventListener('scroll', handleScroll);
  })
</script>

<template>
  <div class="container my-4">
    <div class="row justify-content-center">
      <div class="d-flex flex-column gap-1 col-12 col-md-8">
        <div class="d-inline-flex align-items-center gap-3 text-center p-0">
          <input
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="Pesquise pelo nome ou número do pokémon"
            class="form-control border border-3 border-secondary rounded-5 w-full"
            style="height: 44px; padding-left: 16px;"
          />

          <div>
            <button @click="handleSearch" class="border-0 bg-dark-subtle rounded-circle" style="width: 52px; height: 52px;">
              <i class="bi bi-search fs-4 text-white-50"></i>
            </button>
          </div>
        </div>

        <span class="d-flex align-items-center gap-2">
          <i class="bi bi-info-circle-fill text-secondary fs-5"></i> Ou, se preferir, filtre os pokémons exibidos clicando no quadrado à direita.
        </span>
      </div>


      <div class="col-12 col-md-4">
        <div class="d-flex justify-content-end align-items-center">
          O filtro será colocado aqui
        </div>
      </div>
    </div>
  </div>

  <div class="d-flex flex-wrap justify-content-center">
    <div v-for="pokemon in pokemons" :key="pokemon.order" class="d-flex flex-column border border-3 border-solid border-secondary rounded-5 p-3 m-3">
      <div class="d-flex justify-content-center align-items-end p-4 bg-secondary-subtle rounded-5" style="width: 168px; min-width: 168px; max-width: 160px; height: 160px;">
        <img
          v-if="pokemon.sprites?.other?.['showdown']?.front_default"
          :src="pokemon.sprites?.other?.['showdown']?.front_default"
          :alt="pokemon.name"
          style="max-width: 100%; max-height: 100%;"
        />
      </div>

      <div class="mt-3">
        <p>#{{ String(pokemon.id).padStart(4, '0') }}</p>
        <p class="text-capitalize text-nowrap text-truncate" style="max-width: 120px;">{{ pokemon.name }}</p>

        <div v-for="type in pokemon.types" :key="type.type.name" class="d-inline-flex align-items-center">
          <p class="text-capitalize px-3 py-1 me-2 mb-0 rounded-5 bg-dark-subtle" style="font-size: 14px;">{{ type.type.name }}</p>
        </div>
      </div>
    </div>
  </div>

  <div v-if="loading" class="text-center my-4">
    <span>Carregando pokémons...</span>
  </div>

  <div v-if="finished" class="text-center my-4 text-muted">
    <span>Todos os pokémons foram carregados!</span>
  </div>

  <div v-if="!loading && pokemons.length === 0 && hasSearched">
    <p class="text-center text-muted my-4">Nenhum pokémon encontrado.</p>
  </div>
</template>

<style scoped>
</style>
