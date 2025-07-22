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
  { name: 'Экскурсии', attractions: 70, icon: 'mdi:hiking' },
  { name: 'Где поесть', attractions: 245, image: './Category.resto.jpeg' },
  { name: 'Размещение', attractions: 123, image: './Category.hotels.jpeg' },
  { name: 'Активный отдых', attractions: 53, image: './Category.activity.jpeg' },
  { name: 'Исторические места', attractions: 321, icon: 'mdi:castle' },
  { name: 'Концерты', attractions: 76, image: './Category.concerts.jpeg' },
  { name: 'Театры', attractions: 123, image: './Theater.jpeg' },
  { name: 'Семейный выход', attractions: 123, image: './Category.family.jpeg' },
  { name: 'Кино', attractions: 123, image: './Movie.jpeg' },
  { name: 'Мастер-классы', attractions: 123, image: './Workshop.jpeg' },
  { name: 'Музеи', attractions: 123, image: './Museums.jpeg' },
  { name: 'Парки/cкверы', attractions: 123, image: './Parks.jpeg' },
  { name: 'Отпускной транспорт', attractions: 123, image: './transport.jpeg' },
])


import { useRouter} from 'vue-router'

const router = useRouter()

function goToCity(city) {
  console.log('Navigating to', city.name)
}
</script>