<template>
  <div class="category-detail-page">
    <!-- Fallbacks prevent broken layout even if category not found -->
    <div class="category-hero" :style="{ backgroundImage: `url(${categoryImage})` }">
      <div
        class="category-hero-overlay"
        :style="{
          transform: `translateY(${Math.min(scrollY, 50) * -0.5}px)`,
          opacity: `${1 - Math.min(scrollY, 100) / 100}`,
        }"
      >
        <h1 class="category-title">{{ categoryName }} в {{ getCityInPrepositionalCase(selectedCity) }}</h1>
      </div>
    </div>

    <div class="results-count">
      <span>{{ getResultsCountText(filteredAttractions.length) }}</span>
    </div>

    <!-- FILTERS BAR -->
    <div class="filters-sticky" role="toolbar" aria-label="Фильтры">
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
      :category="categoryName"
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

    <!-- ATTRACTIONS -->
    <div class="attraction-grid">
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
          
          <p v-if="attraction.checkedIn" class="participants">👥 {{ getReviewsText(attraction.checkedIn) }}</p>
            <div class="price-section">
              <span v-if="attraction.price === 0" class="price free">🆓 Бесплатно</span>
              <span v-else-if="attraction.price" class="price">💶 {{ attraction.price }} ₽</span>
              
              <div v-if="categoryName === 'Мастер-классы' && (attraction as any)['Оплата']" class="payment-method" :title="(attraction as any)['Оплата']">
                <span v-if="(attraction as any)['Оплата'] === 'наличные'">💵</span>
                <span v-else-if="(attraction as any)['Оплата'] === 'карта'">💳</span>
                <span v-else-if="(attraction as any)['Оплата'] === 'наличные/карта'">💵💳</span>
              </div>
            </div>

          <div class="facilities-line">
            <div class="facility-icon working-hours-icon" :class="{ available: (attraction as any)['Время работы'], unavailable: !(attraction as any)['Время работы'] }" :title="(attraction as any)['Время работы'] ? `Время работы: ${(attraction as any)['Время работы']}` : 'Нет информации о времени работы'">
              <span v-if="(attraction as any)['Время работы']" class="working-hours-text">🕣 {{ (attraction as any)['Время работы'] }}</span>
              <span v-else class="crossed">🕣</span>
            </div>

            <div v-if="categoryName === 'Где поесть' && (attraction as any)['Кухня'] && (attraction as any)['Кухня'].length > 0" class="facility-icon cuisine-flag-icon" :title="(attraction as any)['Кухня'][0]">
              {{ getCuisineFlag((attraction as any)['Кухня'][0]) }}
            </div>
            
            <div v-if="categoryName === 'Где поесть' && (attraction as any)['Средний чек']" class="facility-icon price-flag-icon" :class="getPriceClass((attraction as any)['Средний чек'])" :title="(attraction as any)['Средний чек']">
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
            <div v-if="categoryName === 'Мастер-классы'" class="facility-icon" :class="{ available: (attraction as any)['Инструктор'], unavailable: !(attraction as any)['Инструктор'] }" :title="(attraction as any)['Инструктор'] ? 'Есть инструктор' : 'Нет инструктора'">
              <span v-if="(attraction as any)['Инструктор']">👨‍🏫</span>
              <span v-else class="crossed">👨‍🏫</span>
            </div>

            <div v-if="categoryName === 'Мастер-классы'" class="facility-icon" :class="{ available: (attraction as any)['Сертификат'], unavailable: !(attraction as any)['Сертификат'] }" :title="(attraction as any)['Сертификат'] ? 'Выдается сертификат' : 'Сертификат не выдается'">
              <span v-if="(attraction as any)['Сертификат']">📜</span>
              <span v-else class="crossed">📜</span>
            </div>

            <div v-if="categoryName === 'Мастер-классы'" class="facility-icon" :class="{ available: (attraction as any)['Фото/видео'], unavailable: !(attraction as any)['Фото/видео'] }" :title="(attraction as any)['Фото/видео'] ? 'Можно фотографировать/снимать' : 'Фото/видео запрещено'">
              <span v-if="(attraction as any)['Фото/видео']">📸</span>
              <span v-else class="crossed">📸</span>
            </div>

            <div v-if="categoryName === 'Мастер-классы'" class="facility-icon" :class="{ available: (attraction as any)['Сменная одежда'], unavailable: !(attraction as any)['Сменная одежда'] }" :title="(attraction as any)['Сменная одежда'] ? 'Есть сменная одежда' : 'Нет сменной одежды'">
              <span v-if="(attraction as any)['Сменная одежда']">👕</span>
              <span v-else class="crossed">👕</span>
            </div>

            <div v-if="categoryName === 'Мастер-классы'" class="facility-icon" :class="{ available: (attraction as any)['Душ'], unavailable: !(attraction as any)['Душ'] }" :title="(attraction as any)['Душ'] ? 'Есть душ' : 'Нет душа'">
              <span v-if="(attraction as any)['Душ']">🚿</span>
              <span v-else class="crossed">🚿</span>
            </div>

            <div v-if="categoryName === 'Мастер-классы'" class="facility-icon" :class="{ available: (attraction as any)['Wi-Fi'], unavailable: !(attraction as any)['Wi-Fi'] }" :title="(attraction as any)['Wi-Fi'] ? 'Есть Wi-Fi' : 'Нет Wi-Fi'">
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
import { allAttractions, type Attraction } from '../Data'
import FilterModal from '../components/FilterModal.vue'
// import { filterOptions } from '../filterConfig'

const route = useRoute()
const router = useRouter()
const categoryParam = route.params.name as string
const selectedCity = ref<string>(localStorage.getItem('selectedCity') || 'Калининград')

const showFilterModal = ref(false)
const activeFilters = ref<Record<string, any>>({})
const searchQuery = ref('')
const scrollY = ref(0)

// Get category info
// const categoryInfo = computed(() => 
//   categoriesCarouselData.value.find(cat => cat.name === categoryParam)
// )

const categoryName = computed(() => categoryParam || 'Категория')
const categoryImage = computed(() => {
  const categoryName = categoryParam || ''
  // Map category names to proper JPEG images
  const imageMap: Record<string, string> = {
    'Экскурсии': '/Excursions.jpeg',
    'Где поесть': '/Category.resto.jpeg',
    'Размещение': '/Category.hotels.jpeg',
    'Активный отдых': '/Category.activity.jpeg',
    'Исторические места': '/historical_sites.jpeg',
    'Концерты': '/Category.concerts.jpeg',
    'Театры': '/Theater.jpeg',
    'Семейный выход': '/Category.family.jpeg',
    'Кино': '/Movie.jpeg',
    'Мастер-классы': '/Workshop.jpeg',
    'Музеи': '/Museums.jpeg',
    'Парки/cкверы': '/Parks.jpeg',
    'Отпускной транспорт': '/transport.jpeg',
    'Выставки': '/Exhibition.jpeg'
  }
  return imageMap[categoryName] || '/Excursions.jpeg'
})

// Filter attractions by category and city
const categoryAttractions = computed(() => {
  return allAttractions.value.filter(attraction => 
    attraction.categories && 
    attraction.categories.includes(categoryName.value) &&
    attraction.city === selectedCity.value
  )
})

// Apply filters
const filteredAttractions = computed(() => {
  let attractions = [...categoryAttractions.value]

  // Quick filters removed - moved to advanced filters

  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    attractions = attractions.filter(a => (a.name || '').toLowerCase().includes(q))
  }

  // Apply advanced filters
  if (Object.keys(activeFilters.value).length > 0) {
    attractions = attractions.filter(a => matchesAdvanced(a, activeFilters.value, categoryName.value))
  }

  // Apply sorting - default to rating descending if no sorting is set
  const sortBy = activeFilters.value.sortBy || 'rating'
  const sortOrder = activeFilters.value.sortOrder || 'desc'
  
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
//   searchQuery.value.trim().length > 0 || Object.keys(activeFilters.value).length > 0
// )

const contextChips = computed(() => {
  const chips: Array<{ key: string; label: string; clear: () => void }> = []
  
  // Only show search and advanced filter chips
  if (searchQuery.value) chips.push({ key: 'q', label: `Поиск: ${searchQuery.value}`, clear: () => (searchQuery.value = '') })
  
  return chips
})

function clearFilters() {
  searchQuery.value = ''
  activeFilters.value = {}
}

function clearAllFilters() {
  clearFilters()
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

// function isOpenNow(hours?: string) {
//   if (!hours) return true
//   // Simple check - you can implement more sophisticated logic
//   return true
// }

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

const checkScroll = () => {
  scrollY.value = window.scrollY
}

onMounted(() => {
  window.addEventListener('scroll', checkScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
})

function getCityInPrepositionalCase(cityName: string): string {
  // Add 'е' ending for prepositional case in Russian
  const lastChar = cityName.slice(-1);
  if (lastChar === 'а') {
    return cityName.slice(0, -1) + 'е';
  } else if (lastChar === 'я') {
    return cityName.slice(0, -1) + 'е';
  } else if (lastChar === 'ь') {
    return cityName.slice(0, -1) + 'е';
  } else if (lastChar === 'й') {
    return cityName.slice(0, -1) + 'е';
  } else {
    return cityName + 'е';
  }
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
</script>

<style scoped>
.category-detail-page {
  font-family: sans-serif;
  padding-top: 4.3rem;
  width: 100%;
  margin: 0 auto;
  background: rgba(225, 245, 254, 0.18);
}

.category-hero {
  position: relative;
  height: 30vh;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.category-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.category-hero-overlay {
  position: relative;
  z-index: 2;
}

.category-hero-overlay {
  background: rgba(0, 0, 0, 0.3);
  border: double white 4px;
  padding: 0.6rem 1.3rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  backdrop-filter: blur(3px);
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.category-title {
  color: #fff;
  font-size: clamp(1.2rem, 4vw, 1.4rem);
  font-weight: 700;
  background-color: transparent;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90vw;
  text-align: center;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
  letter-spacing: 0.5px;
}

.category-description {
  padding: 1rem 1rem 0.2rem;
  font-size: 1rem;
  line-height: 1.6;
  text-align: center;
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

.filters-sticky {
  position: sticky;
  top: 4.3rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e5e7eb;
  z-index: 10;
  padding: 0.5rem 1rem;
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
}

.advanced-filter-btn:hover {
  background: #e2e8f0;
  border-color: rgba(0,0,0,0.2);
}

.advanced-filter-btn {
  font-size: 16px;
  line-height: 1;
}

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

.chip {
  background: #e0f2fe;
  color: #0c4a6e;
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
  cursor: pointer;
}

.chip.active {
  background: #0ea5e9;
  color: white;
}

/* ATTRACTIONS GRID */
.attraction-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

@media (max-width: 768px) {
  .attraction-grid {
    grid-template-columns: 1fr;
    padding: 0.5rem;
  }
  
  .card-main {
    flex-direction: column;
    gap: 1rem;
  }
  
  .card-right {
    align-items: flex-start;
    min-width: auto;
    width: 100%;
  }
  
  .facilities-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.4rem;
  }
  
  .facility-icon {
    height: 2rem;
    font-size: 1.4rem;
  }
}

.attraction-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.attraction-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-content {
  padding: 1.2rem;
}

.card-main {
  margin-top: 0.8rem;
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

.price-section span {
  margin: 0;
  flex-shrink: 0;
}

.facilities-line {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  margin-top: 0.3rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.3rem;
  gap: 0.5rem;
}

.category-name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
  line-height: 1.3;
}

.attraction-name {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.3;
  flex: 1;
  min-width: 0;
}

.card-rating {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
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
  font-size: 0.8rem;
  font-weight: 600;
  color: #1f2937;
}



.date-info {
  color: #059669 !important;
  font-weight: 500;
}

.participants {
  color: #3b82f6 !important;
  font-weight: 500;
}

.price {
  font-weight: 600;
  color: #1f2937 !important;
}

.price.free {
  color: #059669 !important;
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

.facility-icon.inline {
  width: 40px;
  height: 40px;
  font-size: 1.4rem;
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

.facility-icon:hover {
  transform: scale(1.05);
  background: #f1f5f9;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

.facility-icon.available:hover {
  background: #f1f5f9;
  border-color: #6b7280;
}

.facility-icon.unavailable:hover {
  background: #f1f5f9;
  border-color: #6b7280;
}

.crossed {
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
.working-hours-icon {
  min-width: auto !important;
  width: auto !important;
  padding: 0 0.5rem !important;
  white-space: nowrap;
}

.working-hours-text {
  font-size: 0.75rem;
  line-height: 1.2;
}

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

.cuisine-flags {
  display: flex;
  gap: 0.2rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.cuisine-flag {
  font-size: 1rem;
  padding: 0.2rem;
  border-radius: 6px;
  background: #f8fafc;
  border: 2px solid #9ca3af;
  cursor: help;
  transition: all 0.2s ease;
}

.cuisine-flag:hover {
  transform: scale(1.05);
  background: #f1f5f9;
}

.price-indicator {
  font-size: 1rem;
  font-weight: 600;
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  border: 1px solid;
  cursor: help;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2rem;
}

.price-indicator.inline {
  min-width: 2rem;
  height: 1.6rem;
  font-size: 0.9rem;
  padding: 0.2rem 0.4rem;
}

.price-indicator:hover {
  transform: scale(1.05);
}

.price-cheap {
  background: #f8fafc;
  color: #1f2937;
  border-color: #9ca3af;
}

.price-affordable {
  background: #f8fafc;
  color: #1f2937;
  border-color: #9ca3af;
}

.price-expensive {
  background: #f8fafc;
  color: #1f2937;
  border-color: #9ca3af;
}

.price-premium {
  background: #f8fafc;
  color: #1f2937;
  border-color: #9ca3af;
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