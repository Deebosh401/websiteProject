<template>
  <div class="all-events-page">
    <div class="page-header">
      <h1>Афиша событий</h1>
      <p>Все предстоящие события в хронологическом порядке</p>
    </div>

    <!-- Calendar Section -->
    <div class="calendar-section">
      <div class="calendar-header">
        <h3>Выберите даты</h3>
        <button class="clear-dates-btn" @click="clearDateRange" v-if="dateRange.start || dateRange.end">
          Очистить даты
        </button>
      </div>
      
      <div class="date-inputs">
        <div class="date-input-group">
          <label for="start-date">С</label>
          <input 
            id="start-date"
            type="date" 
            v-model="dateRange.start"
            :min="today"
            @change="updateDateRange"
          />
        </div>
        <div class="date-input-group">
          <label for="end-date">По</label>
          <input 
            id="end-date"
            type="date" 
            v-model="dateRange.end"
            :min="dateRange.start || today"
            @change="updateDateRange"
          />
        </div>
      </div>
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
          aria-label="Поиск events"
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

    <!-- EVENTS LIST -->
    <div class="events-list">
      <div
        class="event-card"
        v-for="event in filteredEvents"
        :key="event.id"
        @click="goToEvent(event)"
      >
                  <div class="event-date">
            <div class="date-day">{{ getEventDay(event.date || '') }}</div>
            <div class="date-month">{{ getEventMonth(event.date || '') }}</div>
          </div>
        <div class="event-content">
          <h3>{{ event.name }}</h3>
          <p class="event-time">{{ getEventTime(event.date || '') }}</p>
          <p class="event-location" v-if="event.location">{{ event.location }}</p>
          <div class="event-meta">
            <span v-if="event.price === 0" class="price free">Бесплатно</span>
            <span v-else-if="event.price" class="price">{{ event.price }} ₽</span>
            <span v-if="event.rating" class="rating">⭐ {{ event.rating }}</span>
            <span v-if="event.checkedIn" class="participants">👥 {{ event.checkedIn }}</span>
          </div>
        </div>
        <div class="event-image">
          <img :src="event.image || '/default.jpg'" alt="event image" />
        </div>
      </div>
    </div>

    <div v-if="!filteredEvents.length" class="empty-state">
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
const selectedCity = ref<string>(localStorage.getItem('selectedCity') || 'Калининград')

// Listen for city changes
window.addEventListener('city:changed', (e: any) => {
  const c = e?.detail
  if (c) selectedCity.value = c
})

const showFilterModal = ref(false)
const activeFilters = ref<Record<string, any>>({})
const searchQuery = ref('')
// Quick filter variables removed
const selectedCategory = ref('👍🏼')

// Date range
const today = new Date().toISOString().split('T')[0]
const dateRange = ref({
  start: '',
  end: ''
})

// Get all categories
const categories = computed(() => [
  { name: '👍🏼', label: 'Все' },
  ...categoriesCarouselData.value
])

// Get all events with dates
const allEvents = computed(() => {
  const now = Date.now()
  return allAttractions.value
    .filter(a => a && a.date)
    .map(a => {
      const dateStr = a.date as string
      const tsNative = Date.parse(dateStr)
      const ts = Number.isNaN(tsNative) ? parseRu(dateStr) : tsNative
      return { ...a, _ts: ts }
    })
    .filter(a => !Number.isNaN(a._ts))
    .filter(a => a._ts >= now)
    .sort((a, b) => a._ts - b._ts)
    .map(({ _ts, ...rest }) => rest)
})

// Filter events by date range and other criteria
const filteredEvents = computed(() => {
  let events = [...allEvents.value]

  // Filter by city
  if (selectedCity.value) {
    events = events.filter(event => event.city === selectedCity.value)
  }

  // Filter by date range
  if (dateRange.value.start) {
    const startDate = new Date(dateRange.value.start).getTime()
    events = events.filter(event => {
      const eventDate = new Date(event.date as string).getTime()
      return eventDate >= startDate
    })
  }

  if (dateRange.value.end) {
    const endDate = new Date(dateRange.value.end + 'T23:59:59').getTime()
    events = events.filter(event => {
      const eventDate = new Date(event.date as string).getTime()
      return eventDate <= endDate
    })
  }

  // Filter by category
  if (selectedCategory.value !== '👍🏼') {
    events = events.filter(event => 
      event.categories && event.categories.includes(selectedCategory.value)
    )
  }

  // Quick filters removed - moved to advanced filters

  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    events = events.filter(a => (a.name || '').toLowerCase().includes(q))
  }

  // Apply advanced filters
  if (Object.keys(activeFilters.value).length > 0) {
    events = events.filter(a => matchesAdvanced(a, activeFilters.value, selectedCategory.value))
  }

  // Apply sorting - default to rating descending if no sorting is set
  const sortBy = activeFilters.value?.sortBy || 'rating'
  const sortOrder = activeFilters.value?.sortOrder || 'desc'
  
  if (sortBy === 'rating') {
    events.sort((a, b) => {
      const ratingA = a.rating || 0
      const ratingB = b.rating || 0
      if (sortOrder === 'desc') {
        return ratingB - ratingA
      } else {
        return ratingA - ratingB
      }
    })
  }

  return events
})

// const hasActiveFilters = computed(() =>
//   searchQuery.value.trim().length > 0 || selectedCategory.value !== '👍🏼' || 
//   dateRange.value.start || dateRange.value.end || Object.keys(activeFilters.value).length > 0
// )

const contextChips = computed(() => {
  const chips: Array<{ key: string; label: string; clear: () => void }> = []
  
  if (dateRange.value.start) {
    chips.push({ 
      key: 'date', 
      label: `Дата: ${formatDate(dateRange.value.start)}${dateRange.value.end ? ` - ${formatDate(dateRange.value.end)}` : '+'}`, 
      clear: () => clearDateRange() 
    })
  }
  // Quick filter chips removed
  
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
  clearDateRange()
  selectedCategory.value = '👍🏼'
}

function clearDateRange() {
  dateRange.value.start = ''
  dateRange.value.end = ''
}

function updateDateRange() {
  // Ensure end date is not before start date
  if (dateRange.value.start && dateRange.value.end && dateRange.value.end < dateRange.value.start) {
    dateRange.value.end = dateRange.value.start
  }
}

function handleFilterClick() {
  showFilterModal.value = true
}

function applyFilters(filters: Record<string, any>) {
  activeFilters.value = filters
  showFilterModal.value = false
}

function goToEvent(event: Attraction) {
  router.push({ name: 'event-detail', params: { id: event.id } })
}

function goBack() {
  router.back()
}

function parseRu(dateStr: string) {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2}))?$/.exec(String(dateStr))
  if (!m) return NaN
  const [, dd, mm, yyyy, hh = '00', min = '00'] = m
  return new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:00`).getTime()
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
}

function getEventDay(dateStr: string) {
  const date = new Date(dateStr)
  return date.getDate()
}

function getEventMonth(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { month: 'short' })
}

function getEventTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false })
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
.all-events-page {
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

/* Calendar Section */
.calendar-section {
  background: white;
  margin: 1rem;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.calendar-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.clear-dates-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
}

.date-inputs {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.date-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 150px;
}

.date-input-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.date-input-group input {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.date-input-group input:focus {
  outline: none;
  border-color: #3b82f6;
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

/* EVENTS LIST */
.events-list {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.event-card:hover {
  transform: translateY(-2px);
}

.event-date {
  text-align: center;
  min-width: 60px;
  padding: 0.5rem;
  background: #f0f9ff;
  border-radius: 8px;
  border: 2px solid #0ea5e9;
}

.date-day {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0ea5e9;
  line-height: 1;
}

.date-month {
  font-size: 0.8rem;
  color: #0369a1;
  text-transform: uppercase;
  font-weight: 600;
}

.event-content {
  flex: 1;
}

.event-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
}

.event-time {
  margin: 0 0 0.3rem 0;
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

.event-location {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #6b7280;
}

.event-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.price {
  font-weight: 600;
  font-size: 0.9rem;
}

.price.free {
  color: #059669;
}

.rating {
  font-size: 0.9rem;
  color: #f59e0b;
}

.participants {
  font-size: 0.9rem;
  color: #6b7280;
}

.event-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
