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

    <div v-if="recentCategories.length > 0" class="recent-categories">
      <div class="recent-header">
        <span class="recent-title">Недавно просмотренные</span>
        <button class="clear-history-btn" @click="clearHistory" title="Очистить историю">
          <Icon icon="mdi:delete-outline" />
        </button>
      </div>
      <div class="recent-chips">
        <button
          v-for="category in recentCategories.slice(0, 3)"
          :key="category"
          class="recent-chip"
          @click="goToCategory(category)"
          :title="`Перейти к категории: ${category}`"
        >
          {{ category }}
        </button>
      </div>
    </div>

    <div v-if="selectedCategory !== 'Топ'" class="results-count">
      <span>{{ getResultsCountText(filteredAttractions.length) }}</span>
    </div>

    <div class="categories-bar">
      <div class="category-scroll">
        <button
          v-for="category in categories"
          :key="category.name"
          class="category-btn"
          :class="{ active: selectedCategory === category.name }"
          @click="toggleCategory(category.name)"
          @touchend.prevent="toggleCategory(category.name)"
          @keydown.enter.prevent="toggleCategory(category.name)"
          role="switch"
          :aria-pressed="selectedCategory === category.name"
          :aria-checked="selectedCategory === category.name"
        >
          {{ category.name }}
        </button>
      </div>
      </div>

    <div class="search-sticky" role="toolbar" aria-label="Поиск и фильтры">
      <div class="search-section">
        <input
          v-model="searchQuery"
          class="search-input"
          type="search"
          placeholder="Поиск..."
          aria-label="Поиск attractions"
        />
        <button 
          v-if="selectedCategory !== 'Топ'" 
          class="rating-sort-btn" 
          @click="toggleRatingSort" 
          :title="getRatingSortTitle()"
        >
          <span class="rating-stars">
            <Icon v-for="i in 5" :key="i" class="star" :class="{ filled: getStarFilled(i), [getStarSize(i)]: true }" icon="lucide:star" />
          </span>
          <span class="sort-arrow">{{ getRatingSortIcon() }}</span>
        </button>
        <button class="advanced-filter-btn" @click="handleFilterClick" title="Расширенный фильтр">
          <Icon icon="mdi:filter-variant" />
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


    <div class="active-chips" v-if="contextChips.length">
      <button class="clear-btn" @click="clearAllFilters">Очистить все</button>
      <div v-for="chip in contextChips" :key="chip.key" class="filter-chip-container">
        <span class="filter-chip-label">{{ chip.label }}</span>
        <button class="filter-chip-remove" @click="chip.clear()" aria-label="Удалить фильтр">
          ×
        </button>
      </div>
    </div>

<div
  :class="['attraction-grid', { horizontal: false, vertical: true }]"
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
          <div class="card-header">
            <h3 class="attraction-name">{{ attraction.name }}</h3>
            <div class="card-rating" v-if="attraction.rating">
              <StarRating :rating="attraction.rating" :show-text="true" />
            </div>
          </div>
          
          <p v-if="getReviewCount(attraction.id) > 0" class="participants"><Icon icon="mdi:account-group" /> {{ getReviewsText(getReviewCount(attraction.id)) }}</p>
          
          <div class="price-section">
            <span v-if="attraction.price === 0" class="price free"><Icon icon="mdi:gift" /> Бесплатно</span>
            <span v-else-if="attraction.price" class="price"><Icon icon="mdi:currency-rub" /> {{ attraction.price }}</span>
            
            <div v-if="selectedCategory === 'Мастер-классы' && (attraction as any)['Оплата'] && ((attraction as any)['Оплата'] === 'наличные' || (attraction as any)['Оплата'] === 'наличные/карта')" class="facility-icon" title="Принимает наличные">
              <Icon icon="mdi:cash" />
            </div>

            <div v-if="selectedCategory === 'Мастер-классы' && (attraction as any)['Оплата'] && ((attraction as any)['Оплата'] === 'карта' || (attraction as any)['Оплата'] === 'наличные/карта')" class="facility-icon" title="Принимает карты">
              <Icon icon="mdi:credit-card" />
            </div>
          </div>

          <div v-if="attraction.categories && attraction.categories.length" class="card-categories">
            <span v-for="category in attraction.categories" :key="category" class="category-chip">
              {{ category }}
            </span>
          </div>

          <div class="facilities-line">
            <div v-if="(attraction as any)['Время работы']" class="facility-icon working-hours-icon" :title="`Время работы: ${(attraction as any)['Время работы']}`">
              <span class="working-hours-text"><Icon icon="mdi:clock-outline" /> {{ (attraction as any)['Время работы'] }}</span>
            </div>

            <div v-if="selectedCategory === 'Где поесть' && (attraction as any)['Кухня'] && (attraction as any)['Кухня'].length > 0" class="facility-icon cuisine-chip" :title="(attraction as any)['Кухня'][0]" :style="getCuisineChipStyle((attraction as any)['Кухня'][0])">
              {{ getCuisineFlag((attraction as any)['Кухня'][0]) }}
            </div>
            
            <!-- <div v-if="selectedCategory === 'Где поесть' && (attraction as any)['Средний чек']" class="facility-icon price-flag-icon" :class="getPriceClass((attraction as any)['Средний чек'])" :title="(attraction as any)['Средний чек']">
              {{ getPriceSymbols((attraction as any)['Средний чек']) }}
            </div> -->

            <div v-if="(attraction as any)['Парковка']" class="facility-icon parking-icon" :title="getParkingType(attraction).title">
              <div class="parking-combined">
                <Icon icon="mdi:car" class="parking-main-icon" />
                <span class="parking-type-badge">{{ getParkingType(attraction).badge }}</span>
              </div>
            </div>

            <div v-if="(attraction as any)['Семейные']" class="facility-icon" title="Подходит для семьи">
              <Icon icon="mdi:account-group" />
            </div>

            <div v-if="(attraction as any)['Доступность']" class="facility-icon" title="Доступно для людей с ограниченными возможностями">
              <Icon icon="mdi:wheelchair-accessibility" />
            </div>

            <div v-if="(attraction as any)['Wi-Fi']" class="facility-icon" title="Есть Wi-Fi">
              <Icon icon="mdi:wifi" />
            </div>

            <div v-if="(attraction as any)['Оплата'] && ((attraction as any)['Оплата'] === 'наличные' || (attraction as any)['Оплата'] === 'наличные/карта')" class="facility-icon" title="Принимает наличные">
              <Icon icon="mdi:cash" />
            </div>

            <div v-if="(attraction as any)['Оплата'] && ((attraction as any)['Оплата'] === 'карта' || (attraction as any)['Оплата'] === 'наличные/карта')" class="facility-icon" title="Принимает карты">
              <Icon icon="mdi:credit-card" />
            </div>

            <div v-if="selectedCategory === 'Мастер-классы' && (attraction as any)['Инструктор']" class="facility-icon" title="Есть инструктор">
              <Icon icon="mdi:account-tie" />
            </div>

            <div v-if="selectedCategory === 'Мастер-классы' && (attraction as any)['Сертификат']" class="facility-icon" title="Выдается сертификат">
              <Icon icon="mdi:certificate" />
            </div>

            <div v-if="selectedCategory === 'Мастер-классы' && (attraction as any)['Фото/видео']" class="facility-icon" title="Можно фотографировать/снимать">
              <Icon icon="mdi:camera" />
            </div>

            <div v-if="selectedCategory === 'Мастер-классы' && (attraction as any)['Сменная одежда']" class="facility-icon" title="Есть сменная одежда">
              <Icon icon="mdi:tshirt-crew" />
            </div>

            <div v-if="selectedCategory === 'Мастер-классы' && (attraction as any)['Душ']" class="facility-icon" title="Есть душ">
              <Icon icon="mdi:shower" />
            </div>

            <div v-if="selectedCategory === 'Мастер-классы' && (attraction as any)['Wi-Fi']" class="facility-icon" title="Есть Wi-Fi">
              <Icon icon="mdi:wifi" />
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
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { allAttractions, type Attraction, citiesData, generateBreadcrumbs } from '../Data'  
import { Icon } from '@iconify/vue'

import FilterModal from '../components/FilterModal.vue'
import StarRating from '../components/StarRating.vue'
import { filterOptions } from '../filterConfig'
import { userHistory } from '../utils/userHistory'
import { intelligentSearch } from '../utils/intelligentSearch'
import { SEOOptimizer } from '../utils/seoOptimization'

const selectedCity = ref<string>(localStorage.getItem('selectedCity') || 'Калининград')
const showFilterModal = ref(false)
const activeFilters = ref<Record<string, any>>({})
const searchQuery = ref('')
const activeCategories = ref<string[]>([])

const allReviews = ref<Record<number, any[]>>({})
const ratingSortOrder = ref<'asc' | 'desc'>('desc')

const loadReviews = () => {
  try {
    const savedReviews = localStorage.getItem('attractionReviews')
    if (savedReviews) {
      allReviews.value = JSON.parse(savedReviews)
    }
  } catch (error) {
    console.error('Error loading reviews:', error)
    allReviews.value = {}
  }
}

const getReviewCount = (attractionId: number): number => {
  return allReviews.value[attractionId]?.length || 0
}

const categoryFilters = ref<Record<string, Record<string, any>>>({})



function toggleCategory(name: string) {
  console.log('toggleCategory called with:', name, 'current category:', selectedCategory.value)
  if (name === 'Топ') {
    selectedCategory.value = 'Топ'
    activeCategories.value = []
    activeFilters.value = {}
    if (selectedCategory.value !== 'Топ') {
      categoryFilters.value[selectedCategory.value] = {}
    }
    // Save to history
    userHistory.saveLastCategory('Топ')
  } else if (selectedCategory.value === name) {
    // When clicking the same category again, reset filters but stay in category
    activeFilters.value = {}
    categoryFilters.value[name] = {}
  } else {
    // When clicking a different category, switch to it
    selectedCategory.value = name
    activeCategories.value = [name]
    // Load saved filters for this category
    activeFilters.value = categoryFilters.value[name] || {}
    
    // Save to history
    userHistory.saveLastCategory(name)
    
    // Load filters from history if available
    const savedFilters = userHistory.getLastFilters(name)
    if (savedFilters) {
      activeFilters.value = savedFilters
      categoryFilters.value[name] = savedFilters
    }
  }
}

function clearAllFilters() {
  // Store current category before clearing
  const currentCategory = selectedCategory.value
  
  // Clear filters but preserve category
  activeFilters.value = {}
  searchQuery.value = ''
  
  // Clear filters for current category
  if (currentCategory !== 'Топ') {
    categoryFilters.value[currentCategory] = {}
  }
  
  // Don't change the selected category - stay in current one
}

function applyFilters(newFilters: Record<string, any>) {
  activeFilters.value = newFilters
  const cat = selectedCategory.value
  if (cat && cat !== 'Топ') {
    activeCategories.value = [cat]
    // Save filters for this category
    categoryFilters.value[cat] = { ...newFilters }
    
    // Save to history
    userHistory.saveFilters(cat, newFilters)
  }
  showFilterModal.value = false
}

const router = useRouter()
const route = useRoute()
const scrollY = ref(0)
function handleScroll() { 
  scrollY.value = window.scrollY
  // Save scroll position to history
  userHistory.saveScrollPosition(window.scrollY)
}
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  
  // Load reviews
  loadReviews()
  
  // Restore user history
  const lastCategory = userHistory.getLastCategory()
  const lastSearchQuery = userHistory.getLastSearchQuery()
  
  if (lastCategory && lastCategory !== 'Топ') {
    selectedCategory.value = lastCategory
    activeCategories.value = [lastCategory]
    
    // Restore filters
    const savedFilters = userHistory.getLastFilters(lastCategory)
    if (savedFilters) {
      activeFilters.value = savedFilters
      categoryFilters.value[lastCategory] = savedFilters
    }
  }
  
  if (lastSearchQuery) {
    searchQuery.value = lastSearchQuery
  }
  
  // Save current page
  userHistory.saveLastPage(`city-${cityParam.value}`)
  
  // Restore scroll position
  const lastScrollPosition = userHistory.getLastScrollPosition()
  if (lastScrollPosition) {
    nextTick(() => {
      window.scrollTo(0, lastScrollPosition)
    })
  }
  
  // Listen for city changes from header
  window.addEventListener('city:changed', handleCityChange)
  
  // Apply SEO optimization
  applySEOOptimization()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('city:changed', handleCityChange)
})

// Handle city changes from header
function handleCityChange(event: any) {
  const newCity = event.detail
  if (newCity && newCity !== cityParam.value) {
    router.push(`/city/${newCity}`)
  }
}

// SEO optimization function
function applySEOOptimization() {
  const cityAttractions = filteredAttractions.value
  
  // Generate and apply meta tags for city page
  const metaData = SEOOptimizer.generateCityMetaTags(cityParam.value, cityAttractions)
  SEOOptimizer.applyMetaTags(metaData)
  
  // Generate and add structured data for city
  const structuredData = SEOOptimizer.generatePlaceStructuredData(cityParam.value, cityAttractions)
  SEOOptimizer.addStructuredData(structuredData)
  
  // Generate breadcrumb structured data
  const breadcrumbs = generateBreadcrumbs('city', cityParam.value)
  const breadcrumbData = SEOOptimizer.generateBreadcrumbStructuredData(breadcrumbs)
  
  // Add breadcrumb structured data
  const breadcrumbScript = document.createElement('script')
  breadcrumbScript.type = 'application/ld+json'
  breadcrumbScript.textContent = breadcrumbData
  document.head.appendChild(breadcrumbScript)
}

// Watch for search query changes and save to history
watch(searchQuery, (newQuery) => {
  if (newQuery.trim()) {
    userHistory.saveSearchQuery(newQuery)
  }
})

function goBack() { router.back() }

const cityParam = computed(() => String(route.params.name ?? ''))
const city = computed(() => {
  const list = Array.isArray(citiesData.value) ? citiesData.value : []
  return list.find(c => c.name === cityParam.value)
})

const selectedCategory = ref((route.query.category as string) || 'Топ')
const singleSelectedCategory = computed(() => {
  return selectedCategory.value
})

// Recent categories from history
const recentCategories = computed(() => {
  return userHistory.getRecentCategories().filter(cat => cat !== selectedCategory.value).slice(0, 5)
})

// Function to go to a category
function goToCategory(category: string) {
  selectedCategory.value = category
  activeCategories.value = [category]
  
  // Load saved filters for this category
  activeFilters.value = categoryFilters.value[category] || {}
  
  // Save to history
  userHistory.saveLastCategory(category)
  
  // Load filters from history if available
  const savedFilters = userHistory.getLastFilters(category)
  if (savedFilters) {
    activeFilters.value = savedFilters
    categoryFilters.value[category] = savedFilters
  }
}

// Function to clear history
function clearHistory() {
  userHistory.clearAllHistory()
  // Refresh the page to reset everything
  window.location.reload()
}


const categories = ref([
  { name: 'Топ', attractions: 0 },
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
  { name: 'Аренда транспорта', attractions: 123 },
  { name: 'Выставки', attractions: 123 },
])

function handleFilterClick() {
  // Ensure the currently selected category is reflected in activeCategories
  if (selectedCategory.value && selectedCategory.value !== 'Топ') {
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
  
  // Filter by current city - ensure only attractions from the selected city are shown
  attractions = attractions.filter(a => a.city === selectedCity.value)
  
  // Filter by selected category
  if (selectedCategory.value !== 'Топ') {
    attractions = attractions.filter(a => a.categories && a.categories.includes(selectedCategory.value))
  }

  // Quick filters removed - moved to advanced filters

  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    attractions = attractions.filter(a => intelligentSearch(a, q))
  }

  return attractions
})

const filteredAttractions = computed<Attraction[]>(() => {
  let attractions = [...quickFilteredAttractions.value]
  // Apply advanced modal filters (single category)
  const advCat = selectedCategory.value !== 'Топ' ? selectedCategory.value : ''
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
  
  // Don't show category chip to avoid duplication with category buttons
  // if (selectedCategory.value !== 'Топ') {
  //   chips.push({ 
  //     key: 'cat', 
  //     label: selectedCategory.value, 
  //     clear: () => { selectedCategory.value = 'Топ'; activeCategories.value = [] } 
  //   })
  // }
  
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
  // Return the full cuisine name for display in chips
  return cuisine
}

function getCuisineChipStyle(cuisine: string): string {
  const cuisineStyles: Record<string, string> = {
    // Traditional cuisines - using subtle, modern colors
    'Русская': 'background: #f8fafc; color: #374151; border: 1px solid #e2e8f0;',
    'Европейская': 'background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1;',
    'Итальянская': 'background: #fef3c7; color: #92400e; border: 1px solid #fbbf24;',
    'Японская': 'background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5;',
    'Китайская': 'background: #fffbeb; color: #d97706; border: 1px solid #fbbf24;',
    'Индийская': 'background: #ecfdf5; color: #166534; border: 1px solid #86efac;',
    'Мексиканская': 'background: #fef3c7; color: #92400e; border: 1px solid #fbbf24;',
    'Тайская': 'background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5;',
    'Корейская': 'background: #f0f9ff; color: #1e40af; border: 1px solid #93c5fd;',
    'Французская': 'background: #f0f9ff; color: #1e40af; border: 1px solid #93c5fd;',
    'Немецкая': 'background: #f8fafc; color: #374151; border: 1px solid #e2e8f0;',
    'Испанская': 'background: #fef3c7; color: #92400e; border: 1px solid #fbbf24;',
    'Греческая': 'background: #f0f9ff; color: #1e40af; border: 1px solid #93c5fd;',
    'Турецкая': 'background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5;',
    'Арабская': 'background: #ecfdf5; color: #166534; border: 1px solid #86efac;',
    'Балтийская': 'background: #f0f9ff; color: #1e40af; border: 1px solid #93c5fd;',
    'Стейки': 'background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5;',
    'Бургеры': 'background: #fffbeb; color: #d97706; border: 1px solid #fbbf24;',
    
    // Dietary preferences - using subtle green tones
    'Вегетарианская': 'background: #ecfdf5; color: #166534; border: 1px solid #86efac;',
    'Веганская': 'background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0;',
    
    // Food service types - using subtle, themed colors
    'Кафе': 'background: #fef7ed; color: #9a3412; border: 1px solid #fed7aa;',
    'Бар': 'background: #faf5ff; color: #7c2d12; border: 1px solid #e9d5ff;',
    'Пиццерия': 'background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5;',
    'Суши': 'background: #f0f9ff; color: #1e40af; border: 1px solid #93c5fd;',
    'Стейк-хаус': 'background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5;',
    'Морепродукты': 'background: #ecfeff; color: #164e63; border: 1px solid #a5f3fc;',
    'Фастфуд': 'background: #fffbeb; color: #d97706; border: 1px solid #fbbf24;',
    'Азиатская': 'background: #fdf2f8; color: #be185d; border: 1px solid #fce7f3;',
    'Пекарня': 'background: #fffbeb; color: #d97706; border: 1px solid #fbbf24;',
    'Кондитерская': 'background: #fdf2f8; color: #be185d; border: 1px solid #fce7f3;',
    'Мороженое': 'background: #fffbeb; color: #d97706; border: 1px solid #fbbf24;',
    'Столовая': 'background: #f8fafc; color: #374151; border: 1px solid #e2e8f0;',
    'Бистро': 'background: #fef7ed; color: #9a3412; border: 1px solid #fed7aa;',
    'Паб': 'background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0;',
    'Ресторан': 'background: #f8fafc; color: #374151; border: 1px solid #e2e8f0;'
  }
  return cuisineStyles[cuisine] || 'background: #f8fafc; color: #374151; border: 1px solid #e2e8f0;'
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

function getParkingType(attraction: Attraction): { type: string; badge: string; title: string } {
  // Determine parking type based on attraction data
  const category = selectedCategory.value;
  const name = attraction.name?.toLowerCase() || '';
  const description = attraction.description?.toLowerCase() || '';
  
  // Accommodation - Private hotel parking
  if (name.includes('отель') || name.includes('гостиница') || name.includes('хостел') || name.includes('санаторий') || 
      category === 'Размещение' || description.includes('отель') || description.includes('гостиница')) {
    return { type: 'private', badge: '🏨', title: 'Частная парковка отеля' };
  }
  
  // Shopping - Mall/shopping center parking
  if (name.includes('торговый') || name.includes('молл') || name.includes('центр') || name.includes('магазин') || 
      name.includes('супермаркет') || name.includes('рынок') || description.includes('торговый') || 
      description.includes('магазин') || category === 'Шопинг') {
    return { type: 'shopping', badge: '🏪', title: 'Парковка торгового центра' };
  }
  
  // Cultural venues - Museum, theater, cinema parking
  if (name.includes('музей') || name.includes('театр') || name.includes('кино') || name.includes('галерея') || 
      name.includes('выставка') || name.includes('концерт') || name.includes('филармония') || 
      category === 'Культура' || description.includes('музей') || description.includes('театр')) {
    return { type: 'cultural', badge: '🎭', title: 'Парковка при культурном заведении' };
  }
  
  // Food & Dining - Restaurant, cafe, bar parking
  if (name.includes('ресторан') || name.includes('кафе') || name.includes('бар') || name.includes('бистро') || 
      name.includes('столовая') || name.includes('пиццерия') || name.includes('суши') || 
      category === 'Где поесть' || description.includes('ресторан') || description.includes('кафе')) {
    return { type: 'restaurant', badge: '🍽️', title: 'Парковка ресторана' };
  }
  
  // Entertainment - Clubs, bowling, entertainment centers
  if (name.includes('клуб') || name.includes('боулинг') || name.includes('развлечения') || name.includes('игровая') || 
      name.includes('бильярд') || name.includes('караоке') || category === 'Развлечения' || 
      description.includes('развлечения') || description.includes('клуб')) {
    return { type: 'entertainment', badge: '🎪', title: 'Парковка развлекательного центра' };
  }
  
  // Sports & Fitness - Gym, sports center, pool
  if (name.includes('спорт') || name.includes('фитнес') || name.includes('бассейн') || name.includes('тренажер') || 
      name.includes('стадион') || name.includes('каток') || category === 'Спорт' || 
      description.includes('спорт') || description.includes('фитнес')) {
    return { type: 'sports', badge: '🏃', title: 'Парковка спортивного центра' };
  }
  
  // Healthcare - Hospital, clinic, spa
  if (name.includes('больница') || name.includes('клиника') || name.includes('поликлиника') || name.includes('спа') || 
      name.includes('салон') || name.includes('красота') || category === 'Здоровье' || 
      description.includes('медицин') || description.includes('здоровье')) {
    return { type: 'healthcare', badge: '🏥', title: 'Парковка медицинского учреждения' };
  }
  
  // Education - School, university, library
  if (name.includes('школа') || name.includes('университет') || name.includes('институт') || name.includes('библиотека') || 
      name.includes('учебн') || name.includes('образование') || category === 'Образование' || 
      description.includes('образование') || description.includes('учебн')) {
    return { type: 'education', badge: '🎓', title: 'Парковка образовательного учреждения' };
  }
  
  // Parks & Nature - Parks, gardens, nature areas
  if (name.includes('парк') || name.includes('сад') || name.includes('сквер') || name.includes('аллея') || 
      name.includes('природ') || description.includes('парк') || description.includes('сад') || 
      description.includes('природ')) {
    return { type: 'nature', badge: '🌳', title: 'Парковка в парке' };
  }
  
  // Beach & Water - Beaches, coastal areas, water activities
  if (name.includes('пляж') || name.includes('берег') || name.includes('набережная') || name.includes('пристань') || 
      name.includes('яхт') || description.includes('пляж') || description.includes('берег') || 
      description.includes('вод')) {
    return { type: 'water', badge: '🏖️', title: 'Парковка у воды' };
  }
  
  // Religious - Churches, temples, religious sites
  if (name.includes('церковь') || name.includes('храм') || name.includes('собор') || name.includes('монастырь') || 
      name.includes('мечеть') || name.includes('синагога') || description.includes('религиоз') || 
      description.includes('церковь')) {
    return { type: 'religious', badge: '⛪', title: 'Парковка у религиозного объекта' };
  }
  
  // Transportation - Stations, airports, bus stops
  if (name.includes('вокзал') || name.includes('аэропорт') || name.includes('станция') || name.includes('автобус') || 
      name.includes('метро') || name.includes('порт') || description.includes('транспорт') || 
      description.includes('вокзал')) {
    return { type: 'transport', badge: '🚉', title: 'Парковка у транспортного узла' };
  }
  
  // Default to general public parking
  return { type: 'public', badge: '🅿️', title: 'Общественная парковка' };
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
  return '↓' // Always show down arrow
}

function getStarFilled(_starIndex: number): boolean {
  // Always show all stars as filled for consistent visibility
  return true
}

function getStarSize(starIndex: number): string {
  if (ratingSortOrder.value === 'desc') {
    // Descending: decreasing size from 5 to 1 (first star is biggest, last is smallest)
    // Star 1 (leftmost) = size-5 (biggest)
    // Star 2 = size-4
    // Star 3 = size-3 (medium)
    // Star 4 = size-2
    // Star 5 (rightmost) = size-1 (smallest)
    return `size-${6 - starIndex}`
  } else {
    // Ascending: increasing size from 1 to 5 (first star is smallest, last is biggest)
    // Star 1 (leftmost) = size-1 (smallest)
    // Star 2 = size-2
    // Star 3 = size-3 (medium)
    // Star 4 = size-4
    // Star 5 (rightmost) = size-5 (biggest)
    return `size-${starIndex}`
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
      '0-1000₽': '0-1,000₽',
      '1000-3000₽': '1,000-3,000₽',
      '3000-5000₽': '3,000-5,000₽',
      '5000-10000₽': '5,000-10,000₽',
      '10000₽+': 'от 10,000₽',
      '0-800₽': '0-800₽',
      '800-1500₽': '800-1,500₽',
      '1500-2500₽': '1,500-2,500₽',
      '2500₽+': '2,500₽+',
      '300-800': '300-800₽',
      '800-1500': '800-1,500₽',
      '1500-2500': '1,500-2,500₽',
      '2500+': '2,500₽+',
      'бюджетные': '300-800₽',
      'средние': '800-1,500₽',
      'дорогие': '1,500-2,500₽',
      'премиум': '2,500₽+'
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

.recent-categories {
  padding: 1rem;
  margin: 0 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.recent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.recent-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.clear-history-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  opacity: 0.7;
}

.clear-history-btn:hover {
  opacity: 1;
  background: #f3f4f6;
}

.recent-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.recent-chip {
  background: #ffffff;
  border: 1px solid #d1d5db;
  color: #374151;
  transition: all 0.2s ease;
}

.recent-chip:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  transform: translateY(-1px);
}

.results-count {
  text-align: center;
  padding: 0.75rem 1rem;
  background: rgba(248, 250, 252, 0.9);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
  margin-bottom: 0.5rem;
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
  overflow: hidden;
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
  display: flex;
  align-items: center;
  gap: 0.25rem;
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
  display: flex;
  align-items: center;
  gap: 0.25rem;
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
  flex-wrap: nowrap;
  gap: 0.15rem;
  margin-top: 0.1rem;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 0.2rem;
}

.facilities-line::-webkit-scrollbar {
  display: none;
}

.facility-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  font-size: 2rem;
  background: transparent;
  position: relative;
  cursor: help;
  color: #1f2937;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0;
  margin: 0.15rem;
  flex-shrink: 0;
}

.facility-icon.available {
  background: #f8fafc;
  border-color: #9ca3af;
  color: #1f2937;
}

/* Parking icon styling */
.parking-icon {
  position: relative;
}

.parking-combined {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  height: 100%;
}

.parking-main-icon {
  font-size: 1.3rem;
  z-index: 2;
}

.parking-type-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  z-index: 3;
}

.cuisine-chip {
  font-size: 1.1rem;
  font-weight: 700;
  min-width: auto;
  width: auto !important;
  height: 60px;
  padding: 0.2rem 0.6rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  text-align: center;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  line-height: 1.1;
  max-width: none !important;
  overflow: visible;
  flex-shrink: 0;
}

.cuisine-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
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
  display: flex;
  align-items: center;
  gap: 0.25rem;
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
    width: 56px;
    height: 56px;
    font-size: 1.9rem;
    margin: 0.1rem;
  }
  
  .cuisine-chip {
    font-size: 1.01rem;
    height: 56px;
    max-width: none;
    padding: 0.15rem 0.5rem;
  }
}

@media (max-width: 480px) {
  
  .working-hours-text {
    font-size: 0.75rem;
  }
  
  .facility-icon {
    width: 52px;
    height: 52px;
    font-size: 1.7rem;
    margin: 0.1rem;
  }
  
  .cuisine-chip {
    font-size: 0.94rem;
    height: 52px;
    max-width: none;
    padding: 0.1rem 0.4rem;
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

.categories-bar {
  padding: 0.25rem 0.25rem;
  margin-top: 0rem;
}

.search-sticky {
  position: sticky;
  top: 3.5rem; 
  z-index: 1000;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0,0,0,0.1);
  padding: 0.5rem 0 0.75rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
}

@media (min-width: 768px) {
  .search-sticky {
    top: 80px; 
  }
}

@media (min-width: 1024px) {
  .search-sticky {
    top: 85px;
  }
}

@media (min-width: 1280px) {
  .search-sticky {
    top: 90px; 
  }
}

@media (min-width: 1536px) {
  .search-sticky {
    top: 95px; 
  }
}

.category-scroll {
  display: flex;
  overflow-x: auto;
  gap: 0.5rem;
  -ms-overflow-style: none; /* IE/Edge */
  scrollbar-width: none; /* Firefox */
  -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 16px, #000 calc(100% - 16px), transparent 100%);
  mask-image: linear-gradient(90deg, transparent 0, #000 16px, #000 calc(100% - 16px), transparent 100%);
}
.category-scroll::-webkit-scrollbar { display: none; }

.category-btn {
  background: rgba(225,245,254,255);
  color: #1f2937;
  border: none;
  border-radius: 8px;
  padding: 0.375rem 0.75rem;
  white-space: nowrap;
  cursor: pointer;
  font-weight: 550;
  transition: background 0.2s ease;
  flex: 0 0 auto;
  font-size: 0.9rem;
}

.category-btn:hover {
  background: #c7d2fe;
}

.category-btn.active {
  background: #3b82f6;
  color: white;
}

.search-section { 
  display: flex; 
  align-items: center; 
  gap: 0.5rem; 
  width: 100%; 
  margin: 0; 
  padding: 0 1rem; 
  margin-top: 0.5rem;
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
  background: rgba(248, 250, 252, 0.8);
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
  border: 1px solid rgba(0, 0, 0, 0.12);
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
  gap: 3px;
  align-items: center;
  justify-content: center;
}

.rating-stars .star {
  color: #fbbf24;
  opacity: 0.3;
  transition: all 0.2s ease;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.rating-stars .star.filled {
  opacity: 1;
  color: #f59e0b;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* Star size variations - more pronounced differences */
.rating-stars .star.size-1 {
  font-size: 10px;
}

.rating-stars .star.size-2 {
  font-size: 12px;
}

.rating-stars .star.size-3 {
  font-size: 14px;
}

.rating-stars .star.size-4 {
  font-size: 16px;
}

.rating-stars .star.size-5 {
  font-size: 18px;
}

/* Attraction Card Star Rating Styling */
.card-rating .stars .star {
  color: #fbbf24;
  opacity: 0.3;
  transition: all 0.2s ease;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.card-rating .stars .star.filled {
  opacity: 1;
  color: #f59e0b;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
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
.search-sticky .search-section > * { flex: 0 0 auto; }
.search-sticky .search-section .search-input { flex: 1; }

/* Responsive search section */
@media (max-width: 1200px) {
  .search-section {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .search-section {
    width: 100%;
    padding: 0 0.5rem;
  }
  
  .search-input {
    min-width: 150px;
  }
  
  .category-btn {
    padding: 0.5rem 1rem;
    font-size: 0.95rem;
  }
  
  .category-scroll {
    gap: 0.75rem;
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

.active-chips { 
  display: flex; 
  align-items: center; 
  gap: 0.75rem; 
  padding: 0.75rem 1rem; 
  flex-wrap: nowrap; 
  overflow-x: auto; 
  -ms-overflow-style: none; 
  scrollbar-width: none; 
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}
.active-chips::-webkit-scrollbar { display: none; }

.clear-btn {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.clear-btn:hover {
  background: #fecaca;
  border-color: #f87171;
}

.filter-chip-container {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.375rem 0.75rem;
  gap: 0.5rem;
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.filter-chip-container:hover {
  border-color: #9ca3af;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-chip-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
}

.filter-chip-remove {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.filter-chip-remove:hover {
  background: #f3f4f6;
  color: #374151;
}
.empty-state { text-align: center; padding: 1rem; color: #555; }
.empty-actions { display: flex; justify-content: center; gap: 0.5rem; margin-top: 0.5rem; }

.card-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin: 0.4rem 0;
}

.category-chip {
  background: #f8fafc;
  color: #475569;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid #e2e8f0;
}

/* Recent Categories Styles */
.recent-categories {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid rgba(226, 232, 240, 0.6);
  border-radius: 16px;
  padding: 1rem;
  margin: 1rem auto;
  width: 80%;
  max-width: 600px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(8px);
}

.recent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.recent-title {
  font-size: 1rem;
  font-weight: 600;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.recent-title::before {
  content: "🕒";
  font-size: 0.875rem;
}

.clear-history-btn {
  background: transparent;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 8px;
  padding: 0.375rem;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.clear-history-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #dc2626;
  transform: translateY(-1px);
}

.recent-chips {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: nowrap;
  width: 100%;
}

.recent-chip {
  background: white;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  flex: 1;
  text-align: center;
  min-width: 0;
}

.recent-chip::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  transition: left 0.5s ease;
}

.recent-chip:hover {
  background: #f0f9ff;
  border-color: rgba(59, 130, 246, 0.3);
  color: #1e40af;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.recent-chip:hover::before {
  left: 100%;
}

.recent-chip:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2);
}

/* Responsive adjustments */
@media (min-width: 1200px) {
  .recent-categories {
    padding: 1.25rem;
    margin: 1.25rem auto;
    width: 75%;
    max-width: 700px;
  }
  
  .recent-title {
    font-size: 1.125rem;
  }
  
  .recent-title::before {
    font-size: 1rem;
  }
  
  .recent-chip {
    font-size: 1rem;
    padding: 0.625rem 1.25rem;
  }
  
  .clear-history-btn {
    width: 36px;
    height: 36px;
  }
}

@media (min-width: 992px) and (max-width: 1199px) {
  .recent-categories {
    padding: 1.125rem;
    margin: 1.125rem auto;
    width: 78%;
    max-width: 650px;
  }
  
  .recent-title {
    font-size: 1.0625rem;
  }
  
  .recent-title::before {
    font-size: 0.9375rem;
  }
  
  .recent-chip {
    font-size: 0.9375rem;
    padding: 0.5625rem 1.125rem;
  }
  
  .clear-history-btn {
    width: 34px;
    height: 34px;
  }
}

@media (min-width: 769px) and (max-width: 991px) {
  .recent-categories {
    padding: 1rem;
    margin: 1rem auto;
    width: 80%;
    max-width: 600px;
  }
  
  .recent-title {
    font-size: 1rem;
  }
  
  .recent-title::before {
    font-size: 0.875rem;
  }
  
  .recent-chip {
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
  }
  
  .clear-history-btn {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 768px) {
  .recent-categories {
    padding: 0.875rem;
    margin: 0.875rem auto;
    width: 85%;
    max-width: 500px;
  }
  
  .recent-title {
    font-size: 0.9375rem;
  }
  
  .recent-title::before {
    font-size: 0.8125rem;
  }
  
  .recent-chip {
    font-size: 0.8125rem;
    padding: 0.4375rem 0.875rem;
  }
  
  .clear-history-btn {
    width: 30px;
    height: 30px;
  }
}

@media (max-width: 640px) {
  .recent-categories {
    padding: 0.75rem;
    margin: 0.75rem auto;
    width: 90%;
    max-width: 450px;
  }
  
  .recent-title {
    font-size: 0.875rem;
  }
  
  .recent-title::before {
    font-size: 0.75rem;
  }
  
  .recent-chip {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
  }
  
  .clear-history-btn {
    width: 28px;
    height: 28px;
  }
}

@media (max-width: 480px) {
  .recent-categories {
    padding: 0.625rem;
    margin: 0.625rem auto;
    width: 92%;
    max-width: 400px;
  }
  
  .recent-header {
    margin-bottom: 0.625rem;
  }
  
  .recent-title {
    font-size: 0.8125rem;
  }
  
  .recent-title::before {
    font-size: 0.6875rem;
  }
  
  .recent-chips {
    gap: 0.4375rem;
    justify-content: space-between;
  }
  
  .recent-chip {
    font-size: 0.6875rem;
    padding: 0.3125rem 0.625rem;
  }
  
  .clear-history-btn {
    width: 26px;
    height: 26px;
  }
}

@media (max-width: 360px) {
  .recent-categories {
    padding: 0.5rem;
    margin: 0.5rem auto;
    width: 95%;
    max-width: 350px;
  }
  
  .recent-header {
    margin-bottom: 0.5rem;
  }
  
  .recent-title {
    font-size: 0.75rem;
  }
  
  .recent-title::before {
    font-size: 0.625rem;
  }
  
  .recent-chips {
    gap: 0.375rem;
    justify-content: space-between;
  }
  
  .recent-chip {
    font-size: 0.625rem;
    padding: 0.25rem 0.5rem;
  }
  
  .clear-history-btn {
    width: 24px;
    height: 24px;
  }
}

</style>