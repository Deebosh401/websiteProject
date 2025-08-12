
<template>
  <div class="weather-widget" v-if="currentWeather">
    <div class="top-section">
      <div class="location-info">
        <div class="city">{{ city }}</div>
        <div class="temp">{{ Math.round(currentWeather.temp_c) }}°</div>
        <div class="condition">{{ currentWeather.condition.text }}</div>
      </div>
      <div class="weather-icon">
        <img :src="currentWeather.condition.icon" alt="weather" />
      </div>
    </div>

    <div class="forecast-scroll">
       <div class="end-spacer" aria-hidden="true"></div>
      <div
        v-for="(day, index) in forecast"
        :key="index"
        class="forecast-icon"
        :class="{ active: selectedDayIndex === index }"
        @click="selectDay(index)"
      >
        <div class="day">{{ formatDay(day.date) }}</div>
        <div class="date">{{ formatDate(day.date) }}</div>
      </div>
       <div class="end-spacer" aria-hidden="true"></div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref, onMounted } from 'vue'

interface WeatherCondition {
  text: string
  icon: string
}

interface CurrentWeather {
  temp_c: number
  condition: WeatherCondition
}

interface ForecastDay {
  date: string
  day: {
    avgtemp_c: number
    condition: WeatherCondition
  }
}

const city = ref('')
const currentWeather = ref<CurrentWeather | null>(null)
const forecast = ref<ForecastDay[]>([])
const selectedDayIndex = ref<number>(0)

const API_KEY = '393246f465d54987937212209251706'
const lat = 54.7104
const lon = 20.4522

onMounted(async () => {
  const res = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=6&lang=ru`
  )
  const data = await res.json()
  city.value = data.location.name
  currentWeather.value = data.current
  forecast.value = data.forecast.forecastday.slice(0, 6)
})

const formatDay = (iso: string): string =>
  new Date(iso).toLocaleDateString('ru-RU', { weekday: 'short' })

const formatDate = (iso: string): string => {
  const date = new Date(iso)
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
}

const selectDay = (index: number) => {
  selectedDayIndex.value = index
  const selected = forecast.value[index]
  currentWeather.value = {
    temp_c: selected.day.avgtemp_c,
    condition: selected.day.condition
  }
}
</script>

<style scoped>
.weather-widget {
  background: #fff;
  border-radius: 20px;
  padding: 0.1rem;
  max-width: 400px;
  margin: 0.5rem auto;
  font-family: 'Arial', sans-serif;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  color: #1f2f3f;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.top-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.location-info {
  text-align: left;
  flex-grow: 1;
  padding: 0 1rem;
}

.city {
  font-size: 1.3rem;
  font-weight: bold;
}

.temp {
  font-size: 1.5rem;
  color: #f26c00;
  font-weight: bold;
}

.condition {
  font-size: 1rem;
  color: #374151;
}

.weather-icon img {
  width: 60px;
  height: auto;
}

.forecast-scroll {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.5rem 0;
  width: 100%;
}

.forecast-scroll::-webkit-scrollbar {
  display: none;
}

.forecast-icon {
  flex: 0 0 auto;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #f5f5f5;
  color: #374151;
  text-align: center;
  font-size: 0.75rem;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.forecast-icon.active {
  background: linear-gradient(135deg, #f26c00 0%, #ffd900 100%);
  color: white;
  transform: scale(1.1);
  border: 2px solid #ffaa00;
  box-shadow: 0 4px 10px rgba(242, 108, 0, 0.2);
}

.day {
  font-size: 0.75rem;
}

.date {
  font-size: 0.7rem;
}

/* Responsive */
@media (max-width: 480px) {
  .weather-widget {
    margin: 1rem;
    padding: 0.75rem;
  }
}
</style>