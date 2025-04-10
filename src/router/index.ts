import { createMemoryHistory, createRouter } from 'vue-router'

import HomeView from './HomeView.vue'
import PokemonView from './PokemonView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/pokemons/:id',
    name: 'Pokemon',
    component: PokemonView
  },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router
