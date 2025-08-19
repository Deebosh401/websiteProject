<template>
<!-- City Selector -->
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
        :class="{ selected: city === selectedCity }"
      >
        {{ city }}
      </li>
    </ul>
  </div>
</div>

  </template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const selectedCity = ref('Город')
const showCityDropdown = ref(false)
const searchQuery = ref('')

const cities = ref([
  'Москва',
  'Санкт-Петербург',
  'Калининград',
  'Сочи',
  'Казань',
  'Новосибирск',
  'Екатеринбург',
  'Нижний Новгород',
  'Владивосток',
])

const filteredCities = computed(() =>
  cities.value.filter((city) =>
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
  margin-left: 0.25rem;
  font-size: 0.8rem;
  z-index: 1000;
}

.location-button {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, #eaf3ff, #e2f6ff);
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  cursor: pointer;
  gap: 0.35rem;
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

</style>