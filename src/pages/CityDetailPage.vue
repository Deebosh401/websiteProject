<template>
  <div class="city-detail-page">
    <div class="city-hero" :style="{ backgroundImage: `url(${city?.image})` }">
      <div class="city-hero-overlay">
        <h1
            class="city-name"
            :style="{
                transform: `translateY(${Math.min(scrollY, 50) * -0.5}px)`,
                opacity: `${1 - Math.min(scrollY, 100) / 100}`,
            }"
            >
            {{ city?.name }}
        </h1>
      </div>
    </div>

    <div class="city-description">
      <p>{{ city?.description }}</p>
    </div>

    <div class="category-grid">
      <div
        class="category-card"
        v-for="(category, index) in categories"
        :key="index"
        @click="onCategoryClick(category)"
      >
        <Icon :icon="category.icon" class="category-icon" />
        <span class="category-label">{{ category.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { onMounted, onUnmounted} from 'vue'

const scrollY = ref(0)

function handleScroll() {
  scrollY.value = window.scrollY
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})


const route = useRoute()
const cityName = route.params.name as string

const cities = [
  {
    name: 'Калининград',
    description:
      'Калининград — это уникальный город на побережье Балтийского моря, сочетающий в себе богатое прусское наследие и современную российскую культуру. Улицы с немецкой архитектурой, уютные парки и музеи создают атмосферу старой Европы. Город идеально подойдёт для неспешных прогулок, экскурсионного отдыха и знакомства с историей региона. Особое очарование Калининграду придают морской воздух, Янтарный музей и близость к побережью.',
    image: '/Kaliningrad.jpeg',
  },
  {
    name: 'Светлогорск',
    description: 'Seaside charm',
    image: '/Svetlogorsk.jpeg',
  },
]

const city = cities.find((c) => c.name === cityName)

const categories = [
  { name: 'Экскурсии', icon: 'mdi:map-marker-radius' },
  { name: 'Где поесть', icon: 'mdi:silverware-fork-knife' },
  { name: 'Размещение', icon: 'mdi:bed' },
  { name: 'История', icon: 'mdi:castle' },
  { name: 'Концерты', icon: 'mdi:music' },
  { name: 'Семейный отдых', icon: 'mdi:account-group' },
]

function onCategoryClick(category: any) {
  console.log('Go to category:', category.name)
}
</script>

<style scoped>
.city-detail-page {
  font-family: sans-serif;
}

.city-hero {
  position: relative;
  height: 35vh;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
}

.city-hero-overlay {
  background: rgba(0, 0, 0, 0.25); 
  padding: 0.8rem 1.5rem;
  border-radius: 16px;
  backdrop-filter: blur(6px); 
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); 
}

.city-name {
  color: #fff;
  font-size: 1.4rem;
  font-weight: 500;
  text-align: center;
  margin: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); 
  letter-spacing: 0.5px;
}


.city-description {
  padding: 1.2rem;
  font-size: 1rem;
  color: #333;
  line-height: 1.5;
  text-align: justify;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.category-card {
  background: #f0f8ff;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s;
}

.category-card:hover {
  transform: scale(1.05);
}

.category-icon {
  font-size: 2rem;
  color: #2563eb;
}

.category-label {
  display: block;
  margin-top: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
}
</style>
