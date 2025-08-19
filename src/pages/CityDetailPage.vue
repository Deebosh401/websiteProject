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

    <!-- FILTERS BAR -->
    <div class="filters-sticky" role="group" aria-label="Фильтры">
      <div class="category-scroll">
        <button
          v-for="category in categories"
          :key="category.name"
          class="chip"
          :class="{ active: activeCategories.includes(category.name) }"
          @click="toggleCategory(category.name)"
          @keydown.enter.prevent="toggleCategory(category.name)"
          role="switch"
          :aria-checked="activeCategories.includes(category.name)"
        >
          <span class="bullet" aria-hidden="true"></span>
          <span class="label">{{ category.name }}</span>
        </button>
      </div>

      <div class="quick-filters">
        <input
          v-model="searchQuery"
          class="search-input"
          type="search"
          placeholder="Поиск по названию…"
          aria-label="Поиск attractions"
        />
        <label class="toggle">
          <input type="checkbox" v-model="freeOnly" />
          <span>Бесплатно</span>
        </label>
        <label class="toggle">
          <input type="checkbox" v-model="cheapOnly" />
          <span>Недорого</span>
        </label>
        <label class="toggle">
          <input type="checkbox" v-model="rating4p" />
          <span>Рейтинг 4+</span>
        </label>
        <label class="toggle">
          <input type="checkbox" v-model="familyOnly" />
          <span>Семейные</span>
        </label>
        <label class="toggle">
          <input type="checkbox" v-model="accessibleOnly" />
          <span>Доступно</span>
        </label>
        <button class="clear-btn" v-if="hasActiveFilters" @click="clearFilters">Сбросить</button>
        <span class="result-count" aria-live="polite">Найдено: {{ filteredAttractions.length }}</span>
      </div>
    </div>

    <div class="filter-bar">
      <button class="filter-btn" @click="handleFilterClick">Расширенный фильтр</button>
    </div>

<FilterModal
  v-if="showFilterModal"
  :category="singleSelectedCategory"
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
const searchQuery = ref('')
const freeOnly = ref(false)
const cheapOnly = ref(false)
const rating4p = ref(false)
const familyOnly = ref(false)
const accessibleOnly = ref(false)
const activeCategories = ref<string[]>([])

const hasActiveFilters = computed(() =>
  freeOnly.value || cheapOnly.value || rating4p.value || familyOnly.value || accessibleOnly.value ||
  searchQuery.value.trim().length > 0 || activeCategories.value.length > 0
)

function toggleCategory(name: string) {
  // Enforce SINGLE category selection
  if (activeCategories.value.length === 1 && activeCategories.value[0] === name) {
    // Tapping the same chip clears the selection (back to "All")
    activeCategories.value = []
    selectedCategory.value = '👍🏼'
  } else {
    activeCategories.value = [name]
    selectedCategory.value = name
  }
}

function clearFilters() {
  activeCategories.value = []
  searchQuery.value = ''
  freeOnly.value = false
  cheapOnly.value = false
  rating4p.value = false
  familyOnly.value = false
  accessibleOnly.value = false
}

function applyFilters(newFilters: Record<string, any>) {
  activeFilters.value = newFilters
  // Ensure the currently filtered category stays visually selected
  const cat = singleSelectedCategory.value
  if (cat && cat !== '👍🏼') activeCategories.value = [cat]
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

const selectedCategory = ref((route.query.category as string) || '👍🏼')
const singleSelectedCategory = computed(() => {
  if (activeCategories.value.length > 0) return activeCategories.value[0]
  return selectedCategory.value
})
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
  // Snap the chip selection to the current category if none selected yet
  if (!activeCategories.value.length && selectedCategory.value && selectedCategory.value !== '👍🏼') {
    activeCategories.value = [selectedCategory.value]
  }
  if (filterOptions[selectedCategory.value]) showFilterModal.value = true
  else alert('Фильтры для выбранной категории пока не доступны.')
}

// IMPORTANT: allAttractions is a ref → use .value
const filteredAttractions = computed<Attraction[]>(() => {
  const source = Array.isArray(allAttractions.value) ? allAttractions.value : []

  // Start with full list; chips act as include filters (if none selected, keep all)
  let attractions = [...source]
  const cats = activeCategories.value.length
    ? activeCategories.value
    : (selectedCategory.value === '👍🏼' ? [] : [selectedCategory.value])

  if (cats.length > 0) {
    attractions = attractions.filter(a => cats.includes(a.category))
  }

  if (freeOnly.value) {
    attractions = attractions.filter(a => a.price === 0)
  }
  if (cheapOnly.value) {
    attractions = attractions.filter(a => typeof a.price === 'number' && a.price > 0 && a.price < 1000)
  }
  if (rating4p.value) {
    attractions = attractions.filter(a => (a.rating || 0) >= 4)
  }
  if (familyOnly.value) {
    attractions = attractions.filter(a => a.familyFriendly === true)
  }
  if (accessibleOnly.value) {
    attractions = attractions.filter(a => a.accessible === true)
  }

  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    attractions = attractions.filter(a => (a.name || '').toLowerCase().includes(q))
  }

  // Apply advanced modal filters (single category at a time)
  const advCat = activeCategories.value[0] || (selectedCategory.value !== '👍🏼' ? selectedCategory.value : '')
  const adv = activeFilters.value || {}
  if (advCat) {
    attractions = attractions.filter(a => matchesAdvanced(a, advCat, adv))
  }

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

function matchesAdvanced(a: Attraction, category: string, f: Record<string, any>): boolean {
  const lc = (s: any) => String(s ?? '').toLowerCase()
  const isYes = (v: any) => lc(v) === 'да'
  const inRange = (val: any, rng: any) => {
    if (!Array.isArray(rng) || rng.length < 2) return true
    const n = Number(val)
    if (Number.isNaN(n)) return true
    return n >= Number(rng[0]) && n <= Number(rng[1])
  }

  switch (category) {
    case 'Где поесть': {
      if (Array.isArray(f.cuisine) && f.cuisine.length) {
        const have = (a.cuisine || []).map(lc)
        const want = f.cuisine.map(lc)
        if (!want.some((w: string) => have.includes(w))) return false
      }
      if (f.priceRange && !inRange(a.price, f.priceRange)) return false
      if (f.placeType && lc(f.placeType) && lc(a.placeType) !== lc(f.placeType)) return false
      if (f.canReserve) {
        const need = isYes(f.canReserve)
        if ((a.canReserve ?? false) !== need) return false
      }
      // time filter omitted for simplicity
      return true
    }
    case 'Экскурсии': {
      if (f.priceRange && !inRange(a.price, f.priceRange)) return false
      if (f.excursionType && lc(a.excursionType) !== lc(f.excursionType)) return false
      if (f.transportType && lc(a.transportType) !== lc(f.transportType)) return false
      if (f.duration && lc(a.duration) !== lc(f.duration)) return false
      if (f.accessible && (a.accessible ?? false) !== isYes(f.accessible)) return false
      if (f.familyFriendly && (a.familyFriendly ?? false) !== isYes(f.familyFriendly)) return false
      if (f.season && lc(a.season) !== lc(f.season)) return false
      if (f.difficulty && lc(a.difficulty) !== lc(f.difficulty)) return false
      return true
    }
    case 'Размещение': {
      if (f.stars && lc(String(a.stars)) !== lc(String(f.stars).replace('★',''))) return false
      if (f.priceRange && !inRange(a.price, f.priceRange)) return false
      if (Array.isArray(f.amenities) && f.amenities.length) {
        const have = (a.amenities || []).map(lc)
        const want = f.amenities.map(lc)
        if (!want.every((w: string) => have.includes(w))) return false
      }
      if (f.familyFriendly && (a.familyFriendly ?? false) !== isYes(f.familyFriendly)) return false
      if (f.dogFriendly && (a.dogFriendly ?? false) !== isYes(f.dogFriendly)) return false
      return true
    }
    default: {
      // Generic pass-through for other categories using simple mappings
      if (f.ticketPrice && !inRange(a.ticketPrice, f.ticketPrice)) return false
      if (f.freeDay && (a.freeDay ?? false) !== isYes(f.freeDay)) return false
      if (f.accessible && (a.accessible ?? false) !== isYes(f.accessible)) return false
      if (Array.isArray(f.amenities) && f.amenities.length) {
        const have = (a.amenities || []).map(lc)
        const want = f.amenities.map(lc)
        if (!want.every((w: string) => have.includes(w))) return false
      }
      if (f.genre && lc(a.genre) !== lc(f.genre)) return false
      if (f.period && lc(a.period) !== lc(f.period)) return false
      if (f.indoorOutdoor) {
        const needIn = lc(f.indoorOutdoor) === 'indoor'
        const ok = needIn ? a.indoor === true : a.outdoor === true
        if (!ok) return false
      }
      if (f.minAge && !inRange(a.minAge, f.minAge)) return false
      if (f.gearIncluded && (a.gearIncluded ?? false) !== isYes(f.gearIncluded)) return false
      return true
    }
  }
}

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
  width: 100%;
  margin: 0 auto;
  background: rgba(225, 245, 254, 0.18);
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

.filters-sticky {
  position: sticky;
  top: 0;
  z-index: 5;
  background: transparent;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  padding-bottom: 0.25rem;
}

.category-scroll {
  display: flex;
  overflow-x: auto;
  padding: 0.5rem 0.7rem;
  gap: 0.5rem;
  -ms-overflow-style: none; /* IE/Edge */
  scrollbar-width: none; /* Firefox */
}
.category-scroll::-webkit-scrollbar { display: none; }

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.38rem 0.75rem;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  flex: 0 0 auto;
  cursor: pointer;
  transition: transform 140ms ease, box-shadow 160ms ease, background 160ms ease;
}
.chip .bullet { width: 8px; height: 8px; border-radius: 999px; background: rgba(37,99,235,0.25); box-shadow: inset 0 0 0 2px rgba(37,99,235,0.35); }
.chip.active .bullet { background: #2563eb; box-shadow: 0 0 0 4px rgba(37,99,235,0.18); }
.chip .label { white-space: nowrap; font-weight: 600; }
.chip.active { background: #f3f7ff; border-color: rgba(37,99,235,0.35); box-shadow: 0 4px 12px rgba(37,99,235,0.15); transform: translateY(-1px); }

.quick-filters { display: flex; align-items: center; gap: 0.5rem; margin-left: auto; overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch; scroll-snap-type: x proximity; -ms-overflow-style: none; scrollbar-width: none; }
.quick-filters::-webkit-scrollbar { display: none; }
.search-input { border: 1px solid rgba(0,0,0,0.12); border-radius: 8px; padding: 0.45rem 0.6rem; min-width: 130px; width: 180px;margin-left: 0.5rem; }
.toggle { display: inline-flex; align-items: center; gap: 0.35rem; background: rgba(225,245,254,255); border-radius: 8px; padding: 0.35rem 0.6rem; }
.clear-btn { background: transparent; border: 1px solid rgba(0,0,0,0.12); border-radius: 8px; padding: 0.35rem 0.6rem; }
.result-count { font-size: 0.86rem; opacity: 0.75; }

/* Make the filters row responsive and prevent horizontal overflow */
.filters-sticky .quick-filters > * { flex: 0 0 auto; scroll-snap-align: start; }

@media (max-width: 420px) { .result-count { display: none; } }

</style>