<template>
  <div class="all-popular-page">
    <div class="page-header">
      <h1>Популярные места</h1>
      <p>Лучшие места по рейтингу и отзывам</p>
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
        <button class="advanced-filter-btn" @click="handleFilterClick" title="Расширенный фильтр">
          ⚙️
        </button>
      </div>
    </div>

    <FilterModal
      v-if="showFilterModal"
      :category="selectedCategory"
      :existingFilters="activeFilters"
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

    <!-- ATTRACTIONS GRID -->
    <div class="attraction-grid">
      <div
        class="attraction-card"
        v-for="(attraction, index) in filteredAttractions"
        :key="attraction.id"
        @click="goToAttraction(attraction)"
      >
        <div class="card-rank" v-if="index < 10">
          <span class="rank-number">{{ index + 1 }}</span>
        </div>
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
          
          <!-- Participants -->
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { allAttractions, type Attraction, categoriesCarouselData } from '../Data'
import FilterModal from '../components/FilterModal.vue'

const router = useRouter()
// const selectedCity = ref<string>(localStorage.getItem('selectedCity') || 'Калининград')

const showFilterModal = ref(false)
const activeFilters = ref<Record<string, any>>({})
const searchQuery = ref('')
// Quick filter variables removed
const selectedCategory = ref('👍🏼')

// Get all categories
const categories = computed(() => [
  { name: '👍🏼', label: 'Все' },
  ...categoriesCarouselData.value
])

// Get all attractions sorted by popularity
const allPopularAttractions = computed(() => {
  const toNum = (v: unknown, d = 0) =>
    typeof v === 'number'
      ? v
      : typeof v === 'string'
      ? Number(v.replace(/[^\d.]/g, '')) || d
      : d

  return [...(Array.isArray(allAttractions.value) ? (allAttractions.value as Attraction[]) : [])]
    .filter(a => a && (a.rating != null || a.checkedIn != null))
    .map(a => ({
      ...a,
      _rating: toNum(a.rating),
      _reviews: toNum((a as any).reviewsCount ?? (a as any).ratingCount ?? (a.reviews?.length || 0)),
      _fallbackPop: toNum(a.checkedIn ?? 0),
    }))
    .sort((a, b) => {
      const byRating = b._rating - a._rating
      if (byRating !== 0) return byRating

      const byReviews = b._reviews - a._reviews
      if (byReviews !== 0) return byReviews

      const byFallback = b._fallbackPop - a._fallbackPop
      if (byFallback !== 0) return byFallback

      return (a.name || '').localeCompare(b.name || '')
    })
    .map(({ _rating, _reviews, _fallbackPop, ...rest }) => rest)
})

// Apply filters
const filteredAttractions = computed(() => {
  let attractions = [...allPopularAttractions.value]

  // Filter by category
  if (selectedCategory.value !== '👍🏼') {
    attractions = attractions.filter(attraction => 
      attraction.categories && attraction.categories.includes(selectedCategory.value)
    )
  }

  // Quick filters removed - moved to advanced filters

  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    attractions = attractions.filter(a => (a.name || '').toLowerCase().includes(q))
  }

  // Apply advanced filters
  if (Object.keys(activeFilters.value).length > 0) {
    attractions = attractions.filter(a => matchesAdvanced(a, activeFilters.value, selectedCategory.value))
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

// const hasActiveFilters = computed(() =>
//   searchQuery.value.trim().length > 0 || selectedCategory.value !== '👍🏼' || Object.keys(activeFilters.value).length > 0
// )

const contextChips = computed(() => {
  const chips: Array<{ key: string; label: string; clear: () => void }> = []
  
  // Only show search and category chips
  if (searchQuery.value) chips.push({ key: 'q', label: `Поиск: ${searchQuery.value}`, clear: () => (searchQuery.value = '') })
  if (selectedCategory.value !== '👍🏼') chips.push({ key: 'cat', label: selectedCategory.value, clear: () => (selectedCategory.value = '👍🏼') })
  
  return chips
})

function toggleCategory(name: string) {
  if (selectedCategory.value === name) {
    selectedCategory.value = '👍🏼'
  } else {
    selectedCategory.value = name
  }
}

function clearFilters() {
  searchQuery.value = ''
  activeFilters.value = {}
}

function clearAllFilters() {
  clearFilters()
  selectedCategory.value = '👍🏼'
}

function handleFilterClick() {
  showFilterModal.value = true
}

function applyFilters(filters: Record<string, any>) {
  activeFilters.value = filters
  showFilterModal.value = false
}

function goToAttraction(attraction: Attraction) {
  router.push({ name: 'event-detail', params: { id: attraction.id } })
}

function goBack() {
  router.back()
}



// Helper functions for enhanced attraction cards
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
  if (price.includes('до 1000') || price.includes('дешево') || price.includes('недорого')) {
    return '$'
  } else if (price.includes('1000-2000') || price.includes('средне') || price.includes('нормально')) {
    return '$$'
  } else if (price.includes('2000-3000') || price.includes('дорого') || price.includes('высоко')) {
    return '$$$'
  } else if (price.includes('от 3000') || price.includes('очень дорого') || price.includes('премиум')) {
    return '$$$$'
  }
  return '$$'
}

function getPriceClass(avgCheck: string): string {
  const price = avgCheck.toLowerCase()
  if (price.includes('до 1000') || price.includes('дешево') || price.includes('недорого')) {
    return 'price-cheap'
  } else if (price.includes('1000-2000') || price.includes('средне') || price.includes('нормально')) {
    return 'price-affordable'
  } else if (price.includes('2000-3000') || price.includes('дорого') || price.includes('высоко')) {
    return 'price-expensive'
  } else if (price.includes('от 3000') || price.includes('очень дорого') || price.includes('премиум')) {
    return 'price-premium'
  }
  return 'price-affordable'
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

function matchesAdvanced(a: Attraction, f: Record<string, any>, _category: string) {
  const lc = (s: any) => String(s ?? '').toLowerCase()
  const isYes = (v: any) => lc(v) === 'да'
  // const inRange = (val: any, rng: any) => {
  //   if (!Array.isArray(rng) || rng.length < 2) return true
  //   const n = Number(val)
  //   if (Number.isNaN(n)) return true
  //   return n >= Number(rng[0]) && n <= Number(rng[1])
  // }

  // Apply filters based on category
  if (f['Кухня'] && Array.isArray(f['Кухня']) && f['Кухня'].length) {
    const have = (a['Кухня'] || []).map(lc)
    const want = f['Кухня'].map(lc)
    if (!want.some((w: string) => have.includes(w))) return false
  }
  if (f['Средний чек'] && lc(a['Средний чек']) !== lc(f['Средний чек'])) return false
  if (f['Тип заведения'] && lc(f['Тип заведения']) && lc(a['Тип заведения']) !== lc(f['Тип заведения'])) return false
  if (f['Бронирование']) {
    const need = isYes(f['Бронирование'])
    if ((a['Бронирование'] ?? false) !== need) return false
  }

  return true
}
</script>

<style scoped>
.all-popular-page {
  font-family: sans-serif;
  padding-top: 4.3rem;
  width: 100%;
  margin: 0 auto;
  background: rgba(225, 245, 254, 0.18);
}

.page-header {
  text-align: center;
  padding: 2rem 1rem 1rem;
  background: white;
  margin-bottom: 1rem;
}

.page-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.page-header p {
  margin: 0;
  color: #6b7280;
  font-size: 1.1rem;
}

/* FILTERS */
.filters-sticky {
  position: sticky;
  top: 4.3rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e5e7eb;
  z-index: 10;
  padding: 0.5rem 1rem;
}

.category-scroll {
  display: flex;
  overflow-x: auto;
  padding: 0.5rem 0;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.chip {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.chip.active {
  background: #3b82f6;
  color: white;
}

.search-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1rem;
  width: 100%;
}

.quick-filters {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
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

/* Slider icon styles removed - using gear emoji instead */

.toggle {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.clear-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
}

.result-count {
  font-size: 0.9rem;
  color: #6b7280;
}

.filter-bar {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.filter-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
}

.active-chips {
  padding: 0.5rem 1rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* ATTRACTIONS GRID */
.attraction-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.attraction-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease;
  position: relative;
}

.attraction-card:hover {
  transform: translateY(-2px);
}

.card-rank {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 2;
}

.rank-number {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-content {
  padding: 1rem;
}

.card-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

/* Enhanced attraction card styles */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.3rem;
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
  margin: 0.3rem 0;
  font-size: 0.9rem;
  color: #3b82f6;
  font-weight: 500;
}

.price-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.3rem 0;
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
  background: #f9fafb;
  border-color: #e5e7eb;
  color: #374151;
}

.facilities-line {
  display: flex;
  flex-wrap: wrap;
  gap: 0.15rem;
  margin-top: 0.3rem;
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
  font-size: 0.8rem;
  line-height: 1.2;
}

/* Responsive adjustments for smaller screens */
@media (max-width: 768px) {
  .working-hours-icon {
    padding: 0 0.25rem !important;
  }
  
  .working-hours-text {
    font-size: 0.75rem;
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

.card-content p {
  margin: 0.2rem 0;
  font-size: 0.9rem;
  color: #6b7280;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.stars {
  display: flex;
  gap: 0.1rem;
}

.star {
  font-size: 0.8rem;
  opacity: 0.3;
}

.star.filled {
  opacity: 1;
}

.rating-text {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1f2937;
}

.reviews-count {
  font-size: 0.8rem;
  color: #6b7280;
}

.price {
  font-weight: 600;
  font-size: 0.9rem;
  margin: 0.3rem 0 0 0;
}

.price.free {
  color: #059669;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty-actions {
  margin-top: 1rem;
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
</style>
