<template>
  <div class="local-lingo-weather">
    <!-- Top action buttons -->
    <div class="icon-button-row">
      <button class="icon-button" @click="openDictionary" aria-label="Локальный словарь">📖</button>
      <button class="icon-button" @click="openWeather" aria-label="Погода">🌤️</button>
    </div>

    <!-- Dictionary Modal -->
    <div
      v-if="showDictionary"
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
      @click.self="closeModals"
    >
      <div class="modal-content scrollable">
        <div class="modal-header">
          <h3>Локальный словарь</h3>
          <button class="close-btn" @click="closeModals" aria-label="Закрыть">✕</button>
        </div>

        <div class="expandable-list">
          <div v-for="(phrase, i) in phrases" :key="i" class="expandable-item">
            <div class="expandable-header" @click="toggleExpand(i)">
              <span class="label">{{ phrase.short }}</span>
              <span class="chevron">{{ expanded.includes(i) ? '▲' : '▼' }}</span>
            </div>

            <transition name="expand">
              <div v-if="expanded.includes(i)" class="expandable-body">
                <p>{{ phrase.full }}</p>
                <ul>
                  <li v-for="(ex, j) in phrase.examples" :key="j">{{ ex }}</li>
                </ul>
              </div>
            </transition>
          </div>
        </div>

        <button class="ack-btn" @click="closeModals">Закрыть</button>
      </div>
    </div>

    <!-- Weather Modal -->
    <div
      v-if="showWeather"
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
      @click.self="closeModals"
    >
      <div class="weather-modal">
        <div class="modal-header">
          <h3>Погода</h3>
          <button class="close-btn" @click="closeModals" aria-label="Закрыть">✕</button>
        </div>

        <!-- Loading / Error states -->
        <div v-if="loading" class="loader">Загрузка…</div>
        <div v-else-if="error" class="error">{{ error }}</div>

        <!-- Weather content -->
        <div class="weather-widget" v-else-if="currentWeather">
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

        <button class="ack-btn" @click="closeModals">Закрыть</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

/** -----------------------
 * Dictionary state/logic
 * --------------------- */
const showDictionary = ref(false)
const expanded = ref<number[]>([])

const phrases = [
  { short: 'Кёниг', full: 'Кёнигсберг кратко', examples: ['"1200" – парковка', '"Южный" – вокзал'] },
  { short: 'Башня', full: 'Форт или сторожевая башня', examples: ['Башня Дона'] },
  { short: 'Балтон', full: 'Балтийская набережная', examples: ['Поехали в Балтон!'] },
  { short: 'Победка', full: 'Улица Победы', examples: ['Живу на Победке'] },
  { short: 'Коса', full: 'Куршская Коса', examples: ['Поехали на Косу'] },
]

const toggleExpand = (index: number) => {
  const i = expanded.value.indexOf(index)
  if (i > -1) expanded.value.splice(i, 1)
  else expanded.value.push(index)
}

/** -----------------------
 * Weather state/logic
 * --------------------- */
const showWeather = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

interface WeatherCondition { text: string; icon: string }
interface CurrentWeather { temp_c: number; condition: WeatherCondition }
interface ForecastDay { date: string; day: { avgtemp_c: number; condition: WeatherCondition } }

const city = ref('')
const currentWeather = ref<CurrentWeather | null>(null)
const forecast = ref<ForecastDay[]>([])
const selectedDayIndex = ref<number>(0)

/* Your coordinates (Kaliningrad default) and API key */
const API_KEY = '393246f465d54987937212209251706'
const lat = 54.7104
const lon = 20.4522

const fetchWeather = async () => {
  try {
    loading.value = true
    error.value = null
    const res = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=6&lang=ru`
    )
    if (!res.ok) throw new Error('Не удалось загрузить погоду')
    const data = await res.json()
    city.value = data.location?.name ?? 'Город'
    currentWeather.value = data.current
    forecast.value = (data.forecast?.forecastday ?? []).slice(0, 6)
    selectedDayIndex.value = 0
  } catch (e: any) {
    error.value = e?.message || 'Ошибка загрузки погоды'
  } finally {
    loading.value = false
  }
}

const selectDay = (index: number) => {
  selectedDayIndex.value = index
  const selected = forecast.value[index]
  if (!selected) return
  currentWeather.value = {
    temp_c: selected.day.avgtemp_c,
    condition: selected.day.condition
  }
}

const formatDay = (iso: string): string =>
  new Date(iso).toLocaleDateString('ru-RU', { weekday: 'short' })

const formatDate = (iso: string): string => {
  const d = new Date(iso)
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
}

/** -----------------------
 * Modal controls
 * --------------------- */
const closeModals = () => {
  showDictionary.value = false
  showWeather.value = false
}

const openDictionary = () => {
  expanded.value = []
  showDictionary.value = true
}

const openWeather = () => {
  showWeather.value = true
}

/* Fetch weather only when the weather modal opens */
watch(showWeather, (on) => {
  if (on) fetchWeather()
})
</script>

<style scoped>
/* Shared: icon buttons row */
.icon-button-row {
  display: flex;
  justify-content: center;
  gap: 4%;
  padding: 0;
  flex-wrap: wrap;
}

.icon-button {
  aspect-ratio: 1 / 1;
  font-size: clamp(2.5rem, 5vw, 3rem);
  border-radius: 16px;
  border: none;
  background: rgba(225, 245, 254, 0.9);
  color: #064047;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.3s ease, background 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44vw;
}

.icon-button:hover {
  background: linear-gradient(135deg, #dba400ba, #ffc500ba, #44b78bba);
  color: white;
  transform: scale(1.05);
}

/* Shared: modal shell */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-end;
  z-index: 10000;
  animation: fadeIn 0.2s ease-in;
}

.modal-content,
.weather-modal {
  background: white;
  width: 100%;
  border-radius: 1.2rem 1.2rem 0 0;
  animation: slideUp 0.3s ease;
  max-height: 90vh;
  overflow-y: auto;
}

/* dictionary modal padding differs a bit */
.modal-content {
  padding: 1.5rem 1.25rem;
}

/* weather modal has tighter vertical rhythm */
.weather-modal {
  padding: 0.5rem 0 0.75rem;
}

/* header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 .75rem;
}

.modal-header h3 {
  margin: .2rem 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  padding: .25rem;
}

/* footer button */
.ack-btn {
  display: block;
  margin: 1rem auto 0.25rem;
  background: rgba(45, 45, 45, 0.707);
  color: white;
  padding: 0.7rem 1.2rem;
  border-radius: 14px;
  font-size: 1rem;
  border: none;
  cursor: pointer;
}

/* dictionary: expandable list */
.expandable-item + .expandable-item { border-top: 1px solid #eee; }
.expandable-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  cursor: pointer;
  padding: 0.6rem 0.2rem;
}
.expandable-body {
  padding: 0.2rem 0.2rem 0.6rem 0.2rem;
  font-size: 0.95rem;
  color: #2a2e33;
}
.expand-enter-active,
.expand-leave-active { transition: max-height 0.3s ease, opacity 0.3s ease; }
.expand-enter-from,
.expand-leave-to { max-height: 0; opacity: 0; }
.expand-enter-to,
.expand-leave-from { max-height: 300px; opacity: 1; }

/* weather: widget */
.weather-widget {
  background: #fff;
  border-radius: 20px;
  padding: 0.1rem;
  max-width: 420px;
  margin: 0.5rem auto 0;
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

.city { font-size: 1.3rem; font-weight: bold; }
.temp { font-size: 1.5rem; color: #f26c00; font-weight: bold; }
.condition { font-size: 1rem; color: #374151; }

.weather-icon img { width: 60px; height: auto; }

/* forecast row */
.forecast-scroll {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.5rem 0.25rem;
  width: 100%;
}
.forecast-scroll::-webkit-scrollbar { display: none; }

.forecast-icon {
  flex: 0 0 auto;
  width: 60px; height: 60px; border-radius: 50%;
  background: #f5f5f5; color: #374151; text-align: center;
  font-size: 0.75rem; font-weight: bold;
  display: flex; flex-direction: column; justify-content: center;
  transition: all 0.3s ease; border: 2px solid transparent;
}
.forecast-icon.active {
  background: linear-gradient(135deg, #f26c00 0%, #ffd900 100%);
  color: white; transform: scale(1.1); border: 2px solid #ffaa00;
  box-shadow: 0 4px 10px rgba(242, 108, 0, 0.2);
}
.day { font-size: 0.75rem; }
.date { font-size: 0.7rem; }

.end-spacer { flex: 0 0 0.1vw; pointer-events: none; }

/* loader / error */
.loader, .error {
  text-align: center;
  padding: .75rem 1rem;
  color: #374151;
}
.error { color: #b91c1c; }

/* animations */
@keyframes slideUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* responsive */
@media (max-width: 480px) {
  .weather-widget {
    margin: 1rem;
    padding: 0.75rem;
  }
}
</style>
