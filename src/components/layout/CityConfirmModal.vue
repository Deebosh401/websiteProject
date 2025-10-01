<template>
  <div v-if="show" class="city-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="city-modal-title">
    <div class="city-modal">
      <h3 id="city-modal-title" class="title">Проверим местоположение</h3>
      <div v-if="isLoading" class="loading">
        <div class="spinner" aria-hidden="true"></div>
        <p class="hint">Определяем ваш город…</p>
      </div>
      <template v-else>
        <p class="subtitle">Мы определили ваш город как <strong>{{ detectedCity || 'Калининград' }}</strong>. Это верно?</p>
        <div class="actions">
          <button class="btn primary" @click="onConfirm(true)">Да</button>
          <button class="btn" @click="onConfirm(false)">Нет</button>
        </div>
      </template>

      <transition name="fade-slide">
        <div v-if="chooseManually" class="choose">
          <p class="help">Выберите город вручную</p>
          <div class="chips">
            <button
              v-for="city in orderedCities"
              :key="city"
              class="chip"
              :class="{ center: city === regionalCenter }"
              @click="selectCity(city)"
            >
              {{ city }}
            </button>
          </div>
        </div>
      </transition>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { fetchRegionCities, type RegionCity } from '../../Data'

const regionalCenter = 'Калининград'
const allCities = ref<RegionCity[]>([])

// Coords for nearest-city detection
interface CityCoord { name: string; lat: number; lng: number }
const cityCoords = ref<CityCoord[]>([])

const show = ref(false)
const chooseManually = ref(false)
const detectedCity = ref<string>('')
const isLoading = ref(false)

const orderedCities = computed(() => {
  const byName = [...allCities.value].sort((a, b) => a.name.localeCompare(b.name, 'ru'))
  const center = byName.find(c => c.isRegionalCenter)
  const others = byName.filter(c => !c.isRegionalCenter)
  return center ? [center.name, ...others.map(c => c.name)] : byName.map(c => c.name)
})

// function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
//   const R = 6371
//   const dLat = (lat2 - lat1) * Math.PI / 180
//   const dLon = (lon2 - lon1) * Math.PI / 180
//   const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2) ** 2
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
//   return R * c
// }

// function nearestCity(lat: number, lng: number): { name: string; dist: number } | null {
//   let best: CityCoord | null = null
//   let bestDist = Number.POSITIVE_INFINITY
//   for (const c of cityCoords.value) {
//     const d = haversine(lat, lng, c.lat, c.lng)
//     if (d < bestDist) { best = c; bestDist = d }
//   }
//   return best ? { name: best.name, dist: bestDist } : null
// }

function setCity(city: string) {
  localStorage.setItem('selectedCity', city)
  localStorage.setItem('cityConfirmShownV1', '1')
  window.dispatchEvent(new CustomEvent('city:changed', { detail: city }))
}

function onConfirm(yes: boolean) {
  if (yes) {
    setCity(detectedCity.value || regionalCenter)
    show.value = false
  } else {
    chooseManually.value = true
  }
}

function selectCity(city: string) {
  setCity(city)
  show.value = false
}

onMounted(async () => {
  const prompted = localStorage.getItem('cityConfirmShownV1')
  // Load city catalog (simulate API)
  allCities.value = await fetchRegionCities()
  cityCoords.value = allCities.value.map(c => ({ name: c.name, lat: c.lat, lng: c.lng }))
  if (prompted) return
  show.value = true
  isLoading.value = true
  
  // TEMPORARILY DISABLED: Geolocation functionality
  // const inSecureContext = window.isSecureContext || location.hostname === 'localhost'

  // TEMPORARILY DISABLED: IP-based geolocation for non-HTTPS or when permission denied
  // async function ipFallback() {
  //   try {
  //     const ctrl = new AbortController()
  //     const t = setTimeout(() => ctrl.abort(), 5000)
  //     const res = await fetch('https://ipapi.co/json/', { signal: ctrl.signal })
  //     clearTimeout(t)
  //     if (res.ok) {
  //       const data: any = await res.json()
  //       const lat = Number(data?.latitude)
  //       const lon = Number(data?.longitude)
  //       if (Number.isFinite(lat) && Number.isFinite(lon)) {
  //         const n = nearestCity(lat, lon)
  //         detectedCity.value = n ? n.name : regionalCenter
  //         isLoading.value = false
  //         return
  //       }
  //     }
  //   } catch (_) {}
  //   detectedCity.value = regionalCenter
  //   isLoading.value = false
  // }

  // TEMPORARILY DISABLED: Browser geolocation
  // if (!navigator.geolocation || !inSecureContext) {
  //   ipFallback()
  //   return
  // }
  // navigator.geolocation.getCurrentPosition((pos) => {
  //   const { latitude, longitude } = pos.coords
  //   const n = nearestCity(latitude, longitude)
  //   detectedCity.value = n ? n.name : regionalCenter
  //   isLoading.value = false
  // }, () => {
  //   ipFallback()
  // }, { enableHighAccuracy: false, timeout: 6000 })
  
  // TEMPORARILY: Set default city without geolocation
  detectedCity.value = regionalCenter
  isLoading.value = false
})

// Allow reopening the modal on demand, regardless of the once-per-browser flag
function handleOpenConfirm() {
  chooseManually.value = true
  detectedCity.value = localStorage.getItem('selectedCity') || regionalCenter
  show.value = true
  isLoading.value = false
}

onMounted(() => {
  window.addEventListener('city:openConfirm', handleOpenConfirm)
})

onBeforeUnmount(() => {
  window.removeEventListener('city:openConfirm', handleOpenConfirm)
})
</script>

<style scoped>
.city-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 80px 16px 16px;
  z-index: 10000;
}
.city-modal {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.18);
  padding: 16px;
}
.title { margin: 0 0 6px; font-size: 18px; }
.subtitle { margin: 0 0 12px; color: #374151; }
.actions { display: flex; gap: 8px; }
.btn { border: 1px solid #e5e7eb; background: #fff; border-radius: 10px; padding: 8px 12px; cursor: pointer; }
.btn.primary { background: #2563eb; color: #fff; border-color: #2563eb; }
.choose { margin-top: 12px; }
.help { margin: 0 0 8px; color: #6b7280; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { border: 1px solid #e5e7eb; background: #f9fafb; border-radius: 999px; padding: 6px 10px; cursor: pointer; }
.chip.center { font-weight: 700; background: #eff6ff; border-color: #bfdbfe; }

.fade-slide-enter-active, .fade-slide-leave-active { transition: opacity .2s ease, transform .2s ease; }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(-4px); }
</style>


