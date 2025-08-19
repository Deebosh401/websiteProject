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
        :items="citiesData.slice(0, 6)"
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
        :items="afishaItems"
        item-key="name"
        @itemClick="(item) => router.push({ name: 'event-detail', params: { id: item.id } })"
        @allClick="() => router.push({ name: 'all-categories' })"
      />
    </div>

    <div id="popular">
  <Categories
    title="Популярные"
    allTitle="Посмотреть все"
    :items="popularItems"
    item-key="name"
    @itemClick="(item) => router.push({ name: 'event-detail', params: { id: item.id } })"
    @allClick="() => router.push({ name: 'all-categories' })"
  />
</div>
    <div id="weather"><WeatherApp /></div>
    <div id="guides"><Guides /></div>
    <div id="slang"><SlangJokes @modal-toggle="setModalState" /></div>
    <div class="map-trigger-wrap">
      <button class="open-map-btn" @click="openExplorer" aria-haspopup="dialog" aria-controls="city-explorer">Открыть карту</button>
    </div>
    <CityExplorerMap v-if="showExplorer" id="city-explorer" :noHeader="true" @close="closeExplorer" />
    <div id="firsthand"><FirstHandExperience /></div>
    <div id="map"></div>

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

<script setup>
import Categories from "../components/layout/Categories.vue"
import Guides from "../components/layout/Guides.vue";
import SlangJokes from "../components/layout/SlangJokes.vue";
import FirstHandExperience from "../components/layout/FirstHandExperience.vue";
import Map from "../components/layout/Map.vue";
import { defineAsyncComponent } from 'vue'
const CityExplorerMap = defineAsyncComponent(() => import('../components/layout/CityExplorerMap.vue'))
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { citiesData, categoriesCarouselData,allAttractions } from "../Data";
import { useRouter } from "vue-router";

const router = useRouter()
const showTopButton = ref(false)
const showExplorer = ref(false)
const openExplorer = () => { showExplorer.value = true }
const closeExplorer = () => { showExplorer.value = false }
const anyModalOpen = ref(false)
const setModalState = (open) => { anyModalOpen.value = open }
const handleFullscreenChange = () => {
  anyModalOpen.value = !!document.fullscreenElement || anyModalOpen.value
}

const scrollTo = (id) => {
  const el = document.getElementById(id)
  if (el) {
    const yOffset = -80 
    const y = el.getBoundingClientRect().top + window.scrollY + yOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}

function parseRu(dateStr) {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2}))?$/.exec(String(dateStr))
  if (!m) return NaN
  const [, dd, mm, yyyy, hh = '00', min = '00'] = m
  return new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:00`).getTime()
}

const afishaItems = computed(() => {
  const now = Date.now()
  return allAttractions.value
    .filter(a => a && a.date)
    .map(a => {
      const tsNative = Date.parse(a.date)
      const ts = Number.isNaN(tsNative) ? parseRu(a.date) : tsNative
      return { ...a, _ts: ts }
    })
    .filter(a => !Number.isNaN(a._ts))
    .filter(a => a._ts >= now) 
    .sort((a, b) => a._ts - b._ts) 
    .slice(0, 6)
    .map(({ _ts, ...rest }) => rest)
})

const popularItems = computed(() => {
  const toNum = (v, d = 0) =>
    typeof v === 'number'
      ? v
      : typeof v === 'string'
      ? Number(v.replace(/[^\d.]/g, '')) || d
      : d

  return [...(Array.isArray(allAttractions.value) ? allAttractions.value : [])]
    .filter(a => a && (a.rating != null || a.checkedIn != null))
    .map(a => ({
      ...a,
      _rating: toNum(a.rating),
      _reviews: toNum(a.reviewsCount ?? a.ratingCount ?? 0),
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


const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const checkScroll = () => {
  showTopButton.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', checkScroll)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  // Safari WebKit prefix (best-effort; TS ignore for vendor event)
  // @ts-ignore
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  // @ts-ignore
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
  padding-inline: clamp(1rem, 4vw, 5rem);
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
  font-weight: 650;
  font-size: clamp(1.5rem, 3.5vw, 2.3rem);
  line-height: 1.2;
  margin: 0;
  margin-right: 0.5rem;
  padding: 0.2rem 0.4rem;
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

</style>