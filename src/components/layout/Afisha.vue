<template>
  <div class="cities-header">
    <p class="cities-list animate-left">Афиша событий</p>
    <span class="cities-link animate-right" @click="goToAllCities"> Посмотреть все </span>
  </div>

  <div class="slideshow-container">
    <div class="slideshow">
      <div
        v-for="(city, index) in cities"
        :key="index"
        class="card"
        :class="{ 'first-card': index === 0, 'last-card': index === cities.length - 1 }"
      >
        <div class="card-image-container">
          <template v-if="city.image.endsWith('.mp4')">
            <video
              loop
              muted
              playsinline
              preload="none"
              class="city-image"
              ref="videoRefs"
              :data-index="index"
            >
              <source :src="city.image" type="video/mp4" />
            </video>
          </template>
          <template v-else>
            <img :src="city.image" alt="City Image" class="city-image" />
          </template>
          <button class="overlay-button" @click="goToCity(city)">
            {{ city.name }}
          </button>
        </div>
      </div>
      <div class="end-spacer" aria-hidden="true"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'

interface City {
  name: string
  description: string
  image: string
  attractions: number
}

export default defineComponent({
  setup() {
    const cities = ref<City[]>([
      { name: 'Экскурсии', description: 'City of Light', image: '/Excursions.mp4', attractions: 50 },
      { name: 'Где поесть', description: 'The Big Apple', image: '/food.mp4', attractions: 70 },
      { name: 'Размещение', description: 'Land of the Rising Sun', image: '/hotels.mp4', attractions: 60 },
      { name: 'Исторические места', description: 'The Old Smoke', image: '/historicalSites.mp4', attractions: 40 },
      { name: 'Концерты', description: 'The Eternal City', image: '/music.mp4', attractions: 30 },
      { name: 'Идём семьёй', description: 'The Eternal City', image: '/activity.mp4', attractions: 30 },
      { name: 'Вечерний город', description: 'The Eternal City', image: '/NightCity.mp4', attractions: 30 },
      { name: 'Музеи и выставки', description: 'The Eternal City', image: '/museums.mp4', attractions: 30 }
    ])

    const currentIndex = ref(0)

    const goToAllCities = () => {
      console.log('Navigating to all cities...')
    }

    const goToCity = (city: City) => {
      console.log(`Navigating to ${city.name} with ${city.attractions} attractions.`)
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target as HTMLVideoElement
        const index = parseInt(video.dataset.index || '0')
        if (entry.isIntersecting) {
          currentIndex.value = index
        }
      })
    }, {
      threshold: 0.5,
      rootMargin: '0px 20% 0px 20%'
    })

    const updateVideoPlayback = () => {
      const videos = document.querySelectorAll<HTMLVideoElement>('video.city-image')

      videos.forEach((video) => {
        const index = parseInt(video.dataset.index || '0')
        const distance = Math.abs(index - currentIndex.value)

        if (distance <= 1) {
          if (video.preload !== 'auto') video.preload = 'auto'
          video.play().catch(() => {})
        } else if (distance === 2) {
          if (video.preload !== 'metadata') video.preload = 'metadata'
          video.pause()
        } else {
          if (video.preload !== 'none') video.preload = 'none'
          video.pause()
        }
      })
    }

    let playbackTimeout: number | null = null

    watch(currentIndex, () => {
      if (playbackTimeout) cancelAnimationFrame(playbackTimeout)

      playbackTimeout = requestAnimationFrame(() => {
        setTimeout(() => {
          updateVideoPlayback()
        }, 100)
      })
    })

    onMounted(() => {
      nextTick(() => {
        const videos = document.querySelectorAll<HTMLVideoElement>('video.city-image')
        videos.forEach((video) => observer.observe(video))
        updateVideoPlayback()
      })
    })

    onBeforeUnmount(() => {
      const videos = document.querySelectorAll<HTMLVideoElement>('video.city-image')
      videos.forEach((video) => observer.unobserve(video))
    })

    return { cities, goToCity, goToAllCities }
  }
})
</script>

<style scoped>

.overlay-button {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(214, 36, 125, 0.7); /* semi-transparent */
  color: rgba(255, 255, 255, 0.786);
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.3s ease, background-color 0.3s ease;
  backdrop-filter: blur(4px);
}

.overlay-button:hover {
  transform: translateX(-50%) scale(1.05);
  background-color: rgba(185, 28, 112, 0.8);
}


.cities-list{
  text-align: left;
  margin: 3;
}

.slideshow-container {
  background-color: transparent;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 10%;
  padding-top: 2%;
  scroll-behavior: smooth;
}

.slideshow-container::-webkit-scrollbar {
  display: none; 
}

.slideshow {
  display: flex;
  gap: 5vw;
  display: flex;
  padding-left: 5vw;
  scroll-snap-type: x mandatory;
  scroll-padding-left: 7vw;
  padding-right: 30vw;
  display: flex;
}

.card {
  flex: 0 0 calc(70vw - 2.5vw);
  background-color: #f8f5f2; 
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 5px 15px 15px rgba(0, 0, 0, 0.22);
  scroll-snap-align: center;
  display: flex;
  flex-direction: column;
}

.card:hover {
  box-shadow: 0.5px 15px 20px #ff8c00a8;
}

.card-image-container {
  position: relative;
  width: 100%;
  height: 35vh;
  overflow: hidden;
  transition: transform 0.3s ease, filter 0.3s ease;
}

.city-image,
.city-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease, filter 0.3s ease;
  border-radius: 20px;
}

.card-image-container:hover .city-image,
.card-image-container:hover .city-video {
  filter: brightness(1.15);
  transform: scale(1.01);
}

.overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: transparent;
  color: #ffffff;
  padding: 10px;
  text-align: center;
}
.overlay h3 {
  font-size: 10px;
  margin: 0;
  letter-spacing: 1px;
}
.overlay h1 {
  font-size: 26px;
  font-weight: 700;
}

.overlay-button {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(225, 245, 254, 0.765);
  color: rgba(6, 65, 71, 0.913);
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.3s ease, background-color 0.3s ease;
  backdrop-filter: blur(4px);
}

.overlay-button:hover {
  transform: translateX(-50%) scale(1.05);
  background-color: rgba(225, 245, 254, 0.648);
  font:bold;
}

.cities-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 5vw 10px;
  padding-top: 0;
}

.cities-list {
  font-size: 20px;
  font-weight: bold;
  opacity: 0;
  transform: translateX(-20px);
  animation: slideInLeft 0.6s ease-out forwards;
}

.cities-link {
  font-size: 16px;
  font-weight: 500;
  color: rgb(26,58,107);
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
  color: #00b4d8; /* more vivid yellow */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.end-spacer {
  flex: 0 0 0.1vw; /* Adjust for more/less breathing room */
  pointer-events: none;
}


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