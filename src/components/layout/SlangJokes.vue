<template>
  <div class="local-lingo-weather">
    <div class="icon-button-row">
      <button class="icon-button" @click="openDictionary" aria-label="Локальный словарь">📖</button>
      <button class="icon-button" @click="openWeather" aria-label="Погода">🌤️</button>
    </div>

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

        <div v-if="loading" class="loader">Загрузка…</div>
        <div v-else-if="error" class="error">{{ error }}</div>

        <div class="weather-widget" v-else-if="currentWeather" :class="theme">
          <div class="top-section">
            <div class="location-info">
              <div class="city">{{ city }}</div>
              <div class="temp-row">
                <div class="temp">{{ formatTemp(currentWeather.temp_c) }}</div>
                <button class="unit-toggle" @click="useCelsius = !useCelsius">{{ useCelsius ? '°C' : '°F' }}</button>
              </div>
              <div class="condition">{{ currentWeather.condition.text }}</div>
            </div>
            <div class="weather-icon">
              <img :src="currentWeather.condition.icon" alt="weather" />
            </div>
          </div>

          <div class="metrics-row">
            <div class="metric-card" aria-label="Ветер">
              <span class="m-ico">💨</span>
              <span class="m-val">{{ details.wind }} км/ч</span>
              <span class="m-lbl">Ветер</span>
            </div>
            <div class="metric-card" aria-label="Влажность">
              <span class="m-ico">💧</span>
              <span class="m-val">{{ details.humidity }}%</span>
              <span class="m-lbl">Влажность</span>
            </div>
            <div class="metric-card" aria-label="UV">
              <span class="m-ico">☀️</span>
              <span class="m-val">{{ details.uv }}</span>
              <span class="m-lbl">UV</span>
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
              <img :src="day.day.condition.icon" alt="" class="f-icon" />
              <div class="minmax">
                <span>{{ formatTemp(day.day.mintemp_c ?? day.day.avgtemp_c) }}</span>
                <span>/</span>
                <span>{{ formatTemp(day.day.maxtemp_c ?? day.day.avgtemp_c) }}</span>
              </div>
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
import { ref, watch, computed } from 'vue'
import { getPhrases } from '../../Data'
const emit = defineEmits<{ (e: 'modal-toggle', open: boolean): void }>()

/** -----------------------
 * Dictionary state/logic
 * --------------------- */
const showDictionary = ref(false)
const expanded = ref<number[]>([])

const phrases = getPhrases()

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
interface ForecastDay { date: string; day: { avgtemp_c: number; mintemp_c?: number; maxtemp_c?: number; condition: WeatherCondition } }

const city = ref('')
const currentWeather = ref<CurrentWeather | null>(null)
const forecast = ref<ForecastDay[]>([])
const selectedDayIndex = ref<number>(0)
const useCelsius = ref(true)
const theme = computed(() => (currentWeather.value && Math.round(currentWeather.value.temp_c) <= 0 ? 'cold' : 'warm'))
const details = ref<{ wind: number; humidity: number; uv: number }>({ wind: 0, humidity: 0, uv: 0 })

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
    details.value = { wind: Math.round(data.current?.wind_kph ?? 0), humidity: Math.round(data.current?.humidity ?? 0), uv: Math.round(data.current?.uv ?? 0) }
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

const toF = (c: number) => (c * 9) / 5 + 32
const formatTemp = (c: number) => `${Math.round(useCelsius.value ? c : toF(c))}°`

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

// Notify parent when any modal in this widget opens/closes
watch([showDictionary, showWeather], ([d, w]) => {
  emit('modal-toggle', Boolean(d || w))
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
  position: relative;
  background: radial-gradient(120% 120% at 0% 0%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.75) 60%, rgba(255,255,255,0.6) 100%), #fff;
  border-radius: 20px;
  padding: 0.75rem 0.6rem 0.8rem;
  max-width: 460px;
  margin: 0.5rem auto 0;
  font-family: 'Arial', sans-serif;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
  color: #1f2f3f;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}

.weather-widget::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(60% 60% at 100% 0%, rgba(255,200,120,0.25), rgba(255,200,120,0) 60%), radial-gradient(50% 50% at 0% 100%, rgba(120,180,255,0.2), rgba(120,180,255,0) 70%);
  pointer-events: none;
  z-index: 0;
}

.top-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  position: relative;
  z-index: 1;
}

.location-info {
  text-align: left;
  flex-grow: 1;
  padding: 0 1rem;
}

.city { font-size: 1.15rem; font-weight: 800; letter-spacing: 0.2px; }
.temp-row { display: flex; align-items: center; gap: 0.5rem; margin: 0.15rem 0; }
.temp { font-size: 1.9rem; color: #f26c00; font-weight: 800; }
.unit-toggle { border: 1px solid rgba(0,0,0,0.08); border-radius: 999px; padding: 0.18rem 0.5rem; font-size: 0.8rem; background: rgba(255,255,255,0.7); }
.condition { font-size: 1rem; color: #374151; }

.weather-icon img { width: 64px; height: auto; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.12)); }

.metrics-row { display: flex; gap: 0.5rem; margin: 0.35rem 0 0.25rem; width: 100%; justify-content: space-around; }
.metric-card { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.1rem; width: 30%; padding: 0.4rem 0.2rem; border-radius: 14px; background: rgba(255,255,255,0.6); box-shadow: inset 0 1px 0 rgba(255,255,255,0.6), 0 6px 14px rgba(0,0,0,0.06); }
.metric-card .m-ico { font-size: 1rem; }
.metric-card .m-val { font-weight: 700; font-size: 0.95rem; }
.metric-card .m-lbl { font-size: 0.75rem; opacity: 0.75; }

/* forecast row */
.forecast-scroll {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.5rem 0.25rem;
  width: 100%;
  position: relative;
  z-index: 1;
}
.forecast-scroll::-webkit-scrollbar { display: none; }

.forecast-icon {
  flex: 0 0 auto;
  width: 72px; height: 86px; border-radius: 16px;
  background: rgba(255,255,255,0.7); color: #374151; text-align: center;
  font-size: 0.75rem; font-weight: bold;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  transition: all 0.25s ease; border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 8px 18px rgba(0,0,0,0.06);
}
.forecast-icon.active {
  background: linear-gradient(135deg, #f26c00 0%, #ffd900 100%);
  color: white; transform: translateY(-2px) scale(1.02);
  border-color: rgba(255,255,255,0.5);
  box-shadow: 0 10px 24px rgba(242, 108, 0, 0.25);
}
.day { font-size: 0.75rem; }
.f-icon { width: 32px; height: 32px; object-fit: contain; margin: 0.25rem 0; }
.minmax { display: flex; gap: 0.15rem; align-items: baseline; font-size: 0.75rem; }
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

/* Theming by temp */
.weather-widget.warm { --accent: #f26c00; }
.weather-widget.cold { --accent: #1d4ed8; }
.weather-widget.cold .temp { color: var(--accent); }
</style>
