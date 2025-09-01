<template>
  <div class="city-detail-page">
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

    <!-- Results count display -->
    <div v-if="selectedCategory !== '👍🏼'" class="results-count">
      <span>{{ getResultsCountText(filteredAttractions.length) }}</span>
    </div>

    <!-- FILTERS BAR -->
    <div class="filters-sticky" role="toolbar" aria-label="Фильтры">
      <div class="category-scroll">
        <button
          v-for="category in categories"
          :key="category.name"
          class="chip"
          :class="{ active: selectedCategory === category.name }"
          @click="toggleCategory(category.name)"
          @keydown.enter.prevent="toggleCategory(category.name)"
          role="switch"
          :aria-pressed="selectedCategory === category.name"
          :aria-checked="selectedCategory === category.name"
        >
          <span class="bullet" aria-hidden="true"></span>
          <span class="label">{{ category.name }}</span>
        </button>
      </div>

      <div class="search-section">
        <input
          v-model="searchQuery"
          class="search-input"
          type="search"
          placeholder="Поиск по названию…"
          aria-label="Поиск attractions"
        />
        <button 
          v-if="selectedCategory !== '👍🏼'" 
          class="rating-sort-btn" 
          @click="toggleRatingSort" 
          :title="getRatingSortTitle()"
        >
          <span class="rating-stars">
            <span v-for="i in 5" :key="i" class="star" :class="{ filled: getStarFilled(i) }">⭐</span>
          </span>
          <span class="sort-arrow">{{ getRatingSortIcon() }}</span>
        </button>
        <button class="advanced-filter-btn" @click="handleFilterClick" title="Расширенный фильтр">
          ⚙️
        </button>
      </div>
    </div>

<FilterModal
  v-if="showFilterModal"
  :category="singleSelectedCategory"
  :existingFilters="activeFilters"
  :currentMatchCount="filteredAttractions.length"
  @apply="applyFilters"
  @close="showFilterModal = false"
/>


    <!-- Active filter chips -->
    <div class="active-chips" v-if="contextChips.length">
      <button v-for="chip in contextChips" :key="chip.key" class="chip active" @click="chip.clear()">
        {{ chip.label }} ×
      </button>
      <button class="clear-btn" @click="clearAllFilters">Очистить все</button>
    </div>

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
          <!-- Name and Rating -->
          <div class="card-header">
            <h3 class="attraction-name">{{ attraction.name }}</h3>
            <div class="card-rating" v-if="attraction.rating">
              <span class="stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= attraction.rating }">⭐</span>
              </span>
              <span class="rating-text">{{ attraction.rating }}/5</span>
            </div>
          </div>
          
          <!-- Reviews -->
          <p v-if="attraction.checkedIn" class="participants">👥 {{ getReviewsText(attraction.checkedIn) }}</p>
          
          <!-- Price and Payment Method -->
          <div class="price-section">
            <span v-if="attraction.price === 0" class="price free">🆓 Бесплатно</span>
            <span v-else-if="attraction.price" class="price">💶 {{ attraction.price }} ₽</span>
            
            <!-- Payment method for workshops -->
            <div v-if="selectedCategory === 'Мастер-классы' && (attraction as any)['Оплата']" class="payment-method" :title="(attraction as any)['Оплата']">
              <span v-if="(attraction as any)['Оплата'] === 'наличные'">💵</span>
              <span v-else-if="(attraction as any)['Оплата'] === 'карта'">💳</span>
              <span v-else-if="(attraction as any)['Оплата'] === 'наличные/карта'">💵💳</span>
            </div>
          </div>

          <!-- Facility icons in ONE horizontal line -->
          <div class="facilities-line">
            <!-- Working hours -->
            <div class="facility-icon working-hours-icon" :class="{ available: (attraction as any)['Время работы'], unavailable: !(attraction as any)['Время работы'] }" :title="(attraction as any)['Время работы'] ? `Время работы: ${(attraction as any)['Время работы']}` : 'Нет информации о времени работы'">
              <span v-if="(attraction as any)['Время работы']" class="working-hours-text">🕣 {{ (attraction as any)['Время работы'] }}</span>
              <span v-else class="crossed">🕣</span>
            </div>

            <!-- Cuisine flag for restaurants -->
            <div v-if="selectedCategory === 'Где поесть' && (attraction as any)['Кухня'] && (attraction as any)['Кухня'].length > 0" class="facility-icon cuisine-flag-icon" :title="(attraction as any)['Кухня'][0]">
              {{ getCuisineFlag((attraction as any)['Кухня'][0]) }}
            </div>
            
            <!-- Price indicator for restaurants -->
            <div v-if="selectedCategory === 'Где поесть' && (attraction as any)['Средний чек']" class="facility-icon price-flag-icon" :class="getPriceClass((attraction as any)['Средний чек'])" :title="(attraction as any)['Средний чек']">
              {{ getPriceSymbols((attraction as any)['Средний чек']) }}
            </div>

            <!-- Parking -->
            <div class="facility-icon" :class="{ available: (attraction as any)['Парковка'], unavailable: !(attraction as any)['Парковка'] }" :title="(attraction as any)['Парковка'] ? 'Есть парковка' : 'Нет парковки'">
              <span v-if="(attraction as any)['Парковка']">🅿️</span>
              <span v-else class="crossed">🅿️</span>
            </div>

            <!-- Family friendly -->
            <div class="facility-icon" :class="{ available: (attraction as any)['Семейные'], unavailable: !(attraction as any)['Семейные'] }" :title="(attraction as any)['Семейные'] ? 'Семейное место' : 'Не подходит для семей'">
              <span v-if="(attraction as any)['Семейные']">👨‍👩‍👧‍👦</span>
              <span v-else class="crossed">👨‍👩‍👧‍👦</span>
            </div>

            <!-- Accessibility -->
            <div class="facility-icon" :class="{ available: (attraction as any)['Доступность'], unavailable: !(attraction as any)['Доступность'] }" :title="(attraction as any)['Доступность'] ? 'Доступно для людей с ограниченными возможностями' : 'Недоступно для людей с ограниченными возможностями'">
              <span v-if="(attraction as any)['Доступность']">♿️</span>
              <span v-else class="crossed">♿️</span>
            </div>

            <!-- Wi-Fi -->
            <div class="facility-icon" :class="{ available: (attraction as any)['Wi-Fi'], unavailable: !(attraction as any)['Wi-Fi'] }" :title="(attraction as any)['Wi-Fi'] ? 'Есть Wi-Fi' : 'Нет Wi-Fi'">
              <span v-if="(attraction as any)['Wi-Fi']">📶</span>
              <span v-else class="crossed">📶</span>
            </div>

            <!-- Payment method -->
            <div v-if="(attraction as any)['Оплата']" class="facility-icon payment-icon" :title="(attraction as any)['Оплата']">
              <span v-if="(attraction as any)['Оплата'] === 'наличные'">💵</span>
              <span v-else-if="(attraction as any)['Оплата'] === 'карта'">💳</span>
              <span v-else-if="(attraction as any)['Оплата'] === 'наличные/карта'">💵💳</span>
            </div>

            <!-- Workshop-specific icons -->
            <div v-if="selectedCategory === 'Мастер-классы'" class="facility-icon" :class="{ available: (attraction as any)['Инструктор'], unavailable: !(attraction as any)['Инструктор'] }" :title="(attraction as any)['Инструктор'] ? 'Есть инструктор' : 'Нет инструктора'">
              <span v-if="(attraction as any)['Инструктор']">👨‍🏫</span>
              <span v-else class="crossed">👨‍🏫</span>
            </div>

            <div v-if="selectedCategory === 'Мастер-классы'" class="facility-icon" :class="{ available: (attraction as any)['Сертификат'], unavailable: !(attraction as any)['Сертификат'] }" :title="(attraction as any)['Сертификат'] ? 'Выдается сертификат' : 'Сертификат не выдается'">
              <span v-if="(attraction as any)['Сертификат']">📜</span>
              <span v-else class="crossed">📜</span>
            </div>

            <div v-if="selectedCategory === 'Мастер-классы'" class="facility-icon" :class="{ available: (attraction as any)['Фото/видео'], unavailable: !(attraction as any)['Фото/видео'] }" :title="(attraction as any)['Фото/видео'] ? 'Можно фотографировать/снимать' : 'Фото/видео запрещено'">
              <span v-if="(attraction as any)['Фото/видео']">📸</span>
              <span v-else class="crossed">📸</span>
            </div>

            <div v-if="selectedCategory === 'Мастер-классы'" class="facility-icon" :class="{ available: (attraction as any)['Сменная одежда'], unavailable: !(attraction as any)['Сменная одежда'] }" :title="(attraction as any)['Сменная одежда'] ? 'Есть сменная одежда' : 'Нет сменной одежды'">
              <span v-if="(attraction as any)['Сменная одежда']">👕</span>
              <span v-else class="crossed">👕</span>
            </div>

            <div v-if="selectedCategory === 'Мастер-классы'" class="facility-icon" :class="{ available: (attraction as any)['Душ'], unavailable: !(attraction as any)['Душ'] }" :title="(attraction as any)['Душ'] ? 'Есть душ' : 'Нет душа'">
              <span v-if="(attraction as any)['Душ']">🚿</span>
              <span v-else class="crossed">🚿</span>
            </div>

            <div v-if="selectedCategory === 'Мастер-классы'" class="facility-icon" :class="{ available: (attraction as any)['Wi-Fi'], unavailable: !(attraction as any)['Wi-Fi'] }" :title="(attraction as any)['Wi-Fi'] ? 'Есть Wi-Fi' : 'Нет Wi-Fi'">
              <span v-if="(attraction as any)['Wi-Fi']">📶</span>
              <span v-else class="crossed">📶</span>
            </div>
          </div>
        </div>
  </div>
</div>

    <div v-if="!filteredAttractions.length" class="empty-state">
      <p>Ничего не найдено по текущим фильтрам.</p>
      <div class="empty-actions">
        <button class="filter-btn" @click="clearAllFilters">Сбросить все</button>
      </div>
    </div>

    <button class="back-floating-btn" @click="goBack">
  ← Назад
</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { allAttractions, type Attraction, citiesData } from '../Data'  

import FilterModal from '../components/FilterModal.vue'
import { filterOptions } from '../filterConfig'

const showFilterModal = ref(false)
const activeFilters = ref<Record<string, any>>({})
const searchQuery = ref('')
const activeCategories = ref<string[]>([])
const ratingSortOrder = ref<'asc' | 'desc'>('desc')

// Store filters per category to persist them
const categoryFilters = ref<Record<string, Record<string, any>>>({})


function toggleCategory(name: string) {
  if (selectedCategory.value === name) {
    selectedCategory.value = '👍🏼'
    activeCategories.value = []
  } else {
    selectedCategory.value = name
    activeCategories.value = [name]
    // Load saved filters for this category
    activeFilters.value = categoryFilters.value[name] || {}
  }
}

function clearFilters() {
  activeCategories.value = []
  selectedCategory.value = '👍🏼'
  searchQuery.value = ''
}

function clearAllFilters() {
  clearFilters()
  activeFilters.value = {}
  // Clear filters for current category
  if (selectedCategory.value !== '👍🏼') {
    categoryFilters.value[selectedCategory.value] = {}
  }
}

function applyFilters(newFilters: Record<string, any>) {
  activeFilters.value = newFilters
  const cat = selectedCategory.value
  if (cat && cat !== '👍🏼') {
    activeCategories.value = [cat]
    // Save filters for this category
    categoryFilters.value[cat] = { ...newFilters }
  }
  showFilterModal.value = false
}

const router = useRouter()
const route = useRoute()
const scrollY = ref(0)
function handleScroll() { scrollY.value = window.scrollY }
onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
function goBack() { router.back() }

const cityParam = computed(() => String(route.params.name ?? ''))
const city = computed(() => {
  const list = Array.isArray(citiesData.value) ? citiesData.value : []
  return list.find(c => c.name === cityParam.value)
})

const selectedCategory = ref((route.query.category as string) || '👍🏼')
const singleSelectedCategory = computed(() => {
  return selectedCategory.value
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
  // Ensure the currently selected category is reflected in activeCategories
  if (selectedCategory.value && selectedCategory.value !== '👍🏼') {
    activeCategories.value = [selectedCategory.value]
  }
  if (filterOptions[selectedCategory.value]) showFilterModal.value = true
  else alert('Фильтры для выбранной категории пока не доступны.')
}

// IMPORTANT: allAttractions is a ref → use .value
const quickFilteredAttractions = computed<Attraction[]>(() => {
  const source = Array.isArray(allAttractions.value) ? allAttractions.value : []

  // Start with full list; chips act as include filters (if none selected, keep all)
  let attractions = [...source]
  
  // Filter by selected category
  if (selectedCategory.value !== '👍🏼') {
    attractions = attractions.filter(a => a.categories && a.categories.includes(selectedCategory.value))
  }

  // Quick filters removed - moved to advanced filters

  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    attractions = attractions.filter(a => (a.name || '').toLowerCase().includes(q))
  }

  return attractions
})

const filteredAttractions = computed<Attraction[]>(() => {
  let attractions = [...quickFilteredAttractions.value]
  // Apply advanced modal filters (single category)
  const advCat = selectedCategory.value !== '👍🏼' ? selectedCategory.value : ''
  const adv = activeFilters.value || {}
  if (advCat) {
    attractions = attractions.filter(a => matchesAdvanced(a, advCat, adv))
  }

  // Apply sorting - default to rating descending if no sorting is set
  const sortBy = activeFilters.value?.sortBy || 'rating'
  const sortOrder = activeFilters.value?.sortOrder || 'desc'
  
  if (sortBy === 'rating') {
    attractions.sort((a, b) => {
      const ratingA = a.rating || 0
      const ratingB = b.rating || 0
      if (sortOrder === 'desc') {
        return ratingB - ratingA
      } else {
        return ratingA - ratingB
      }
    })
  }

  return attractions
})

const contextChips = computed(() => {
  const chips: { key: string; label: string; clear: () => void }[] = []
  
  if (selectedCategory.value !== '👍🏼') {
    chips.push({ 
      key: 'cat', 
      label: selectedCategory.value, 
      clear: () => { selectedCategory.value = '👍🏼'; activeCategories.value = [] } 
    })
  }
  
  if (searchQuery.value) {
    chips.push({ 
      key: 'q', 
      label: `Поиск: ${searchQuery.value}`, 
      clear: () => (searchQuery.value = '') 
    })
  }
  
  Object.entries(activeFilters.value || {}).forEach(([k, v]) => {
    // Skip sortBy and sortOrder as they're handled by the rating sort button
    if (k === 'sortBy' || k === 'sortOrder') return
    
    if (Array.isArray(v) && v.length) {
      chips.push({ 
        key: `adv-${k}`, 
        label: `${getFilterLabel(k)}: ${v.join(', ')}`, 
        clear: () => (activeFilters.value[k] = []) 
      })
    } else if (typeof v === 'string' && v) {
      chips.push({ 
        key: `adv-${k}`, 
        label: `${getFilterLabel(k)}: ${getFilterValueLabel(k, v)}`, 
        clear: () => (activeFilters.value[k] = '') 
      })
    }
  })
  
  return chips
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
      if (Array.isArray(f['Кухня']) && f['Кухня'].length) {
        const have = (a['Кухня'] || []).map(lc)
        const want = f['Кухня'].map(lc)
        if (!want.some((w: string) => have.includes(w))) return false
      }
      if (f['Средний чек'] && lc(a['Средний чек']) !== lc(f['Средний чек'])) return false
      if (f['Тип заведения'] && lc(f['Тип заведения']) && lc(a['Тип заведения']) !== lc(f['Тип заведения'])) return false
      if (f['Завтраки']) {
        const need = isYes(f['Завтраки'])
        if (((a as any)['Завтраки'] ?? false) !== need) return false
      }
      if (f['Бронирование']) {
        const need = isYes(f['Бронирование'])
        if ((a['Бронирование'] ?? false) !== need) return false
      }
      if (f['Открыто сейчас']) {
        const need = isYes(f['Открыто сейчас'])
        // This would need to be implemented based on current time vs working hours
        // For now, we'll assume it's available if working hours exist
        const hasWorkingHours = !!(a['Время работы'])
        if (hasWorkingHours !== need) return false
      }
      return true
    }
    case 'Экскурсии': {
      if (f['Ценовой диапазон'] && !inRange(a.price, f['Ценовой диапазон'])) return false
      if (f['Тип экскурсии'] && lc(a['Тип экскурсии']) !== lc(f['Тип экскурсии'])) return false
      if (f['Тип транспорта'] && lc(a['Тип транспорта']) !== lc(f['Тип транспорта'])) return false
      if (f['Продолжительность'] && lc(a['Длительность']) !== lc(f['Продолжительность'])) return false
      if (f['Доступность'] && (a['Доступность'] ?? false) !== isYes(f['Доступность'])) return false
      if (f['Сезон'] && lc(a['Сезон']) !== lc(f['Сезон'])) return false
      return true
    }
    case 'Размещение': {
      if (f['Звезды'] && lc(String(a['Звезды'])) !== lc(String(f['Звезды']).replace('★',''))) return false
      if (f['Ценовой диапазон'] && !inRange(a.price, f['Ценовой диапазон'])) return false
      if (Array.isArray(f['Удобства']) && f['Удобства'].length) {
        const have = (a['Удобства'] || []).map(lc)
        const want = f['Удобства'].map(lc)
        if (!want.every((w: string) => have.includes(w))) return false
      }
      if (f['Семейные'] && (a['Семейные'] ?? false) !== isYes(f['Семейные'])) return false
      if (f['С животными'] && (a['С животными'] ?? false) !== isYes(f['С животными'])) return false
      return true
    }
    default: {
      // Generic pass-through for other categories using simple mappings
      if (f['Цена билета'] && !inRange(a['Цена билета'], f['Цена билета'])) return false
      if (f['Бесплатные дни'] && (a['Бесплатные дни'] ?? false) !== isYes(f['Бесплатные дни'])) return false
      if (f['Доступность'] && (a['Доступность'] ?? false) !== isYes(f['Доступность'])) return false
      if (Array.isArray(f['Инфраструктура']) && f['Инфраструктура'].length) {
        const have = (a['Инфраструктура'] || []).map(lc)
        const want = f['Инфраструктура'].map(lc)
        if (!want.every((w: string) => have.includes(w))) return false
      }
      if (f['Жанр'] && lc(a['Жанр']) !== lc(f['Жанр'])) return false
      if (f['Период'] && lc(a['Период']) !== lc(f['Период'])) return false
      if (f['Формат']) {
        const needIn = lc(f['Формат']) === 'в помещении'
        const ok = needIn ? a.indoor === true : a.outdoor === true
        if (!ok) return false
      }
      if (f['Мин возраст'] && !inRange(a['Мин возраст'], f['Мин возраст'])) return false
      if (f['Снаряжение включено'] && (a['Снаряжение включено'] ?? false) !== isYes(f['Снаряжение включено'])) return false
      return true
    }
  }
}

function goToAttraction(attraction: Attraction) {
  router.push({ 
    name: 'city-event-detail', 
    params: { 
      cityName: cityParam.value, 
      eventId: attraction.id 
    } 
  })
}

function getCuisineFlag(cuisine: string): string {
  const flagMap: Record<string, string> = {
    'Русская': '🇷🇺',
    'Европейская': '🇪🇺',
    'Итальянская': '🇮🇹',
    'Японская': '🇯🇵',
    'Китайская': '🇨🇳',
    'Индийская': '🇮🇳',
    'Мексиканская': '🇲🇽',
    'Тайская': '🇹🇭',
    'Корейская': '🇰🇷',
    'Французская': '🇫🇷',
    'Немецкая': '🇩🇪',
    'Испанская': '🇪🇸',
    'Греческая': '🇬🇷',
    'Турецкая': '🇹🇷',
    'Арабская': '🇸🇦',
    'Балтийская': '🌊',
    'Американская': '🇺🇸',
    'Вегетарианская': '🥬',
    'Веганская': '🌱',
    'Фастфуд': '🍔',
    'Морепродукты': '🦐',
    'Стейк-хаус': '🥩',
    'Азиатская': '🍜'
  }
  return flagMap[cuisine] || '🍽️'
}

function getPriceSymbols(avgCheck: string): string {
  const price = avgCheck.toLowerCase()
  if (price.includes('300-800') || price.includes('бюджетные') || price.includes('дешево') || price.includes('недорого')) {
    return '$'
  } else if (price.includes('800-1500') || price.includes('средние') || price.includes('средне') || price.includes('нормально')) {
    return '$$'
  } else if (price.includes('1500-2500') || price.includes('дорогие') || price.includes('дорого') || price.includes('высоко')) {
    return '$$$'
  } else if (price.includes('2500+') || price.includes('премиум') || price.includes('очень дорого')) {
    return '$$$$'
  }
  return '$$'
}

function getPriceClass(avgCheck: string): string {
  const price = avgCheck.toLowerCase()
  if (price.includes('300-800') || price.includes('бюджетные') || price.includes('дешево') || price.includes('недорого')) {
    return 'price-cheap'
  } else if (price.includes('800-1500') || price.includes('средние') || price.includes('средне') || price.includes('нормально')) {
    return 'price-affordable'
  } else if (price.includes('1500-2500') || price.includes('дорогие') || price.includes('дорого') || price.includes('высоко')) {
    return 'price-expensive'
  } else if (price.includes('2500+') || price.includes('премиум') || price.includes('очень дорого')) {
    return 'price-premium'
  }
  return 'price-affordable'
}



function getResultsCountText(count: number): string {
  if (count === 0) {
    return 'Ничего не найдено';
  } else if (count === 1) {
    return '1 место найдено';
  } else if (count >= 2 && count <= 4) {
    return `${count} места найдено`;
  } else {
    return `${count} мест найдено`;
  }
}

function getReviewsText(count: number): string {
  if (count === 1) {
    return '1 отзыв';
  } else if (count >= 2 && count <= 4) {
    return `${count} отзыва`;
  } else if (count >= 5 && count <= 20) {
    return `${count} отзывов`;
  } else {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return `${count} отзывов`;
    } else if (lastDigit === 1) {
      return `${count} отзыв`;
    } else if (lastDigit >= 2 && lastDigit <= 4) {
      return `${count} отзыва`;
    } else {
      return `${count} отзывов`;
    }
  }
}

function toggleRatingSort() {
  ratingSortOrder.value = ratingSortOrder.value === 'desc' ? 'asc' : 'desc'
  // Update active filters to trigger re-sorting
  activeFilters.value = { ...activeFilters.value, sortBy: 'rating', sortOrder: ratingSortOrder.value }
}

function getRatingSortTitle(): string {
  return ratingSortOrder.value === 'desc' ? 'Сортировка по рейтингу (по убыванию)' : 'Сортировка по рейтингу (по возрастанию)'
}

function getRatingSortIcon(): string {
  return ratingSortOrder.value === 'desc' ? '↓' : '↑'
}

function getStarFilled(starIndex: number): boolean {
  if (ratingSortOrder.value === 'desc') {
    // Descending: all 5 stars filled (5,4,3,2,1)
    return true
  } else {
    // Ascending: only 1 star filled (1,2,3,4,5)
    return starIndex === 1
  }
}

function getFilterLabel(key: string): string {
  const labelMap: Record<string, string> = {
    'Кухня': 'Кухня',
    'Средний чек': 'Средний чек',
    'Тип заведения': 'Тип заведения',
    'Завтраки': 'Завтраки',
    'Бронирование': 'Бронирование',
    'Открыто сейчас': 'Открыто сейчас',
    'Ценовой диапазон': 'Цена',
    'Тип экскурсии': 'Тип экскурсии',
    'Тип транспорта': 'Тип транспорта',
    'Продолжительность': 'Продолжительность',
    'Доступность': 'Доступность',

    'Сезон': 'Сезон',

    'Звезды': 'Звезды',
    'Удобства': 'Удобства',
    'С животными': 'С животными',
    'Период': 'Период',
    'Цена билета': 'Цена билета',
    'Бесплатные дни': 'Бесплатные дни',
    'Инфраструктура': 'Инфраструктура',
    'Жанр': 'Жанр',
    'Время начала': 'Время начала',
    'Время сеанса': 'Время сеанса',
    'Материалы включены': 'Материалы включены',
    'Мин возраст': 'Мин. возраст',
    'Формат': 'Формат',
    'Снаряжение включено': 'Снаряжение включено',
    'Тематика': 'Тематика',
    'Тип': 'Тип',
    'Стоимость': 'Стоимость',
    'Для детей': 'Для детей',
    'Бюджет': 'Бюджет',
    'С собаками': 'С собаками'
  }
  return labelMap[key] || key
}

function getFilterValueLabel(key: string, value: string): string {
  const valueMap: Record<string, Record<string, string>> = {
    'Средний чек': {
      '300-800': '300-800 ₽',
      '800-1500': '800-1500 ₽',
      '1500-2500': '1500-2500 ₽',
      '2500+': '2500+ ₽',
      'бюджетные': '300-800 ₽',
      'средние': '800-1500 ₽',
      'дорогие': '1500-2500 ₽',
      'премиум': '2500+ ₽'
    },
    'Бронирование': {
      'да': 'Есть',
      'нет': 'Нет'
    },
    'Завтраки': {
      'да': 'Есть',
      'нет': 'Нет'
    },
    'Доступность': {
      'да': 'Есть',
      'нет': 'Нет'
    },
    'Семейные': {
      'да': 'Есть',
      'нет': 'Нет'
    },
    'С животными': {
      'да': 'Есть',
      'нет': 'Нет'
    },
    'Бесплатные дни': {
      'да': 'Есть',
      'нет': 'Нет'
    },
    'Снаряжение включено': {
      'да': 'Есть',
      'нет': 'Нет'
    },
    'Материалы включены': {
      'да': 'Есть',
      'нет': 'Нет'
    },
    'Собаками': {
      'да': 'Есть',
      'нет': 'Нет'
    },
    'Формат': {
      'в помещении': 'В помещении',
      'на улице': 'На улице'
    }
  }
  
  return valueMap[key]?.[value] || value
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
  background: transparent;
  padding: 0.6rem 1.3rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  text-align: center;
}

.city-name {
  color: #fff;
  font-size: 1.4rem;
  font-weight: 600;
  background-color: transparent;
  margin: 0;
}

.category-title {
  color: #fff;
  font-size: clamp(1rem, 4vw, 1.2rem);
  font-weight: 500;
  background-color: transparent;
  margin: 0.5rem 0 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90vw;
}

.city-description {
  padding: 1rem 1rem 0.2rem;
  font-size: 1rem;
  line-height: 1.6;
  text-align: justify;
  color: #333;
}

.results-count {
  text-align: center;
  padding: 0.5rem 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
}

.category-scroll {
  display: flex;
  overflow-x: auto;
  padding: 0.5rem 1rem;
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

.attraction-grid {
  padding: 1rem 0;
}

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
  padding: 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.2rem;
  gap: 0.5rem;
}

.attraction-name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
  line-height: 1.3;
  min-width: 0;
}

.card-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
}

.stars {
  display: flex;
  gap: 1px;
}

.star {
  font-size: 0.8rem;
  opacity: 0.3;
}

.star.filled {
  opacity: 1;
}

.rating-text {
  color: #1f2937;
  font-weight: 600;
  font-size: 0.8rem;
}

.participants {
  margin: 0.2rem 0;
  font-size: 0.9rem;
  color: #3b82f6;
  font-weight: 500;
}

.price-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.2rem 0;
}

.price {
  font-weight: 600;
  color: #059669;
}

.price.free {
  color: #059669;
}

.payment-method {
  display: inline-flex;
  align-items: center;
  margin-left: 0.5rem;
  font-size: 0.9rem;
}

.payment-icon {
  background: #f8fafc;
  border-color: #9ca3af;
  color: #1f2937;
}

.facilities-line {
  display: flex;
  flex-wrap: wrap;
  gap: 0.15rem;
  margin-top: 0.1rem;
}

.facility-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  font-size: 1.6rem;
  border: 2px solid #9ca3af;
  background: #f8fafc;
  position: relative;
  cursor: help;
  color: #1f2937;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0;
}

.facility-icon.available {
  background: #f8fafc;
  border-color: #9ca3af;
  color: #1f2937;
}

.facility-icon.unavailable {
  background: #f8fafc;
  border-color: #9ca3af;
  color: #6b7280;
  opacity: 0.7;
}

.facility-icon.crossed {
  position: relative;
}

.crossed::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120%;
  height: 2px;
  background: #ef4444;
  transform: translate(-50%, -50%) rotate(-45deg);
  border-radius: 1px;
}

.cuisine-flag-icon {
  background: #f8fafc;
  border-color: #9ca3af;
  color: #1f2937;
}

.price-flag-icon {
  background: #f8fafc;
  border-color: #9ca3af;
  color: #1f2937;
  font-weight: 600;
  min-width: 48px;
  width: auto;
  padding: 0 0.5rem;
}

/* Working hours responsive styling */
.working-hours-icon {
  min-width: auto !important;
  width: auto !important;
  padding: 0 0.5rem !important;
  white-space: nowrap;
}

.working-hours-text {
  font-size: 0.85rem;
  line-height: 1.2;
}

/* Responsive adjustments for smaller screens */
@media (max-width: 768px) {
  .working-hours-icon {
    padding: 0 0.25rem !important;
  }
  
  .working-hours-text {
    font-size: 0.8rem;
  }
  
  .facilities-line {
    gap: 0.1rem;
  }
  
  .facility-icon {
    width: 40px;
    height: 40px;
    font-size: 1.4rem;
  }
}

@media (max-width: 480px) {
  .working-hours-text {
    font-size: 0.75rem;
  }
  
  .facility-icon {
    width: 38px;
    height: 38px;
    font-size: 1.3rem;
  }
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
  padding: 0.25rem 0.3rem 0.5rem; 
}

.category-scroll {
  display: flex;
  overflow-x: auto;
  padding: 0.5rem 0.5rem; /* added horizontal padding */
  gap: 0.5rem;
  -ms-overflow-style: none; /* IE/Edge */
  scrollbar-width: none; /* Firefox */
  -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 16px, #000 calc(100% - 16px), transparent 100%);
  mask-image: linear-gradient(90deg, transparent 0, #000 16px, #000 calc(100% - 16px), transparent 100%);
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

.search-section { 
  display: flex; 
  align-items: center; 
  gap: 0.5rem; 
  width: 90%; 
  margin: 0 auto; 
  padding: 0 1rem; 
}
.search-input { 
  border: 1px solid rgba(0,0,0,0.12); 
  border-radius: 8px; 
  padding: 0.45rem 0.4rem; 
  flex: 1;
  min-width: 200px;
  margin-left: 0.5rem; 
}

.advanced-filter-btn {
  background: #f8fafc;
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 8px;
  padding: 0.45rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  min-width: 40px;
  height: 40px;
  font-size: 16px;
  line-height: 1;
}

.advanced-filter-btn:hover {
  background: #e2e8f0;
  border-color: rgba(0,0,0,0.2);
}

.rating-sort-btn {
  background: #f8fafc;
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 8px;
  padding: 0.45rem 0.6rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  transition: all 0.2s ease;
  min-width: 60px;
  height: 40px;
  font-size: 12px;
  line-height: 1;
  font-weight: 600;
}

.rating-stars {
  display: flex;
  gap: 1px;
}

.rating-stars .star {
  font-size: 10px;
  opacity: 0.3;
  transition: opacity 0.2s ease;
}

.rating-stars .star.filled {
  opacity: 1;
}

.sort-arrow {
  font-size: 12px;
  font-weight: bold;
  color: #1f2937;
}

.rating-sort-btn:hover {
  background: #e2e8f0;
  border-color: rgba(0,0,0,0.2);
}
/* .toggle { display: inline-flex; align-items: center; gap: 0.35rem; background: rgba(225,245,254,255); border-radius: 8px; padding: 0.35rem 0.6rem; } */
.clear-btn { background: transparent; border: 1px solid rgba(0,0,0,0.12); border-radius: 8px; padding: 0.35rem 0.6rem; white-space: nowrap; }
.result-count { font-size: 0.86rem; opacity: 0.75; }

/* Make the search section responsive */
.filters-sticky .search-section > * { flex: 0 0 auto; }

/* Responsive search section */
@media (max-width: 1200px) {
  .search-section {
    width: 95%;
  }
}

@media (max-width: 768px) {
  .search-section {
    width: 98%;
    padding: 0 0.5rem;
  }
  
  .search-input {
    min-width: 150px;
  }
}

@media (max-width: 480px) {
  .search-section {
    width: 100%;
    padding: 0 0.25rem;
  }
  
  .search-input {
    min-width: 120px;
  }
}

@media (max-width: 420px) { 
  .result-count { display: none; } 
}

.active-chips { display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 1rem; flex-wrap: nowrap; overflow-x: auto; -ms-overflow-style: none; scrollbar-width: none; }
.active-chips::-webkit-scrollbar { display: none; }
.chips-title { font-size: 0.85rem; opacity: 0.7; margin-right: 0.25rem; }
.xchip { border: 1px solid rgba(0,0,0,0.1); background: #f5f7fb; border-radius: 999px; padding: 0.3rem 0.6rem; font-size: 0.88rem; }
.xchip.clear-all { background: #fff0f0; border-color: #ffd9d9; }
.empty-state { text-align: center; padding: 1rem; color: #555; }
.empty-actions { display: flex; justify-content: center; gap: 0.5rem; margin-top: 0.5rem; }

</style>