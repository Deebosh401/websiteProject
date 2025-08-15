<template>
  <div class="header" :class="{ 'search-active': isSearchActive }">
    <div v-if="!isSearchActive" class="icon-wrapper" @click="toggleSearch">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" >
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
      </svg>
    </div>
    <div v-else class="search-container">
      <button class="back-button" @click="toggleSearch">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <div class="search-input-wrapper">
        <input
          type="text"
          v-model="searchQuery"
          id="search-input"
          name="search"
          placeholder="Поиск городов, событий, гидов..."
          class="search-input"
          @input="handleSearch"
          @keydown.enter="performSearch"
          @focus="showSuggestions = true"
        />
        <button v-if="searchQuery" class="clear-button" @click="clearSearch">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Search Suggestions -->
      <div v-if="showSuggestions && (searchQuery || searchHistory.length)" class="search-suggestions">
        <!-- Recent Searches -->
        <div v-if="searchHistory.length && !searchQuery" class="suggestions-section">
          <h4>Недавние поиски</h4>
          <div class="suggestion-item" v-for="item in searchHistory" :key="item" @click="selectSuggestion(item)">
            <Icon icon="mdi:history" />
            <span>{{ item }}</span>
          </div>
        </div>
        
        <!-- Search Results -->
        <div v-if="searchQuery && filteredResults.length" class="suggestions-section">
          <h4>Результаты поиска</h4>
          <div class="suggestion-item" v-for="item in filteredResults" :key="item.id" @click="selectSuggestion(item.name)">
            <Icon :icon="getItemIcon(item)" />
            <div class="suggestion-content">
              <span class="suggestion-title">{{ item.name }}</span>
              <span class="suggestion-subtitle">{{ item.category || item.city }}</span>
            </div>
          </div>
        </div>
        
        <!-- Popular Searches -->
        <div v-if="!searchQuery && !searchHistory.length" class="suggestions-section">
          <h4>Популярные поиски</h4>
          <div class="suggestion-item" v-for="item in popularSearches" :key="item" @click="selectSuggestion(item)">
            <Icon icon="mdi:trending-up" />
            <span>{{ item }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import { allAttractions, citiesData, categoriesCarouselData } from '../Data'

const searchQuery = ref('')
const isSearchActive = ref(false)
const showSuggestions = ref(false)
const searchHistory = ref([])
const filteredResults = ref([])

const popularSearches = [
  'Калининград',
  'Экскурсии',
  'Рестораны',
  'Музеи',
  'Парки'
]

// Load search history from localStorage
onMounted(() => {
  const saved = localStorage.getItem('searchHistory')
  if (saved) {
    searchHistory.value = JSON.parse(saved)
  }
})

// Save search history to localStorage
const saveSearchHistory = (query) => {
  if (!query.trim()) return
  
  const history = searchHistory.value.filter(item => item !== query)
  history.unshift(query)
  searchHistory.value = history.slice(0, 5) // Keep only 5 recent searches
  
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

const handleSearch = () => {
  if (!searchQuery.value.trim()) {
    filteredResults.value = []
    return
  }
  
  const query = searchQuery.value.toLowerCase()
  const results = []
  
  // Search in attractions
  allAttractions.value.forEach(item => {
    if (item.name.toLowerCase().includes(query) || 
        item.category.toLowerCase().includes(query) ||
        item.city.toLowerCase().includes(query)) {
      results.push({ ...item, type: 'attraction' })
    }
  })
  
  // Search in cities
  citiesData.forEach(item => {
    if (item.name.toLowerCase().includes(query)) {
      results.push({ ...item, type: 'city' })
    }
  })
  
  // Search in categories
  categoriesCarouselData.forEach(item => {
    if (item.name.toLowerCase().includes(query)) {
      results.push({ ...item, type: 'category' })
    }
  })
  
  filteredResults.value = results.slice(0, 8) // Limit to 8 results
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    saveSearchHistory(searchQuery.value)
    // Emit search event for parent component
    emit('search', searchQuery.value)
    showSuggestions.value = false
  }
}

const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion
  performSearch()
}

const clearSearch = () => {
  searchQuery.value = ''
  filteredResults.value = []
  showSuggestions.value = false
}

const getItemIcon = (item) => {
  switch (item.type) {
    case 'attraction': return 'mdi:map-marker'
    case 'city': return 'mdi:city'
    case 'category': return 'mdi:tag'
    default: return 'mdi:map-marker'
  }
}

// Close suggestions when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.search-container')) {
    showSuggestions.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function toggleSearch() {
  isSearchActive.value = !isSearchActive.value;
  nextTick(() => {
    const input = document.querySelector('.search-input');
    if (isSearchActive.value && input) {
      input.focus();
    } else {
      document.activeElement?.blur(); 
      window.scrollTo(0, 0); 
    }
  });
}

const emit = defineEmits(['search'])
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  position: relative;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  padding: 0.5rem 0.5rem;
}

.icon-wrapper {
  cursor: pointer;
  margin-left: auto;
  transition: transform 0.3s ease;
  width: clamp(2.2rem, 3vw, 3rem);
  height: clamp(2.2rem, 3vw, 3rem);
}

.icon-wrapper:hover {
  transform: scale(1.1) rotate(15deg);
}

.search-active {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 95%;
  align-items: center;
  background-color: #f8f8f8;
  border-radius: 0.75rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  padding: 0.75rem 1rem;
  z-index: 9999;
  max-width: 100%;
  margin: 0 auto;
  transition: all 0.2s ease-in-out;
  height: auto;
  min-height: 75px;
}

.search-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
}

.back-button {
  background: none;
  border: none;
  cursor: pointer;
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  padding: 0;
  transition: transform 0.3s ease;
}

.back-button:hover {
  transform: scale(1.1);
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  outline: none;
  padding: 0.5rem 0;
}

.search-input::placeholder {
  color: #999;
}

.clear-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  margin-top: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
}

.suggestions-section {
  padding: 1rem;
}

.suggestions-section h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  color: #666;
  font-weight: 600;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease;
}

.suggestion-item:hover {
  background-color: #f5f5f5;
}

.suggestion-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.suggestion-title {
  font-weight: 500;
  color: #333;
}

.suggestion-subtitle {
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.25rem;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .search-active {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    border-radius: 0;
    margin: 0;
  }
  
  .search-suggestions {
    position: fixed;
    top: 75px;
    left: 0;
    right: 0;
    border-radius: 0;
    max-height: calc(100vh - 75px);
  }
}
</style>