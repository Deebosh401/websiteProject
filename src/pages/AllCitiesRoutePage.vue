<template>
  <AllCitiesPage
    title="Все города"
   :items="cities"
   :getItemLabel="(item) => item.name"
    :getItemImage="(item) => item.image"
    :onItemClick="goToCity"
  />
</template>

<script setup>
import AllCitiesPage from './AllCitiesPage.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const cities = ref([
  { name: 'Калининград', image: '/Kaliningrad.jpeg',attractions:70 },
  { name: 'Светлогорск', image: '/Svetlogorsk.jpeg',attractions:53 },
  { name: 'Зеленоградск', image: '/Zelenogradsk.jpeg',attractions:321 },
  { name: 'Янтарный', image: '/Yantarnyi.jpeg',attractions:245 },
  { name: 'Советск', image: '/Sovetsk.jpeg',attractions:76 },
  { name: 'Балтийск', image: '/Baltiysk.jpeg',attractions:72 },
  { name: 'Черняховск', image: '/Chernyakhovsk.jpeg',attractions:123 },
  { name: 'Гвардейск', image: '/Gvardeysk.jpeg',attractions:43 },
  { name: 'Гусев', image: '/Gusev.jpeg',attractions:70 },
  { name: 'Багратионовск', image: '/Bagrationovsk.jpeg',attractions:70 },
  { name: 'Пионерский', image: '/Pionerskiy.jpeg',attractions:70 },
  { name: 'Гурьевск', image: '/Guryevsk.jpeg',attractions:70 },
  { name: 'Озерск', image: '/Ozersk.jpeg',attractions:70 },
  { name: 'Железнодорожный', image: '/Zheleznodorozhniy.jpeg',attractions:70 },
  { name: 'Нестеров', image: '/Nesterov.jpeg',attractions:70 },
  { name: 'Правдинск', image: '/Pravdinsk.jpeg',attractions:70 },
  { name: 'Краснознаменск', image: '/Krasnoznamensk.jpeg',attractions:70 },
  { name: 'Славск', image: '/Slavsk.jpeg',attractions:70 },
  { name: 'Полесск', image: '/Polessk.jpeg',attractions:70 },
  { name: 'Неман', image: '/Neman.jpeg',attractions:70 },
  { name: 'Ладушкин', image: '/Ladushkin.jpeg',attractions:70 },
  { name: 'Мамоново', image: '/Mamonovo.jpeg',attractions:70 },
])

function goToCity(city) {
  router.push({ name: 'city-detail', params: { name: city.name } })
}
</script>