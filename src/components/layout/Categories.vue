<template>
  <div class="cities-header">
    <p class="cities-list">{{ title }}</p>

    <div class="page-indicators">
      <span v-for="n in totalPages" :key="n" :class="{ dot: true, active: n - 1 === currentPage }"/>
    </div>

    <span class="cities-link" @click="emit('allClick')">{{ allTitle }}</span>
  </div>

  <!-- Loading Skeleton -->
  <div v-if="loading" class="skeleton-container">
    <div v-for="i in 6" :key="i" class="skeleton-card">
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-title"></div>
        <div class="skeleton-subtitle"></div>
      </div>
    </div>
  </div>

  <!-- Content -->
  <div
    v-else
    class="scroll-carousel"
    :class="{ 'afisha-mode': isAfisha }"
    ref="carouselRef"
    @scroll.passive="onScroll"
    @wheel.passive="onWheel"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @keydown.left="previousPage"
    @keydown.right="nextPage"
    tabindex="0"
    role="region"
    :aria-label="`${title} карусель`"
  >
    <div
        v-for="(item, i) in displayItems"
        :key="itemKeyValue(item, i)"
        class="card"
        :class="{ 
          'afisha-card': title === 'Афиша событий',
          'popular-card': isPopularSection,
          'loading': item.loading
        }"
        @click="handleCardClick(item)"
        @keydown.enter="handleCardClick(item)"
        @keydown.space.prevent="handleCardClick(item)"
        role="button"
        :tabindex="0"
        :aria-label="`${getName(item)} - ${getItemDescription(item)}`"
      >
      <div class="card-image-container">
        <template v-if="getImage(item).endsWith('.mp4')">
          <video 
            ref="videoRefs" 
            autoplay 
            loop 
            muted 
            playsinline 
            preload="metadata" 
            class="city-image"
            :poster="getVideoPoster(item)"
            @loadstart="handleVideoLoad"
            @canplay="handleVideoCanPlay"
          >
            <source :src="getImage(item)" type="video/mp4" />
          </video>
        </template>
        <template v-else>
          <img 
            :src="getImage(item)" 
            :alt="`${getName(item)} изображение`"
            class="city-image" 
            loading="lazy"
            @load="handleImageLoad"
            @error="handleImageError"
          />
        </template>

        <!-- Loading overlay -->
        <div v-if="item.loading" class="loading-overlay">
          <div class="loading-spinner"></div>
        </div>

        <template v-if="title === 'Афиша событий' && isAttraction(item)">
      <div class="event-info compact">
        <h4 class="event-name">{{ getName(item) }}</h4>
        <p v-if="item.date" class="event-date">{{ formatDate(item.date) }}</p>
        <p v-if="item.location" class="event-location">{{ item.location }}</p>
      </div>
    </template>

    <template v-else-if="isPopularSection && isAttraction(item)">
  <div class="popular-compact">
    <div class="rating-badge">
      ⭐ {{ formatRating(item.rating) }}
      <span v-if="item.checkedIn" class="sep">•</span>
      <span v-if="item.checkedIn">{{ item.checkedIn }}</span>
    </div>

    <div class="popular-bottom2">
      <div class="popular-name">{{ getName(item) }}</div>
      <div class="popular-chips">
        <span v-if="item.category" class="chip">{{ item.category }}</span>
        <span v-if="priceLabel(item)" class="chip strong">{{ priceLabel(item) }}</span>
      </div>
    </div>
  </div>
</template>

        <template v-else>
          <button
            class="overlay-button"
            @click="emit('itemClick', item)"
            role="button"
            :aria-label="`Открыть ${getName(item)}`"
          >
            {{ getName(item) }}
          </button>
        </template>
      </div>
    </div>
  </div>

  <!-- Navigation Arrows -->
  <button 
    v-if="showNavigation" 
    class="nav-arrow nav-prev" 
    @click="previousPage"
    aria-label="Предыдущая страница"
  >
    <Icon icon="mdi:chevron-left" />
  </button>
  <button 
    v-if="showNavigation" 
    class="nav-arrow nav-next" 
    @click="nextPage"
    aria-label="Следующая страница"
  >
    <Icon icon="mdi:chevron-right" />
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import type { Attraction, CarouselInfo } from '../../Data'

type Item = CarouselInfo | Attraction

const props = defineProps<{
  title: string
  allTitle?: string
  items: Item[]
  cardsPerPage?: number
  itemKey?: keyof CarouselInfo | keyof Attraction | string | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'itemClick', item: Item): void
  (e: 'allClick'): void
}>()

const isAfisha = computed(() => props.title === 'Афиша событий')
const isPopularSection = computed(() => props.title === 'Популярные')
const showNavigation = computed(() => props.items.length > 6)

// Loading state
const loading = ref(props.loading || false)
const loadedItems = ref(new Set<number>())

// Touch handling for mobile
let touchStartX = 0
let touchStartY = 0
let touchEndX = 0
let touchEndY = 0

const onTouchStart = (e: TouchEvent) => {
  touchStartX = e.changedTouches[0].screenX
  touchStartY = e.changedTouches[0].screenY
}

const onTouchMove = (e: TouchEvent) => {
  e.preventDefault()
}

const onTouchEnd = (e: TouchEvent) => {
  touchEndX = e.changedTouches[0].screenX
  touchEndY = e.changedTouches[0].screenY
  handleSwipe()
}

const handleSwipe = () => {
  const diffX = touchStartX - touchEndX
  const diffY = touchStartY - touchEndY
  
  // Check if it's a horizontal swipe
  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
    if (diffX > 0) {
      nextPage()
    } else {
      previousPage()
    }
  }
}

// Navigation
const currentPage = ref(0)
const carouselRef = ref<HTMLElement>()

const totalPages = computed(() => Math.ceil(props.items.length / (props.cardsPerPage || 6)))

const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++
    scrollToPage()
  }
}

const previousPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--
    scrollToPage()
  }
}

const scrollToPage = () => {
  if (carouselRef.value) {
    const cardWidth = carouselRef.value.scrollWidth / props.items.length
    const scrollPosition = currentPage.value * cardWidth * (props.cardsPerPage || 6)
    carouselRef.value.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    })
  }
}

// Handle card clicks with loading state
const handleCardClick = (item: Item) => {
  if (!item.loading) {
    emit('itemClick', item)
  }
}

// Image and video loading
const handleImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  const index = Array.from(carouselRef.value?.children || []).indexOf(img.closest('.card') as HTMLElement)
  loadedItems.value.add(index)
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/default-avatar.png' // Fallback image
}

const handleVideoLoad = (event: Event) => {
  const video = event.target as HTMLVideoElement
  const index = Array.from(carouselRef.value?.children || []).indexOf(video.closest('.card') as HTMLElement)
  loadedItems.value.add(index)
}

const handleVideoCanPlay = (event: Event) => {
  const video = event.target as HTMLVideoElement
  video.play().catch(() => {
    // Autoplay failed, but that's okay
  })
}

// Keyboard navigation
const onKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault()
      previousPage()
      break
    case 'ArrowRight':
      event.preventDefault()
      nextPage()
      break
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})

// Watch for loading state changes
watch(() => props.loading, (newLoading) => {
  loading.value = newLoading || false
})

function isAttraction(item: Item): item is Attraction {
  return 'category' in item && 'price' in item
}

function itemKeyValue(item: Item, index: number): string | number {
  if (props.itemKey && item[props.itemKey as keyof Item]) {
    return item[props.itemKey as keyof Item] as string | number
  }
  return index
}

function getName(item: Item): string {
  return 'name' in item ? item.name : 'Unknown'
}

function getImage(item: Item): string {
  if (isAttraction(item)) {
    return item.image || '/default-avatar.png'
  }
  return item.image || '/default-avatar.png'
}

function getVideoPoster(item: Item): string {
  // Generate a poster image for videos
  return item.image?.replace('.mp4', '.jpg') || '/default-avatar.png'
}

function getItemDescription(item: Item): string {
  if (isAttraction(item)) {
    return `${item.category}${item.city ? ` в ${item.city}` : ''}`
  }
  return item.description || ''
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatRating(rating?: number): string {
  return rating ? rating.toFixed(1) : '0.0'
}

function priceLabel(item: Attraction): string {
  if (item.price === 0) return 'Бесплатно'
  if (item.price) return `${item.price} ₽`
  return ''
}

const onScroll = () => {
  // Update current page based on scroll position
  if (carouselRef.value) {
    const scrollLeft = carouselRef.value.scrollLeft
    const cardWidth = carouselRef.value.scrollWidth / props.items.length
    const cardsPerPage = props.cardsPerPage || 6
    currentPage.value = Math.round(scrollLeft / (cardWidth * cardsPerPage))
  }
}

const onWheel = (e: WheelEvent) => {
  e.preventDefault()
  if (e.deltaY > 0) {
    nextPage()
  } else {
    previousPage()
  }
}
</script>

<style scoped>
/* Skeleton Loading */
.skeleton-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.skeleton-card {
  background: var(--bg-secondary, #f8f9fa);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px var(--shadow-color, rgba(0, 0, 0, 0.1));
}

.skeleton-image {
  width: 100%;
  height: 200px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-content {
  padding: 1rem;
}

.skeleton-title {
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  margin-bottom: 0.5rem;
  border-radius: 4px;
}

.skeleton-subtitle {
  height: 16px;
  width: 60%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Navigation Arrows */
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 10;
}

.nav-arrow:hover {
  background: white;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.nav-prev {
  left: 10px;
}

.nav-next {
  right: 10px;
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--primary-color, #3b82f6);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Enhanced Card Styles */
.card {
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px var(--shadow-color, rgba(0, 0, 0, 0.15));
}

.card:focus {
  outline: 2px solid var(--primary-color, #3b82f6);
  outline-offset: 2px;
}

/* Accessibility improvements */
.card[role="button"]:focus-visible {
  outline: 2px solid var(--primary-color, #3b82f6);
  outline-offset: 2px;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .nav-arrow {
    width: 35px;
    height: 35px;
  }
  
  .skeleton-container {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

/* Dark mode support */
[data-theme="dark"] .skeleton-image,
[data-theme="dark"] .skeleton-title,
[data-theme="dark"] .skeleton-subtitle {
  background: linear-gradient(90deg, #2d2d2d 25%, #404040 50%, #2d2d2d 75%);
}

[data-theme="dark"] .nav-arrow {
  background: rgba(45, 45, 45, 0.9);
  color: white;
}

[data-theme="dark"] .nav-arrow:hover {
  background: #2d2d2d;
}

[data-theme="dark"] .loading-overlay {
  background: rgba(26, 26, 26, 0.8);
}
</style>