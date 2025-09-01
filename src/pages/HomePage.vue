<template>
  <div class="home-page">
    <div class="site-motto pushkin-motto">
      <div class="motto-line">
        <h3>Путешествуйте со вкусом</h3>
      </div>
    </div>

    <nav class="scroll-nav">
      <button @click="scrollTo('cities')">Города</button>
      <button @click="scrollTo('categories')">Категории</button>
      <button @click="scrollTo('afisha')">Афиша</button>
      <button @click="scrollTo('popular')">Популярное</button>
      <button @click="scrollTo('guides')">Гиды</button>
      <button @click="scrollTo('slang')">Словарь/Погода</button>
      <button @click="scrollTo('firsthand')">Личный опыт</button>
      <button @click="scrollTo('map')">Карта</button>
    </nav>

    <div id="cities">
      <Categories
        title="Города"
        allTitle="Все города"
        :items="orderedCities"
        item-key="name"
        @itemClick="(item) => router.push({ name: 'city-detail', params: { name: item.name } })"
        @allClick="() => router.push({ name: 'all-cities' })"
      />
    </div>

    <div id="categories">
      <Categories
        title="Категории"
        allTitle="Все категории"
        :items="categoriesCarouselData.slice(0, 6)"
        item-key="name"
        @itemClick="(item) => router.push({ name: 'category-detail', params: { name: item.name }})"
        @allClick="() => router.push({ name: 'all-categories' })"
      />
    </div>

    <div id="afisha">
      <Categories
        title="Афиша событий"
        allTitle="Все события"
        :items="afishaItemsByCity"
        item-key="name"
        @itemClick="goToEvent"
        @allClick="() => router.push({ name: 'all-events' })"
      />
    </div>

    <div id="popular">
  <Categories
    title="Популярные"
    allTitle="Посмотреть все"
    :items="popularItemsByCity"
    item-key="name"
    @itemClick="goToEvent"
    @allClick="() => router.push({ name: 'all-popular' })"
  />
</div>

    <div id="guides"><Guides /></div>
    <div id="slang"><SlangJokes @modal-toggle="setModalState" /></div>
    <div class="map-trigger-wrap" id="map">
      <button class="open-map-btn" @click="openExplorer" aria-haspopup="dialog" aria-controls="city-explorer">Открыть карту</button>
    </div>
    <CityExplorerMap v-if="showExplorer" id="city-explorer" :noHeader="true" @close="closeExplorer" />
    <div id="firsthand"><FirstHandExperience /></div>

    <button
      v-if="showTopButton && !anyModalOpen && !showExplorer"
      class="back-to-top"
      @click="scrollToTop"
      @touchend.prevent.stop="scrollToTop"
      aria-label="Наверх"
    >
      <span class="arrow-icon"></span>
    </button>
  </div>
</template>

<script setup lang="ts">
import Categories from "../components/layout/Categories.vue"
import Guides from "../components/layout/Guides.vue";
import SlangJokes from "../components/layout/SlangJokes.vue";
import FirstHandExperience from "../components/layout/FirstHandExperience.vue";
import { defineAsyncComponent } from 'vue'
const CityExplorerMap = defineAsyncComponent(() => import('../components/layout/CityExplorerMap.vue'))
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { citiesData, categoriesCarouselData, allAttractions, type Attraction, type CarouselInfo } from "../Data";
import { useRouter } from "vue-router";

const router = useRouter()
const showTopButton = ref(false)
const showExplorer = ref(false)
const openExplorer = () => { showExplorer.value = true }
const closeExplorer = () => { showExplorer.value = false }
const anyModalOpen = ref(false)
const setModalState = (open: boolean) => { anyModalOpen.value = open }
const handleFullscreenChange = () => {
  anyModalOpen.value = !!document.fullscreenElement || anyModalOpen.value
}

// Global selected city
const selectedCity = ref<string>(localStorage.getItem('selectedCity') || 'Калининград')
window.addEventListener('city:changed', (e: any) => {
  const c = e?.detail
  if (c) selectedCity.value = c
})

const scrollTo = (id: string) => {
  const el = document.getElementById(id)
  if (el) {
    const yOffset = -80 
    const y = el.getBoundingClientRect().top + window.scrollY + yOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}

function parseRu(dateStr: string) {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2}))?$/.exec(String(dateStr))
  if (!m) return NaN
  const [, dd, mm, yyyy, hh = '00', min = '00'] = m
  return new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:00`).getTime()
}

const afishaItems = computed(() => {
  const now = Date.now()
  const attractions = allAttractions.value as Attraction[]
  if (!Array.isArray(attractions)) return []
  
  return attractions
    .filter(a => a && a.date)
    .map(a => {
      const dateStr = a.date as string
      const tsNative = Date.parse(dateStr)
      const ts = Number.isNaN(tsNative) ? parseRu(dateStr) : tsNative
      return { ...a, _ts: ts }
    })
    .filter(a => !Number.isNaN(a._ts))
    .filter(a => a._ts >= now) 
    .sort((a, b) => a._ts - b._ts) 
    .slice(0, 6)
    .map(({ _ts, ...rest }) => rest)
})

const afishaItemsByCity = computed(() => {
  const city = selectedCity.value
  return afishaItems.value.filter(a => !city || a.city === city).slice(0, 6)
})

const popularItems = computed(() => {
  const toNum = (v: unknown, d = 0) =>
    typeof v === 'number'
      ? v
      : typeof v === 'string'
      ? Number(v.replace(/[^\d.]/g, '')) || d
      : d

  const attractions = allAttractions.value as Attraction[]
  if (!Array.isArray(attractions)) return []

  return attractions
    .filter(a => a && (a.rating != null || a.checkedIn != null))
    .map(a => ({
      ...a,
      _rating: toNum(a.rating),
      _reviews: toNum((a as any).reviewsCount ?? (a as any).ratingCount ?? 0),
      _fallbackPop: toNum(a.checkedIn ?? 0),
    }))
    .sort((a, b) => {
      const byRating = b._rating - a._rating
      if (byRating !== 0) return byRating

      const byReviews = b._reviews - a._reviews
      if (byReviews !== 0) return byReviews

      const byFallback = b._fallbackPop - a._fallbackPop
      if (byFallback !== 0) return byFallback

      return (a.name || '').localeCompare(b.name || '')
    })
    .slice(0, 6)
    .map(({ _rating, _reviews, _fallbackPop, ...rest }) => rest)
})

const popularItemsByCity = computed(() => {
  const city = selectedCity.value
  return popularItems.value.filter(a => !city || a.city === city).slice(0, 6)
})

const orderedCities = computed(() => {
  const items = [...(citiesData.value as CarouselInfo[])]
  const idx = items.findIndex(c => c.name === selectedCity.value)
  if (idx > 0) {
    const [sel] = items.splice(idx, 1)
    items.unshift(sel)
  }
  return items.slice(0, 6)
})

function goToEvent(item: Attraction | CarouselInfo) {
  console.log('HomePage goToEvent called with:', item)
  const id = (item as any).id
  console.log('Item ID:', id, 'Type:', typeof id)
  if (typeof id === 'number' || typeof id === 'string') {
    console.log('Navigating to event-detail with id:', id)
    router.push({ name: 'event-detail', params: { id } })
  } else {
    console.log('No valid ID found for item:', item)
  }
}


const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const checkScroll = () => {
  showTopButton.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', checkScroll)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
})

</script>
  
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500&display=swap');
  
.home-page {
  margin-top: 4.7rem;
  position: relative;
  z-index: 1;
  background-color: rgba(249, 233, 208, 0);
}

.pushkin-motto {
  padding-inline: clamp(2rem, 4vw, 5rem);
  margin: 0;
  animation: fadeZoomIn 2.2s ease-out;
  text-align: center;
  
}

.motto-line {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: baseline;
  gap: 0.1rem;
}

.pushkin-motto h2,
.pushkin-motto h3 {
  font-family: 'Dancing Script', cursive;
  font-weight: 800;
  font-size: clamp(1.7rem, 3.5vw, 2.3rem);
  line-height: 1.2;
  margin: 0;
  margin-right: 0;
  padding: 0.2rem 0rem;
  border-radius: 8px;
  letter-spacing: 0.5px;
  background: transparent;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
  color: #19212c;
}

.pushkin-motto h2 {
  color: linear-gradient(135deg, #121821, #1f2937, #3b4759);
}

.pushkin-motto h3 {
  color: linear-gradient(135deg, #121821, #1f2937, #3b4759);
}

.pushkin-motto h2:hover,
.pushkin-motto h3:hover {
  transform: scale(1.15);
}

.scroll-nav {
  position: sticky;
  top: 0;
  background-color: rgba(254, 227, 203, 0);
  display: flex;
  overflow-x: auto;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  scrollbar-width: none;
}

.scroll-nav::-webkit-scrollbar {
  display: none;
}

.scroll-nav button {
  background: rgba(225,245,254,255);
  color: black;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  white-space: nowrap;
  cursor: pointer;
  font-weight: 550;
  transition: background 0.2s ease;
}

.scroll-nav button:hover {
  background: #c7d2fe;
}

.back-to-top {
  position: fixed;
  bottom: 1.5rem;
  right: 1.2rem;
  background: rgba(225,245,254,255); 
  border: none;
  border-radius: 12px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7);
  transition: transform 0.2s ease, box-shadow 0.3s ease, opacity 0.3s ease;
  opacity: 0.65;
  z-index: 2147483647; /* ensure it's above overlays */
  pointer-events: auto;
}

.back-to-top:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  opacity: 1;
  background: linear-gradient(145deg, rgba(255, 140, 0, 0.879),rgba(195, 116, 19, 0.751),rgba(151, 95, 26, 0.551));
}

.map-trigger-wrap {
  display: flex;
  justify-content: center;
  padding-top: 1rem;
}
.open-map-btn {
  background: rgba(225,245,254,255);
  color: #111;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 12px;
  padding: 0.6rem 1rem;
  font-weight: 650;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(0,0,0,0.08);
}
.open-map-btn:hover { background: #c7d2fe; }



.arrow-icon::after {
  content: '';
  display: block;
  width: 12px;
  height: 12px;
  border-left: 3px solid black;
  border-top: 3px solid black;
  transform: rotate(45deg);
  margin-top: 4px;
  color:black;
}

@media (max-width: 480px) {
  .back-to-top {
    width: 60px;
    height: 60px;
    font-size: 1rem;
    line-height: 40px;
  }

  .back-to-top img {
    width: 60px;
    height: 42px;
  }
}

@media (max-width: 768px) {
  .motto-line {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 409px) {
  .pushkin-motto h2,
  .pushkin-motto h3 {
    font-size: clamp(1.5rem, 3.5vw, 2.3rem);
  }
}

/* Responsive Design for larger screens */
@media (min-width: 768px) {
  .home-page {
    padding-top: 5rem;
  }
  
  .site-motto {
    padding: 3rem 2rem;
  }
  
  .pushkin-motto h2,
  .pushkin-motto h3 {
    font-size: clamp(2rem, 4vw, 3rem);
  }
  
  .scroll-nav {
    padding: 1rem 2rem;
    gap: 1rem;
  }
  
  .scroll-nav button {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
  
  .back-to-top {
    width: 56px;
    height: 56px;
    bottom: 2rem;
    right: 2rem;
  }
  
  .open-map-btn {
    padding: 0.875rem 1.5rem;
    font-size: 1.1rem;
  }
}

@media (min-width: 1024px) {
  .home-page {
    padding-top: 5.5rem;
  }
  
  .site-motto {
    padding: 4rem 3rem;
  }
  
  .pushkin-motto h2,
  .pushkin-motto h3 {
    font-size: clamp(2.5rem, 3.5vw, 3.5rem);
  }
  
  .scroll-nav {
    padding: 1.25rem 3rem;
    gap: 1.25rem;
  }
  
  .scroll-nav button {
    padding: 1rem 2rem;
    font-size: 1.1rem;
  }
  
  .back-to-top {
    width: 64px;
    height: 64px;
    bottom: 2.5rem;
    right: 2.5rem;
  }
  
  .open-map-btn {
    padding: 1rem 2rem;
    font-size: 1.2rem;
  }
}

@media (min-width: 1280px) {
  .home-page {
    padding-top: 6rem;
  }
  
  .site-motto {
    padding: 5rem 4rem;
  }
  
  .pushkin-motto h2,
  .pushkin-motto h3 {
    font-size: clamp(3rem, 3vw, 4rem);
  }
  
  .scroll-nav {
    padding: 1.5rem 4rem;
    gap: 1.5rem;
  }
  
  .scroll-nav button {
    padding: 1.25rem 2.5rem;
    font-size: 1.2rem;
  }
  
  .back-to-top {
    width: 72px;
    height: 72px;
    bottom: 3rem;
    right: 3rem;
  }
  
  .open-map-btn {
    padding: 1.25rem 2.5rem;
    font-size: 1.3rem;
  }
}

@media (min-width: 1536px) {
  .home-page {
    padding-top: 6.5rem;
  }
  
  .site-motto {
    padding: 6rem 5rem;
  }
  
  .pushkin-motto h2,
  .pushkin-motto h3 {
    font-size: clamp(3.5rem, 2.5vw, 4.5rem);
  }
  
  .scroll-nav {
    padding: 1.75rem 5rem;
    gap: 1.75rem;
  }
  
  .scroll-nav button {
    padding: 1.5rem 3rem;
    font-size: 1.3rem;
  }
  
  .back-to-top {
    width: 80px;
    height: 80px;
    bottom: 3.5rem;
    right: 3.5rem;
  }
  
  .open-map-btn {
    padding: 1.5rem 3rem;
    font-size: 1.4rem;
  }
}

</style>