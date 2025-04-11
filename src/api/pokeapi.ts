import axios from 'axios';

// Tipagem para os ataques dos pokémons
export interface Ability {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

// Tipagem para dados de busca dos pokémons
export interface Form {
  name: string;
  url: string;
}

// Tipagem para os jogos onde os pokémons aparecem
export interface GameIndex {
  game_index: number;
  version: {
    name: string;
    url: string;
  };
}

// Tipagem para os tipos de pokémons
export interface Type {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

// Tipagem para a espécie de um pokémon
export interface Species {
  name: string;
  url: string;
}

// Tipagem para as sprites de pokémons
export interface Sprites {
  front_default: string;
  other?: {
    ['official-artwork']?: {
      front_default: string;
    };
    ['showdown']?: {
      front_default: string;
    };
  }
}

// Tipagem dos dados consumidos de pokémons
export interface Pokemon {
  id: number;
  name: string;
  order: number;
  abilities: Ability[];
  forms: Form[];
  game_indices: GameIndex[];
  species: Species;
  sprites: Sprites;
  types: Type[];
}

// Função para buscar a lista de pokémons
async function fetchPokemonList(offset = 0, limit = 20) {
  const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);

  return response.data.results;
}

// Função para buscar os dados completos de um pokémon (com base no retorno da fetchPokemonList)
async function fetchPokemonDetails(url: string): Promise<Pokemon> {
  const res = await axios.get(url);
  const data = res.data;

  return {
    id: data.id,
    name: data.name,
    order: data.order,
    abilities: data.abilities,
    forms: data.forms,
    game_indices: data.game_indices,
    species: data.species,
    sprites: data.sprites,
    types: data.types,
  };
}

// Função principal
export async function getPokemons(offset = 0, limit = 20): Promise<Pokemon[]> {
  const list = await fetchPokemonList(offset, limit);

  return await Promise.all(
    list.map((item: { name: string; url: string }) =>
      fetchPokemonDetails(item.url)
    )
  );
}

// Função para pesquisar um pokémon
export async function searchPokemon(query: string): Promise<Pokemon | null> {
  try {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`);
    const data = response.data;

    return {
      id: data.id,
      name: data.name,
      order: data.order,
      abilities: data.abilities,
      forms: data.forms,
      game_indices: data.game_indices,
      species: data.species,
      sprites: data.sprites,
      types: data.types,
    };
  } catch (error) {
    console.error("Erro! Pokémon não encontrado:", error);
    return null;
  }
}

interface PokemonBase {
  name: string;
  url: string;
}

interface PokemonTypeByEntry {
  pokemon: PokemonBase;
}

// Função para filtro de pokémons a partir do tipo selecionado
export async function getPokemonsByType(type: string): Promise<Pokemon[]> {
  const response = await axios.get(`https://pokeapi.co/api/v2/type/${type}`);
  const list: PokemonTypeByEntry[] = response.data.pokemon;

  // Lista para limitar a quantidade de pokémons (conforme o limit definido)
  const limitedList = list.slice(0, 20);

  return await Promise.all(
    limitedList.map(entry => fetchPokemonDetails(entry.pokemon.url))
  );
}

export interface PokemonVariety {
  is_default: boolean;
  pokemon: PokemonBase;
}

// Função para filtro de pokémons a partir da espécie selecionada
export async function getPokemonsBySpecies(species: string): Promise<Pokemon[]> {
  const response = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${species}`);
  const speciesData = response.data;

  const varieties = speciesData.varieties;

  return await Promise.all(
    varieties.map((v: PokemonVariety) => fetchPokemonDetails(v.pokemon.url))
  );
}

interface PokemonFilterOptions {
  type?: string;
  species?: string;
  offset?: number;
  limit?: number;
}

// Função para resgatar os pokémons com verificação de filtro
export async function getFilteredPokemons(options: PokemonFilterOptions): Promise<Pokemon[]> {
  if (options.type) {
    return await getPokemonsByType(options.type);
  }

  if (options.species) {
    return await getPokemonsBySpecies(options.species);
  }

  // Retorno caso não tenha filtros
  return await getPokemons(options.offset ?? 0, options.limit ?? 20);
}

export async function fetchPokemonTypes(): Promise<string[]> {
  const response = await axios.get(`https://pokeapi.co/api/v2/type`);
  return response.data.results.map((type: PokemonBase) => type.name);
}

export async function fetchPokemonSpecies(): Promise<string[]> {
  const response = await axios.get(`https://pokeapi.co/api/v2/pokemon-species?limit=1000`);
  return response.data.results.map((species: PokemonBase) => species.name);
}
