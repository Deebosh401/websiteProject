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

    <!-- Description -->
    <div class="city-description">
      <p>{{ city?.description }}</p>
    </div>

    <!-- Categories -->
    <div class="category-grid">
      <div
        class="category-card"
        v-for="(category, index) in categories"
        :key="index"
        @click="onCategoryClick(category)"
        :style="{ backgroundImage: category.image ? `url(${category.image})` : '' }"
      >
        <!-- Attractions Badge -->
        <div class="attraction-badge" v-if="category.attractions">
          {{ category.attractions }}
        </div>

        <!-- Optional icon -->
        <Icon v-if="category.icon" :icon="category.icon" class="category-icon" />

        <!-- Label -->
        <span class="category-label">{{ category.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'

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

const categories = ref([
  { name: 'Экскурсии', attractions: 70, image: '/Excursions.jpeg' },
  { name: 'Где поесть', attractions: 245, image: '/Category.resto.jpeg' },
  { name: 'Размещение', attractions: 123, image: '/Category.hotels.jpeg' },
  { name: 'Активный отдых', attractions: 53, image: '/Category.activity.jpeg' },
  { name: 'Исторические места', attractions: 321, icon: 'mdi:castle' },
  { name: 'Концерты', attractions: 76, image: '/Category.concerts.jpeg' },
  { name: 'Театры', attractions: 123, image: '/Theater.jpeg' },
  { name: 'Семейный выход', attractions: 123, image: '/Category.family.jpeg' },
  { name: 'Кино', attractions: 123, image: '/Movie.jpeg' },
  { name: 'Мастер-классы', attractions: 123, image: '/Workshop.jpeg' },
  { name: 'Музеи', attractions: 123, image: '/Museums.jpeg' },
  { name: 'Парки/cкверы', attractions: 123, image: '/Parks.jpeg' },
  { name: 'Отпускной транспорт', attractions: 123, image: '/transport.jpeg' },
  { name: 'Выставки', attractions: 123, image: '/Exhibition.jpeg' },
])

function onCategoryClick(category: any) {
  console.log('Go to category:', category.name)
}
</script>

<style scoped>
.city-detail-page {
  font-family: sans-serif;
  padding-top:4.3rem;
}

.city-hero {
  position: relative;
  height: 30vh;
  min-height: 200px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.city-hero-overlay {
  background: rgba(0, 0, 0, 0.35);
  padding: 0.6rem 1.4rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  backdrop-filter: blur(4px);
  text-align: center;
}

.city-name {
  color: #fff;
  font-size: 1.4rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.city-description {
  padding: 1.2rem 1.5rem;
  font-size: 1rem;
  color: #333;
  line-height: 1.6;
  text-align: justify;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.category-card {
  position: relative;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background-color: #f3f3f3;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
}

.category-card:hover {
  transform: scale(1.03);
}

.category-icon {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 1.7rem;
  color: white;
  z-index: 2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

.category-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.45);
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0.4rem;
  text-align: center;
  z-index: 2;
}

.attraction-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #3b82f6;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0.3em 0.55em;
  border-radius: 999px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  z-index: 2;
}
</style>