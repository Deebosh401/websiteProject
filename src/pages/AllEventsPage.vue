<template>
  <div class="all-events-page">
    <div class="page-header">
      <h1>Афиша событий</h1>
      <p>Все предстоящие события в хронологическом порядке</p>
    </div>

    <div class="calendar-section">
      <div class="month-indicator">
        <span class="month-name">{{ currentMonthName.toUpperCase() }}</span>
        <div class="calendar-navigation">
          <button class="nav-arrow" @click="scrollToPreviousBatch" :disabled="!canScrollLeft">
            <Icon icon="mdi:chevron-left" />
          </button>
          <button class="nav-arrow" @click="scrollToNextBatch" :disabled="!canScrollRight">
            <Icon icon="mdi:chevron-right" />
        </button>
        </div>
      </div>
      
      <div class="horizontal-calendar">
        <div class="dates-scroll" ref="datesScroll">
          <div 
            v-for="date in scrollableDates" 
            :key="date.key"
            class="date-item"
            :class="{
              'today': date.isToday,
              'selected': date.isSelected,
              'in-range': date.isInRange,
              'weekend': date.isWeekend,
              'past': date.isPast,
              'has-selection': hasAnySelection
            }"
            @click="date.isPast ? null : selectDate(date)"
            :title="date.isPast ? 'Нельзя выбрать прошедшую дату' : ''"
          >
            <div class="date-number">{{ date.day }}</div>
            <div class="day-name">{{ date.dayName }}</div>
        </div>
        </div>
      </div>
    </div>

    <div v-if="selectedCategory !== 'Топ'" class="results-count">
      <span>{{ getResultsCountText(filteredEvents.length) }}</span>
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
          aria-label="Поиск events"
        />
        <button 
          v-if="selectedCategory !== 'Топ'" 
          class="rating-sort-btn" 
          @click="toggleRatingSort" 
          :title="getRatingSortTitle()"
        >
          <span class="rating-stars">
            <Icon v-for="i in 5" :key="i" class="star" :class="{ filled: getStarFilled(i) }" icon="lucide:star" />
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
      :category="selectedCategory"
      :existingFilters="activeFilters"
      :currentMatchCount="filteredEvents.length"
      @apply="applyFilters"
      @close="showFilterModal = false"
    />

    <div class="active-chips" v-if="contextChips.length">
      <button class="clear-btn" @click="clearAllFilters">Очистить все</button>
      <button v-for="chip in contextChips" :key="chip.key" class="chip active" @click="chip.clear()">
        {{ chip.label }} ×
      </button>
    </div>


    <div class="events-list">
      <div
        class="event-card"
        v-for="event in filteredEvents"
        :key="event.id"
        @click="goToEvent(event)"
        :style="{ '--bg-image': `url(${event.image || '/default.jpg'})` }"
      >
        <div class="card-bg-image"></div>
        
        <div class="card-content-overlay">
          <div class="card-content">
            <div class="card-header">
              <h3 class="event-name">{{ event.name }}</h3>
              <div class="rating-badge" v-if="event.rating">
                <Icon icon="lucide:star" class="rating-star" />
                <span class="rating-number">{{ event.rating }}</span>
              </div>
          </div>
            
            <div class="info-row">
              <div class="info-item date-time">
                <Icon icon="lucide:calendar" class="info-icon" />
                <span class="info-text">{{ getEventDay(event.date || '') }} {{ getEventMonth(event.date || '') }}</span>
                <Icon icon="lucide:clock" class="info-icon" />
                <span class="info-text">{{ getEventTime(event.date || '') }}</span>
                <div class="badges-group">
                <div class="participants-badge" v-if="event.checkedIn">
                  <Icon icon="mdi:account-group" class="participants-icon" />
                  <span class="participants-number">{{ event.checkedIn }}</span>
        </div>
                
                <div class="price-badge" v-if="event.price === 0">
                  <Icon icon="mdi:gift" class="price-icon" />
                  <span class="price-text">Бесплатно</span>
                </div>
                <div class="price-badge" v-else-if="event.price">
                  <Icon icon="mdi:currency-rub" class="price-icon" />
                  <span class="price-amount">{{ event.price }}</span>
                </div>
              </div>
              </div>
              
            </div>
            
            <div class="location-row" v-if="event.location">
              <div class="info-item">
                <Icon icon="lucide:map-pin" class="info-icon" />
                <span class="info-text">{{ event.location }}</span>
              </div>
            </div>
          </div>
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
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { allAttractions, type Attraction, categoriesCarouselData, getMonthNames, getDayNames } from '../Data'
import { intelligentSearch } from '../utils/intelligentSearch'
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
// Initialize selectedCategory with localStorage or default to 'Топ'
const selectedCategory = ref(localStorage.getItem('afishaSelectedCategory') || 'Топ')
const ratingSortOrder = ref<'asc' | 'desc'>('desc') // Default to descending (5 stars)

// Date range - initialize empty, today will be shown by default but not "selected"
const dateRange = ref<{
  start: string | null,
  end: string
}>({
  start: null,
  end: ''
})

// Calendar state
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())

// Track the currently visible date for month display
const visibleDate = ref(new Date())

// Horizontal calendar data
const datesScroll = ref<HTMLElement | null>(null)
const canScrollRight = ref(true)
const canScrollLeft = ref(false)

// Calendar data - imported from Data.ts
const monthNames = getMonthNames()
const dayNames = getDayNames()

// Computed properties for calendar
const currentMonthName = computed(() => monthNames[visibleDate.value.getMonth()])


// Generate scrollable dates for horizontal calendar
const scrollableDates = computed(() => {
  const dates: Array<{
    key: string
    date: Date
    day: number
    dayName: string
    isToday: boolean
    isSelected: boolean
    isInRange: boolean
    isWeekend: boolean
    isPast: boolean
  }> = []

  const today = new Date()
  // Ensure we get the correct local date by using local timezone
  const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startDate = new Date(localToday)
  startDate.setDate(localToday.getDate() - 7) // Show 7 days before today

  // Generate 3 months ahead (approximately 100 days) starting from 7 days ago
  for (let i = 0; i < 100; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    
    // Check if date is in selected range
    let isSelected = false
    let isInRange = false
    
    if (dateRange.value.start && dateRange.value.end) {
      const start = new Date(dateRange.value.start + 'T00:00:00')
      const end = new Date(dateRange.value.end + 'T23:59:59')
      const current = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      
      if (current >= start && current <= end) {
        isInRange = true
        if (current.getTime() === start.getTime() || current.getTime() === end.getTime()) {
          isSelected = true
        }
      }
    } else if (dateRange.value.start) {
      const start = new Date(dateRange.value.start + 'T00:00:00')
      const current = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      isSelected = current.getTime() === start.getTime()
    }
    
    dates.push({
      key: dateStr,
      date: new Date(date),
      day: date.getDate(),
      dayName: dayNames[date.getDay()],
      isToday: date.toDateString() === localToday.toDateString(),
      isSelected,
      isInRange,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      isPast: date < localToday && date.toDateString() !== localToday.toDateString()
    })
  }

  return dates
})

const categories = computed(() => {
  // Use a try-catch to handle the initialization order issue
  try {
    const categoriesWithEvents = categoriesCarouselData.value.filter(category => {
      // Check if this category has any events with date/time
      return allEvents.value.some(event => 
        event.categories && event.categories.includes(category.name)
      )
    })
    
    return [
      { name: 'Топ', label: 'Все' },
      ...categoriesWithEvents
    ]
  } catch (error) {
    // Fallback to all categories if allEvents isn't ready yet
    return [
      { name: 'Топ', label: 'Все' },
  ...categoriesCarouselData.value
    ]
  }
})

// Watch categories to ensure selectedCategory is valid
watch(categories, (newCategories) => {
  const categoryNames = newCategories.map(c => c.name)
  if (!categoryNames.includes(selectedCategory.value)) {
    selectedCategory.value = 'Топ'
    localStorage.setItem('afishaSelectedCategory', 'Топ')
  }
}, { immediate: true })

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

// Check if any dates are selected by the user
const hasAnySelection = computed(() => {
  return dateRange.value.start !== null && dateRange.value.start !== ''
})

// Filter events by date range and other criteria
const filteredEvents = computed(() => {
  let events = [...allEvents.value]

  // Filter by city
  if (selectedCity.value) {
    events = events.filter(event => event.city === selectedCity.value)
  }

  // Filter by date range - show today's events by default if no dates selected
  if (dateRange.value.start) {
    const startDate = new Date(dateRange.value.start + 'T00:00:00').getTime()
    events = events.filter(event => {
      const eventDate = new Date(event.date as string).getTime()
      return eventDate >= startDate
    })
  } else {
    // Show today's events by default when no dates are selected
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const todayStart = new Date(todayStr + 'T00:00:00').getTime()
    const todayEnd = new Date(todayStr + 'T23:59:59').getTime()
    events = events.filter(event => {
      const eventDate = new Date(event.date as string).getTime()
      return eventDate >= todayStart && eventDate <= todayEnd
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
  if (selectedCategory.value !== 'Топ') {
    events = events.filter(event => 
      event.categories && event.categories.includes(selectedCategory.value)
    )
  }

  // Quick filters removed - moved to advanced filters

  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    events = events.filter(a => intelligentSearch(a, q))
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
//   searchQuery.value.trim().length > 0 || selectedCategory.value !== 'Топ' || 
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
    selectedCategory.value = 'Топ'
  } else {
    selectedCategory.value = name
  }
  // Save selected category to localStorage
  localStorage.setItem('afishaSelectedCategory', selectedCategory.value)
}

function clearFilters() {
  searchQuery.value = ''
  activeFilters.value = {}
}

function clearAllFilters() {
  clearFilters()
  clearDateRange()
  selectedCategory.value = 'Топ'
  // Save reset category to localStorage
  localStorage.setItem('afishaSelectedCategory', 'Топ')
}

function clearDateRange() {
  // Reset to today
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  dateRange.value = { start: todayStr, end: '' }
}


function getResultsCountText(count: number) {
  if (count === 0) return 'События не найдены'
  if (count === 1) return 'Найдено 1 событие'
  if (count < 5) return `Найдено ${count} события`
  return `Найдено ${count} событий`
}

// Calendar functions



function selectDate(dateObj: any) {
  // Prevent selecting past dates
  if (dateObj.isPast) {
    return
  }
  
  // Get the exact date string from the date object
  const year = dateObj.date.getFullYear()
  const month = String(dateObj.date.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.date.getDate()).padStart(2, '0')
  const dateStr = `${year}-${month}-${day}`
  
  // If we have a complete range, the next click changes the start date
  if (dateRange.value.start && dateRange.value.end) {
    dateRange.value = { start: dateStr, end: '' }
    return
  }
  
  // If we only have a start date, set the end date
  if (dateRange.value.start && !dateRange.value.end) {
    // Use string comparison to avoid timezone issues
    if (dateStr < dateRange.value.start) {
      // If end date is before start date, swap them
      dateRange.value = { start: dateStr, end: dateRange.value.start }
    } else {
      dateRange.value = { start: dateRange.value.start, end: dateStr }
    }
    return
  }
  
  // If we have no start date, set it (this shouldn't happen now since we default to today)
  if (!dateRange.value.start) {
    dateRange.value = { start: dateStr, end: '' }
  }
}



function handleFilterClick() {
  showFilterModal.value = true
}

function applyFilters(filters: Record<string, any>) {
  activeFilters.value = filters
  showFilterModal.value = false
}

// Rating sort functionality
function toggleRatingSort() {
  // Toggle between the only 2 states
  ratingSortOrder.value = ratingSortOrder.value === 'desc' ? 'asc' : 'desc'
}

function getRatingSortTitle() {
  if (ratingSortOrder.value === 'desc') return 'Сортировка по рейтингу: по убыванию'
  return 'Сортировка по рейтингу: по возрастанию'
}

function getRatingSortIcon() {
  // Always show arrow down
  return '↓'
}

function getStarFilled(starIndex: number) {
  if (ratingSortOrder.value === 'asc') {
    // Ascending: show only 1 star (first star)
    return starIndex === 1
  } else {
    // Descending: show all 5 stars
    return true
  }
}

function goToEvent(event: Attraction) {
  router.push({ name: 'event-detail', params: { id: event.id } })
}

function goBack() {
  router.back()
}

// Calendar navigation functions
function scrollToPreviousBatch() {
  if (datesScroll.value) {
    const container = datesScroll.value
    const currentScrollLeft = container.scrollLeft
    
    // Find the first visible date
    let firstVisibleIndex = 0
    for (let i = 0; i < container.children.length; i++) {
      const child = container.children[i] as HTMLElement
      if (child.offsetLeft >= currentScrollLeft) {
        firstVisibleIndex = i
        break
      }
    }
    
    // Scroll back by exactly 5 dates
    const targetIndex = Math.max(0, firstVisibleIndex - 5)
    
    // Check if scrolling left would show past dates
    const todayStr = new Date().toISOString().split('T')[0]
    const todayIndex = scrollableDates.value.findIndex(date => date.key === todayStr)
    
    if (todayIndex !== -1 && targetIndex < todayIndex) {
      // Go back to today if we would scroll to past dates
      scrollToDate(todayIndex)
    } else {
      scrollToDate(targetIndex)
    }
  }
}

function scrollToNextBatch() {
  if (datesScroll.value) {
    const container = datesScroll.value
    const currentScrollLeft = container.scrollLeft
    
    // Find the first visible date
    let firstVisibleIndex = 0
    for (let i = 0; i < container.children.length; i++) {
      const child = container.children[i] as HTMLElement
      if (child.offsetLeft >= currentScrollLeft) {
        firstVisibleIndex = i
        break
      }
    }
    
    // Scroll forward by exactly 5 dates
    const targetIndex = Math.min(scrollableDates.value.length - 1, firstVisibleIndex + 5)
    
    scrollToDate(targetIndex)
  }
}

// Auto-scroll to today's date on mount
function scrollToToday() {
  nextTick(() => {
    if (datesScroll.value) {
      // Find today's date in the scrollable dates
      const todayStr = new Date().toISOString().split('T')[0]
      const todayIndex = scrollableDates.value.findIndex(date => date.key === todayStr)
      
      if (todayIndex !== -1) {
        // Use scrollIntoView for perfect alignment
        scrollToDate(todayIndex)
      }
    }
  })
}

// Simple scroll to specific date
function scrollToDate(dateIndex: number) {
  if (datesScroll.value && datesScroll.value.children[dateIndex]) {
    const dateItem = datesScroll.value.children[dateIndex] as HTMLElement
    dateItem.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'nearest', 
      inline: 'start' 
    })
  }
}

// Update scroll state
function updateScrollState() {
  if (datesScroll.value) {
    const { scrollLeft, scrollWidth, clientWidth } = datesScroll.value
    canScrollLeft.value = scrollLeft > 0
    canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 1
    
    // Update visible date based on scroll position
    updateVisibleDate()
  }
}

// Update the visible date based on scroll position
function updateVisibleDate() {
  if (!datesScroll.value) return
  
  const scrollLeft = datesScroll.value.scrollLeft
  const itemWidth = datesScroll.value.scrollWidth / scrollableDates.value.length
  const visibleIndex = Math.floor(scrollLeft / itemWidth)
  
  if (visibleIndex >= 0 && visibleIndex < scrollableDates.value.length) {
    const visibleDateObj = scrollableDates.value[visibleIndex]
    if (visibleDateObj) {
      visibleDate.value = new Date(visibleDateObj.date)
    }
  }
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

// Initialize calendar
onMounted(() => {
  // Set current month and year
  const today = new Date()
  currentMonth.value = today.getMonth()
  currentYear.value = today.getFullYear()
  
  // Add scroll event listener
  if (datesScroll.value) {
    datesScroll.value.addEventListener('scroll', updateScrollState)
    updateScrollState() // Initial state
  }
  
  // Scroll to today's date with a small delay to ensure DOM is ready
  setTimeout(() => {
    scrollToToday()
  }, 100)
})
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
  margin: 0.3rem;
  padding: 0.7rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Month Indicator */
.month-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0 0.5rem;
}

.month-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: #64748b;
  letter-spacing: 0.05em;
}

/* Horizontal Calendar */
.horizontal-calendar {
  position: relative;
  margin-bottom: 1rem;
}

.dates-scroll {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding: 0.5rem 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
}

.dates-scroll::-webkit-scrollbar {
  display: none;
}

.date-item {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: calc((100vw - 2rem - 4 * 0.75rem) / 5); /* Exactly 5 days fit in viewport */
  min-width: 60px;
  max-width: 80px;
  height: 70px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  scroll-snap-align: start;
  box-sizing: border-box;
}

.date-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

/* Today is only highlighted when no dates are selected at all */
.date-item.today:not(.selected):not(.in-range):not(.has-selection) {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.date-item.selected {
  background: #1e40af;
  border-color: #1e40af;
  color: white;
}

.date-item.in-range {
  background: rgba(30, 64, 175, 0.3);
  border-color: rgba(30, 64, 175, 0.4);
  color: #1e40af;
}

.date-item.weekend .day-name {
  color: #ef4444 !important;
}

.date-item.today.weekend .day-name,
.date-item.selected.weekend .day-name {
  color: rgba(0, 0, 0, 0.8) !important;
}

.date-item.past {
  opacity: 0.4;
  cursor: not-allowed;
}

.date-item.past:hover {
  transform: none;
  background: #f8fafc;
  border-color: #e2e8f0;
}

.date-number {
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 2px;
}

.day-name {
  font-size: 0.7rem;
  font-weight: 500;
  color: #64748b !important;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}


/* Calendar Navigation */
.calendar-navigation {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.nav-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-arrow:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: scale(1.05);
}

.nav-arrow:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.nav-arrow .icon {
  font-size: 1rem;
  color: #64748b;
}

.results-count {
  background: white;
  margin: 1rem;
  padding: 0.5rem 0.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.results-count span:first-child {
  font-weight: 600;
  color: #1f2937;
}

.date-range-info {
  color: #3b82f6;
  font-size: 0.9rem;
  background: #eff6ff;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #dbeafe;
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

/* Modern Calendar Widget */
.calendar-widget {
  background: #f8fafc;
  border-radius: 16px;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  max-width: 100%;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.month-navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.month-nav {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
}

.month-nav:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #3b82f6;
}

.month-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.month-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  min-width: 200px;
  text-align: center;
}

.quick-actions {
  display: flex;
  gap: 0.5rem;
}

.quick-btn {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #64748b;
}

.quick-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.today-btn {
  color: #3b82f6;
  border-color: #3b82f6;
}

.today-btn:hover {
  background: #eff6ff;
}


.weekdays-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 1rem;
}

.weekday {
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  padding: 0.5rem;
  text-transform: uppercase;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 1.5rem;
}

.date-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-height: 40px;
  transform: scale(1);
}

.date-cell:hover:not(.past):not(.other-month) {
  background: #f1f5f9;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.date-cell:hover:not(.past):not(.other-month) {
  background: #f1f5f9;
  transform: translateY(-1px);
}

.date-cell.other-month {
  opacity: 0.3;
  cursor: default;
}

.date-cell.today:not(.selected):not(.in-range) {
  background: #dbeafe;
  border-color: #3b82f6;
  font-weight: 700;
}

.date-cell.selected {
  background: #3b82f6 !important;
  color: white !important;
  border-color: #3b82f6 !important;
  font-weight: 700;
  position: relative;
  z-index: 2;
  animation: selectPop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55), todayPulse 2s ease-in-out infinite;
  transform: scale(1.1);
}

.date-cell.selected::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 2px solid #1d4ed8;
  border-radius: 10px;
  z-index: -1;
  animation: borderGlow 0.6s ease-out;
}

.date-cell.in-range {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%) !important;
  border-color: #0ea5e9 !important;
  position: relative;
  animation: rangeFill 0.5s ease-out;
}

.date-cell.weekend .date-number {
  color: #dc2626;
}

.date-cell.selected.weekend .date-number {
  color: white;
}

.date-cell.in-range.weekend .date-number {
  color: #dc2626;
}

.date-cell.past {
  opacity: 0.4;
  cursor: not-allowed;
  background: #f3f4f6;
  border-color: #d1d5db;
}

.date-cell.past:hover {
  background: #f3f4f6;
  transform: none;
}

.date-cell.past .date-number {
  color: #9ca3af;
}

.date-number {
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1;
}

.calendar-summary {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.selected-range {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.range-label {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.range-dates {
  font-size: 1rem;
  color: #1e293b;
  font-weight: 600;
}

.range-actions {
  display: flex;
  gap: 0.5rem;
}

.range-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.range-btn:hover {
  background: #dc2626;
}

/* Date Selection Animations */
@keyframes selectPop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1.1);
  }
}

@keyframes borderGlow {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes rangeFill {
  0% {
    background: white;
    transform: scale(0.95);
  }
  100% {
    background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
    transform: scale(1);
  }
}

@keyframes todayPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
  }
}

.selecting-end {
  color: #3b82f6;
  font-style: italic;
  opacity: 0.8;
  background: #eff6ff;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-left: 0.5rem;
  font-size: 0.85rem;
}

.range-indicator {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid #3b82f6;
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
  text-align: center;
}

.range-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.range-start,
.range-end {
  background: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
}

.range-line {
  flex: 1;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  border-radius: 2px;
  max-width: 100px;
}

.calendar-month {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.month-title {
  font-size: clamp(0.9rem, 3vw, 1.1rem);
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: center;
}

.calendar-actions {
  display: flex;
  justify-content: center;
}

.all-events-btn {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  padding: clamp(10px, 3vw, 12px) clamp(16px, 4vw, 24px);
  border-radius: 12px;
  font-weight: 600;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  width: 100%;
  justify-content: center;
}

.all-events-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.all-events-btn:active {
  transform: translateY(0);
}

/* Mobile-first responsive design */
@media (max-width: 480px) {
  .calendar-widget {
    padding: 0.75rem;
  }
  
  .calendar-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .month-navigation {
    justify-content: center;
  }
  
  .month-title {
    min-width: auto;
    font-size: 1rem;
  }
  
  .quick-actions {
    justify-content: center;
  }
  
  .month-nav {
    width: 36px;
    height: 36px;
  }
  
  .date-cell {
    min-height: 36px;
    border-radius: 6px;
  }
  
  .weekday {
    padding: 0.25rem;
    font-size: 0.7rem;
  }
  
  .calendar-summary {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
}

@media (min-width: 768px) {
  .calendar-section {
    padding: 1.5rem;
  }
  
  .date-item {
    width: 70px;
    height: 80px;
  }
  
  .date-number {
    font-size: 1.2rem;
  }
  
  .day-name {
    font-size: 0.75rem;
  }
  
  .dates-scroll {
    gap: 1rem;
  }
  
  /* Show more dates on larger screens */
  .date-item {
    width: 65px;
    height: 75px;
  }
  
  .month-nav {
    width: 44px;
    height: 44px;
  }
}

@media (min-width: 1024px) {
  .date-item {
    width: 60px;
    height: 70px;
  }
  
  .dates-scroll {
    gap: 0.75rem;
  }
  
  .date-cell {
    min-height: 48px;
    border-radius: 10px;
  }
  
  .weekday {
    padding: 0.75rem;
    font-size: 0.9rem;
  }
}

/* FILTERS */
/* Categories Bar */
.categories-bar {
  padding: 0 0.1rem 0.1rem;
}

.category-scroll {
  display: flex;
  overflow-x: auto;
  padding: 0.5rem 0.5rem; 
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
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 44px;
  min-width: 44px;
}
.chip .bullet { width: 8px; height: 8px; border-radius: 999px; background: rgba(37,99,235,0.25); box-shadow: inset 0 0 0 2px rgba(37,99,235,0.35); }
.chip.active .bullet { background: #2563eb; box-shadow: 0 0 0 4px rgba(37,99,235,0.18); }
.chip .label { white-space: nowrap; font-weight: 600; }
.chip.active { background: #f3f7ff; border-color: rgba(37,99,235,0.35); box-shadow: 0 4px 12px rgba(37,99,235,0.15); transform: translateY(-1px); }

/* Search Sticky */
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

.search-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  margin: 0; 
  padding: 0 1rem; 
  margin-top: 0.5rem;
}

.quick-filters {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
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
  gap: 0.1rem;
}

.rating-stars .star {
  font-size: 0.8rem;
  color: #cbd5e1;
  transition: color 0.2s ease;
}

.rating-stars .star.filled {
  color: #fbbf24;
}

.sort-arrow {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: bold;
}

.rating-sort-btn:hover {
  background: #e2e8f0;
  border-color: rgba(0,0,0,0.2);
}

.clear-btn { background: transparent; border: 1px solid rgba(0,0,0,0.12); border-radius: 8px; padding: 0.35rem 0.6rem; white-space: nowrap; }

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
  
  .chip {
    min-height: 48px;
    min-width: 48px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
  
  .category-scroll {
    padding: 0.75rem 0.5rem;
    gap: 0.75rem;
  }
  
  /* Ensure exactly 5 days are visible on mobile */
  .date-item {
    width: calc((100vw - 1rem - 4 * 0.5rem) / 5);
    min-width: 50px;
    max-width: 70px;
  }
  
  .dates-scroll {
    gap: 0.5rem;
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
  
  /* Extra small screens - adjust for exactly 5 days */
  .date-item {
    width: calc((100vw - 0.5rem - 4 * 0.25rem) / 5);
    min-width: 45px;
    max-width: 65px;
    height: 65px;
  }
  
  .dates-scroll {
    gap: 0.25rem;
    padding: 0.25rem 0;
  }
  
}

.active-chips { display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 1rem; flex-wrap: nowrap; overflow-x: auto; -ms-overflow-style: none; scrollbar-width: none; }
.active-chips::-webkit-scrollbar { display: none; }

/* Slider icon styles removed - using gear emoji instead */

.toggle {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
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

/* Event Cards with Background Image Overlay */
.event-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  will-change: transform;
  margin-bottom: 0.5rem;
  height: 280px;
  display: flex;
  flex-direction: column;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
}

/* Background Image */
.card-bg-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: var(--bg-image);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

/* Content Overlay */
.card-content-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
  height: 32%;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.1) 30%,
    rgba(0, 0, 0, 0.4) 100%
  );
  color: white;
}

.card-content {
  padding: 0.25rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  border-radius: 0 0 12px 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Responsive heights */
@media (min-width: 640px) {
  .event-card {
    height: 380px;
    width: 380px;
  }
}

@media (min-width: 1024px) {
  .event-card {
    height: 320px;
  }
}

/* Modern Card Layout with Creative Space Management */

/* Top Row: Name + Rating */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  gap: 0.3rem;
}

.event-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  flex: 1;
  line-height: 1.2;
  min-width: 0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.rating-badge {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  background: rgba(255, 255, 255, 0.15);
  padding: 0.2rem 0.4rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.rating-star {
  font-size: 0.9rem;
  color: #fbbf24;
}

.rating-number {
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* Middle Section: Date+Time on left, Participants+Price grouped on right */
.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  margin-bottom: 0;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  min-width: 0;
}

.date-time {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  flex-wrap: wrap;
  min-width: 0;
  flex: 1;
}

.badges-group {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
}

.location-row {
  margin-bottom: 0.2rem;
}

.info-icon {
  font-size: 0.7rem;
  color: #60a5fa;
  flex-shrink: 0;
}

.info-text {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Bottom Row: Participants + Price */
.bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.participants-badge {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  background: rgba(239, 68, 68, 0.25);
  padding-right: 0.2rem;
  padding-left: 0.2rem;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(239, 68, 68, 0.4);
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
  flex-shrink: 0;
}

.participants-icon {
  font-size: 0.8rem;
  color: #f87171;
}

.participants-number {
  font-size: 0.7rem;
  color: white;
  font-weight: 800;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

.price-badge {
  display: flex;
  align-items: center;
  gap: 0;
  background: rgba(16, 185, 129, 0.25);
  padding-right: 0.2rem;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(16, 185, 129, 0.4);
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
  flex-shrink: 0;
}

.price-icon {
  font-size: 0.8rem;
  color: #10b981;
}

.price-amount {
  font-size: 0.7rem;
  color: white;
  font-weight: 800;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

.price-text {
  font-size: 0.7rem;
  color: white;
  font-weight: 800;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
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

/* Rating Stars Styling */
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

/* Event Rating Badge */
.rating-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.rating-star {
  color: #f59e0b;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

.rating-number {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
}
</style>
