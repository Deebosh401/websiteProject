<template>
  <div class="cities-header">
    <p class="cities-list">{{ title }}</p>

    <div class="page-indicators">
      <span
        v-for="n in totalPages"
        :key="n"
        :class="{ dot: true, active: n - 1 === currentPage }"
      />
    </div>

    <span class="cities-link" @click="emit('allClick')">{{ allTitle }}</span>
  </div>

  <div
    class="scroll-carousel"
    ref="carouselRef"
    @scroll.passive="onScroll"
    @wheel.passive="onWheel"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <div
      v-for="(item, i) in items"
      :key="itemKey ? item[itemKey] : i"
      class="card"
      @click="emit('itemClick', item)"
    >
      <div class="card-image-container">
        <template v-if="(item.image || '').endsWith('.mp4')">
          <video
            ref="videoRefs"
            autoplay
            loop
            muted
            playsinline
            preload="metadata"
            class="city-image"
          >
            <source :src="item.image" type="video/mp4" />
          </video>
        </template>
        <template v-else>
          <img :src="item.image" alt="" class="city-image" />
        </template>

        <button
          class="overlay-button"
          @click.stop="emit('itemClick', item)"
          role="button"
          :aria-label="`Открыть ${item.name}`"
        >
          {{ item.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import type { CarouselInfo } from '../../Data'

const props = defineProps<{
  title: string
  allTitle?: string
  items: CarouselInfo[]
  cardsPerPage?: number
  itemKey?: keyof CarouselInfo | null
}>()

const emit = defineEmits<{
  (e: 'itemClick', item: CarouselInfo): void
  (e: 'allClick'): void
}>()

const carouselRef = ref<HTMLElement | null>(null)
const videoRefs = ref<HTMLVideoElement[]>([])
let observer: IntersectionObserver | null = null

const currentPage = ref(0)
const cardsPerPage = computed(() => props.cardsPerPage ?? 2)
const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.items.length / cardsPerPage.value))
)

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function getPageWidthPx() {
  const el = carouselRef.value
  if (!el) return 0
  const card = el.querySelector('.card') as HTMLElement | null
  if (!card) return 0
  const gap = parseFloat(getComputedStyle(el).gap || '0')
  return (card.offsetWidth + gap) * cardsPerPage.value
}

function scrollToPage(page: number) {
  const el = carouselRef.value
  if (!el) return
  const w = getPageWidthPx()
  const p = clamp(page, 0, totalPages.value - 1)
  el.scrollTo({ left: p * w, behavior: 'smooth' })
  currentPage.value = p
}

function onScroll() {
  const el = carouselRef.value
  if (!el) return
  const w = getPageWidthPx()
  if (!w) return
  const p = Math.round(el.scrollLeft / w)
  currentPage.value = clamp(p, 0, totalPages.value - 1)
}

let wheelTimeout: number | undefined
function onWheel() {
  if (wheelTimeout) window.clearTimeout(wheelTimeout)
  wheelTimeout = window.setTimeout(() => snapToNearestPage(), 40)
}

function snapToNearestPage() {
  const el = carouselRef.value
  if (!el) return
  const w = getPageWidthPx()
  if (!w) return
  scrollToPage(Math.round(el.scrollLeft / w))
}

const SWIPE_VELOCITY_THRESHOLD = 0.6
const SWIPE_DISTANCE_RATIO = 0.25

const touchStartX = ref(0)
const lastTouchX = ref(0)
const touchStartTime = ref(0)
const isTouching = ref(false)

function onTouchStart(e: TouchEvent) {
  const t = e.touches[0]
  touchStartX.value = t.clientX
  lastTouchX.value = t.clientX
  touchStartTime.value = performance.now()
  isTouching.value = true
}
function onTouchMove(e: TouchEvent) {
  if (!isTouching.value) return
  lastTouchX.value = e.touches[0].clientX
}
function onTouchEnd() {
  if (!isTouching.value) return
  isTouching.value = false

  const w = getPageWidthPx()
  if (!w) return snapToNearestPage()

  const elapsed = performance.now() - touchStartTime.value
  const dist = lastTouchX.value - touchStartX.value
  const speed = Math.abs(dist) / Math.max(1, elapsed)
  const dir = dist < 0 ? 1 : -1

  if (speed >= SWIPE_VELOCITY_THRESHOLD || Math.abs(dist) >= w * SWIPE_DISTANCE_RATIO) {
    scrollToPage(currentPage.value + dir)
  } else {
    snapToNearestPage()
  }
}

onMounted(async () => {
  scrollToPage(0)
  await nextTick()
  const videos = (carouselRef.value?.querySelectorAll('video') ?? []) as NodeListOf<HTMLVideoElement>
  videoRefs.value = Array.from(videos)
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const v = entry.target as HTMLVideoElement
      if (entry.isIntersecting) v.play().catch(() => {})
      else v.pause()
    })
  }, { threshold: 0.5 })
  videoRefs.value.forEach((v) => observer?.observe(v))
})

onUnmounted(() => observer?.disconnect())
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
  gap: 2vw;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 0.1rem 2vw 1rem 2vw;
  scroll-padding-left: 2vw;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  scroll-behavior: smooth;
  overscroll-behavior-x: contain;
  touch-action: pan-x; 
}

.scroll-carousel::-webkit-scrollbar {
  display: none;
}

.card {
  flex: 0 0 calc((100% - 2vw) / 2);
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
  aspect-ratio: 1 / 1;
  overflow: hidden;
  transition: transform 0.3s ease, filter 0.3s ease;
  border-radius: 20px;
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
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  background-color: transparent;
  color: white;
  border: thick double white;
  padding: 8px 6px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90%;
}

.overlay-button:hover {
  transform: translateX(-50%) scale(1.05);
}

@keyframes slideInLeft { to { opacity: 1; transform: translateX(0); } }
@keyframes slideInRight { to { opacity: 1; transform: translateX(0); } }
</style>