<template>
  <div class="city-detail-page">
    <!-- Fallbacks prevent broken layout even if city not found -->
    <div class="city-hero" :style="{ backgroundImage: `url(${city?.image || '/default-hero.jpg'})` }">
      <div
        class="city-hero-overlay"
        :style="{
          transform: `translateY(${Math.min(scrollY, 50) * -0.5}px)`,
          opacity: `${1 - Math.min(scrollY, 100) / 100}`,
        }"
      >
        <h1 class="city-name">{{ city?.name || cityParam }}</h1>
      </div>
    </div>

    <div class="city-description">
      <p v-if="city?.description">{{ city.description }}</p>
      <p v-else style="opacity:.7">Описание появится позже.</p>
    </div>

    <!-- CATEGORY BAR -->
    <div class="category-scroll">
      <div
        class="scroll-button"
        v-for="category in categories"
        :key="category.name"
        :class="{ active: selectedCategory === category.name }"
        @click="selectedCategory = category.name"
      >
        {{ category.name }}
      </div>
    </div>

    <!-- SORTING DROPDOWN -->
    <div class="sort-bar">
  <label for="sort-select">Сортировать:</label>
  <div class="select-wrapper">
    <select id="sort-select" v-model="sortOption">
      <option v-for="option in sortOptions" :key="option" :value="option">
        {{ option }}
      </option>
    </select>
    <span class="select-arrow">▼</span>
  </div>
  <button class="sort-order-toggle" @click="sortAscending = !sortAscending">
    {{ sortAscending ? '↑' : '↓' }}
  </button>
 
</div>
 <div class="filter-bar">
  <button class="filter-btn" @click="handleFilterClick">Фильтр</button>
</div>

<FilterModal
  v-if="showFilterModal"
  :category="selectedCategory"
  :existingFilters="activeFilters"
  @apply="applyFilters"
  @close="showFilterModal = false"
/>


    <!-- ATTRACTIONS -->
<div
  :class="['attraction-grid', { horizontal: selectedCategory === '👍🏼', vertical: selectedCategory !== '👍🏼' }]"
>
  <div
    class="attraction-card"
    v-for="attraction in filteredAttractions"
    :key="attraction.id"
    @click="goToAttraction(attraction)"
  >
    <img
      :src="attraction.image || '/default.jpg'"
      class="card-image"
      loading="lazy"
      alt="attraction image"
    />
    <div class="card-content">
      <h3>{{ attraction.name }}</h3>
      <p v-if="attraction.date">📅 {{ formatDateTimeRu(attraction.date) }}</p>
      <p v-if="attraction.checkedIn">✅ {{ attraction.checkedIn }} участников</p>
      <p v-if="attraction.price === 0">Бесплатно</p>
      <p v-else-if="attraction.price">💶 {{ attraction.price }} ₽</p>
    </div>
  </div>
</div>

    <button class="back-floating-btn" @click="goBack">
  ← Назад
</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { allAttractions, type Attraction, citiesData } from '../Data'  // ⬅️ use shared data

import FilterModal from '../components/FilterModal.vue'
import { filterOptions } from '../filterConfig'

const showFilterModal = ref(false)
const activeFilters = ref<Record<string, any>>({})

function applyFilters(newFilters: Record<string, any>) {
  activeFilters.value = newFilters
  showFilterModal.value = false
}

const router = useRouter()
const route = useRoute()

// sticky header transform
const scrollY = ref(0)
function handleScroll() { scrollY.value = window.scrollY }
onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
function goBack() { router.back() }

// read :name from route and find city from shared data
const cityParam = computed(() => String(route.params.name ?? ''))
const city = computed(() => {
  const list = Array.isArray(citiesData.value) ? citiesData.value : []
  return list.find(c => c.name === cityParam.value)
})

// UI state from query
const selectedCategory = ref((route.query.category as string) || '👍🏼')
const sortOption = ref((route.query.sort as string) || 'По дате')
const sortAscending = ref(route.query.asc !== 'false')

watch([selectedCategory, sortOption, sortAscending], () => {
  router.replace({
    query: {
      ...route.query,
      category: selectedCategory.value,
      sort: sortOption.value,
      asc: String(sortAscending.value),
    },
  })
})

const sortOptions = ['По дате', 'По популярности', 'Бесплатные']

const categories = ref([
  { name: '👍🏼', attractions: 0 },
  { name: 'Экскурсии', attractions: 70 },
  { name: 'Где поесть', attractions: 245 },
  { name: 'Размещение', attractions: 123 },
  { name: 'Активный отдых', attractions: 53 },
  { name: 'Исторические места', attractions: 321 },
  { name: 'Концерты', attractions: 76 },
  { name: 'Театры', attractions: 123 },
  { name: 'Семейный выход', attractions: 123 },
  { name: 'Кино', attractions: 123 },
  { name: 'Мастер-классы', attractions: 123 },
  { name: 'Музеи', attractions: 123 },
  { name: 'Парки/cкверы', attractions: 123 },
  { name: 'Отпускной транспорт', attractions: 123 },
  { name: 'Выставки', attractions: 123 },
])

function handleFilterClick() {
  if (filterOptions[selectedCategory.value]) showFilterModal.value = true
  else alert('Фильтры для выбранной категории пока не доступны.')
}

// IMPORTANT: allAttractions is a ref → use .value
const filteredAttractions = computed<Attraction[]>(() => {
  const source = Array.isArray(allAttractions.value) ? allAttractions.value : []

  let attractions =
    selectedCategory.value === '👍🏼'
      ? [...source] // clone array
      : source.filter(a => a.category === selectedCategory.value)

  if (sortOption.value === 'По дате') {
    attractions.sort((a, b) =>
      sortAscending.value
        ? new Date(a.date ?? 0).getTime() - new Date(b.date ?? 0).getTime()
        : new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
    )
  } else if (sortOption.value === 'По популярности') {
    attractions.sort((a, b) =>
      sortAscending.value
        ? (a.checkedIn || 0) - (b.checkedIn || 0)
        : (b.checkedIn || 0) - (a.checkedIn || 0)
    )
  } else if (sortOption.value === 'Бесплатные') {
    attractions = attractions.filter(a => a.price === 0)
  }

  return attractions
})

function goToAttraction(attraction: Attraction) {
  router.push({ name: 'event-detail', params: { id: attraction.id } })
}

function formatDateTimeRu(dateStr?: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const day = date.getDate()
  const month = new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(date)
  const time = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${day} ${month} ${time}`
}
</script>

<style scoped>
.city-detail-page {
  font-family: sans-serif;
  padding-top: 4.3rem;
}

.city-hero {
  position: relative;
  height: 30vh;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.city-hero-overlay {
  background: rgba(255, 255, 255, 0.102);
  border: double white 4px;
  padding: 0.6rem 1.3rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  backdrop-filter: blur(1.5px);
  text-align: center;
}

.city-name {
  color: #fff;
  font-size: 1.4rem;
  font-weight: 600;
  background-color: transparent;
}

.city-description {
  padding: 1rem 1rem 0.2rem;
  font-size: 1rem;
  line-height: 1.6;
  text-align: justify;
  color: #333;
}

/* CATEGORY BAR */
.category-scroll {
  display: flex;
  overflow-x: auto;
  padding: 0.5rem 0.7rem;
  gap: 0.5rem;
  margin-top: 0;
}

.scroll-button {
  background: rgba(225, 245, 254, 255);
  color: black;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  white-space: nowrap;
  cursor: pointer;
  font-weight: 550;
  transition: background 0.2s ease;
}

.scroll-button.active {
  background: #c7d2fe;
  color: black;
  font-weight: bold;
}

/* SORT BAR */
.sort-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-weight: 500;
  font-size: 0.95rem;
}

.select-wrapper {
  position: relative;
}

.sort-bar select {
  appearance: none;
  background: rgba(225, 245, 254, 255);
  border: none;
  border-radius: 8px;
  padding: 0.5rem 2rem 0.5rem 0.8rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-arrow {
  position: absolute;
  right: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 0.7rem;
  color: #555;
}

.sort-order-toggle {
  background: rgba(225, 245, 254, 255);
  border: none;
  border-radius: 8px;
  padding: 0.45rem 0.8rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
  font-weight: bold;
}

/* ATTRACTION CARDS */
.attraction-grid {
  padding: 1rem 0;
}

/* Horizontal scrolling for '👍🏼' */
.attraction-grid.horizontal {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 0.5rem;
  scroll-padding-left: 0.7rem;
  scroll-behavior: smooth;
}

.attraction-grid.horizontal .attraction-card {
  flex: 0 0 80%;
  scroll-snap-align: center;
  margin-left: 0;
  margin-right: 0;
}

.attraction-grid.horizontal .attraction-card:first-child {
  margin-left: 1rem;
}

.attraction-grid.horizontal .attraction-card:last-child {
  margin-right: 1rem;
}

/* Responsive vertical grid for other categories */
.attraction-grid.vertical {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  padding: 1rem;
}

@media (min-width: 640px) {
  .attraction-grid.vertical {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .attraction-grid.vertical {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .attraction-grid.vertical {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Card styles */
.attraction-card {
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  will-change: transform;
}

.attraction-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
}

/* Image responsiveness */
.card-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

@media (min-width: 640px) {
  .card-image {
    height: 180px;
  }
}

@media (min-width: 1024px) {
  .card-image {
    height: 200px;
  }
}

.card-content {
  padding: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.95rem;
  color: #333;
}

.card-content h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.card-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.card-content {
  padding: 0.8rem;
}

.card-content h3 {
  margin: 0 0 0.4rem 0;
  font-size: 1rem;
}

.back-floating-btn {
  position: fixed;
  bottom: 1.2rem;
  right: 1.2rem;
  background: rgba(255, 255, 255, 0.8);
  color: #333;
  border: 1px solid #ccc;
  border-radius: 999px;
  padding: 0.6rem 1.1rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  transition: background 0.3s ease;
  z-index: 10;
}

.back-floating-btn:hover {
  border-color: #aaa;
}

.filter-bar {
  padding: 0.5rem 1rem;
  text-align: left;
}

.filter-btn {
  background: rgba(225, 245, 254, 255);
  border: none;
  border-radius: 8px;
  padding: 0.45rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
}

</style>