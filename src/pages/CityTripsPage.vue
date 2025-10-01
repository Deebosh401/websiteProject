<template>
  <div class="city-trips-page">
    <div class="page-header">
      <h1 class="page-title">Маршруты в {{ getCityInPrepositionalCase(cityName) }}</h1>
    </div>

    <div class="filters-section">
      <div class="search-row">
        <input 
          v-model="searchQuery" 
          class="search-input" 
          type="search" 
          placeholder="Поиск по названию, тегам…"
        />
      </div>
      
      <div class="filter-row">
        <select v-model="durationFilter" class="filter-select">
          <option value="">Длительность</option>
          <option value="0-2">до 2ч</option>
          <option value="2-4">2–4ч</option>
          <option value="4-8">4–8ч</option>
          <option value="8+">8+ ч</option>
        </select>
        
        <select v-model="distanceFilter" class="filter-select">
          <option value="">Дистанция</option>
          <option value="0-5">до 5км</option>
          <option value="5-10">5–10км</option>
          <option value="10-20">10–20км</option>
          <option value="20+">20+ км</option>
        </select>
        
        <select v-model="difficultyFilter" class="filter-select">
          <option value="">Сложность</option>
          <option value="лёгкий">Лёгкий</option>
          <option value="средний">Средний</option>
          <option value="сложный">Сложный</option>
        </select>
      </div>

      <div class="tags-row">
        <button
          v-for="tag in availableTags"
          :key="tag"
          class="tag-chip"
          :class="{ active: selectedTags.has(tag) }"
          @click="toggleTag(tag)"
        >
          #{{ tag }}
        </button>
      </div>
    </div>

    <div class="results-count">
      <span>{{ getResultsCountText(filteredTrips.length) }}</span>
    </div>

    <div class="trips-grid">
      <article
        v-for="trip in filteredTrips"
        :key="trip.id"
        class="trip-card"
        @click="openTripDetail(trip)"
      >
        <div class="trip-media">
          <img :src="trip.cover" class="trip-img" :alt="trip.title" loading="lazy" />
          <div class="trip-overlay">
            <h3 class="trip-title">{{ trip.title }}</h3>
            <div class="trip-meta">
              <span class="meta-item">
                <Icon icon="mdi:clock-outline" width="16" />
                {{ trip.duration }}ч
              </span>
              <span class="meta-item">
                <Icon icon="mdi:map-marker-distance" width="16" />
                {{ trip.distance }}км
              </span>
              <span class="difficulty-badge" :data-difficulty="trip.difficulty">
                {{ getDifficultyLabel(trip.difficulty) }}
              </span>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div v-if="selectedTrip" class="trip-modal-overlay" @click.self="closeTripDetail">
      <div class="trip-modal">
        <div class="modal-header">
          <h2>{{ selectedTrip.title }}</h2>
          <button class="close-btn" @click="closeTripDetail">
            <Icon icon="lucide:x" width="20" />
          </button>
        </div>
        
        <div class="modal-content">
          <div class="trip-image">
            <img :src="selectedTrip.cover" :alt="selectedTrip.title" />
          </div>
          
          <div class="trip-info">
            <div class="info-row">
              <span class="info-label">Длительность:</span>
              <span class="info-value">{{ selectedTrip.duration }}ч</span>
            </div>
            <div class="info-row">
              <span class="info-label">Дистанция:</span>
              <span class="info-value">{{ selectedTrip.distance }}км</span>
            </div>
            <div class="info-row">
              <span class="info-label">Сложность:</span>
              <span class="info-value">{{ getDifficultyLabel(selectedTrip.difficulty) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Стоимость:</span>
              <span class="info-value">{{ selectedTrip.costs?.amount || 'По запросу' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Гид:</span>
              <span class="info-value">{{ selectedTrip.owner.name }}</span>
            </div>
          </div>
          
          <div class="trip-description">
            <h3>Описание</h3>
            <p>{{ selectedTrip.summary || 'Описание маршрута пока не добавлено.' }}</p>
          </div>
          
          <div class="trip-tags">
            <span v-for="tag in selectedTrip.tags" :key="tag" class="tag">
              #{{ tag }}
            </span>
          </div>
          
          <div class="trip-actions">
            <button class="action-btn primary" @click="contactGuide">
              <Icon icon="lucide:phone" width="16" />
              Связаться с гидом
            </button>
            <button class="action-btn secondary" @click="bookTrip">
              <Icon icon="lucide:calendar-check" width="16" />
              Забронировать
            </button>
          </div>
        </div>
      </div>
    </div>

    <button class="back-floating-btn" @click="goBack">
      ← Назад
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { getTrailsByCity, type Trail } from '../Data'
import { userHistory } from '../utils/userHistory'

const router = useRouter()
const route = useRoute()

// Get city from route params
const cityName = computed(() => String(route.params.city || ''))

// Function to convert city names to prepositional case for "в" preposition
function getCityInPrepositionalCase(city: string): string {
  const cityCases: Record<string, string> = {
    'Калининград': 'Калининграде',
    'Светлогорск': 'Светлогорске',
    'Зеленоградск': 'Зеленоградске',
    'Янтарный': 'Янтарном',
    'Советск': 'Советске',
    'Балтийск': 'Балтийске',
    'Черняховск': 'Черняховске',
    'Гвардейск': 'Гвардейске',
    'Гусев': 'Гусеве',
    'Багратионовск': 'Багратионовске',
    'Пионерский': 'Пионерском',
    'Гурьевск': 'Гурьевске',
    'Озерск': 'Озерске',
    'Железнодорожный': 'Железнодорожном',
    'Нестеров': 'Нестерове',
    'Правдинск': 'Правдинске',
    'Краснознаменск': 'Краснознаменске',
    'Славск': 'Славске',
    'Полесск': 'Полесске',
    'Неман': 'Немане',
    'Ладушкин': 'Ладушкине',
    'Мамоново': 'Мамонове'
  }
  
  return cityCases[city] || city
}

// State
const searchQuery = ref('')
const durationFilter = ref('')
const distanceFilter = ref('')
const difficultyFilter = ref('')
const selectedTags = ref<Set<string>>(new Set())
const selectedTrip = ref<Trail | null>(null)

// Get trips for this city
const cityTrips = computed(() => getTrailsByCity(cityName.value))

// Available tags from city trips
const availableTags = computed(() => {
  const tags = new Set<string>()
  cityTrips.value.forEach(trip => {
    trip.tags.forEach(tag => tags.add(tag))
  })
  return Array.from(tags).sort()
})

// Filtered trips
const filteredTrips = computed(() => {
  return cityTrips.value.filter(trip => {
    // Search query
    const text = `${trip.title} ${trip.tags.join(' ')} ${trip.summary || ''}`.toLowerCase()
    const passSearch = !searchQuery.value || text.includes(searchQuery.value.toLowerCase())
    
    // Duration filter
    const passDuration = !durationFilter.value || matchesRange(trip.duration, durationFilter.value)
    
    // Distance filter
    const passDistance = !distanceFilter.value || matchesRange(trip.distance, distanceFilter.value)
    
    // Difficulty filter
    const passDifficulty = !difficultyFilter.value || trip.difficulty === difficultyFilter.value
    
    // Tags filter
    const passTags = !selectedTags.value.size || 
                    Array.from(selectedTags.value).every(tag => trip.tags.includes(tag))
    
    return passSearch && passDuration && passDistance && passDifficulty && passTags
  })
})

// Helper function for range matching
function matchesRange(val: number, spec: string): boolean {
  if (!spec) return true
  if (spec.endsWith('+')) return val >= parseFloat(spec)
  const [a, b] = spec.split('-').map(parseFloat)
  return val >= a && val < b
}

// Get difficulty label
function getDifficultyLabel(difficulty: string): string {
  const labels: Record<string, string> = {
    'лёгкий': 'Лёгкий',
    'средний': 'Средний',
    'сложный': 'Сложный'
  }
  return labels[difficulty] || difficulty
}

// Get results count text
function getResultsCountText(count: number): string {
  if (count === 0) return 'Маршруты не найдены'
  if (count === 1) return 'Найден 1 маршрут'
  if (count < 5) return `Найдено ${count} маршрута`
  return `Найдено ${count} маршрутов`
}

// Tag toggle
function toggleTag(tag: string): void {
  if (selectedTags.value.has(tag)) {
    selectedTags.value.delete(tag)
  } else {
    selectedTags.value.add(tag)
  }
}

// Trip detail modal
function openTripDetail(trip: Trail): void {
  selectedTrip.value = trip
}

function closeTripDetail(): void {
  selectedTrip.value = null
}

// Actions
function contactGuide(): void {
  if (selectedTrip.value) {
    // Here you would implement contact functionality
    alert(`Связаться с гидом ${selectedTrip.value.owner.name}`)
  }
}

function bookTrip(): void {
  if (selectedTrip.value) {
    // Here you would implement booking functionality
    alert(`Забронировать маршрут: ${selectedTrip.value.title}`)
  }
}

// Navigation
function goBack(): void {
  router.back()
}

// Save search state to history
function saveSearchState(): void {
  userHistory.saveSearchQuery(searchQuery.value)
  userHistory.saveLastPage(`trips-${cityName.value}`)
}

// Watch for changes and save to history
watch([searchQuery, durationFilter, distanceFilter, difficultyFilter], () => {
  saveSearchState()
})

// Save to history on mount
onMounted(() => {
  userHistory.saveLastPage(`trips-${cityName.value}`)
  if (cityName.value) {
    userHistory.saveLastCategory('Маршруты')
  }
  
  // Listen for city changes from header
  window.addEventListener('city:changed', handleCityChange)
})

// Clean up event listener
onUnmounted(() => {
  window.removeEventListener('city:changed', handleCityChange)
})

// Handle city changes from header
function handleCityChange(event: any) {
  const newCity = event.detail
  if (newCity && newCity !== cityName.value) {
    // Navigate to the new city's trips page
    router.push(`/city/${newCity}/trips`)
  }
}
</script>

<style scoped>
.city-trips-page {
  min-height: 100vh;
  background: #f8fafc;
  margin-top: 3.2rem;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}



.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.filters-section {
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.search-row {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.filter-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.filter-select {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-chip {
  padding: 0.5rem 0.75rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.tag-chip:hover {
  background: #e5e7eb;
}

.tag-chip.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.results-count {
  text-align: center;
  padding: 0.75rem 1rem;
  background: rgba(248, 250, 252, 0.9);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
}

.trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.trip-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.trip-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.trip-media {
  position: relative;
  height: 200px;
}

.trip-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.trip-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 1rem;
}

.trip-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.3;
}

.trip-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.difficulty-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.difficulty-badge[data-difficulty="лёгкий"] {
  background: #dcfce7;
  color: #14532d;
}

.difficulty-badge[data-difficulty="средний"] {
  background: #fef3c7;
  color: #92400e;
}

.difficulty-badge[data-difficulty="сложный"] {
  background: #fee2e2;
  color: #991b1b;
}

/* Modal styles */
.trip-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.trip-modal {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
}

.modal-content {
  padding: 1.5rem;
}

.trip-image {
  margin-bottom: 1.5rem;
}

.trip-image img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
}

.trip-info {
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.info-label {
  font-weight: 500;
  color: #6b7280;
}

.info-value {
  color: #1f2937;
}

.trip-description {
  margin-bottom: 1.5rem;
}

.trip-description h3 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
}

.trip-description p {
  margin: 0;
  color: #6b7280;
  line-height: 1.6;
}

.trip-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.trip-tags .tag {
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #6b7280;
}

.trip-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
}

.action-btn.primary:hover {
  background: #2563eb;
}

.action-btn.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.action-btn.secondary:hover {
  background: #e5e7eb;
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
  }
  
  .trips-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .trip-actions {
    flex-direction: column;
  }
}

/* Floating back button */
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
