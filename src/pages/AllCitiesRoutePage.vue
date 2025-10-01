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
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { getCitiesWithAttractionCounts } from '../Data'

const router = useRouter()

// Use cities data from Data.ts with calculated attraction counts
const cities = computed(() => getCitiesWithAttractionCounts())

function goToCity(city) {
  router.push({ name: 'city-detail', params: { name: city.name } })
}
</script>