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
        </div>

    <div class="event-info">
      <h1 class="event-title">{{ event.name }}</h1>
      <div class="event-meta">
        <div class="meta-info">
          <span v-if="event.date" class="meta-chip">
            <Icon icon="lucide:clock" width="16" /> {{ formatDateTimeRu(event.date) }}
          </span>
          <button class="action-icon-btn" aria-label="Поделиться" @click="shareEvent">
            <Icon icon="lucide:share-2" width="20" />
          </button>
          <button class="action-icon-btn" :aria-pressed="isFav" aria-label="В избранное" @click="toggleFavorite">
            <Icon :icon="isFav ? 'mdi:heart' : 'mdi:heart-outline'" width="22" />
          </button>

          <button v-if="event.location" class="meta-chip link" @click="openMapOptions">
            <Icon icon="lucide:map-pin" width="16" /> {{ event.location }}
          </button>
        </div>
      </div>
    </div>

    <div class="event-card">
      <div class="section description-section">
        <h3 class="section-title">Описание</h3>
        <div class="section-content">
          <p>{{ event.description || 'Описание мероприятия пока не добавлено.' }}</p>
        </div>
      </div>

      <div v-if="event.categories && event.categories.length" class="section categories-section">
        <h3 class="section-title">Категории</h3>
        <div class="section-content">
          <div class="event-categories">
            <span v-for="category in event.categories" :key="category" class="category-chip">
              {{ category }}
        </span>
          </div>
        </div>
      </div>

      <div class="section facilities-section" :class="{ 'facilities-open': showFacilities }">
        <div class="facilities-header" @click="toggleFacilities">
          <h3 class="section-title">Удобства</h3>
          <Icon :icon="showFacilities ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="toggle-icon" />
        </div>
        <div class="section-content facilities-content" :class="{ 'facilities-open': showFacilities, 'facilities-closed': !showFacilities }">
          <div class="facilities-grid">
            <div class="facilities-category" v-if="hasEssentialServices">
              <h4 class="category-title">Основные услуги</h4>
              <div class="category-facilities">
                <div v-if="event['Время работы']" class="facility-item enhanced" :title="`Время работы: ${event['Время работы']}`">
                  <div class="facility-icon-wrapper">
                    <Icon icon="mdi:clock-time-four-outline" class="facility-icon" />
                  </div>
                  <div class="facility-info">
                    <span class="facility-label">Время работы</span>
                    <span class="facility-value">{{ event['Время работы'] }}</span>
                    <span class="facility-status" v-if="isOpenNow">Сейчас открыто</span>
                  </div>
                </div>

                <div v-if="event['Парковка']" class="facility-item enhanced" :title="`Парковка: ${getParkingType(event).type === 'private' ? 'Частная' : getParkingType(event).type === 'public' ? 'Общественная' : 'При заведении'}`">
                  <div class="facility-icon-wrapper">
                    <Icon icon="mdi:car" class="facility-icon" />
                  </div>
                  <div class="facility-info">
                    <span class="facility-label">Парковка</span>
                    <span class="facility-value">{{ getParkingType(event).type === 'private' ? 'Частная' : getParkingType(event).type === 'public' ? 'Общественная' : 'При заведении' }}</span>
                  </div>
                </div>

                <div v-if="event['Оплата']" class="facility-item enhanced payment-enhanced" title="Способы оплаты">
                  <div class="payment-icons">
                    <div class="payment-method" v-if="event['Оплата'].includes('наличные')">
                      <Icon icon="mdi:cash" class="payment-icon" />
                      <span class="payment-label">Наличные</span>
                    </div>
                    <div class="payment-method" v-if="event['Оплата'].includes('карта')">
                      <Icon icon="mdi:credit-card" class="payment-icon" />
                      <span class="payment-label">Карта</span>
                    </div>
                    <div class="payment-method" v-if="event['Оплата'].includes('бесконтактная')">
                      <Icon icon="mdi:nfc-tap" class="payment-icon" />
                      <span class="payment-label">Бесконтактная</span>
                    </div>
                  </div>
                  <div class="facility-info">
                    <span class="facility-label">Оплата</span>
                    <span class="facility-value">{{ event['Оплата'] }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="event['Кухня'] || (event['Средний чек'] && event.price)" class="facilities-category">
              <h4 class="category-title">Ресторан</h4>
              <div class="category-facilities">
                <div v-if="event['Средний чек'] && event.price" class="facility-item enhanced price-enhanced" :title="`Средний чек: ${event.price}₽`">
                  <div class="facility-icon-wrapper">
                    <Icon icon="mdi:currency-rub" class="facility-icon" />
                  </div>
                  <div class="facility-info">
                    <span class="facility-label">Средний чек</span>
                    <span class="facility-value price-value">{{ event.price }}₽</span>
                  </div>
                </div>

                <div v-if="event['Кухня'] && event['Кухня'].length > 0" class="facility-item enhanced cuisine-enhanced" :title="`Кухня: ${event['Кухня'][0]}`">
                  <div class="facility-icon-wrapper">
                    <span class="cuisine-icon-large">{{ getCuisineFlag(event['Кухня'][0]) }}</span>
                  </div>
                  <div class="facility-info">
                    <span class="facility-label">Кухня</span>
                    <span class="facility-value">{{ event['Кухня'][0] }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="event['Семейные'] || event['Доступность'] || event['Wi-Fi']" class="facilities-category">
              <h4 class="category-title">Дополнительные услуги</h4>
              <div class="category-facilities">
                <div v-if="event['Семейные']" class="facility-item enhanced" title="Подходит для семьи">
                  <div class="facility-icon-wrapper">
                    <Icon icon="mdi:account-group" class="facility-icon" />
                  </div>
                  <div class="facility-info">
                    <span class="facility-label">Для семьи</span>
                    <span class="facility-value">Да</span>
                  </div>
                </div>

                <div v-if="event['Доступность']" class="facility-item enhanced" title="Доступно для людей с ограниченными возможностями">
                  <div class="facility-icon-wrapper">
                    <Icon icon="mdi:wheelchair-accessibility" class="facility-icon" />
                  </div>
                  <div class="facility-info">
                    <span class="facility-label">Доступность</span>
                    <span class="facility-value">Да</span>
                  </div>
                </div>

                <div v-if="event['Wi-Fi']" class="facility-item enhanced" title="Есть Wi-Fi">
                  <div class="facility-icon-wrapper">
                    <Icon icon="mdi:wifi" class="facility-icon" />
                  </div>
                  <div class="facility-info">
                    <span class="facility-label">Wi-Fi</span>
                    <span class="facility-value">Есть</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div class="section reviews-section">
        <h3 class="section-title">Отзывы</h3>
        <div class="section-content">
          <div v-if="reviews.length > 0">
            <p class="reviews-label">Отзывы:</p>
        <div class="avatar-scroll-wrapper">
          <div class="avatar-list">
            <img
              v-for="(review, index) in limitedReviews"
                  :key="review.id || index"
              :src="`https://i.pravatar.cc/80?img=${index + 1}`"
              class="avatar-interactive"
              :alt="`User ${review.user}`"
              @click="openSingleReviewModal(review)"
            />
            <div
              v-if="extraReviewCount > 0"
              class="more-avatar-interactive"
              @click="openReviewsModal"
                  :title="`Показать еще ${extraReviewCount} отзывов`"
            >
              +{{ extraReviewCount }}
            </div>
          </div>
        </div>
          </div>
          
          <div v-else class="reviews-empty">
            <Icon icon="mdi:comment-outline" class="empty-icon" />
            <p class="empty-text">Пока нет отзывов</p>
            <p class="empty-subtext">Станьте первым, кто оставит отзыв об этом месте</p>
          </div>
          
        <div class="reviews-cta">
            <button 
              v-if="reviews.length > 0"
              class="review-btn" 
              @click="openReviewsModal" 
              :title="`Показать все ${reviews.length} отзывов`"
            >
              <Icon icon="lucide:message-square" width="18" />
              <span class="review-count">{{ reviews.length }}</span>
          </button>
            <button class="review-btn" @click="writeReview" title="Написать отзыв">
              <Icon icon="lucide:pencil" width="18" />
          </button>
        </div>
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

    <div v-if="showMapDialog" class="map-dialog">
      <div class="map-dialog-box">
        <div class="map-dialog-content">
          <p>Открыть в:</p>
          <button @click="openMap('google')">
            <Icon icon="logos:google-maps" width="20" /> Google Maps
          </button>
          <button @click="openMap('yandex')">
            <Icon icon="logos:yandex-icon" width="20" /> Yandex Maps
          </button>
          <button @click="openMap('2gis')">
            <Icon icon="logos:2gis" width="20" /> 2GIS
          </button>
        </div>
        <div class="map-dialog-footer">
          <button class="cancel" @click="showMapDialog = false">
            <span>Назад</span>
          </button>
        </div>
      </div>
    </div>
    <div v-if="showReviewsModal" class="reviews-modal-overlay" @click.self="closeReviewsModal">
      <div class="reviews-modal">
        <h2>Отзывы</h2>
        <div class="review-item" v-for="(review, index) in reviews" :key="review.id || index">
          <div class="review-header">
            <div class="review-user">
              <strong>{{ review.user }}</strong>
              <span class="review-medal" :title="getLevelTitle(review.level)">
                <Icon :icon="getMedalIcon(review.level)" width="18" />
              </span>
            </div>
            <span class="review-date">{{ formatDateTimeRu(review.date) }}</span>
          </div>
          <div class="review-rating"><Icon icon="lucide:star" /> {{ formatRating(review.rating) }}/5</div>
          <p class="review-comment">{{ review.comment }}</p>
          
          <div v-if="review.media && review.media.length > 0" class="review-media">
            <div
              v-for="(media, mediaIndex) in review.media"
              :key="media.id || mediaIndex"
              class="media-item"
            >
              <img
                v-if="media.type && media.type.startsWith('image/')"
                :src="media.url"
                :alt="media.name"
                class="media-image"
                @click="openMediaModal(media)"
              />
              <video
                v-else-if="media.type && media.type.startsWith('video/')"
                :src="media.url"
                class="media-video"
                controls
                preload="metadata"
              />
              <div v-else class="media-file">
                <Icon icon="mdi:file" class="file-icon" />
                <span class="file-name">{{ media.name }}</span>
              </div>
            </div>
          </div>
        </div>
        <button class="close-btn" @click="closeReviewsModal">Закрыть</button>
      </div>
    </div>

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
          <div class="review-rating"><Icon icon="lucide:star" /> {{ formatRating(singleReview.rating) }}/5</div>
          <p class="review-comment">{{ singleReview.comment }}</p>
          
          <div v-if="singleReview.media && singleReview.media.length > 0" class="review-media">
            <div
              v-for="(media, mediaIndex) in singleReview.media"
              :key="media.id || mediaIndex"
              class="media-item"
            >
              <img
                v-if="media.type && media.type.startsWith('image/')"
                :src="media.url"
                :alt="media.name"
                class="media-image"
                @click="openMediaModal(media)"
              />
              <video
                v-else-if="media.type && media.type.startsWith('video/')"
                :src="media.url"
                class="media-video"
                controls
                preload="metadata"
              />
              <div v-else class="media-file">
                <Icon icon="mdi:file" class="file-icon" />
                <span class="file-name">{{ media.name }}</span>
              </div>
            </div>
          </div>
        </div>
        <button class="close-btn" @click="closeSingleReviewModal">Закрыть</button>
      </div>
    </div>

    <div v-if="showReviewForm" class="reviews-modal-overlay" @click.self="closeReviewForm">
      <div class="review-form-modal">
        <div class="review-form-header">
          <h2>Написать отзыв</h2>
          <button class="close-btn" @click="closeReviewForm">
            <Icon icon="lucide:x" width="20" />
          </button>
        </div>
        
        <div class="review-form-content">
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

          <div class="comment-section">
            <label class="form-label">Ваш отзыв</label>
            <textarea
              v-model="newReview.comment"
              class="comment-input"
              placeholder="Расскажите о вашем опыте..."
              rows="4"
            ></textarea>
          </div>

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

    <button class="back-floating-btn" @click="goBack">
      ← Назад
    </button>
  </div>

  <div v-else class="event-not-found">
    <p>Событие не найдено.</p>
    <button class="back-floating-btn" @click="goBack">
      ← Назад
    </button>
  </div>

  <div v-if="showMediaModal" class="media-modal-overlay">
    <div class="media-modal-content">
      <img
        v-if="selectedMedia?.type && selectedMedia.type.startsWith('image/')"
        :src="selectedMedia.url"
        :alt="selectedMedia.name"
        class="modal-media-image"
        :style="{
          transform: `scale(${imageZoom}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
          cursor: imageZoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
        }"
        @wheel="handleWheel"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @dragstart.prevent
      />
      <video
        v-else-if="selectedMedia?.type && selectedMedia.type.startsWith('video/')"
        :src="selectedMedia.url"
        class="modal-media-video"
        controls
        autoplay
      />
      <div v-else class="modal-media-file">
        <Icon icon="mdi:file" class="modal-file-icon" />
        <p>{{ selectedMedia?.name }}</p>
      </div>
    </div>
    <button class="back-button modal-back-btn" @click="closeMediaModal">
      <Icon icon="lucide:arrow-left" width="20" />
      <span>Назад</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { allAttractions, getSampleReviewsForAttraction } from '../Data'
import { Icon } from '@iconify/vue'

const route = useRoute()
const router = useRouter()

const eventId = Number(route.params.eventId || route.params.id)

const event = allAttractions.value.find((e) => e.id === eventId)

// Check if essential services section should be shown
const hasEssentialServices = computed(() => {
  if (!event) return false
  return !!(event['Время работы'] || event['Парковка'] || event['Оплата'])
})

const galleryImages = computed<string[]>(() => {
  const images: string[] = []
  if (event?.image) images.push(event.image)
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

// Enhanced review system with proper attraction correlation
const reviews = ref<any[]>([])
const allReviews = ref<Record<number, any[]>>({}) // attractionId -> reviews

// Load reviews for this specific attraction
const loadAttractionReviews = () => {
  if (event?.id) {
    // Initialize if not exists
    if (!allReviews.value[event.id]) {
      allReviews.value[event.id] = []
    }
    reviews.value = allReviews.value[event.id] || []
  }
}

// Initialize reviews for this attraction
onMounted(() => {
  // Load saved reviews from localStorage
  const savedReviews = localStorage.getItem('attractionReviews')
  if (savedReviews) {
    try {
      allReviews.value = JSON.parse(savedReviews)
    } catch (e) {
      console.error('Failed to parse saved reviews:', e)
    }
  }
  
  // Add sample reviews for testing if none exist
  if (event?.id && (!allReviews.value[event.id] || allReviews.value[event.id].length === 0)) {
    addSampleReviewsForAttraction(event.id)
  }
  
  loadAttractionReviews()
})

// Function to add sample reviews for testing
function addSampleReviewsForAttraction(attractionId: number) {
  const sampleReviews = getSampleReviewsForAttraction(attractionId)
  
  // Add sample reviews to the attraction
  allReviews.value[attractionId] = sampleReviews
  
  // Save to localStorage
  localStorage.setItem('attractionReviews', JSON.stringify(allReviews.value))
}

// Function to clear all sample reviews (for testing)
function clearAllSampleReviews() {
  allReviews.value = {}
  localStorage.removeItem('attractionReviews')
  reviews.value = []
}

// Expose function globally for testing (optional)
if (typeof window !== 'undefined') {
  (window as any).clearAllSampleReviews = clearAllSampleReviews
}

const limitedReviews = computed(() => reviews.value.slice(0, 10))
const extraReviewCount = computed(() =>
  reviews.value.length > 10 ? reviews.value.length - 10 : 0
)





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

// Media modal for viewing images/videos
const showMediaModal = ref(false)
const selectedMedia = ref<any>(null)

// Zoom functionality
const imageZoom = ref(1)
const imagePosition = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const lastTouchDistance = ref(0)

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

// Media modal functions
function openMediaModal(media: any) {
  selectedMedia.value = media
  showMediaModal.value = true
}

function closeMediaModal() {
  showMediaModal.value = false
  selectedMedia.value = null
  // Reset zoom and position
  imageZoom.value = 1
  imagePosition.value = { x: 0, y: 0 }
}

// Zoom functions
function handleWheel(event: WheelEvent) {
  event.preventDefault()
  const delta = event.deltaY > 0 ? 0.9 : 1.1
  const newZoom = Math.max(0.5, Math.min(3, imageZoom.value * delta))
  imageZoom.value = newZoom
}

function handleTouchStart(event: TouchEvent) {
  if (event.touches.length === 2) {
    // Pinch to zoom
    const touch1 = event.touches[0]
    const touch2 = event.touches[1]
    lastTouchDistance.value = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    )
  } else if (event.touches.length === 1) {
    // Single touch - start dragging
    isDragging.value = true
    dragStart.value = { x: event.touches[0].clientX, y: event.touches[0].clientY }
  }
}

function handleTouchMove(event: TouchEvent) {
  event.preventDefault()
  
  if (event.touches.length === 2) {
    // Pinch to zoom
    const touch1 = event.touches[0]
    const touch2 = event.touches[1]
    const currentDistance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    )
    
    if (lastTouchDistance.value > 0) {
      const scale = currentDistance / lastTouchDistance.value
      const newZoom = Math.max(0.5, Math.min(3, imageZoom.value * scale))
      imageZoom.value = newZoom
    }
    lastTouchDistance.value = currentDistance
  } else if (event.touches.length === 1 && isDragging.value && imageZoom.value > 1) {
    // Drag
    const deltaX = event.touches[0].clientX - dragStart.value.x
    const deltaY = event.touches[0].clientY - dragStart.value.y
    imagePosition.value.x += deltaX
    imagePosition.value.y += deltaY
    dragStart.value = { x: event.touches[0].clientX, y: event.touches[0].clientY }
  }
}

function handleTouchEnd() {
  isDragging.value = false
  lastTouchDistance.value = 0
}

// Mouse drag functions
function handleMouseDown(event: MouseEvent) {
  if (imageZoom.value > 1) {
    isDragging.value = true
    dragStart.value = { x: event.clientX, y: event.clientY }
  }
}

function handleMouseMove(event: MouseEvent) {
  if (isDragging.value && imageZoom.value > 1) {
    const deltaX = event.clientX - dragStart.value.x
    const deltaY = event.clientY - dragStart.value.y
    imagePosition.value.x += deltaX
    imagePosition.value.y += deltaY
    dragStart.value = { x: event.clientX, y: event.clientY }
  }
}

function handleMouseUp() {
  isDragging.value = false
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
  
  if (!event?.id) {
    alert('Ошибка: не удалось определить место')
    return
  }
  
  // Create new review with enhanced media support
  const review = {
    id: Date.now(), // Unique ID for the review
    attractionId: event.id, // Link to specific attraction
    user: 'Вы',
    rating: newReview.value.rating,
    comment: newReview.value.comment,
    date: new Date().toISOString(),
    level: 'beginner' as const,
    media: newReview.value.media.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file) // Create object URL for display
    }))
  }
  
  // Add to attraction-specific reviews
  if (!allReviews.value[event.id]) {
    allReviews.value[event.id] = []
  }
  allReviews.value[event.id].unshift(review)
  reviews.value = allReviews.value[event.id]
  
  // Save to localStorage for persistence
  localStorage.setItem('attractionReviews', JSON.stringify(allReviews.value))
  
  closeReviewForm()
  alert('Отзыв добавлен!')
}

const isFav = ref<boolean>(false)
function toggleFavorite() {
  isFav.value = !isFav.value
}

const showFacilities = ref<boolean>(true)
function toggleFacilities() {
  showFacilities.value = !showFacilities.value
}

// Check if venue is currently open
const isOpenNow = computed(() => {
  if (!event?.['Время работы']) return null
  
  const now = new Date()
  const currentTime = now.getHours() * 100 + now.getMinutes()
  
  // Simple time parsing - can be enhanced
  const hours = event['Время работы']
  if (hours.includes('Круглосуточно')) return true
  
  // Parse time ranges like "10:00-18:00" or "09:00-17:00"
  const timeMatch = hours.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/)
  if (timeMatch) {
    const [, startHour, startMin, endHour, endMin] = timeMatch
    const startTime = parseInt(startHour) * 100 + parseInt(startMin)
    const endTime = parseInt(endHour) * 100 + parseInt(endMin)
    return currentTime >= startTime && currentTime <= endTime
  }
  
  return null
})

// Price level function removed - no longer using price level badges
// function getPriceLevelClass(price: number): string {
//   if (price <= 800) return 'budget'
//   if (price <= 1500) return 'affordable'
//   if (price <= 2500) return 'expensive'
//   return 'premium'
// }


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

function getParkingType(event: any): { type: string; badge: string; title: string } {
  // Determine parking type based on event data
  const name = event?.name?.toLowerCase() || '';
  const description = event?.description?.toLowerCase() || '';
  const location = event?.location?.toLowerCase() || '';
  
  // Accommodation - Private hotel parking
  if (name.includes('отель') || name.includes('гостиница') || name.includes('хостел') || name.includes('санаторий') || 
      description.includes('отель') || description.includes('гостиница') || location.includes('отель')) {
    return { type: 'private', badge: '🏨', title: 'Частная парковка отеля' };
  }
  
  // Shopping - Mall/shopping center parking
  if (name.includes('торговый') || name.includes('молл') || name.includes('центр') || name.includes('магазин') || 
      name.includes('супермаркет') || name.includes('рынок') || description.includes('торговый') || 
      description.includes('магазин') || location.includes('торговый')) {
    return { type: 'shopping', badge: '🏪', title: 'Парковка торгового центра' };
  }
  
  // Cultural venues - Museum, theater, cinema parking
  if (name.includes('музей') || name.includes('театр') || name.includes('кино') || name.includes('галерея') || 
      name.includes('выставка') || name.includes('концерт') || name.includes('филармония') || 
      description.includes('музей') || description.includes('театр') || location.includes('музей')) {
    return { type: 'cultural', badge: '🎭', title: 'Парковка при культурном заведении' };
  }
  
  // Food & Dining - Restaurant, cafe, bar parking
  if (name.includes('ресторан') || name.includes('кафе') || name.includes('бар') || name.includes('бистро') || 
      name.includes('столовая') || name.includes('пиццерия') || name.includes('суши') || 
      description.includes('ресторан') || description.includes('кафе') || location.includes('ресторан')) {
    return { type: 'restaurant', badge: '🍽️', title: 'Парковка ресторана' };
  }
  
  // Entertainment - Clubs, bowling, entertainment centers
  if (name.includes('клуб') || name.includes('боулинг') || name.includes('развлечения') || name.includes('игровая') || 
      name.includes('бильярд') || name.includes('караоке') || description.includes('развлечения') || 
      description.includes('клуб') || location.includes('клуб')) {
    return { type: 'entertainment', badge: '🎪', title: 'Парковка развлекательного центра' };
  }
  
  // Sports & Fitness - Gym, sports center, pool
  if (name.includes('спорт') || name.includes('фитнес') || name.includes('бассейн') || name.includes('тренажер') || 
      name.includes('стадион') || name.includes('каток') || description.includes('спорт') || 
      description.includes('фитнес') || location.includes('спорт')) {
    return { type: 'sports', badge: '🏃', title: 'Парковка спортивного центра' };
  }
  
  // Healthcare - Hospital, clinic, spa
  if (name.includes('больница') || name.includes('клиника') || name.includes('поликлиника') || name.includes('спа') || 
      name.includes('салон') || name.includes('красота') || description.includes('медицин') || 
      description.includes('здоровье') || location.includes('больница')) {
    return { type: 'healthcare', badge: '🏥', title: 'Парковка медицинского учреждения' };
  }
  
  // Education - School, university, library
  if (name.includes('школа') || name.includes('университет') || name.includes('институт') || name.includes('библиотека') || 
      name.includes('учебн') || name.includes('образование') || description.includes('образование') || 
      description.includes('учебн') || location.includes('школа')) {
    return { type: 'education', badge: '🎓', title: 'Парковка образовательного учреждения' };
  }
  
  // Parks & Nature - Parks, gardens, nature areas
  if (name.includes('парк') || name.includes('сад') || name.includes('сквер') || name.includes('аллея') || 
      name.includes('природ') || description.includes('парк') || description.includes('сад') || 
      description.includes('природ') || location.includes('парк')) {
    return { type: 'nature', badge: '🌳', title: 'Парковка в парке' };
  }
  
  // Beach & Water - Beaches, coastal areas, water activities
  if (name.includes('пляж') || name.includes('берег') || name.includes('набережная') || name.includes('пристань') || 
      name.includes('яхт') || description.includes('пляж') || description.includes('берег') || 
      description.includes('вод') || location.includes('пляж')) {
    return { type: 'water', badge: '🏖️', title: 'Парковка у воды' };
  }
  
  // Religious - Churches, temples, religious sites
  if (name.includes('церковь') || name.includes('храм') || name.includes('собор') || name.includes('монастырь') || 
      name.includes('мечеть') || name.includes('синагога') || description.includes('религиоз') || 
      description.includes('церковь') || location.includes('церковь')) {
    return { type: 'religious', badge: '⛪', title: 'Парковка у религиозного объекта' };
  }
  
  // Transportation - Stations, airports, bus stops
  if (name.includes('вокзал') || name.includes('аэропорт') || name.includes('станция') || name.includes('автобус') || 
      name.includes('метро') || name.includes('порт') || description.includes('транспорт') || 
      description.includes('вокзал') || location.includes('вокзал')) {
    return { type: 'transport', badge: '🚉', title: 'Парковка у транспортного узла' };
  }
  
  // Default to general public parking
  return { type: 'public', badge: '🅿️', title: 'Общественная парковка' };
}

function getCuisineFlag(cuisine: string): string {
  const cuisineMap: Record<string, string> = {
    // Traditional cuisines
    'Русская': '🥟', // Pelmeni - traditional Russian dumplings
    'Европейская': '🍽️', // Fine dining - represents European cuisine style
    'Итальянская': '🍝', // Pasta - most recognizable Italian dish
    'Японская': '🍣', // Sushi - iconic Japanese food
    'Китайская': '🥢', // Chopsticks - universal symbol for Chinese cuisine
    'Индийская': '🍛', // Curry - most recognizable Indian dish
    'Мексиканская': '🌶️', // Chili pepper - represents spicy Mexican flavors
    'Тайская': '🥥', // Coconut - key ingredient in Thai cuisine
    'Корейская': '🥘', // Korean stew pot - represents Korean cooking
    'Французская': '🥐', // Croissant - iconic French pastry
    'Немецкая': '🍺', // Beer - traditional German beverage
    'Испанская': '🥘', // Paella pan - represents Spanish rice dishes
    'Греческая': '🫒', // Olives - key Mediterranean ingredient
    'Турецкая': '🥙', // Kebab wrap - popular Turkish street food
    'Арабская': '🫓', // Flatbread - staple in Arab cuisine
    'Балтийская': '🐟', // Fish - represents Baltic seafood
    'Стейки': '🥩', // Steak - premium meat dishes
    'Бургеры': '🍔', // Burger - iconic American fast food
    
    // Dietary preferences
    'Вегетарианская': '🥬', // Leafy greens - represents vegetarian options
    'Веганская': '🌱', // Plant sprout - represents vegan lifestyle
    
    // Food service types
    'Кафе': '☕', // Coffee cup - represents cafes and coffee shops
    'Бар': '🍸', // Cocktail glass - represents bars and lounges
    'Пиццерия': '🍕', // Pizza slice - represents pizza places
    'Суши': '🍣', // Sushi - represents sushi restaurants
    'Стейк-хаус': '🥩', // Steak - represents steak houses
    'Морепродукты': '🦐', // Shrimp - represents seafood restaurants
    'Фастфуд': '🍔', // Burger - represents fast food
    'Азиатская': '🍜', // Ramen bowl - represents Asian cuisine
    'Пекарня': '🥖', // Baguette - represents bakeries
    'Кондитерская': '🧁', // Cupcake - represents pastry shops
    'Мороженое': '🍦', // Ice cream - represents ice cream shops
    'Столовая': '🍽️', // Plate - represents cafeterias
    'Бистро': '🥪', // Sandwich - represents bistros
    'Паб': '🍺', // Beer mug - represents pubs
    'Ресторан': '🍽️' // Fine dining plate - represents restaurants
  }
  return cuisineMap[cuisine] || '🍽️'
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
  bottom: 32px; 
  z-index: 3; 
  color: #fff; 
  padding-bottom: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.hero-title { 
  margin: 0; 
  font-size: clamp(1.2rem, 4.8vw, 1.6rem); 
  font-weight: 800; 
  text-shadow: 0 2px 4px rgba(0,0,0,0.7); 
  line-height: 1.2;
  text-align: left;
}

.hero-sub { 
  display: flex; 
  gap: 4px; 
  flex-wrap: wrap; 
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  width: 100%;
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
}

/* Facilities Header */
.facilities-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 1rem 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.facilities-header .section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  transition: color 0.3s ease;
  letter-spacing: -0.025em;
}

.facilities-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(147, 51, 234, 0.02) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.facilities-header:hover {
  background: rgba(59, 130, 246, 0.05);
  border-radius: 12px;
  padding: 1rem;
  margin: -1rem;
  transform: translateY(-0.5px);
  box-shadow: 0 2px 12px rgba(59, 130, 246, 0.08);
}

.facilities-header:hover::before {
  opacity: 1;
}

.facilities-header:hover .section-title {
  color: #3b82f6;
}

.facilities-header:active {
  transform: translateY(-0.5px);
  transition: all 0.1s ease;
}

.toggle-icon {
  font-size: 1.2rem;
  color: #64748b;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0.5rem;
  border-radius: 50%;
  background: rgba(100, 116, 139, 0.1);
  border: 1px solid rgba(100, 116, 139, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transform: rotate(0deg);
}

.facilities-section.facilities-open .toggle-icon {
  transform: rotate(180deg);
}

.toggle-icon:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.12);
}

/* Facilities Content Animation */
.facilities-content {
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.facilities-content.facilities-open {
  max-height: 1000px;
  opacity: 1;
  transform: translateY(0);
}

.facilities-content.facilities-closed {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

/* Facilities Grid */
.facilities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
  transition: all 0.3s ease;
}

.facility-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: help;
  opacity: 0;
  transform: translateY(20px);
  animation: slideInUp 0.4s ease forwards;
}

.facility-item:nth-child(1) { animation-delay: 0.1s; }
.facility-item:nth-child(2) { animation-delay: 0.15s; }
.facility-item:nth-child(3) { animation-delay: 0.2s; }
.facility-item:nth-child(4) { animation-delay: 0.25s; }
.facility-item:nth-child(5) { animation-delay: 0.3s; }
.facility-item:nth-child(6) { animation-delay: 0.35s; }
.facility-item:nth-child(7) { animation-delay: 0.4s; }
.facility-item:nth-child(8) { animation-delay: 0.45s; }

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.facility-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.facility-icon {
  font-size: 1.75rem;
  color: #3b82f6;
  flex-shrink: 0;
}

.facility-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #64748b;
  min-width: 80px;
}

.facility-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  margin-left: auto;
}

/* Enhanced Facility Styles */
.facilities-category {
  margin-bottom: 1.5rem;
}

.category-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.category-facilities {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 0.75rem;
}

.facility-item.enhanced {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: help;
  opacity: 0;
  transform: translateY(20px);
  animation: slideInUp 0.4s ease forwards;
  backdrop-filter: blur(10px);
  min-height: 60px;
}

.facility-item.enhanced:hover {
  background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  border-color: rgba(255,255,255,0.2);
}

.facility-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
  flex-shrink: 0;
  align-self: center;
}

.facility-icon {
  font-size: 1.75rem;
  color: #3b82f6;
}

.facility-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  justify-content: center;
}

.facility-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #64748b;
  line-height: 1.2;
}

.facility-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.2;
}

.facility-status {
  font-size: 0.75rem;
  color: #059669;
  font-weight: 500;
}

/* Status Indicators */
.status-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
}

.status-indicator.open {
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
}

.status-indicator.closed {
  background: #ef4444;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
}

/* Badges */
.parking-badge, .family-badge, .accessibility-badge, .wifi-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 0.75rem;
  background: rgba(255,255,255,0.9);
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0,0,0,0.1);
}

/* Price Level Badge */
.price-level-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
}

.price-level-badge.budget { background: #10b981; }
.price-level-badge.affordable { background: #f59e0b; }
.price-level-badge.expensive { background: #f97316; }
.price-level-badge.premium { background: #dc2626; }

.price-value {
  font-weight: 700;
  font-size: 1rem;
}

/* Enhanced Payment Display */
.payment-enhanced .payment-icons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: rgba(255,255,255,0.1);
  border-radius: 6px;
  font-size: 0.75rem;
}

.payment-icon {
  font-size: 0.875rem;
  color: #059669;
}

.payment-label {
  color: #374151;
  font-weight: 500;
}

/* Cuisine Enhancement */
.cuisine-enhanced .cuisine-icon-large {
  font-size: 1.5rem;
}


/* Mobile Responsiveness */
@media (max-width: 768px) {
  .category-facilities {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .facility-item.enhanced {
    padding: 0.75rem;
    gap: 0.75rem;
  }
  
  .facility-icon-wrapper {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .facility-icon {
    font-size: 1.4rem;
  }
}

/* Review Media Styles */
.review-media {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.media-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.media-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.media-image:hover {
  transform: scale(1.05);
}

.media-video {
  width: 120px;
  height: 80px;
  object-fit: cover;
}

.media-file {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  padding: 0.5rem;
  background: #f1f5f9;
}

.file-icon {
  font-size: 1.5rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.file-name {
  font-size: 0.75rem;
  color: #475569;
  text-align: center;
  word-break: break-all;
}

/* Media Modal Styles */
.media-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 1000;
  padding: 2rem;
  box-sizing: border-box;
}

.media-modal-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 95%;
  height: 95%;
  max-width: none;
  max-height: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  box-sizing: border-box;
}

.modal-media-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  transition: transform 0.1s ease-out;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.modal-media-video {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-media-file {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.modal-file-icon {
  font-size: 4rem;
  color: #64748b;
}

.modal-media-file p {
  font-size: 1.125rem;
  color: #374151;
  margin: 0;
}

.modal-back-btn {
  position: absolute;
  top: 2rem;
  left: 2rem;
  z-index: 1001;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  font-size: 0.875rem;
  font-weight: 500;
}

.modal-back-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.05);
}

/* Reviews Empty State */
.reviews-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px dashed #cbd5e1;
  margin: 1rem 0;
}

.empty-icon {
  font-size: 3rem;
  color: #94a3b8;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: #475569;
  margin: 0 0 0.5rem 0;
}

.empty-subtext {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  max-width: 280px;
  line-height: 1.5;
}

/* Mobile responsive for reviews */
@media (max-width: 768px) {
  .reviews-cta {
    gap: 0.5rem;
    margin-top: 0.75rem;
  }
  
  .review-btn {
    width: 40px;
    height: 40px;
  }
  
  .review-btn svg {
    width: 16px;
    height: 16px;
  }
  
  .review-count {
    font-size: 0.75rem;
  }
}


.payment-methods {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.payment-icon {
  font-size: 1.1rem;
  color: #3b82f6;
}

.cuisine-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .facilities-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .facility-item {
    padding: 0.6rem;
    gap: 0.6rem;
  }
  
  .facility-label {
    min-width: 70px;
    font-size: 0.8rem;
  }
  
  .facility-value {
    font-size: 0.85rem;
  }
  
  .facilities-header {
    padding: 0.75rem 0;
  }
  
  .facilities-header:hover {
    padding: 0.75rem;
    margin: -0.75rem;
  }
  
  .facilities-header .section-title {
    font-size: 1.1rem;
  }
  
  .toggle-icon {
    width: 2.25rem;
    height: 2.25rem;
    font-size: 1.1rem;
  }
}

.facility-chip.unavailable {
  background: #f8fafc;
  border-color: #9ca3af;
  color: #6b7280;
  opacity: 0.7;
}

.facility-chip.unavailable::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120%;
  height: 2px;
  background: #ef4444;
  transform: translate(-50%, -50%) rotate(-45deg);
  border-radius: 1px;
}

.facility-icon {
  font-size: 2.5rem;
  color: #1f2937;
}

.facility-text {
  display: none;
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

/* Event Info Section - Clean separation from photos */
.event-info {
  padding: 1.5rem 1rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.event-title {
  margin: 0 0 1rem 0;
  font-size: 1.75rem;
  font-weight: 800;
  color: #1f2937;
  line-height: 1.2;
}

.action-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.action-icon-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #374151;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.action-icon-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.action-icon-btn[aria-pressed="true"] {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #dc2626;
}

.action-icon-btn[aria-pressed="true"]:hover {
  background: #fee2e2;
  border-color: #f87171;
}

/* Responsive design for mobile */
@media (max-width: 640px) {
  .event-title {
    font-size: 1.5rem;
  }
  
  .event-meta {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .meta-info {
    order: 2; /* Move meta info below buttons on mobile */
  }
  
  .event-actions {
    justify-content: flex-end;
    order: 1; /* Move buttons to top on mobile */
  }
  
  .action-icon-btn {
    width: 40px;
    height: 40px;
  }
}

.event-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.meta-info {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.event-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.meta-chip {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  text-decoration: none;
  transition: all 0.2s ease;
}

.meta-chip:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
}

.meta-chip.link {
  background: #dbeafe;
  color: #1d4ed8;
  border-color: #93c5fd;
}

.meta-chip.link:hover {
  background: #bfdbfe;
  border-color: #60a5fa;
}

/* Floating back button - positioned to avoid action bar */
.back-floating-btn {
  position: fixed;
  bottom: 5rem; /* Moved up to avoid action bar */
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
  z-index: 9; /* Lower than action bar */
}

.back-floating-btn:hover {
  border-color: #aaa;
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
  
  .hero-bottom {
    bottom: 28px;
    left: 8px;
    right: 8px;
    gap: 6px;
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

.reviews-label {
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
  padding: 1.5rem 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: center;
  width: 90%;
  max-width: 380px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.map-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.map-dialog-content p {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.map-dialog-content button {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #374151;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.map-dialog-content button:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.map-dialog-content button:active {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.map-dialog-footer {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
}

.map-dialog-footer .cancel {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
  padding: 0.75rem 2rem;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}



/* Reviews CTA */
.reviews-cta { 
  display: flex; 
  gap: 0.75rem; 
  margin-top: 1rem; 
  justify-content: center;
  align-items: center;
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
  display: flex;
  align-items: center;
  gap: 0.25rem;
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

/* Categories section */
.categories-section {
  margin-top: 1.5rem;
}

.event-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-chip {
  background: #f8fafc;
  color: #475569;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #e2e8f0;
}

/* Star Rating Styling */
.review-rating .iconify {
  color: #fbbf24;
  margin-right: 0.25rem;
}

/* Interactive Star Rating */
.star-rating {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.star-rating button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.star-rating button .iconify {
  color: #fbbf24;
  opacity: 0.3;
  transition: all 0.2s ease;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.star-rating button.active .iconify {
  opacity: 1;
  color: #f59e0b;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.star-rating button:hover .iconify {
  transform: scale(1.1);
}

</style>