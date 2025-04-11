import axios from 'axios'

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
