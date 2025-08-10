<template>
  <div v-if="event" class="event-detail-page">
    <img :src="event.image || '/default.jpg'" class="event-image" />

    <div class="event-card">
      <h1 class="event-title">{{ event.name }}</h1>
      <p class="event-host">👤 Организатор: Kaliningrad Explorers</p>

      <div class="event-meta">
        <p v-if="event.date">🕒 {{ formatDateTimeRu(event.date) }}</p>
        <p v-if="event.location" class="map-link" @click="openMapOptions">
          <Icon icon="lucide:map-pin" width="18" /> {{ event.location }}
        </p>
        <p v-if="event.price === 0">💸 Бесплатно... ну или не совсем</p>
        <p v-else-if="event.price">💶 {{ event.price }} ₽</p>
        <p v-if="event.going">✅ {{ event.going }} участников</p>
      </div>

      <div class="attendees" v-if="reviews.length">
        <p>Отметились:</p>
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
      </div>

      <div class="event-description">
        <p>{{ event.description || 'Нет описания' }}</p>
      </div>
      <div class="event-links">
        <a v-if="event.whatsapp" :href="event.whatsapp" target="_blank">
          <Icon icon="logos:whatsapp-icon" width="20" /> WhatsApp
        </a>
        <a v-if="event.instagram" :href="event.instagram" target="_blank">
          <Icon icon="logos:telegram" width="20" /> Telegram
        </a>
      </div>
    </div>

    <!-- ACTION BUTTONS -->
    <div class="event-actions">
      <button class="back-btn" @click="goBack">Назад</button>
      <button class="join-btn" @click="joinEvent">Посетить</button>
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
          <button class="cancel" @click="showMapDialog = false">Назад</button>
          <button class="join" @click="joinEvent">Посетить</button>
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
          <div class="review-rating">⭐ {{ review.rating }}/5</div>
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
          <div class="review-rating">⭐ {{ singleReview.rating }}/5</div>
          <p class="review-comment">{{ singleReview.comment }}</p>
        </div>
        <button class="close-btn" @click="closeSingleReviewModal">Закрыть</button>
      </div>
    </div>

    <!-- RECOMMENDED SECTION -->
    <div class="recommended-section" v-if="recommended.length">
      <h2>Рекомендуемые события</h2>
      <div class="recommended-list">
        <div
          class="recommended-item"
          v-for="place in recommended"
          :key="place.id"
          @click="goToEvent(place.id)"
        >
          <img :src="place.image || '/default.jpg'" class="recommended-img" />
          <div class="recommended-info">
            <h3>{{ place.name }}</h3>
            <p>⭐ {{ place.rating || 'N/A' }}</p>
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
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { allAttractions } from '../Data'
import { Icon } from '@iconify/vue'

const route = useRoute()
const router = useRouter()
const eventId = Number(route.params.id)
const event = allAttractions.value.find((e) => e.id === eventId)

const showMapDialog = ref(false)
const showReviewsModal = ref(false)
const singleReviewModal = ref(false)
const singleReview = ref<any>(null)

const reviews = ref(event?.reviews || [])

const limitedReviews = computed(() => reviews.value.slice(0, 8))
const extraReviewCount = computed(() =>
  reviews.value.length > 8 ? reviews.value.length - 8 : 0
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
  if (!event?.category) return []
  return allAttractions.value
    .filter((e) => e.category === event.category && e.id !== event.id)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5)
})

function goToEvent(id: number) {
  router.push({ name: 'EventDetail', params: { id } })
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

.event-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-bottom: 1px solid #eee;
}

.event-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin: 1rem;
  padding: 1.2rem;
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

.attendees {
  margin-top: 1rem;
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


.event-description {
  margin-top: 1rem;
  line-height: 1.5;
}

.event-links {
  margin-top: 1.2rem;
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
  padding: 0.5rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  border: none;
}

.map-dialog-footer .cancel {
  background: #f3f4f6;
  color: #333;
}

.map-dialog-footer .join {
  background: #3b82f6;
  color: white;
}

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
  padding: 0.6rem;
  border-radius: 10px;
  border: none;
  font-weight: bold;
  cursor: pointer;
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