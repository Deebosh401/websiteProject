<template>
<div class="location-selector" ref="locationRef">
  <div class="location-button" @click="toggleCityDropdown" role="button" aria-haspopup="listbox" :aria-expanded="showCityDropdown" :aria-label="`Выбрать город: ${selectedCity}`">
  <svg
  xmlns="http://www.w3.org/2000/svg"
  class="location-icon animated-pin"
  viewBox="0 0 24 24"
  fill="#2563eb"
>
  <path
    fill-rule="evenodd"
    d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
    clip-rule="evenodd"
  />
  </svg>
  <span>{{ selectedCity }}</span>
  <span class="chevron">▾</span>
  </div>

  <div v-if="showCityDropdown" class="city-dropdown">
    <input
      type="text"
      v-model="searchQuery"
      placeholder="Поиск города..."
      class="search-input"
    />
    <ul>
      <li
        v-for="(city, index) in filteredCities"
        :key="index"
        @click="selectCity(city)"
        :class="{ selected: city === selectedCity, regional: city === regionalCenter }"
      >
        {{ city }}
      </li>
    </ul>
  </div>
</div>

  </template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { fetchRegionCities, type RegionCity } from '../../Data'

const selectedCity = ref('Город')
const showCityDropdown = ref(false)
const searchQuery = ref('')

const regionalCenter = 'Калининград'
const allCities = ref<RegionCity[]>([])

const orderedCities = computed(() => {
  const byName = [...allCities.value].sort((a, b) => a.name.localeCompare(b.name, 'ru'))
  const center = byName.find(c => c.isRegionalCenter)
  const others = byName.filter(c => !c.isRegionalCenter)
  return center ? [center.name, ...others.map(c => c.name)] : byName.map(c => c.name)
})

const filteredCities = computed(() =>
  orderedCities.value.filter((city) =>
    city.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)

const toggleCityDropdown = () => {
  showCityDropdown.value = !showCityDropdown.value
}

const selectCity = (city: string) => {
  selectedCity.value = city
  showCityDropdown.value = false
  localStorage.setItem('selectedCity', city)
  window.dispatchEvent(new CustomEvent('city:changed', { detail: city }))
}

const handleClickOutside = (e: MouseEvent) => {
  const dropdown = document.querySelector('.location-selector')
  if (dropdown && !dropdown.contains(e.target as Node)) {
    showCityDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)

  const savedCity = localStorage.getItem('selectedCity')
  if (savedCity) {
    selectedCity.value = savedCity
  }

  // reflect external changes (other tabs / code)
  window.addEventListener('city:changed', (e: any) => {
    const city = e?.detail
    if (city) selectedCity.value = city
  })

  // Load cities from catalog
  fetchRegionCities().then((list) => { allCities.value = list || [] })
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>


<style scoped>

.interactive-drop:hover {
  transform: scale(1.15) rotate(5deg);
  fill: #1d4ed8; 
}

.location-selector {
  position: relative;
  margin-left: 0;
  font-size: 0.75rem;
  z-index: 1000;
}

.location-button {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, #eaf3ff, #e2f6ff);
  border-radius: 999px;
  padding: 0.35rem 0.5rem;
  cursor: pointer;
  gap: 0.3rem;
  transition: background-color 0.2s ease, box-shadow .2s ease, transform .15s ease;
  border: 1px solid #dbeafe;
  
}

.location-button:hover {
  background-color: #e6f0ff;
  box-shadow: 0 2px 8px rgba(29,78,216,.12);
}

.location-button:active { transform: translateY(1px); }

.chevron {
  font-size: 1rem;
}

.city-dropdown {
  position: absolute;
  top: 110%;
  left: 0;
  width: 200px;
  max-height: 250px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  padding: 0.5rem 0;
  font-size: 1rem;
  border: 1px solid #eef2ff;
}

.search-input {
  width: 90%;
  margin: 0.3rem auto;
  padding: 0.4rem 0.6rem;
  display: block;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 0.9rem;
}

.city-dropdown ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.city-dropdown li {
  padding: 0.5rem 1rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s;
}

.city-dropdown li:hover {
  background-color: #f0f0f0;
}

.city-dropdown li.selected {
  background-color: #e0ecff;
  font-weight: bold;
}

.city-dropdown li.regional {
  font-weight: 700;
}

.city-dropdown li.selected.regional {
  font-weight: 900;
}

@keyframes pinPop {
  0% {
    transform: scale(0.5) translateY(-20px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

@keyframes pinBounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.25) translateY(-2px);
  }
}

.location-icon {
  width: 22px;
  height: 22px;
  margin-right: 0.35rem;
  transform-origin: center;
}

.animated-pin {
  animation: pinPop 0.6s ease-out;
  transition: transform 0.3s ease, fill 0.3s ease;
  cursor: pointer;
  animation-fill-mode: forwards;
}

.location-button:active .animated-pin {
  animation: pinBounce 0.3s ease;
}

.geo-confirm {
  position: absolute;
  top: 115%;
  left: 0;
  width: max-content;
  max-width: 280px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(0,0,0,0.12);
  padding: 0.6rem 0.7rem;
  font-size: 0.9rem;
}
.geo-actions { display: flex; gap: 0.4rem; margin-top: 0.4rem; }
.geo-actions button { border: 1px solid #dbeafe; background: #eff6ff; border-radius: 8px; padding: 0.3rem 0.6rem; cursor: pointer; }

/* Responsive Design */
@media (min-width: 768px) {
  .location-selector {
    font-size: 0.875rem;
  }
  
  .location-button {
    padding: 0.5rem 0.75rem;
    gap: 0.4rem;
  }
  
  .location-icon {
    width: 24px;
    height: 24px;
    margin-right: 0.4rem;
  }
  
  .city-dropdown {
    width: 240px;
    max-height: 300px;
    padding: 0.75rem 0;
  }
  
  .search-input {
    padding: 0.5rem 0.75rem;
    font-size: 1rem;
  }
  
  .city-dropdown li {
    padding: 0.75rem 1.25rem;
    font-size: 1rem;
  }
  
  .geo-confirm {
    max-width: 320px;
    padding: 0.75rem 1rem;
    font-size: 1rem;
  }
  
  .geo-actions button {
    padding: 0.4rem 0.8rem;
  }
}

@media (min-width: 1024px) {
  .location-selector {
    font-size: 1rem;
  }
  
  .location-button {
    padding: 0.6rem 0.875rem;
    gap: 0.5rem;
  }
  
  .location-icon {
    width: 26px;
    height: 26px;
    margin-right: 0.45rem;
  }
  
  .city-dropdown {
    width: 280px;
    max-height: 350px;
    padding: 1rem 0;
  }
  
  .search-input {
    padding: 0.6rem 0.875rem;
    font-size: 1.1rem;
  }
  
  .city-dropdown li {
    padding: 0.875rem 1.5rem;
    font-size: 1.1rem;
  }
  
  .geo-confirm {
    max-width: 360px;
    padding: 1rem 1.25rem;
    font-size: 1.1rem;
  }
  
  .geo-actions button {
    padding: 0.5rem 1rem;
  }
}

@media (min-width: 1280px) {
  .location-selector {
    font-size: 1.125rem;
  }
  
  .location-button {
    padding: 0.7rem 1rem;
    gap: 0.6rem;
  }
  
  .location-icon {
    width: 28px;
    height: 28px;
    margin-right: 0.5rem;
  }
  
  .city-dropdown {
    width: 320px;
    max-height: 400px;
    padding: 1.25rem 0;
  }
  
  .search-input {
    padding: 0.7rem 1rem;
    font-size: 1.2rem;
  }
  
  .city-dropdown li {
    padding: 1rem 1.75rem;
    font-size: 1.2rem;
  }
  
  .geo-confirm {
    max-width: 400px;
    padding: 1.25rem 1.5rem;
    font-size: 1.2rem;
  }
  
  .geo-actions button {
    padding: 0.6rem 1.2rem;
  }
}

@media (min-width: 1536px) {
  .location-selector {
    font-size: 1.25rem;
  }
  
  .location-button {
    padding: 0.8rem 1.125rem;
    gap: 0.7rem;
  }
  
  .location-icon {
    width: 30px;
    height: 30px;
    margin-right: 0.55rem;
  }
  
  .city-dropdown {
    width: 360px;
    max-height: 450px;
    padding: 1.5rem 0;
  }
  
  .search-input {
    padding: 0.8rem 1.125rem;
    font-size: 1.3rem;
  }
  
  .city-dropdown li {
    padding: 1.125rem 2rem;
    font-size: 1.3rem;
  }
  
  .geo-confirm {
    max-width: 440px;
    padding: 1.5rem 1.75rem;
    font-size: 1.3rem;
  }
  
  .geo-actions button {
    padding: 0.7rem 1.4rem;
  }
}

/* Mobile-specific adjustments */
@media (max-width: 767px) {
  .location-selector {
    font-size: 0.7rem;
  }
  
  .location-button {
    padding: 0.3rem 0.35rem;
    gap: 0.25rem;
  }
  
  .location-icon {
    width: 20px;
    height: 20px;
    margin-right: 0.3rem;
  }
  
  .city-dropdown {
    width: 180px;
    max-height: 200px;
  }
  
  .search-input {
    padding: 0.35rem 0.5rem;
    font-size: 0.85rem;
  }
  
  .city-dropdown li {
    padding: 0.4rem 0.875rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .location-selector {
    font-size: 0.65rem;
  }
  
  .location-button {
    padding: 0.25rem 0.3rem;
    gap: 0.2rem;
  }
  
  .location-icon {
    width: 18px;
    height: 18px;
    margin-right: 0.25rem;
  }
  
  .city-dropdown {
    width: 160px;
    max-height: 180px;
  }
  
  .search-input {
    padding: 0.3rem 0.4rem;
    font-size: 0.8rem;
  }
  
  .city-dropdown li {
    padding: 0.35rem 0.75rem;
    font-size: 0.85rem;
  }
}

</style>