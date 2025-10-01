<template>
  <div class="map-widget-card">
    <div class="map-header">
      <button class="toggle-map-btn" @click="toggleMap">
        {{ showMap ? 'Закрыть' : 'Открыть карту' }}
      </button>
    </div>

    <transition name="slide-up">
      <div v-if="showMap" class="map-modal-overlay" @click.self="toggleMap">
        <div class="map-modal">
          <div class="map-modal-header">
            <span>🗺️ Места</span>
            <button class="close-button" @click="toggleMap">✖</button>
          </div>

          <div v-if="mapLoading" class="map-loading">
            <div class="spinner"></div>
          </div>

          <div ref="mapContainer" class="map-container"></div>

          <div class="category-bar">
            <button
              v-for="cat in categories"
              :key="cat.value"
              :class="{ active: selectedCategory === cat.value }"
              @click="selectedCategory = cat.value"
            >
              {{ cat.label }}
            </button>
          </div>

          <div class="search-bar-container">
            <input
              v-model="searchQuery"
              type="text"
              class="search-bar"
              placeholder="Поиск по названию..."
            />
          </div>

          <div class="places-scroll">
            <div
              v-for="place in filteredPlaces"
              :key="place.id"
              class="place-scroll-card"
              @click="focusPlace(place)"
            >
              <div class="place-icon">{{ getCategoryIcon(place.category) }}</div>
              <h4>{{ place.name }}</h4>
              <p>{{ place.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import Supercluster from 'supercluster'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getMapCategories, getMapPlaces, getDefaultMapCenter, getDefaultMapZoom, getMapCategoryIcon, getMapStyleUrl } from '../../Data'

const map = ref(null)
const mapContainer = ref(null)
const selectedCategory = ref(null)
const searchQuery = ref('')
const showMap = ref(false)
const mapLoading = ref(true)

const mapCenter = ref(getDefaultMapCenter())
const mapZoom = ref(getDefaultMapZoom())

const categories = getMapCategories()
const places = getMapPlaces()

const filteredPlaces = computed(() => {
  return places.filter(p => {
    const matchCat = selectedCategory.value ? p.category === selectedCategory.value : true
    const matchSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchCat && matchSearch
  })
})

// Category icons are now imported from Data.ts

let clusterIndex = new Supercluster({ radius: 60, maxZoom: 17 })
function createGeoJSON(features) {
  return {
    type: 'FeatureCollection',
    features: features.map(p => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      properties: {
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        icon: getMapCategoryIcon(p.category)
      }
    }))
  }
}

function updateMapSource() {
  if (!map.value) return
  const data = createGeoJSON(filteredPlaces.value)
  clusterIndex.load(data.features)
  map.value.getSource('places')?.setData(data)
}

function focusPlace(place) {
  if (map.value) {
    map.value.flyTo({ center: [place.lng, place.lat], zoom: 15 })
  }
}

function initMap() {
  mapLoading.value = true

  map.value = new maplibregl.Map({
    container: mapContainer.value,
    style: getMapStyleUrl(),
    center: mapCenter.value,
    zoom: mapZoom.value
  })

  map.value.on('load', () => {
    mapLoading.value = false

    const geojson = createGeoJSON(filteredPlaces.value)
    clusterIndex.load(geojson.features)

    map.value.addSource('places', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    })

    map.value.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'places',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#2563eb',
        'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
        'circle-opacity': 0.6
      }
    })

    map.value.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'places',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['Open Sans Bold'],
        'text-size': 12
      }
    })

    map.value.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'places',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#11b4da',
        'circle-radius': 6,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff'
      }
    })

    map.value.on('click', 'clusters', (e) => {
      const clusterId = e.features[0].properties.cluster_id
      const coordinates = e.features[0].geometry.coordinates
      map.value.getSource('places').getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return
        map.value.easeTo({ center: coordinates, zoom: zoom + 1 })
      })
    })

    map.value.on('click', 'unclustered-point', (e) => {
      const props = e.features[0].properties
      const coords = e.features[0].geometry.coordinates
      new maplibregl.Popup({ offset: 25 })
        .setLngLat(coords)
        .setHTML(`
          <div class="popup-content">
            <strong>${props.name}</strong><br>
            <span>${props.description}</span><br><br>
            <a href="${props.googleLink}" target="_blank">📍 Google Maps</a><br>
            <a href="${props.yandexLink}" target="_blank">🧭 Яндекс.Карты</a>
          </div>
        `)
        .addTo(map.value)
    })
  })

  map.value.on('moveend', () => {
    mapCenter.value = map.value.getCenter().toArray()
    mapZoom.value = map.value.getZoom()
  })
}

function destroyMap() {
  if (map.value) {
    map.value.remove()
    map.value = null
  }
}

function toggleMap() {
  showMap.value = !showMap.value
  if (showMap.value) {
    setTimeout(initMap, 100)
  } else {
    destroyMap()
  }
}

watch(showMap, (open) => {
  document.body.style.overflow = open ? 'hidden' : 'auto'
})

let debounceTimer
watch([selectedCategory, searchQuery], () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(updateMapSource, 300)
})
</script>

<style scoped>

.map-header {
  display: flex;
  justify-content: center;
  align-items: center;
}

.toggle-map-btn {
  background: #2563eb;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  margin-bottom: 1rem;
}

.map-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.map-modal {
  background: white;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 20px 20px 0 0;
  padding: 1rem;
}

.map-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
}

.map-container {
  height: 40vh;
  border-radius: 12px;
  margin: 1rem 0;
}

.category-bar {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  margin-bottom: 0.5rem;
}

.category-bar button {
  flex: 0 0 auto;
  padding: 0.5rem 1rem;
  border: none;
  background: #e0e0e0;
  border-radius: 12px;
}

.category-bar button.active {
  background: #2563eb;
  color: white;
}

.search-bar-container {
  margin-bottom: 0.5rem;
}

.search-bar {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 12px;
}

.places-scroll {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 1rem;
}

.place-scroll-card {
  flex: 0 0 200px;
  background: #f5f5f5;
  padding: 0.5rem;
  border-radius: 22px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  padding-right: 0;
}

.place-scroll-card:active{

  transform:translate3d();
}

.place-icon {
  font-size: 1.4rem;
  margin-bottom: 0.25rem;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>