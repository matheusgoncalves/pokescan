import { createWebHistory, createRouter } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import PokemonView from '../views/PokemonView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/pokemons/:query',
    name: 'Pokemon',
    component: PokemonView
  },
  {
    path: "/:catchAll(.*)",
    redirect: "/",
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
