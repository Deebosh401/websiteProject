<template>
  <div class="all-popular-page">
    <div class="page-header">
      <h1>Популярные места</h1>
      <p>Лучшие места по рейтингу и отзывам</p>
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
          placeholder="Поиск по названию, описанию, категориям…"
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

    <div class="active-chips" v-if="contextChips.length">
      <button v-for="chip in contextChips" :key="chip.key" class="chip active" @click="chip.clear()">
        {{ chip.label }} ×
      </button>
      <button class="clear-btn" @click="clearAllFilters">Очистить все</button>
    </div>

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
          <div class="card-header">
            <h3 class="attraction-name">{{ attraction.name }}</h3>
            <div class="card-rating" v-if="attraction.rating">
              <StarRating :rating="attraction.rating" :show-text="true" />
            </div>
          </div>
          
          <p v-if="getReviewCount(attraction.id) > 0" class="participants">👥 {{ getReviewsText(getReviewCount(attraction.id)) }}</p>
          
          <div class="price-section">
            <span v-if="attraction.price === 0" class="price free"><Icon icon="mdi:gift" /> Бесплатно</span>
            <span v-else-if="attraction.price" class="price"><Icon icon="mdi:currency-rub" /> {{ attraction.price }} ₽</span>
            
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

            <div v-if="selectedCategory === 'Где поесть' && (attraction as any)['Кухня'] && (attraction as any)['Кухня'].length > 0" class="facility-icon cuisine-flag-icon" :title="(attraction as any)['Кухня'][0]">
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { allAttractions, type Attraction, categoriesCarouselData } from '../Data'
import { intelligentSearch } from '../utils/intelligentSearch'
import { Icon } from '@iconify/vue'
import FilterModal from '../components/FilterModal.vue'
import StarRating from '../components/StarRating.vue'

const router = useRouter()
// const selectedCity = ref<string>(localStorage.getItem('selectedCity') || 'Калининград')

const showFilterModal = ref(false)
const activeFilters = ref<Record<string, any>>({})
const searchQuery = ref('')
// Quick filter variables removed
const selectedCategory = ref('Топ')

// Reviews data
const allReviews = ref<Record<number, any[]>>({})

// Load reviews from localStorage
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

// Get review count for an attraction
const getReviewCount = (attractionId: number): number => {
  return allReviews.value[attractionId]?.length || 0
}

// Get all categories
const categories = computed(() => [
  { name: 'Топ', label: 'Все' },
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
  if (selectedCategory.value !== 'Топ') {
    attractions = attractions.filter(attraction => 
      attraction.categories && attraction.categories.includes(selectedCategory.value)
    )
  }

  // Quick filters removed - moved to advanced filters

  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    attractions = attractions.filter(a => intelligentSearch(a, q))
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
//   searchQuery.value.trim().length > 0 || selectedCategory.value !== 'Топ' || Object.keys(activeFilters.value).length > 0
// )

const contextChips = computed(() => {
  const chips: Array<{ key: string; label: string; clear: () => void }> = []
  
  // Only show search and category chips
  if (searchQuery.value) chips.push({ key: 'q', label: `Поиск: ${searchQuery.value}`, clear: () => (searchQuery.value = '') })
  if (selectedCategory.value !== 'Топ') chips.push({ key: 'cat', label: selectedCategory.value, clear: () => (selectedCategory.value = 'Топ') })
  
  return chips
})

function toggleCategory(name: string) {
  if (selectedCategory.value === name) {
    selectedCategory.value = 'Топ'
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
  selectedCategory.value = 'Топ'
}

function getResultsCountText(count: number) {
  if (count === 0) return 'Места не найдены'
  if (count === 1) return 'Найдено 1 место'
  if (count < 5) return `Найдено ${count} места`
  return `Найдено ${count} мест`
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
  const cuisineMap: Record<string, string> = {
    // Traditional cuisines
    'Русская': '🥟', // Pelmeni - traditional Russian dumplings
    'Европейская': '🍽️', // Fine dining - represents European cuisine style
    'Итальянская': '🍝', // Pasta - most recognizable Italian dish
    'Японская': '🍣', // Sushi - iconic Japanese food
    'Китайская': '🥢', // Chopsticks - universal symbol for Chinese cuisine
    'Индийская': '🍛', // Curry - most recognizable Indian dish
    'Мексиканская': '🌶️', // Chili pepper - represents spicy Mexican flavors
    'Тайская': '🥥', // Coconut - key ingredient in Thai cuisine
    'Корейская': '🥘', // Korean stew pot - represents Korean cooking
    'Французская': '🥐', // Croissant - iconic French pastry
    'Немецкая': '🍺', // Beer - traditional German beverage
    'Испанская': '🥘', // Paella pan - represents Spanish rice dishes
    'Греческая': '🫒', // Olives - key Mediterranean ingredient
    'Турецкая': '🥙', // Kebab wrap - popular Turkish street food
    'Арабская': '🫓', // Flatbread - staple in Arab cuisine
    'Балтийская': '🐟', // Fish - represents Baltic seafood
    'Стейки': '🥩', // Steak - premium meat dishes
    'Бургеры': '🍔', // Burger - iconic American fast food
    
    // Dietary preferences
    'Вегетарианская': '🥬', // Leafy greens - represents vegetarian options
    'Веганская': '🌱', // Plant sprout - represents vegan lifestyle
    
    // Food service types
    'Кафе': '☕', // Coffee cup - represents cafes and coffee shops
    'Бар': '🍸', // Cocktail glass - represents bars and lounges
    'Пиццерия': '🍕', // Pizza slice - represents pizza places
    'Суши': '🍣', // Sushi - represents sushi restaurants
    'Стейк-хаус': '🥩', // Steak - represents steak houses
    'Морепродукты': '🦐', // Shrimp - represents seafood restaurants
    'Фастфуд': '🍔', // Burger - represents fast food
    'Азиатская': '🍜', // Ramen bowl - represents Asian cuisine
    'Пекарня': '🥖', // Baguette - represents bakeries
    'Кондитерская': '🧁', // Cupcake - represents pastry shops
    'Мороженое': '🍦', // Ice cream - represents ice cream shops
    'Столовая': '🍽️', // Plate - represents cafeterias
    'Бистро': '🥪', // Sandwich - represents bistros
    'Паб': '🍺', // Beer mug - represents pubs
    'Ресторан': '🍽️' // Fine dining plate - represents restaurants
  }
  return cuisineMap[cuisine] || '🍽️'
}

// Price indicator functions - HIDDEN FOR NOW
// function getPriceSymbols(avgCheck: string): string {
//   const price = avgCheck.toLowerCase()
//   if (price.includes('300-800') || price.includes('бюджетные') || price.includes('дешево') || price.includes('недорого')) {
//     return '1₽' // Budget tier
//   } else if (price.includes('800-1500') || price.includes('средние') || price.includes('средне') || price.includes('нормально')) {
//     return '2₽' // Average tier
//   } else if (price.includes('1500-2500') || price.includes('дорогие') || price.includes('дорого') || price.includes('высоко')) {
//     return '3₽' // Expensive tier
//   } else if (price.includes('2500+') || price.includes('премиум') || price.includes('очень дорого')) {
//     return '4₽' // Premium tier
//   }
//   return '2₽' // Default to average
// }

// function getPriceClass(avgCheck: string): string {
//   const price = avgCheck.toLowerCase()
//   if (price.includes('300-800') || price.includes('бюджетные') || price.includes('дешево') || price.includes('недорого')) {
//     return 'price-cheap'
//   } else if (price.includes('800-1500') || price.includes('средние') || price.includes('средне') || price.includes('нормально')) {
//     return 'price-affordable'
//   } else if (price.includes('1500-2500') || price.includes('дорогие') || price.includes('дорого') || price.includes('высоко')) {
//     return 'price-expensive'
//   } else if (price.includes('2500+') || price.includes('премиум') || price.includes('очень дорого')) {
//     return 'price-premium'
//   }
//   return 'price-affordable'
// }

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

// Load reviews on component mount
onMounted(() => {
  loadReviews()
})
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
/* Categories Bar */
.categories-bar {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0.75rem 0;
  margin: 0 1rem;
}

/* Search Sticky */
.search-sticky {
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
  display: flex;
  align-items: center;
  gap: 0.25rem;
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
  width: 60px;
  height: 60px;
  border-radius: 8px;
  font-size: 2rem;
  background: #f8fafc;
  position: relative;
  cursor: help;
  color: #1f2937;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0;
  margin: 0.15rem;
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
    font-size: 0.75rem;
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

/* Category chips */
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

/* Categories Bar Styles */
.categories-bar {
  padding: 0.5rem 1rem;
  margin-top: 0.25rem;
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .category-btn {
    padding: 0.5rem 1rem;
    font-size: 0.95rem;
  }
  
  .category-scroll {
    gap: 0.75rem;
  }
}

/* Star Rating Styling */
.stars .star {
  color: #fbbf24;
  opacity: 0.3;
  transition: all 0.2s ease;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.stars .star.filled {
  opacity: 1;
  color: #f59e0b;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* Rating Stars for Sort Button */
.rating-stars {
  display: flex;
  gap: 2px;
  align-items: center;
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

/* Star size variations */
.rating-stars .star.size-1 {
  font-size: 8px;
}

.rating-stars .star.size-2 {
  font-size: 10px;
}

.rating-stars .star.size-3 {
  font-size: 12px;
}

.rating-stars .star.size-4 {
  font-size: 14px;
}

.rating-stars .star.size-5 {
  font-size: 16px;
}
</style>
