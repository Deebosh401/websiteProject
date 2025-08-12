<template>
  <div class="cities-header">
    <p class="cities-list">{{ title }}</p>

    <div class="page-indicators">
      <span v-for="n in totalPages" :key="n" :class="{ dot: true, active: n - 1 === currentPage }"/>
    </div>

    <span class="cities-link" @click="emit('allClick')">{{ allTitle }}</span>
  </div>

  <div
    class="scroll-carousel"
    :class="{ 'afisha-mode': isAfisha }"
    ref="carouselRef"
    @scroll.passive="onScroll"
    @wheel.passive="onWheel"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <div
        v-for="(item, i) in displayItems"
        :key="itemKeyValue(item, i)"
        class="card"
        :class="{ 'afisha-card': title === 'Афиша событий' }"
        @click="emit('itemClick', item)"
      >
      <div class="card-image-container">
        <template v-if="getImage(item).endsWith('.mp4')">
          <video ref="videoRefs" autoplay loop muted playsinline preload="metadata" class="city-image">
            <source :src="getImage(item)" type="video/mp4" />
          </video>
        </template>
        <template v-else>
          <img :src="getImage(item)" alt="" class="city-image" />
        </template>

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
            @click.stop="emit('itemClick', item)"
            role="button"
            :aria-label="`Открыть ${getName(item)}`"
          >
            {{ getName(item) }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import type { Attraction, CarouselInfo } from '../../Data'

type Item = CarouselInfo | Attraction

const props = defineProps<{
  title: string
  allTitle?: string
  items: Item[]
  cardsPerPage?: number
  itemKey?: keyof CarouselInfo | keyof Attraction | string | null
}>()

const emit = defineEmits<{
  (e: 'itemClick', item: Item): void
  (e: 'allClick'): void
}>()

const isAfisha = computed(() => props.title === 'Афиша событий')

function isAttraction(item: Item): item is Attraction {
  return 'category' in item || 'date' in item || 'location' in item
}
function getImage(item: Item): string {
  return (item as Attraction).image ?? (item as CarouselInfo).image ?? ''
}
function getName(item: Item): string {
  return (item as any).name ?? ''
}
function itemKeyValue(item: Item, i: number) {
  const keyProp = (props.itemKey ?? '') as string
  const val = keyProp && (item as any)[keyProp]
  return val != null ? String(val) : i
}
function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

const isPopularSection = computed(() =>
  (props.title || '').toLowerCase().includes('популяр')
)

function formatRating(r?: number) {
  if (typeof r !== 'number') return '—'
  return Math.round(r * 10) / 10
}

function isRestaurant(item: Item): boolean {
  const cat = (item as any)?.category?.toString().toLowerCase() || ''
  const type = (item as any)?.type?.toString().toLowerCase() || ''
  return cat.includes('есть') || cat.includes('ресторан') || type === 'restaurant'
}

function priceLabel(item: Item): string | null {
  // Prefer symbolic price levels
  const sym = (item as any)?.priceLevel as string | undefined // '$'..'$$$$'
  if (sym) {
    const map: Record<string, string> = {
      '$': 'Недорого',
      '$$': 'Средне',
      '$$$': 'Дорого',
      '$$$$': 'Премиум',
    }
    const m = map[sym]
    if (m) return m
  }

  if (isRestaurant(item)) {
    const avg = (item as any)?.avgPrice
    if (typeof avg === 'number') {
      if (avg < 800) return 'Недорого'
      if (avg < 2000) return 'Средне'
      return 'Дорого'
    }
  }

  const p = (item as any)?.price
  if (typeof p === 'number') {
    return p === 0 ? '0₽' : `от ${p} ₽`
  }

  return null
}

const carouselRef = ref<HTMLElement | null>(null)
const videoRefs = ref<HTMLVideoElement[]>([])
let observer: IntersectionObserver | null = null

const displayItems = computed(() => props.items.slice(0, 6))

const cardsPerPage = computed(() => (isAfisha.value ? 1 : (props.cardsPerPage ?? 2)))

const currentPage = ref(0)
const totalPages = computed(() =>
  Math.max(1, Math.ceil(displayItems.value.length / cardsPerPage.value))
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

function scrollToPage(nextPage: number) {
  const el = carouselRef.value
  if (!el) return
  const total = totalPages.value
  if (nextPage >= total) currentPage.value = 0
  else if (nextPage < 0) currentPage.value = total - 1
  else currentPage.value = nextPage

  const w = getPageWidthPx()
  el.scrollTo({ left: currentPage.value * w, behavior: 'smooth' })
}

let autoScrollTimer: number | undefined
function startAutoScroll() {
  if (!isAfisha.value) return
  stopAutoScroll()
  autoScrollTimer = window.setInterval(() => {
    scrollToPage(currentPage.value + 1)
  }, 3500)
}

function stopAutoScroll() {
  if (autoScrollTimer) {
    window.clearInterval(autoScrollTimer)
    autoScrollTimer = undefined
  }
}
function onUserInteraction() {
  if (isAfisha.value) startAutoScroll()
}

function onScroll() {
  const el = carouselRef.value
  if (!el) return
  const w = getPageWidthPx()
  if (!w) return
  currentPage.value = clamp(Math.round(el.scrollLeft / w), 0, totalPages.value - 1)
  onUserInteraction()
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
  onUserInteraction()
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
  onUserInteraction()
}

onMounted(async () => {
  scrollToPage(0)
  startAutoScroll()

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

onUnmounted(() => {
  observer?.disconnect()
  stopAutoScroll()
})


</script>

<style scoped>
.cities-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 3vw;
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
.scroll-carousel::-webkit-scrollbar { display: none; }

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

.scroll-carousel.afisha-mode .card {
  flex: 0 0 100%;
  height: 85%;
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
.overlay-button:hover { transform: translateX(-50%) scale(1.05); }

.event-info {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 26%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.1rem;
  padding:  0.5rem;
  color: #fff;
  background: linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.25), rgba(0,0,0,0));
  border-top: 0.25px solid rgba(255,255,255,0.15);
  box-shadow: inset 0 8px 24px rgba(0,0,0,0.25);
  backdrop-filter: blur(1px);
}
.event-name {
  font-weight: 500;
  font-size: clamp(1rem, 1vw, 1.2rem);
  letter-spacing: 0.2px;
  text-shadow: 0 1px 2px rgba(193, 156, 71, 0.35);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.event-date,
.event-location {
  font-size: clamp(0.8rem, 1vw, 0.85rem);
  line-height: 1.2;
  opacity: 0.95;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-date::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 4px;
  border-radius: 50%;
  background: #ffbf47;
  box-shadow: 0 0 0 0 rgba(255,191,71,0.9);
  animation: pulse 1.9s infinite;
}

.afisha-card {
  flex: 0 0 100%;    
  aspect-ratio: 16 / 10;
  max-height: 260px;
  overflow: hidden;
}

@media (min-width: 640px) {
  .afisha-card { max-height: 260px; }
}
@media (min-width: 1024px) {
  .afisha-card { max-height: 280px; }
}

.afisha-card .card-image-container,
.afisha-card .city-image {
  height: 100%;
  object-fit: cover;
}

.event-info.compact {
  padding: 0rem 0.5rem 0.1rem;   
  gap: 0.1rem;                     
  background: linear-gradient(
    to top,
    rgba(0,0,0,0.65) 0%,
    rgba(0,0,0,0.45) 60%,
    rgba(0,0,0,0.0) 100%
  );
}

.afisha-card .event-name {
  font-weight: 600;
  font-size: clamp(1rem, 3.6vw, 1.05rem);
  line-height: 1.15;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.afisha-card .event-date,
.afisha-card .event-location {
  font-size: clamp(0.75rem, 3.2vw, 0.9rem);
  line-height: 1.2;
  margin: 0;
  opacity: 0.9;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Popular overlay */
.popular-info {
  position: absolute;
  inset: auto 0 0 0;
  height: 30%;
  padding: 0.55rem 0.65rem;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.25rem;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.65) 0%,
    rgba(0, 0, 0, 0.35) 60%,
    rgba(0, 0, 0, 0) 100%
  );
  pointer-events: none; 
}

.popular-top {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.9rem;
  line-height: 1;
}

.popular-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.popular-info .chip {
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.28);
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  font-size: 0.78rem;
  backdrop-filter: blur(2px);
  max-width: 60%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.popular-info .price {
  font-weight: 600;
  font-size: 0.86rem;
}

.popular-info .chip,
.popular-info .price {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* --- Popular compact presentation --- */
.popular-compact {
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

/* top-left badge */
.rating-badge {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  padding: 0.25rem 0.5rem;
  font-weight: 700;
  font-size: 0.82rem;
  color: #fff;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 999px;
  backdrop-filter: blur(2px);
  line-height: 1;
}
.rating-badge .sep { opacity: 0.7; margin: 0 0.25rem; }

.popular-bottom2 {
  background: linear-gradient(
    to top,
    rgba(0,0,0,0.70) 0%,
    rgba(0,0,0,0.35) 60%,
    rgba(0,0,0,0) 100%
  );
  padding: 0.5rem 0.6rem 0.55rem;
  color: #fff;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

.popular-name {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  display: -webkit-box;
  -webkit-line-clamp: 1; line-clamp: 1;
  -webkit-box-orient: vertical; overflow: hidden;
}

.popular-chips {
  display: flex;
  gap: 0.4rem;
  align-items: center;
}

.popular-chips .chip {
  max-width: 60%;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  font-size: 0.78rem;
  padding: 0.18rem 0.5rem;
  border-radius: 999px;
  background: rgba(255,255,255,0.16);
  border: 1px solid rgba(255,255,255,0.24);
  backdrop-filter: blur(2px);
}
.popular-chips .chip.strong {
  background: rgba(255,255,255,0.25);
  border-color: rgba(255,255,255,0.35);
  font-weight: 700;
}


@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(255,191,71,0.7); }
  70% { box-shadow: 0 0 0 10px rgba(255,191,71,0); }
  100% { box-shadow: 0 0 0 0 rgba(255,191,71,0); }
}

@keyframes slideInLeft { to { opacity: 1; transform: translateX(0); } }
@keyframes slideInRight { to { opacity: 1; transform: translateX(0); } }
</style>