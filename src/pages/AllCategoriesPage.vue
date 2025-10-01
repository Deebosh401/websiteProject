<template>
  <div class="all-cities-page">
      <div class="center-area">
        <button class="back-btn" @click="goBack">← Назад</button>
      </div>

    <div class="cities-scroll-container">
      <div
        class="cities-row"
        v-for="(row, rowIndex) in groupedRows"
        :key="rowIndex"
      >
        <div
          class="city-tile"
          v-for="(item, index) in row"
          :key="item.id || item.name"
          @click="() => onItemClick(item)"
          :style="{ animationDelay: `${index * 0.05}s` }"
        >
          <template v-if="getItemImage(item)">
            <img
              v-if="!getItemImage(item).endsWith('.mp4')"
              :src="getItemImage(item)"
              class="city-image"
            />
            <video v-else autoplay loop muted playsinline class="city-image">
              <source :src="getItemImage(item)" type="video/mp4" />
            </video>
          </template>
          <template v-if="getItemIcon && getItemIcon(item)">
            <div class="icon-wrapper">
              <Icon :icon="getItemIcon(item)" class="tile-icon" />
            </div>
          </template>
          <div class="city-label">{{ getItemLabel(item) }}</div>
          <div class="badge" :title="`${item.attractions} достопримечательностей`">{{ item.attractions }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

const props = defineProps<{
  title: string
  items: any[]
  getItemLabel: (item: any) => string
  getItemImage: (item: any) => string
  onItemClick: (item: any) => void
  getItemIcon?: (item: any) => any
}>()

const router = useRouter()

function goBack() {
  router.push('/')
}

const groupedRows = computed(() => {
  const rows = []
  for (let i = 0; i < props.items.length; i += 3) {
    rows.push(props.items.slice(i, i + 3))
  }
  return rows
})

const isScrolled = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 30
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.all-cities-page {
  padding: 0;
  margin-top: 0;
  background-color: transparent;
}

.center-area {
  display: flex;
  justify-content: center;
  flex: 1;
}

.back-btn {
  position: fixed;
  bottom: 1.2rem;
  right: 1.2rem;
  background: rgba(255, 255, 255, 0.8);
  color: #333;
  border: 1px solid #ccc;
  border-radius: 999px;
  padding: 0.6rem 1.1rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  transition: background 0.3s ease;
  z-index: 10;
}

.back-btn:hover {
  border-color: #aaa;
}

.cities-scroll-container {
  padding: 1rem 0;
  padding-top: 4.7rem;
}

.cities-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.4rem;
  padding: 0 0.4rem;
  margin-bottom: 0.6rem;
}

.city-tile {
  background: white;
  border-radius: 10px;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  cursor: pointer;
  aspect-ratio: 1 / 1;
  transition: transform 0.2s;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInTile 0.5s ease forwards;
}

.city-tile:hover {
  transform: scale(1.05);
}

.city-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.city-label {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  color: white;
  padding: 0.2rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.7rem;
  white-space: normal; /* allow wrapping */
  overflow: hidden; 
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background: linear-gradient(135deg, #2563eb, #00bcd4);
  color: white;
  border-radius: 50%;
  padding: 0.3em 0.55em;
  font-size: 0.65rem;
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, background 0.3s ease;
}

.badge:hover {
  transform: scale(1.1);
  background: linear-gradient(135deg, #00bcd4, #2563eb);
}

@keyframes fadeInTile {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tile-icon {
  width: 80%;
  height: 80%;
  color: #2563eb;
}

.icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  margin: auto;
  background: linear-gradient(135deg, #e0f2ff, #cce7ff);
  border-radius: 10px;
  padding: 0.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.icon-wrapper:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 188, 212, 0.3);
}
</style>