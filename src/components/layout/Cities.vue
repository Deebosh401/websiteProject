<template>
  <div class="cities-header">
    <p class="cities-list">Города</p>

    <div class="page-indicators">
      <span
        v-for="n in totalPages"
        :key="n"
        :class="{ dot: true, active: n - 1 === currentPage }"
      ></span>
    </div>

    <span class="cities-link" @click="goToAllCities">Все города</span>
  </div>

  <div
    class="scroll-carousel"
    ref="carouselRef"
    @scroll.passive="onScroll"
    @wheel.passive="onWheel"
  >
    <div
      v-for="city in cities"
      :key="city.name"
      class="card"
      @click="goToCity(city)"
    >
      <div class="card-image-container">
        <img :src="city.image" alt="" class="city-image" />
        <button class="overlay-button" @click.stop="goToCity(city)">
          {{ city.name }}
        </button>
      </div>
    </div>
  </div>
</template>


<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

interface City {
  name: string
  description: string
  image: string
  attractions: number
}

export default defineComponent({
  setup() {
    const router = useRouter()
    const cities = ref<City[]>([
      { name: 'Калининград', description: '', image: '/Kaliningrad.jpeg', attractions: 50 },
      { name: 'Светлогорск', description: '', image: '/Svetlogorsk.jpeg', attractions: 70 },
      { name: 'Зеленоградск', description: '', image: '/Zelenogradsk.jpeg', attractions: 60 },
      { name: 'Янтарный', description: '', image: '/Yantarnyi.jpeg', attractions: 40 },
      { name: 'Советск', description: '', image: '/Sovetsk.jpeg', attractions: 30 },
       { name: 'Балтийск', description: '', image: '/Baltiysk.jpeg', attractions: 30 },
    ])

    const cardsPerPage = 2
    const totalPages = Math.ceil(cities.value.length / cardsPerPage)
    const currentPage = ref(0)

    const carouselRef = ref<HTMLElement | null>(null)

    function scrollToPage(page: number) {
      const container = carouselRef.value
      if (!container) return

      const card = container.querySelector('.card') as HTMLElement
      const cardWidth = card.offsetWidth
      const gap = parseFloat(getComputedStyle(container).gap || '0px')
      const scrollX = page * (cardWidth + gap) * cardsPerPage

      container.scrollTo({
        left: scrollX,
        behavior: 'smooth',
      })

      currentPage.value = page
    }

    function onTouchEnd() {
      snapToNearestPage()
    }

    function onWheel() {
      clearTimeout((onWheel as any).timeout)
      ;(onWheel as any).timeout = setTimeout(() => {
        snapToNearestPage()
      }, 80)
    }

    function onScroll() {
  const container = carouselRef.value
  if (!container) return

  const scrollLeft = container.scrollLeft
  const card = container.querySelector('.card') as HTMLElement
  const gap = parseFloat(getComputedStyle(container).gap || '0px')
  const cardWidth = card.offsetWidth
  const pageWidth = (cardWidth + gap) * cardsPerPage

  const page = Math.round(scrollLeft / pageWidth)
  currentPage.value = Math.max(0, Math.min(totalPages - 1, page))

  clearTimeout((onScroll as any).timeout)
  ;(onScroll as any).timeout = setTimeout(() => {
    snapToNearestPage()
  }, 100)
}


    function snapToNearestPage() {
      const container = carouselRef.value
      if (!container) return

      const scrollLeft = container.scrollLeft
      const card = container.querySelector('.card') as HTMLElement
      const cardWidth = card.offsetWidth
      const gap = parseFloat(getComputedStyle(container).gap || '0px')
      const pageWidth = (cardWidth + gap) * cardsPerPage

      const nearestPage = Math.round(scrollLeft / pageWidth)
      scrollToPage(nearestPage)
    }

    const goToCity = (city: City) => {
      router.push({ name: 'city-detail', params: { name: city.name } })
    }

    const goToAllCities = () => {
      router.push({ name: 'all-cities' })
    }

    onMounted(() => {
      scrollToPage(0)
    })

    return {
      cities,
      carouselRef,
      goToCity,
      goToAllCities,
      currentPage,
      totalPages,
      onScroll,
      onTouchEnd,
      onWheel,
    }
  },
})
</script>



<style scoped>
.cities-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 5vw;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.cities-list {
  font-size: 20px;
  font-weight: bold;
  opacity: 0;
  transform: translateX(-20px);
  animation: slideInLeft 0.6s ease-out forwards;
}

.page-indicators {
  display: flex;
  gap: 0.3rem;
  align-items: center;
  justify-content: center;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ccc;
 transition: background-color 0.3s ease, transform 0.3s ease;
}

.dot.active {
  background-color: #333;
  transform: scale(1.3);
}

.cities-link {
  font-size: 16px;
  font-weight: 500;
  color: rgb(26, 58, 107);
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 8px;
  transition: background-color 0.3s ease, color 0.3s ease;
  opacity: 0;
  transform: translateX(20px);
  animation: slideInRight 0.6s ease-out forwards;
  animation-delay: 0.2s;
}

.cities-link:hover {
  background-color: rgba(255, 218, 185, 0.3);
  transform: scale(1.05);
  border-radius: 16px;
  color: #00b4d8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.scroll-carousel {
  display: flex;
  gap: 5vw;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 1rem 5vw 2rem 5vw;
  scroll-padding-left: 5vw;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  scroll-behavior: smooth;
  overscroll-behavior-x: contain;
}

.scroll-carousel::-webkit-scrollbar {
  display: none;
}

.card {
  flex: 0 0 calc((100% - 5vw) / 2);
  scroll-snap-align: start;
  background-color: #f8f5f2;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.card:hover {
  box-shadow: 0 6px 20px rgba(255, 140, 0, 0.3);
  transform: translateY(-2px);
  transition: transform 0.3s ease;
}

.card-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5; 
  overflow: hidden;
  transition: transform 0.3s ease, filter 0.3s ease;
  border-radius: 20px;
  touch-action: pan-x;
  cursor: grab;
}

.city-image,
.city-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
  transition: transform 0.3s ease, filter 0.3s ease;
}

.card-image-container:hover .city-image {
  transform: scale(1.03);
  filter: brightness(1.1);
}

.overlay-button {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: transparent;
  color: white;
  border: thick double white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.3s ease;
}

.overlay-button:hover {
  transform: translateX(-50%) scale(1.05);
}

.end-spacer {
  flex: 0 0 5vw;
  pointer-events: none;
}

/* Animations */
@keyframes slideInLeft {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}


</style>
