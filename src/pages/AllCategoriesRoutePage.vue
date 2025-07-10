<template>
  <AllCategoriesPage
  title="Все категории"
  :items="cities"
  :getItemLabel="(item) => item.name"
  :getItemImage="(item) => item.image"
  :getItemIcon="(item) => item.icon"
  :onItemClick="goToCity"
/>

</template>

<script setup>
import AllCategoriesPage from './AllCategoriesPage.vue'
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

const cities = ref([
  { name: 'Экскурсии', attractions: 70, icon: 'ph:map-trifold' },
  { name: 'Исторические места', attractions: 245, icon: 'mdi:castle' },
  { name: 'Вечерний город', attractions: 123, icon: 'ph:moon-stars' },
  { name: 'Где поесть', attractions: 53, icon: 'ph:fork-knife' },
  { name: 'Размещение', attractions: 321, icon: 'ph:bed' },
  { name: 'Концерты', attractions: 76, icon: 'ph:music-notes' },
  { name: 'Идём семьёй', attractions: 72, icon: 'ph:users-three' },
  { name: 'Вечерний город', attractions: 123, icon: 'ph:moon-stars' },
  { name: 'Вечерний город', attractions: 123, icon: 'ph:moon-stars' },
  { name: 'Вечерний город', attractions: 123, icon: 'ph:moon-stars' },
 
])


import { useRouter} from 'vue-router'

const router = useRouter()

function goToCity(city) {
  console.log('Navigating to', city.name)
}
</script>
