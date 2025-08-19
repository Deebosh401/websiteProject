<template>
  <div class="header" :class="{ 'search-active': isSearchActive }">
    <div v-if="!isSearchActive" class="icon-wrapper" @click="toggleSearch">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" >
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
      </svg>
    </div>
    <div v-else class="search-container">
      <button class="back-button" @click="toggleSearch" aria-label="Закрыть поиск">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <div class="input-wrap">
        <input
          type="text"
          v-model="searchQuery"
          id="search-input"
          name="search"
          :placeholder="placeholder"
          class="search-input"
          autocomplete="off"
        />
        <ul v-if="results.length && isSearchActive" class="results" role="listbox">
          <li v-for="(r,i) in results" :key="i" class="result" role="option" @click="goToResult(r)">
            <span class="r-type" :data-type="r.type">{{ r.type === 'event' ? 'Событие' : 'Город' }}</span>
            <span class="r-name">{{ r.label }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
  
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { allAttractions, citiesData } from '../../Data'

const searchQuery = ref('')
const isSearchActive = ref(false)
const router = useRouter()

const placeholder = computed(() => 'Поиск по событиям и городам…')

const results = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []

  const events = (allAttractions.value || [])
    .filter(a => (a.name || '').toLowerCase().includes(q))
    .slice(0, 8)
    .map(a => ({ type: 'event', id: a.id, label: a.name }))

  const cities = (citiesData.value || [])
    .filter(c => (c.name || '').toLowerCase().includes(q))
    .slice(0, 5)
    .map(c => ({ type: 'city', label: c.name }))

  return [...events, ...cities].slice(0, 10)
})

function goToResult(r) {
  if (r.type === 'event' && r.id != null) {
    router.push({ name: 'event-detail', params: { id: r.id } })
  } else if (r.type === 'city') {
    router.push({ name: 'city-detail', params: { name: r.label } })
  }
  isSearchActive.value = false
  searchQuery.value = ''
}

function toggleSearch() {
  isSearchActive.value = !isSearchActive.value
  nextTick(() => {
    const input = document.querySelector('.search-input')
    if (isSearchActive.value && input) input.focus()
    else if (document.activeElement && document.activeElement.blur) (document.activeElement).blur()
  })
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  position: relative;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  padding: 0.5rem 0;
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
  right:0;
  width: 95%;
  align-items: center;
  background-color: #f8f8f8;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  padding: 0.75rem 1rem;
  z-index: 9999;
  max-width: 100%;
  margin: 0 auto;
  transition: all 0.2s ease-in-out;
  height: 75px;
}

.search-container {
  display: flex;
  align-items: center;
  width: 100%;
}

.input-wrap { position: relative; flex: 1; }

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
  transform: rotate(-15deg) scale(1.1);
}

.search-input {
  font-size:16px;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid #ccc;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #007bff;
  background-color: #f0f8ff;
}

.results {
  position: absolute;
  top: calc(100% + 6px);
  left: 0; right: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0,0,0,.08);
  padding: 6px;
  z-index: 10000;
  max-height: 50vh;
  overflow: auto;
}
.result { display: grid; grid-template-columns: auto 1fr; gap: 8px; align-items: center; padding: 8px 10px; border-radius: 8px; cursor: pointer; }
.result:hover { background: #f3f4f6; }
.r-type { font-size: 12px; color: #6b7280; padding: 2px 6px; border: 1px solid #e5e7eb; border-radius: 999px; }
.r-type[data-type="event"] { color: #2563eb; border-color: #bfdbfe; }
.r-type[data-type="city"] { color: #059669; border-color: #bbf7d0; }
.r-name { font-weight: 700; color: #111827; }

</style>