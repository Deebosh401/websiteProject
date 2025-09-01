<template>
  <div v-if="event" class="event-detail-page">
    <div class="hero">
      <div class="hero-slider"
           ref="sliderRef"
           @touchstart.passive="onTouchStart"
           @touchmove.passive="onTouchMove"
           @touchend.passive="onTouchEnd">
        <div class="slides" :style="slideStyle">
          <div class="slide" v-for="(srcUrl, i) in galleryImages" :key="i">
            <img :src="srcUrl || '/default.jpg'" class="hero-image" />
          </div>
        </div>
        <div class="dots">
          <span v-for="i in galleryImages.length" :key="i" :class="{ dot: true, active: (i - 1) === currentSlide }" @click="goToSlide(i - 1)" />
        </div>
      </div>
      <div class="hero-overlay"></div>
      <div class="hero-top">
        <button class="icon-btn" aria-label="Назад" @click="goBack">
          <Icon icon="lucide:arrow-left" width="22" />
        </button>
        <div class="hero-right">
          <button class="icon-btn" aria-label="Поделиться" @click="shareEvent">
            <Icon icon="lucide:share-2" width="20" />
          </button>
          <button class="icon-btn" :aria-pressed="isFav" aria-label="В избранное" @click="toggleFavorite">
            <Icon :icon="isFav ? 'mdi:heart' : 'mdi:heart-outline'" width="22" />
          </button>
        </div>
      </div>
      <div class="hero-bottom">
        <h1 class="hero-title">{{ event.name }}</h1>
        <div class="hero-sub">
          <span v-if="event.date" class="chip">
            <Icon icon="lucide:clock" width="16" /> {{ formatDateTimeRu(event.date) }}
          </span>
          <button v-if="event.location" class="chip link" @click="openMapOptions">
            <Icon icon="lucide:map-pin" width="16" /> {{ event.location }}
          </button>
        </div>
      </div>
    </div>

    <div class="event-card">
      <div class="section chips-section" v-if="visibleChips.length">
        <h3 class="section-title">Информация</h3>
        <div class="section-content">
          <div class="chips-row">
            <span 
              v-for="chip in visibleChips" 
              :key="chip.key" 
              :class="['chip', chip.class]"
            >
              <Icon v-if="chip.icon" :icon="chip.icon" width="16" />
              {{ chip.text }}
              <span v-if="chip.subText" class="muted">{{ chip.subText }}</span>
            </span>
          </div>
        </div>
      </div>

      <div class="section attendees-section" v-if="reviews.length">
        <h3 class="section-title">Отзывы</h3>
        <div class="section-content">
          <p class="attendees-label">Отметились:</p>
          <div class="avatar-scroll-wrapper">
            <div class="avatar-list">
              <img
                v-for="(review, index) in limitedReviews"
                :key="index"
                :src="`https://i.pravatar.cc/80?img=${index + 1}`"
                class="avatar-interactive"
                :alt="`User ${review.user}`"
                @click="openSingleReviewModal(review)"
              />
              <div
                v-if="extraReviewCount > 0"
                class="more-avatar-interactive"
                @click="openReviewsModal"
              >
                +{{ extraReviewCount }}
              </div>
            </div>
          </div>
          <div class="reviews-cta">
            <button class="review-btn" @click="openReviewsModal" :title="`Показать все ${reviews.length} отзывов`">
              <Icon icon="lucide:message-square" width="18" />
              <span class="review-count">{{ reviews.length }}</span>
            </button>
            <button class="review-btn" @click="writeReview" title="Написать отзыв">
              <Icon icon="lucide:pencil" width="18" />
            </button>
          </div>
        </div>
      </div>

      <div class="section description-section">
        <h3 class="section-title">Описание</h3>
        <div class="section-content">
          <p>{{ event.description || 'Описание мероприятия пока не добавлено.' }}</p>
        </div>
      </div>

      <div class="section location-section" v-if="event.location">
        <h3 class="section-title">Место проведения</h3>
        <div class="section-content">
          <div class="inline-map-card" @click="openMapOptions">
            <div class="inline-map-thumb">
              <Icon icon="lucide:map" width="24" />
            </div>
            <div class="inline-map-info">
              <div class="inline-map-sub">{{ event.location }}</div>
            </div>
            <div class="inline-map-open">Открыть</div>
          </div>
        </div>
      </div>

      <div class="section links-section" v-if="event.whatsapp || event.instagram">
        <h3 class="section-title">Контакты</h3>
        <div class="section-content">
          <div class="event-links">
            <a v-if="event.whatsapp" :href="event.whatsapp" target="_blank">
              <Icon icon="logos:whatsapp-icon" width="20" /> WhatsApp
            </a>
            <a v-if="event.instagram" :href="event.instagram" target="_blank">
              <Icon icon="mdi:telegram" width="20" /> Telegram
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Sticky ACTION BAR -->
    <div class="action-bar">
      <button class="secondary" @click="openMapOptions">
        <Icon icon="lucide:navigation" width="16" />
        <span>Как добраться</span>
      </button>
      <button class="primary" @click="joinEvent">
        <Icon icon="lucide:calendar-check" width="16" />
        <span>Посетить</span>
      </button>
    </div>

    <!-- MAP OPTIONS MODAL -->
    <div v-if="showMapDialog" class="map-dialog">
      <div class="map-dialog-box">
        <div class="map-dialog-content">
          <p>Открыть в:</p>
          <button @click="openMap('google')">
            <Icon icon="logos:google-maps" width="18" /> Google Maps
          </button>
          <button @click="openMap('yandex')">
            <Icon icon="logos:yandex" width="18" /> Yandex Maps
          </button>
          <button @click="openMap('2gis')">
            <Icon icon="logos:2gis" width="18" /> 2GIS
          </button>
        </div>
        <div class="map-dialog-footer">
          <button class="cancel" @click="showMapDialog = false">
            <span>Назад</span>
          </button>
          <button class="join" @click="joinEvent">
            <Icon icon="lucide:calendar-check" width="16" />
            <span>Посетить</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ALL REVIEWS MODAL -->
    <div v-if="showReviewsModal" class="reviews-modal-overlay" @click.self="closeReviewsModal">
      <div class="reviews-modal">
        <h2>Отзывы</h2>
        <div class="review-item" v-for="(review, index) in reviews" :key="index">
          <div class="review-header">
            <div class="review-user">
              <strong>{{ review.user }}</strong>
              <span class="review-medal" :title="getLevelTitle(review.level)">
                <Icon :icon="getMedalIcon(review.level)" width="18" />
              </span>
            </div>
            <span class="review-date">{{ formatDateTimeRu(review.date) }}</span>
          </div>
          <div class="review-rating">⭐ {{ formatRating(review.rating) }}/5</div>
          <p class="review-comment">{{ review.comment }}</p>
        </div>
        <button class="close-btn" @click="closeReviewsModal">Закрыть</button>
      </div>
    </div>

    <!-- SINGLE REVIEW MODAL -->
    <div v-if="singleReviewModal" class="reviews-modal-overlay" @click.self="closeSingleReviewModal">
      <div class="reviews-modal">
        <h2>Отзыв</h2>
        <div class="review-item">
          <div class="review-header">
            <div class="review-user">
              <strong>{{ singleReview.user }}</strong>
              <span class="review-medal" :title="getLevelTitle(singleReview.level)">
                <Icon :icon="getMedalIcon(singleReview.level)" width="18" />
              </span>
            </div>
            <span class="review-date">{{ formatDateTimeRu(singleReview.date) }}</span>
          </div>
          <div class="review-rating">⭐ {{ formatRating(singleReview.rating) }}/5</div>
          <p class="review-comment">{{ singleReview.comment }}</p>
        </div>
        <button class="close-btn" @click="closeSingleReviewModal">Закрыть</button>
      </div>
    </div>

    <!-- REVIEW FORM MODAL -->
    <div v-if="showReviewForm" class="reviews-modal-overlay" @click.self="closeReviewForm">
      <div class="review-form-modal">
        <div class="review-form-header">
          <h2>Написать отзыв</h2>
          <button class="close-btn" @click="closeReviewForm">
            <Icon icon="lucide:x" width="20" />
          </button>
        </div>
        
        <div class="review-form-content">
          <!-- Rating Section -->
          <div class="rating-section">
            <label class="form-label">Ваша оценка</label>
            <div class="rating-input">
              <div class="rating-stars">
                <button
                  v-for="star in 5"
                  :key="star"
                  class="star-btn"
                  :class="{ active: newReview.rating >= star }"
                  @click="newReview.rating = star"
                  :title="`${star}/5 звезд`"
                >
                  <Icon 
                    :icon="newReview.rating >= star ? 'lucide:star' : 'lucide:star'" 
                    width="24" 
                    :class="{ filled: newReview.rating >= star }"
                  />
                </button>
              </div>
              <div class="rating-value">{{ newReview.rating || '0' }}/5</div>
            </div>
          </div>

          <!-- Comment Section -->
          <div class="comment-section">
            <label class="form-label">Ваш отзыв</label>
            <textarea
              v-model="newReview.comment"
              class="comment-input"
              placeholder="Расскажите о вашем опыте..."
              rows="4"
            ></textarea>
          </div>

          <!-- Media Upload Section -->
          <div class="media-section">
            <label class="form-label">Добавить фото/видео</label>
            <div class="media-upload">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                @change="handleFileUpload"
                class="file-input"
                id="media-upload"
              />
              <label for="media-upload" class="upload-btn">
                <Icon icon="lucide:plus" width="24" />
                <span>Выбрать файлы</span>
              </label>
            </div>
            
            <!-- Media Preview -->
            <div v-if="newReview.media.length > 0" class="media-preview">
              <div
                v-for="(file, index) in newReview.media"
                :key="index"
                class="media-item"
              >
                <img
                  v-if="file.type.startsWith('image/')"
                  :src="mediaUrls[index]"
                  :alt="file.name"
                  class="media-thumbnail"
                />
                <video
                  v-else-if="file.type.startsWith('video/')"
                  :src="mediaUrls[index]"
                  class="media-thumbnail"
                  muted
                />
                <button
                  @click="removeMedia(index)"
                  class="remove-media-btn"
                  :title="`Удалить ${file.name}`"
                >
                  <Icon icon="lucide:x" width="16" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="review-form-footer">
          <button class="cancel-btn" @click="closeReviewForm">Отмена</button>
          <button class="submit-btn" @click="submitReview">Отправить</button>
        </div>
      </div>
    </div>

    <!-- RECOMMENDED SECTION -->
    <div class="recommended-section" v-if="recommended.length">
      <h2>Рекомендуемые события</h2>
      <div class="recommended-carousel" ref="recRef">
        <div class="recommended-card" v-for="place in recommended" :key="place.id" @click="goToEvent(place.id)">
          <img :src="place.image || '/default.jpg'" class="rec-img" />
          <div class="rec-body">
            <div class="rec-title">{{ place.name }}</div>
            <div class="rec-meta">
              <span class="chip subtle">⭐ {{ formatRating(place.rating) }}</span>
              <span v-if="place.city" class="chip subtle">{{ place.city }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="event-not-found">
    <p>Событие не найдено.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { allAttractions } from '../Data'
import { Icon } from '@iconify/vue'

const route = useRoute()
const router = useRouter()

// Handle both route types: /event/:id and /city/:cityName/event/:eventId
const eventId = Number(route.params.eventId || route.params.id)

const event = allAttractions.value.find((e) => e.id === eventId)
// Gallery images: use main image plus a couple of fallbacks if available
const galleryImages = computed<string[]>(() => {
  const images: string[] = []
  if (event?.image) images.push(event.image)
  // Extend here if you later add event.gallery: images.push(...event.gallery)
  // Add a couple of contextual defaults to avoid single-image feel
  if (images.length < 2) images.push('/kld.jpeg')
  if (images.length < 3) images.push('/kld2.jpeg')
  return images
})

// Simple touch slider
const sliderRef = ref<HTMLElement | null>(null)
const currentSlide = ref<number>(0)
const slideStyle = computed(() => ({ transform: `translateX(-${currentSlide.value * 100}%)` }))
function goToSlide(i: number) { 
  currentSlide.value = Math.max(0, Math.min(i, galleryImages.value.length - 1)) 
  pauseAutoRotation()
}

// Auto-rotation with infinite loop
let autoRotateInterval: number | null = null

function startAutoRotation() {
  if (galleryImages.value.length <= 1) return
  
  autoRotateInterval = window.setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % galleryImages.value.length
  }, 3000)
}

function stopAutoRotation() {
  if (autoRotateInterval) {
    clearInterval(autoRotateInterval)
    autoRotateInterval = null
  }
}

// Pause auto-rotation on user interaction
function pauseAutoRotation() {
  stopAutoRotation()
  // Resume after 5 seconds of inactivity
  setTimeout(startAutoRotation, 5000)
}
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchEndX = ref(0)
const touchEndY = ref(0)
function onTouchStart(e: TouchEvent) {
  const t = e.touches[0]
  touchStartX.value = t.clientX
  touchStartY.value = t.clientY
  pauseAutoRotation()
}
function onTouchMove(e: TouchEvent) {
  const t = e.touches[0]
  touchEndX.value = t.clientX
  touchEndY.value = t.clientY
}
function onTouchEnd() {
  const dx = touchEndX.value - touchStartX.value
  const dy = touchEndY.value - touchStartY.value
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
    if (dx < 0) {
      currentSlide.value = (currentSlide.value + 1) % galleryImages.value.length
    } else {
      currentSlide.value = currentSlide.value === 0 ? galleryImages.value.length - 1 : currentSlide.value - 1
    }
  }
}

const showMapDialog = ref(false)
const showReviewsModal = ref(false)
const singleReviewModal = ref(false)
const singleReview = ref<any>(null)

const reviews = ref(event?.reviews || [])

const limitedReviews = computed(() => reviews.value.slice(0, 8))
const extraReviewCount = computed(() =>
  reviews.value.length > 8 ? reviews.value.length - 8 : 0
)

const visibleChips = computed(() => {
  const chips = []
  
  if (event?.price === 0) {
    chips.push({ key: 'price', text: 'Бесплатно', class: 'strong' })
  } else if (event?.price != null) {
    chips.push({ key: 'price', text: `${event.price} ₽`, class: '' })
  }
  
  if (event?.categories && event.categories.length) {
    chips.push({ key: 'category', text: event.categories[0], class: 'subtle' })
  }
  
  if (event?.city) {
    chips.push({ key: 'city', text: event.city, class: 'subtle' })
  }
  
  if (event?.checkedIn) {
    chips.push({ 
      key: 'checkedIn', 
      text: event.checkedIn, 
      class: 'subtle',
      icon: 'lucide:users'
    })
  }
  
  if (event?.rating) {
    chips.push({ 
      key: 'rating', 
      text: `⭐ ${formatRating(event.rating)}/5`, 
      class: 'subtle',
      subText: reviews.value.length ? `(${reviews.value.length})` : undefined
    })
  }
  
  return chips
})

function openMapOptions() {
  showMapDialog.value = true
}

function openMap(provider: string) {
  showMapDialog.value = false
  const query = encodeURIComponent(event?.location || '')
  const url = provider === 'google'
    ? `https://www.google.com/maps/search/?api=1&query=${query}`
    : provider === 'yandex'
    ? `https://yandex.ru/maps/?text=${query}`
    : `https://2gis.ru/search/${query}`
  window.open(url, '_blank')
}

function formatDateTimeRu(dateStr?: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const day = date.getDate()
  const month = new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(date)
  const time = date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  return `${day} ${month} ${time}`
}

function goBack() {
  router.back()
}

function joinEvent() {
  alert('Вы записались на мероприятие!')
}

function openReviewsModal() {
  showReviewsModal.value = true
}
function closeReviewsModal() {
  showReviewsModal.value = false
}

function openSingleReviewModal(review: any) {
  singleReview.value = review
  singleReviewModal.value = true
}
function closeSingleReviewModal() {
  singleReviewModal.value = false
}

const showReviewForm = ref(false)
const newReview = ref({
  rating: 0,
  comment: '',
  media: [] as File[]
})

const mediaUrls = computed(() => 
  newReview.value.media.map(file => URL.createObjectURL(file))
)

function writeReview() {
  showReviewForm.value = true
}

function closeReviewForm() {
  showReviewForm.value = false
  // Reset form
  newReview.value = {
    rating: 0,
    comment: '',
    media: []
  }
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const files = Array.from(target.files)
    newReview.value.media.push(...files)
  }
}

function removeMedia(index: number) {
  newReview.value.media.splice(index, 1)
}

function submitReview() {
  if (newReview.value.rating === 0) {
    alert('Пожалуйста, поставьте оценку')
    return
  }
  
  if (!newReview.value.comment.trim()) {
    alert('Пожалуйста, напишите отзыв')
    return
  }
  
  // Create new review
  const review = {
    user: 'Пользователь', // In real app, get from auth
    rating: newReview.value.rating,
    comment: newReview.value.comment,
    date: new Date().toISOString(),
    level: 'beginner' as const, // In real app, calculate based on activity
    media: newReview.value.media.map(file => URL.createObjectURL(file))
  }
  
  reviews.value.unshift(review)
  closeReviewForm()
  alert('Отзыв добавлен!')
}

const isFav = ref<boolean>(false)
function toggleFavorite() {
  isFav.value = !isFav.value
}

// Lifecycle hooks for auto-rotation
onMounted(() => {
  startAutoRotation()
})

onUnmounted(() => {
  stopAutoRotation()
})
async function shareEvent() {
  try {
    if ((navigator as any).share) {
      await (navigator as any).share({ title: event?.name, text: event?.description, url: location.href })
    } else {
      await navigator.clipboard.writeText(location.href)
      alert('Ссылка скопирована')
    }
  } catch (_) {}
}

// TEMP MOCK REVIEWS
if (event && (!event.reviews || event.reviews.length < 8)) {
  reviews.value = [
    {
      user: 'Аня',
      rating: 5,
      comment: 'Очень понравилось!',
      date: '2025-07-20T14:00:00',
      level: 'legend',
    },
    {
      user: 'Игорь',
      rating: 4,
      comment: 'Было интересно, но жарко.',
      date: '2025-07-18T11:30:00',
      level: 'beginner',
    },
    {
      user: 'Вика',
      rating: 5,
      comment: 'Потрясающая атмосфера!',
      date: '2025-07-21T10:00:00',
      level: 'moderate',
    },
    {
      user: 'Сергей',
      rating: 3,
      comment: 'Могло быть лучше.',
      date: '2025-07-15T12:00:00',
      level: 'beginner',
    },
    {
      user: 'Олег',
      rating: 5,
      comment: 'Лучшее мероприятие за последнее время!',
      date: '2025-07-10T17:45:00',
      level: 'legend',
    },
    {
      user: 'Лена',
      rating: 4,
      comment: 'Все понравилось!',
      date: '2025-07-22T13:30:00',
      level: 'moderate',
    },
    {
      user: 'Кирилл',
      rating: 5,
      comment: 'Рекомендую всем!',
      date: '2025-07-25T15:20:00',
      level: 'legend',
    },
    {
      user: 'Женя',
      rating: 4,
      comment: 'Хорошая организация.',
      date: '2025-07-26T14:00:00',
      level: 'beginner',
    },
    {
      user: 'Таня',
      rating: 5,
      comment: 'Обязательно пойду снова!',
      date: '2025-07-28T11:10:00',
      level: 'legend',
    },
  ]
}

function getMedalIcon(level: string): string {
  return level === 'legend'
    ? 'twemoji:1st-place-medal'
    : level === 'moderate'
    ? 'twemoji:2nd-place-medal'
    : 'twemoji:3rd-place-medal'
}

function getLevelTitle(level: string) {
  return level === 'legend'
    ? 'Золотой пользователь'
    : level === 'moderate'
    ? 'Серебряный пользователь'
    : 'Бронзовый пользователь'
}

const recommended = computed(() => {
  if (!event?.categories || !event.categories.length) return []
  return allAttractions.value
    .filter((e) => e.categories && e.categories.includes(event.categories[0]) && e.id !== event.id)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5)
})

function goToEvent(id: number) {
  router.push({ name: 'event-detail', params: { id } })
}

function formatRating(r?: number) {
  if (typeof r !== 'number') return '—'
  return Math.round(r * 10) / 10
}
</script>

<style scoped>

.review-medal {
  display: inline-flex;
  align-items: center;
}

.event-detail-page {
  font-family: sans-serif;
  padding-top: 4.3rem;
  background: #f9f9f9;
  min-height: 100vh;
}

.event-detail-page .hero,
.event-card,
.recommended-section,
.action-bar { max-width: 480px; margin-left: auto; margin-right: auto; }

/* Hero slider */
.hero { position: relative; }
.hero-slider { position: relative; overflow: hidden; }
.slides { display: flex; width: 100%; transition: transform .3s ease; }
.slide { min-width: 100%; }
.hero-image { width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block; }
.dots { position: absolute; bottom: 8px; left: 0; right: 0; display: flex; justify-content: center; gap: 6px; z-index: 2; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.6); }
.dot.active { background: #fff; transform: scale(1.1); }
.hero-overlay { 
  position: absolute; 
  inset: 0; 
  background: linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.0) 40%, rgba(0,0,0,0.6) 100%); 
  pointer-events: none; 
}

.hero-top { 
  position: absolute; 
  top: 12px; 
  left: 12px; 
  right: 12px; 
  display: flex; 
  justify-content: space-between; 
  z-index: 3; 
}

.hero-right { 
  display: flex; 
  gap: 8px; 
}

.icon-btn { 
  background: rgba(0,0,0,0.45); 
  color: #fff; 
  border: none; 
  border-radius: 10px; 
  width: 36px; 
  height: 36px; 
  display: inline-flex; 
  align-items: center; 
  justify-content: center; 
  backdrop-filter: blur(8px);
}

.hero-bottom { 
  position: absolute; 
  left: 12px; 
  right: 12px; 
  top: 60px; 
  z-index: 3; 
  color: #fff; 
  padding-bottom: 8px;
}

.hero-title { 
  margin: 0 0 8px; 
  font-size: clamp(1.2rem, 4.8vw, 1.6rem); 
  font-weight: 800; 
  text-shadow: 0 2px 4px rgba(0,0,0,0.7); 
  line-height: 1.2;
}

.hero-sub { 
  display: flex; 
  gap: 4px; 
  flex-wrap: wrap; 
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
}

.hero-sub .chip {
  flex-shrink: 0;
  min-width: 0;
  max-width: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin: 1rem;
  padding: 1.2rem;
}

.section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f5f9;
}

.section:first-child {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.section-title {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 1.1rem;
  background: #3b82f6;
  border-radius: 2px;
}

.section-content {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
}

/* Chips */
.chips-row { 
  display: flex; 
  gap: 4px; 
  flex-wrap: wrap; 
  margin: 0;
  align-items: flex-start;
  justify-content: flex-start;
}

.chip { 
  display: inline-flex; 
  align-items: center; 
  gap: 4px; 
  padding: 6px 10px; 
  border-radius: 999px; 
  background: #ffffff; 
  color: #374151; 
  border: 1px solid #e5e7eb; 
  font-size: 0.84rem; 
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  flex-shrink: 0;
  min-width: fit-content;
}

.chip:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.chip.subtle { 
  background: #f3f4f6; 
  color: #6b7280; 
  border-color: #d1d5db;
}

.chip.strong { 
  background: #dcfce7; 
  color: #14532d; 
  font-weight: 700; 
  border-color: #bbf7d0;
}

.chip.link { 
  background: #eff6ff; 
  color: #1e40af; 
  border-color: #bfdbfe; 
}

/* Hero section chips (different styling for overlay) */
.hero .chip {
  background: rgba(255, 255, 255, 0.75);
  color: #1f2937;
  border: 1px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
  font-weight: 600;
  font-size: 0.8rem;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 4px 8px;
  gap: 3px;
}

.hero .chip:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.hero .chip.link {
  background: rgba(59, 130, 246, 0.75);
  color: white;
  border-color: rgba(59, 130, 246, 0.4);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.hero .chip.link:hover {
  background: rgba(59, 130, 246, 0.9);
  border-color: rgba(59, 130, 246, 0.6);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
.chip .muted { 
  opacity: 0.75; 
  margin-left: 4px; 
  color: #6b7280;
}

/* Responsive chip layout */
@media (max-width: 480px) {
  .chips-row {
    gap: 3px;
  }
  
  .chip {
    padding: 5px 8px;
    font-size: 0.8rem;
    gap: 3px;
  }
  
  .chip .muted {
    margin-left: 2px;
  }
  
  /* Hero chips responsive */
  .hero-sub {
    gap: 3px;
  }
  
  .hero .chip {
    padding: 3px 6px;
    font-size: 0.75rem;
    gap: 2px;
  }
}

.event-title {
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 0.4rem;
}

.event-host {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
}

.event-meta p {
  margin: 0.3rem 0;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.map-link {
  cursor: pointer;
  color: #3b82f6;
  text-decoration: underline;
}

.attendees-label {
  margin: 0 0 0.75rem 0;
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.avatar-interactive {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  object-fit: cover;
  border: 2px solid #3b82f6;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.avatar-interactive:hover {
  transform: scale(1.1);
}

.more-avatar-interactive {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: #3b82f6;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.more-avatar-interactive:hover {
  transform: scale(1.05);
}

.avatar-scroll-wrapper {
  width: 100%;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  margin-top: 0.4rem;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  flex-shrink: 0;
}

.avatar-list {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.6rem;
  padding-bottom: 0.2rem;
  min-width: max-content;
}


.section-content p {
  margin: 0;
  color: #374151;
  font-size: 0.95rem;
  line-height: 1.6;
}

.event-links {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.event-links a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.event-actions {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  gap: 1rem;
  margin-top: -0.5rem;
}

/* Inline map preview */
.inline-map-card { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  padding: 10px; 
  border-radius: 12px; 
  background: #f8fafc; 
  border: 1px solid #e5e7eb; 
  cursor: pointer; 
  transition: all 0.2s ease;
}

.inline-map-card:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.inline-map-thumb { width: 42px; height: 42px; border-radius: 10px; background: #e0f2fe; color: #075985; display: inline-flex; align-items: center; justify-content: center; }
.inline-map-info { flex: 1; }
.inline-map-title { font-weight: 700; margin: 0; }
.inline-map-sub { color: #555; font-size: 0.9rem; }
.inline-map-open { color: #2563eb; font-weight: 700; }

.back-btn,.join-btn {
  background: rgba(225, 245, 254, 255);
  color: black;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 0.5rem;
  white-space: nowrap;
  cursor: pointer;
  font-weight: 650;
  transition: background 0.2s ease;
}

.back-btn.active,.join-btn.active {
  background: #c7d2fe;
  color: black;
  font-weight: bold;
}

.map-dialog {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 20;
}

.map-dialog-box {
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  text-align: center;
  width: 90%;
  max-width: 340px;
}

.map-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.map-dialog-footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.5rem;
}

.map-dialog-footer .cancel,
.map-dialog-footer .join {
  flex: 1;
  padding: 0.75rem 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 10px;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.map-dialog-footer .cancel {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.map-dialog-footer .cancel:hover {
  background: #f1f5f9;
  color: #475569;
  border-color: #cbd5e1;
}

.map-dialog-footer .join {
  background: #3b82f6;
  color: white;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3);
}

.map-dialog-footer .join:hover {
  background: #2563eb;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
}

/* Reviews CTA */
.reviews-cta { 
  display: flex; 
  gap: 0.75rem; 
  margin-top: 1rem; 
  justify-content: center;
}

.review-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  color: #64748b;
}

.review-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #374151;
  transform: translateY(-1px);
}

.review-count {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

/* Recommended carousel */
.recommended-section { margin: 2rem 1rem; }
.recommended-section h2 { font-size: 1.2rem; margin-bottom: 0.8rem; }
.recommended-carousel { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; -webkit-overflow-scrolling: touch; scroll-behavior: smooth; scroll-snap-type: x mandatory; }
.recommended-carousel::-webkit-scrollbar { display: none; }
.recommended-card { flex: 0 0 72%; background: #fff; border: 1px solid #eee; border-radius: 12px; box-shadow: 0 1px 6px rgba(0,0,0,0.05); overflow: hidden; scroll-snap-align: start; }
.rec-img { width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block; }
.rec-body { padding: 8px 10px; }
.rec-title { font-weight: 700; font-size: 0.98rem; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rec-meta { display: flex; gap: 6px; align-items: center; }

/* Sticky action bar */
.action-bar { 
  position: sticky; 
  bottom: 0; 
  left: 0; 
  right: 0; 
  display: flex; 
  gap: 0.7rem; 
  padding: 0.5rem; 
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom)); 
  background: rgba(255,255,255,0.95); 
  backdrop-filter: saturate(120%) blur(12px); 
  border-top: 1px solid #e5e7eb; 
  z-index: 10; 
}

.action-bar .primary { 
  flex: 1; 
  background: #3b82f6; 
  color: #fff; 
  border: none; 
  border-radius: 12px; 
  padding: 0.1rem 0.1rem; 
  font-weight: 600; 
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
}

.action-bar .primary:hover {
  background: #2563eb;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
  transform: translateY(-1px);
}

.action-bar .secondary { 
  flex: 1; 
  background: #f8fafc; 
  color: #475569; 
  border: 1px solid #e2e8f0; 
  border-radius: 12px; 
  padding: 0.5rem 0.1rem; 
  font-weight: 600; 
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
}

.action-bar .secondary:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #374151;
  transform: translateY(-1px);
}

/* Focus visibility for a11y */
.icon-btn:focus-visible,
.chip:focus-visible,
.action-bar button:focus-visible,
.map-dialog-footer button:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }

.reviews-trigger button {
  background: transparent;
  color: #3b82f6;
  border: none;
  font-weight: 600;
  font-size: 1rem;
  padding: 0.8rem 0;
  cursor: pointer;
  width: 100%;
}

.reviews-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 30;
}

.reviews-modal {
  background: white;
  width: 100%;
  max-height: 70vh;
  overflow-y: auto;
  border-radius: 20px 20px 0 0;
  padding: 1rem;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.review-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #555;
}


.review-rating {
  margin-top: 0.3rem;
  font-size: 1rem;
  color: #f59e0b;
}

.review-comment {
  margin-top: 0.5rem;
  font-size: 0.95rem;
  line-height: 1.4;
}

.review-user {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.close-btn {
  margin-top: 1rem;
  width: 100%;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

/* Review Form Modal */
.review-form-modal {
  background: white;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 20px;
  animation: slideUp 0.3s ease-out;
}

.review-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.review-form-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.review-form-header .close-btn {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
  margin: 0;
  padding: 0;
}

.review-form-header .close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.review-form-content {
  padding: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

/* Rating Section */
.rating-section {
  margin-bottom: 1.5rem;
}

.rating-input {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.star-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  color: #d1d5db;
}

.star-btn:hover {
  background: #f3f4f6;
  color: #f59e0b;
}

.star-btn.active {
  color: #f59e0b;
}

.star-btn .filled {
  fill: #f59e0b;
}

.rating-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #f59e0b;
  min-width: 50px;
  text-align: center;
}

/* Comment Section */
.comment-section {
  margin-bottom: 1.5rem;
}

.comment-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  line-height: 1.5;
  resize: vertical;
  font-family: inherit;
}

.comment-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Media Section */
.media-section {
  margin-bottom: 1.5rem;
}

.media-upload {
  position: relative;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
  font-weight: 500;
}

.upload-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #f8fafc;
}

.media-preview {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.media-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}

.media-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-media-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.7rem;
}

/* Form Footer */
.review-form-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #f1f5f9;
  background: #fafafa;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  padding: 0.875rem 1.25rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.cancel-btn:hover {
  background: #f1f5f9;
  color: #475569;
  border-color: #cbd5e1;
}

.submit-btn {
  background: #3b82f6;
  color: white;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3);
}

.submit-btn:hover {
  background: #2563eb;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
}

.recommended-section {
  margin: 2rem 1rem;
}
.recommended-section h2 {
  font-size: 1.2rem;
  margin-bottom: 0.8rem;
}
.recommended-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}
.recommended-item {
  display: flex;
  gap: 0.8rem;
  background: white;
  padding: 0.8rem;
  border-radius: 12px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: background 0.2s ease;
}
.recommended-item:hover {
  background: #f0f9ff;
}
.recommended-img {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}
.recommended-info h3 {
  margin: 0;
  font-size: 1rem;
}
.recommended-info p {
  margin: 0.2rem 0 0;
  font-size: 0.85rem;
  color: #888;
}

</style>