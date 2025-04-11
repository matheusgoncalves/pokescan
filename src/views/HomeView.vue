<script setup lang="ts">
  import { ref, onMounted, watch, computed } from 'vue';
  import { getPokemons, searchPokemon, getFilteredPokemons, fetchPokemonTypes, fetchPokemonSpecies } from '@/api/pokeapi';
  import type { Pokemon } from '@/api/pokeapi';
  import 'bootstrap-icons/font/bootstrap-icons.css';

  const pokemons = ref<Pokemon[]>([]);
  const offset = ref(0);
  const limit = 20;
  const loading = ref(false);
  const finished = ref(false);

  // Variáveis de busca
  const searchQuery = ref('');
  const hasSearched = ref(false);

  // Variáveis de filtro
  const showFilter = ref(false);
  const selectedSpecies = ref<string | null>(null);
  const selectedType = ref<string | null>(null);
  const availableTypes = ref<string[]>([]);
  const availableSpecies = ref<string[]>([]);
  const isSpeciesDisabled = computed(() => selectedType.value !== null);
  const isTypesDisabled = computed(() => selectedSpecies.value !== null);

  // Métodos de filtro
  const toggleFilter = () => {
    showFilter.value = !showFilter.value;
  };

  const clearFilter = (filter: 'species' | 'type') => {
    if (filter === 'species') selectedSpecies.value = null;
    if (filter === 'type') selectedType.value = null;
  };

  const clearAllFilters = () => {
    selectedSpecies.value = null;
    selectedType.value = null;
  };

  const fetchAvailableFilters = async () => {
    availableTypes.value = await fetchPokemonTypes();
    availableSpecies.value = await fetchPokemonSpecies();
  };

  // Watcher para gerenciar a exibição de acordo com o filtro
  watch([selectedType, selectedSpecies], async () => {
    offset.value = 0;
    finished.value = false;
    pokemons.value = [];

    if (selectedType.value || selectedSpecies.value) {
      pokemons.value = await getFilteredPokemons({
        type: selectedType.value,
        species: selectedSpecies.value,
        offset: offset.value,
        limit: limit,
      });

      offset.value += limit;
      hasSearched.value = true;
    } else {
      await loadMorePokemons(); // Volta para o modo padrão (sem filtros)
    }
  });

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

    clearAllFilters();
  }

  onMounted(async () => {
    await Promise.all([
      loadMorePokemons(),
      fetchAvailableFilters(),
    ]);
    window.addEventListener('scroll', handleScroll);
  })
</script>

<template>
  <div class="container my-4">
    <div class="row justify-content-center">
      <!-- Barra de pesquisa -->
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

      <!-- Filtro -->
      <div class="d-flex justify-content-end gap-2 col-12 col-md-4">
        <div class="d-flex flex-column gap-1">
          <div class="d-flex flex-wrap gap-2">
            <div
              v-if="selectedSpecies"
              class="input-hover text-capitalize fw-normal badge bg-dark-subtle d-flex align-items-center gap-1 px-2 py-0 rounded-pill"
              style="height: 28px; font-size: 14px;"
            >
              <i class="bi bi-x-octagon" role="button" @click="clearFilter('species')"></i>
              {{ selectedSpecies }}
            </div>

            <div
              v-if="selectedType"
              class="input-hover text-capitalize fw-normal badge bg-dark-subtle d-flex align-items-center gap-1 px-2 py-0 rounded-pill"
              style="height: 28px; font-size: 14px;"
            >
              <i class="bi bi-x-octagon" role="button" @click="clearFilter('type')"></i>
              {{ selectedType }}
            </div>
          </div>

<!--          <div-->
<!--            v-if="selectedSpecies || selectedType"-->
<!--            class="d-flex gap-2 text-danger"-->
<!--            role="button"-->
<!--            @click="clearAllFilters"-->
<!--          >-->
<!--            <span-->
<!--              class="ms-2"-->
<!--              style="font-size: 14px;"-->
<!--            >-->
<!--              <i class="bi bi-x-octagon"></i> Limpar todos os filtros-->
<!--            </span>-->
<!--          </div>-->
        </div>

        <!-- Botão de filtro -->
        <div class="position-relative">
          <div class="d-flex align-items-top gap-2">
            <button
              @click="toggleFilter"
              class="btn border-0 p-0"
              style="width: 28px; height: 28px; line-height: 0;"
            >
              <i class="bi bi-filter-square-fill fs-5 p-0"></i>
            </button>
          </div>

          <!-- Dropdown suspenso -->
          <div
            v-if="showFilter"
            class="position-absolute bg-white border rounded shadow p-3 mt-2"
            style="z-index: 10; width: 300px; right: 0;"
          >
            <!-- Filtro por espécie -->
            <div class="mb-3">
              <label for="species-select" class="form-label">Filtrar por espécie:</label>
              <select
                id="species-select"
                class="form-select"
                v-model="selectedSpecies"
                :disabled="isSpeciesDisabled"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Remova o filtro de tipo para filtrar por espécie"
              >
                <option :value="null">Selecionar espécie</option>
                <option v-for="specie in availableSpecies" :key="specie" :value="specie">
                  {{ specie }}
                </option>
              </select>
            </div>

            <!-- Filtro por tipo -->
            <div>
              <label for="type-select" class="form-label">Filtrar por tipo:</label>
              <select
                id="type-select"
                class="form-select"
                v-model="selectedType"
                :disabled="isTypesDisabled"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Remova o filtro de espécie para filtrar por tipo"
              >
                <option :value="null">Selecionar tipo</option>
                <option v-for="type in availableTypes" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
            </div>
          </div>
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
  .input-hover{
    transition: color 0.2s ease-out;
  }
  .input-hover:hover {
    color: red;
  }
</style>
