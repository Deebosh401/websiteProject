<template>
  <div class="explorer-modal" role="dialog" aria-modal="true" @click.self="$emit('close')">
    <div class="sheet">
      <header class="sheet-header">
        <h3>Карта интересных мест</h3>
        <button class="close" @click="$emit('close')" aria-label="Закрыть">✕</button>
      </header>

      <div class="filters" role="group" aria-label="Фильтры категорий">
        <button
          v-for="c in categories"
          :key="c"
          class="chip"
          :class="{ active: activeCategories.includes(c) }"
          @click="toggleCat(c)"
          @keydown.enter.prevent="toggleCat(c)"
          role="switch"
          :aria-checked="activeCategories.includes(c)"
        >
          <span class="bullet" aria-hidden="true"></span>
          <span class="label">{{ iconFor(c) }} {{ c }}</span>
        </button>
      </div>

      <div class="place-list" role="list">
        <div
          v-for="p in visiblePlaces"
          :key="p.id"
          class="place-item"
          :class="{ active: selectedPlaceId === p.id }"
          role="button"
          tabindex="0"
          @click="focusPlace(p)"
          @keydown.enter.prevent="focusPlace(p)"
        >
          <div class="pi-title">{{ p.name }}</div>
          <div class="pi-sub">
            <span class="pi-cat">{{ p.category }}</span>
            <span v-if="p.rating" class="pi-rate">★ {{ p.rating.toFixed(1) }}</span>
          </div>
          <div v-if="p.address" class="pi-addr">{{ p.address }}</div>
        </div>
        <div v-if="visiblePlaces.length === 0" class="place-empty">Нет мест в выбранных категориях</div>
      </div>

      <div class="map-wrap">
        <div ref="mapEl" class="map"></div>
        <div v-if="selectedPlace" class="map-shield" @click="closePlaceCard" aria-hidden="true"></div>
        <transition name="pc-slide">
          <div v-if="selectedPlace" class="place-card" role="dialog" aria-modal="false">
            <button class="pc-close" @click="closePlaceCard" aria-label="Закрыть">✕</button>
            <div v-if="selectedGallery.length" class="pc-thumb">
              <div class="pc-thumb-strip" :style="{ transform: `translateX(-${galleryIndex * 100}%)` }">
                <img v-for="(src, i) in selectedGallery" :key="i" :src="src" alt="" />
              </div>
              <div class="pc-thumb-dots">
                <span v-for="(_, i) in selectedGallery" :key="i" :class="['dot', { active: i === galleryIndex }]" @click="galleryIndex = i"></span>
              </div>
            </div>
            <div class="pc-body">
              <div class="pc-title">{{ selectedPlace.name }}</div>
              <div class="pc-meta">
                <span class="pc-cat">{{ selectedPlace.category }}</span>
                <span v-if="selectedPlace.rating" class="pc-rate"><span class="star">★</span>{{ selectedPlace.rating.toFixed(1) }}</span>
              </div>
              <div v-if="selectedPlace.address" class="pc-addr">{{ selectedPlace.address }}</div>
              <div v-if="selectedPlace.description" class="pc-desc">{{ selectedPlace.description }}</div>
              <div class="pc-actions">
                <a :href="googleDir(selectedPlace)" target="_blank" rel="noopener" class="pc-btn">Маршрут Google</a>
                <a :href="yandexDir(selectedPlace)" target="_blank" rel="noopener" class="pc-btn ">Маршрут Яндекс</a>
                <button v-if="selectedPlace.attractionId" class="pc-btn link" @click="goToAttraction(selectedPlace.attractionId)">Открыть место</button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import type { LngLatLike, StyleSpecification } from 'maplibre-gl'
import { allPlaceCategories, mapPlaces, type MapPlace,buildGoogleDirectionsUrl, buildYandexDirectionsUrl } from './mapPlaces'

// Lazy-loaded MapLibre runtime to reduce initial bundle size
let maplibregl: any

const mapEl = ref<HTMLDivElement | null>(null)
let map: any = null
let markers: any[] = []
const markerById = new Map<number, { marker: maplibregl.Marker; el: HTMLElement }>()

const categories = allPlaceCategories
const activeCategories = ref<string[]>([])
function toggleCat(c: string) {
  const idx = activeCategories.value.indexOf(c)
  if (idx >= 0) activeCategories.value.splice(idx, 1)
  else activeCategories.value.push(c)
}
function iconFor(c: string) {
  const map: Record<string, string> = {
    'Исторические места': '🏛️',
    'Где поесть': '🍽️',
    'Парки/скверы': '🌳',
    'ТРЦ': '🛍️',
    'Музеи': '🖼️',
  }
  return map[c] || '📍'
}

const visiblePlaces = computed<MapPlace[]>(() => {
  const act = activeCategories.value
  if (!act || act.length === 0) return mapPlaces
  return mapPlaces.filter((p) => act.includes(p.category))
})
const selectedPlaceId = ref<number | null>(null)
const selectedPlace = computed(() => visiblePlaces.value.find(p => p.id === selectedPlaceId.value) || null)
const selectedGallery = computed(() => selectedPlace.value?.gallery && selectedPlace.value.gallery.length > 0
  ? selectedPlace.value.gallery
  : (selectedPlace.value?.image ? [selectedPlace.value.image] : []))
const galleryIndex = ref(0)
watch(selectedPlaceId, () => { galleryIndex.value = 0 })
const router = useRouter()
function goToAttraction(id: number) { router.push({ name: 'event-detail', params: { id } }) }

const MAPTILER_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    maptiler: {
      type: 'raster',
      tiles: ['https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=Fuo1P4u5HZvd7RfCDyrP'],
      tileSize: 256,
    }
  },
  layers: [
    { id: 'maptiler', type: 'raster', source: 'maptiler' }
  ]
}

function clearMarkers() {
  markers.forEach((m) => m.remove())
  markers = []
  markerById.clear()
}

const googleDir = (p: MapPlace) => buildGoogleDirectionsUrl(p.lat, p.lng)
const yandexDir = (p: MapPlace) => buildYandexDirectionsUrl(p.lat, p.lng)
function closePlaceCard() { selectedPlaceId.value = null }

function makeMarker(place: MapPlace): maplibregl.Marker {
  const el = document.createElement('div')
  el.className = 'ex-pin pin-drop'
  el.innerHTML = '📍'
  const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
    .setLngLat([place.lng, place.lat])
    .addTo(map!)
  el.addEventListener('click', (e) => { e.stopPropagation(); focusPlace(place) })
  setTimeout(() => el.classList.remove('pin-drop'), 650)
  markerById.set(place.id, { marker, el })
  return marker
}

function renderMarkers() {
  clearMarkers()
  // Defer until the style/gl context is ready
  if (!map || !map.isStyleLoaded()) {
    setTimeout(renderMarkers, 50)
    return
  }
  const places = visiblePlaces.value
  places.forEach((p) => markers.push(makeMarker(p)))
}

// Viewport helpers
const DEFAULT_CENTER: [number, number] = [20.4522, 54.7104] // Kaliningrad
const DEFAULT_ZOOM = 12

function fitToMarkers() {
  if (!map) return
  if (markers.length === 0) {
    map.easeTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM, duration: 400 })
    return
  }
  if (markers.length === 1) {
    map.easeTo({ center: markers[0].getLngLat(), zoom: 15.5, duration: 600, easing: (t: number) => t * (2 - t) })
    return
  }
  const bounds = new maplibregl.LngLatBounds(markers[0].getLngLat(), markers[0].getLngLat())
  markers.forEach((m) => bounds.extend(m.getLngLat() as unknown as LngLatLike))
  map.fitBounds(bounds, { padding: 60, duration: 900, easing: (t: number) => t * (2 - t) })
}

function animatePin(el: HTMLElement) {
  el.classList.remove('pin-bounce', 'pin-pulse')
  el.classList.add('pin-bounce')
  setTimeout(() => {
    el.classList.remove('pin-bounce')
    el.classList.add('pin-pulse')
    setTimeout(() => el.classList.remove('pin-pulse'), 1400)
  }, 800)
}

function focusPlace(place: MapPlace) {
  if (!map) return
  selectedPlaceId.value = place.id
  const entry = markerById.get(place.id)
  const center: [number, number] = [place.lng, place.lat]
  map.easeTo({ center, zoom: Math.max(map.getZoom(), 15.5), duration: 800, easing: (t: number) => t * (2 - t) })
  if (entry) animatePin(entry.el)
}

onMounted(async () => {
  await nextTick()
  if (!mapEl.value) return
  // Dynamic import at runtime
  const lib = await import('maplibre-gl')
  // ESM/CJS interop safety
  maplibregl = (lib as any).default ?? lib
  map = new maplibregl.Map({ container: mapEl.value, style: MAPTILER_STYLE, attributionControl: false })
  map.scrollZoom.enable(); map.boxZoom.enable(); map.dragPan.enable(); map.keyboard.enable(); map.doubleClickZoom.enable(); map.touchZoomRotate.enable(); map.dragRotate.disable()
  map.addControl(new maplibregl.NavigationControl(), 'top-right')
  map.addControl(new maplibregl.FullscreenControl(), 'top-right')
  setTimeout(() => map && map.resize(), 100)
  map.on('load', () => {
    try {
      map!.setCenter(DEFAULT_CENTER)
      map!.setZoom(DEFAULT_ZOOM)
    } catch (_) {}
    renderMarkers()
    fitToMarkers()
    setTimeout(() => map && map.resize(), 100)
  })
  map.on('click', () => { closePlaceCard() })
})

onBeforeUnmount(() => { clearMarkers(); map?.remove(); map = null })

watch(activeCategories, () => { renderMarkers(); fitToMarkers() }, { deep: true })
</script>

<style scoped>
.explorer-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end;
  z-index: 10000;
}
.sheet {
  width: 100%;
  background: #fff;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -8px 28px rgba(0,0,0,0.28);
  padding: 0.65rem 0.65rem 0.8rem;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.sheet-header { display: flex; justify-content: space-between; align-items: center; }
.sheet-header h3{ font-size: 1.2rem; font-weight: 800; }

.close { font-size: 1.6rem; background: none; border: none; cursor: pointer; }
.filters { display: flex; gap: 0.5rem; overflow-x: auto; padding: 0.2rem 0.1rem; flex-wrap: nowrap; white-space: nowrap; }
.chip { display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.38rem 0.75rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 999px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); flex: 0 0 auto; cursor: pointer; transition: transform 140ms ease, box-shadow 160ms ease, background 160ms ease; }
.chip .bullet { width: 8px; height: 8px; border-radius: 999px; background: rgba(37,99,235,0.25); box-shadow: inset 0 0 0 2px rgba(37,99,235,0.35); }
.chip.active .bullet { background: #2563eb; box-shadow: 0 0 0 4px rgba(37,99,235,0.18); }
.chip .label { white-space: nowrap; font-weight: 600; }
.chip.active { background: #f3f7ff; border-color: rgba(37,99,235,0.35); box-shadow: 0 4px 12px rgba(37,99,235,0.15); transform: translateY(-1px); }
.chip input { accent-color: #2563eb; }
.map-wrap { position: relative; }
.map { width: 100%; height: 47vh; border-radius: 12px; overflow: hidden; }
.sheet:has(.map) { contain: layout paint; }

.place-list { display: flex; flex-direction: row; gap: 0.5rem; overflow-x: auto; padding: 0.25rem 0.1rem; }
.place-item { min-width: 72%; background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; padding: 0.45rem 0.6rem; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
.place-item.active { outline: 2px solid #2563eb22; background: #f8fbff; }
.pi-title { font-weight: 800; margin-bottom: 0.15rem; }
.pi-sub { display: flex; gap: 0.4rem; align-items: center; font-size: 0.85rem; }
.pi-cat { opacity: 0.75; }
.pi-rate { color: #f59e0b; font-weight: 700; }
.pi-addr { font-size: 0.85rem; opacity: 0.85; }

.ex-pin { font-size: 50px; filter: drop-shadow(0 6px 10px rgba(0,0,0,0.25)); transform: translateY(-6px); transition: transform 0.2s ease; }
.ex-pin:hover { transform: translateY(-8px) scale(1.04); }
.pin-drop { animation: exPinDrop 600ms cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes exPinDrop { 0% { transform: translateY(-30px) scale(0.9); } 70% { transform: translateY(0) scale(1.05); } 100% { transform: translateY(-6px) scale(1); } }

.pin-bounce { animation: pinBounce 800ms ease-out; }
@keyframes pinBounce {
  0% { transform: translateY(-12px) scale(1); }
  40% { transform: translateY(-28px) scale(1.06); }
  70% { transform: translateY(-4px) scale(0.98); }
  100% { transform: translateY(-6px) scale(1); }
}
.pin-pulse { animation: pinPulse 1.4s ease-in-out 1; }
@keyframes pinPulse {
  0% { filter: drop-shadow(0 6px 10px rgba(0,0,0,0.25)); }
  50% { filter: drop-shadow(0 10px 16px rgba(37, 99, 235, 0.45)); transform: translateY(-6px) scale(1.03); }
  100% { filter: drop-shadow(0 6px 10px rgba(0,0,0,0.25)); transform: translateY(-6px) scale(1); }
}

.ml-popup { min-width: 220px; max-width: 260px; background: #fff; border-radius: 12px; padding: 0.6rem 0.7rem; box-shadow: 0 12px 28px rgba(0,0,0,0.22); }
.pp-title { font-weight: 800; margin-bottom: 0.25rem; }
.pp-row { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.25rem; }
.pp-cat { font-size: 0.8rem; opacity: 0.75; }
.pp-rate { font-size: 0.85rem; font-weight: 700; color: #f59e0b; }
.pp-addr { font-size: 0.85rem; opacity: 0.85; }
.pp-desc { font-size: 0.85rem; margin-top: 0.25rem; }
.pp-img { width: 100%; height: 120px; object-fit: cover; border-radius: 10px; margin-top: 0.4rem; }
.pp-actions { display: flex; gap: 0.4rem; margin-top: 0.5rem; }
.pp-btn { border: 1px solid rgba(0,0,0,0.12); border-radius: 999px; padding: 0.25rem 0.6rem; font-size: 0.85rem; background: #fff; text-decoration: none; color: #111; }
.pp-btn.strong { background: #2563eb; color: #fff; border-color: #2563eb; }
.pp-btn:hover { background: #f3f4f6; }

/* Over-map place card */
.map-shield {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.12) 25%, rgba(0,0,0,0) 55%);
  backdrop-filter: blur(2px);
  z-index: 1;
}
.place-card {
  position: absolute;
  left: 0.6rem;
  right: 0.6rem;
  bottom: 0.6rem;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.25);
  overflow: hidden;
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 0.6rem;
  padding: 0.6rem;
  z-index: 2;
  max-height: 42vh;
  overflow-y: auto;
}
.pc-close { position: absolute; top: 6px; right: 8px; background: rgba(255,255,255,0.9); border: 1px solid rgba(0,0,0,0.06); border-radius: 999px; width: 28px; height: 28px; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.12); }
.pc-thumb { width: 120px; height: 120px; border-radius: 12px; overflow: hidden; position: relative; background: #f6f6f7; }
.pc-thumb-strip { display: flex; width: 100%; height: 100%; transition: transform 300ms ease; }
.pc-thumb-strip img { width: 100%; height: 100%; object-fit: cover; flex: 0 0 100%; }
.pc-thumb-dots { position: absolute; left: 0; right: 0; bottom: 6px; display: flex; justify-content: center; gap: 6px; }
.pc-thumb-dots .dot { width: 6px; height: 6px; border-radius: 999px; background: rgba(255,255,255,0.7); box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.pc-thumb-dots .dot.active { width: 16px; border-radius: 999px; background: #fff; }
.pc-body { display: flex; flex-direction: column; gap: 0.4rem; padding-right: 2.2rem; }
.pc-title { font-weight: 800; font-size: 1.02rem; }
.pc-meta { display: flex; gap: 0.4rem; align-items: center; font-size: clamp(0.86rem, 2vw, 0.95rem); opacity: 0.85; flex-wrap: wrap; }
.pc-cat { opacity: 0.75; }
.pc-rate { display: inline-flex; align-items: center; gap: 0.25rem; color: #f59e0b; font-weight: 800; letter-spacing: 0.2px; padding: 0.15rem 0.4rem; border-radius: 999px; background: rgba(245, 158, 11, 0.12); }
.pc-rate .star { font-size: 0.95em; line-height: 1; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1)); }
.pc-addr { font-size: 0.9rem; opacity: 0.85; }
.pc-desc { font-size: 0.9rem; }
.pc-gallery { position: relative; width: 100%; height: 140px; border-radius: 12px; overflow: hidden; background: #f6f6f7; }
.pc-gallery-strip { display: flex; width: 100%; height: 100%; transition: transform 300ms ease; }
.pc-gallery-strip img { width: 100%; height: 100%; object-fit: cover; flex: 0 0 100%; }
.pc-dots { position: absolute; left: 0; right: 0; bottom: 6px; display: flex; justify-content: center; gap: 6px; }
.pc-dots .dot { width: 6px; height: 6px; border-radius: 999px; background: rgba(255,255,255,0.7); box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.pc-dots .dot.active { width: 16px; border-radius: 999px; background: #fff; }
.pc-actions { display: flex; gap: 0.4rem; margin-top: 0.25rem; flex-wrap: wrap; }
.pc-btn { border: 1px solid rgba(0,0,0,0.12); border-radius: 999px; padding: 0.25rem 0.6rem; font-size: 0.9rem; background: #fff; text-decoration: none; color: #111; cursor: pointer; }
.pc-btn.strong { background: #2563eb; color: #fff; border-color: #2563eb; }
.pc-btn.link { color: #2563eb; border-color: rgba(37,99,235,0.25); }

.pc-slide-enter-from,
.pc-slide-leave-to { transform: translateY(16px); opacity: 0; }
.pc-slide-enter-active,
.pc-slide-leave-active { transition: all 220ms ease; }
</style>