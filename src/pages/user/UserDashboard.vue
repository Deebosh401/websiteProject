<template>
  <div class="user-dashboard">
    <div class="dashboard-page-header">
      <div class="dashboard-page-content">
        <nav class="breadcrumb">
          <router-link to="/" class="breadcrumb-item">
            <Icon icon="mdi:home" />
            Главная
          </router-link>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">Мой профиль</span>
        </nav>
        
        <div class="dashboard-welcome">
          <h1 class="dashboard-title">Мой профиль</h1>
          <p class="dashboard-subtitle">Добро пожаловать, {{ authStore.userDisplayName }}!</p>
        </div>
      </div>
    </div>

    <div class="dashboard-nav">
      <button 
        v-for="tab in userTabs" 
        :key="tab.id"
        :class="['dashboard-nav-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <Icon :icon="tab.icon" />
        <span>{{ tab.name }}</span>
        <span v-if="tab.badge" class="badge">{{ tab.badge }}</span>
      </button>
    </div>

    <div class="dashboard-content">
      <div v-if="activeTab === 'favorites'" class="tab-content">
        <div class="section-header">
          <h2>Избранное</h2>
          <p>Ваши сохранённые места и события</p>
        </div>

        <div v-if="userFavorites.length === 0" class="empty-state">
          <div class="empty-illustration">
            <Icon icon="mdi:heart-outline" class="empty-icon" />
            <div class="empty-decoration"></div>
          </div>
          <div class="empty-content">
            <h3>Начните собирать избранное</h3>
            <p>Добавляйте интересные места, события и маршруты в избранное, чтобы легко находить их позже</p>
            <div class="empty-actions">
              <router-link to="/" class="explore-btn primary">
                <Icon icon="mdi:compass" />
                Исследовать места
              </router-link>
              <router-link to="/events" class="explore-btn secondary">
                <Icon icon="mdi:calendar" />
                Посмотреть события
              </router-link>
            </div>
          </div>
        </div>

        <div v-else class="favorites-container">
          <div class="category-filter">
            <button 
              v-for="category in getFavoriteCategories()" 
              :key="category"
              @click="setFavoriteFilter(category)"
              :class="['filter-btn', { active: favoriteFilter === category }]"
            >
              {{ category }}
            </button>
            <button 
              @click="setFavoriteFilter('all')"
              :class="['filter-btn', { active: favoriteFilter === 'all' }]"
            >
              Все ({{ userFavorites.length }})
            </button>
          </div>

          <div class="favorites-grid">
            <div v-for="favorite in filteredFavorites" :key="favorite.id" class="favorite-card">
              <div class="favorite-image">
                <img :src="favorite.itemImage || '/placeholder-image.jpg'" :alt="favorite.itemName" />
                <button @click="removeFromFavorites(favorite.itemId)" class="remove-favorite-btn">
                  <Icon icon="mdi:heart" />
                </button>
                <div class="favorite-badge">
                  <Icon :icon="getItemTypeIcon(favorite.itemType)" />
                </div>
              </div>
              <div class="favorite-info">
                <h3 class="favorite-name">{{ favorite.itemName }}</h3>
                <p class="favorite-type">{{ getItemTypeLabel(favorite.itemType) }}</p>
                <p class="favorite-date">Добавлено {{ formatDate(favorite.addedAt) }}</p>
                <div class="favorite-actions">
                  <button class="action-btn" @click="viewFavorite(favorite)">
                    <Icon icon="mdi:eye" />
                    Посмотреть
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'dashboard'" class="tab-content">
        <div class="section-header">
          <h2>Обзор активности</h2>
          <p>Ваша статистика и быстрые действия</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <Icon icon="mdi:map-marker-path" class="icon" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ userStats.totalTrips }}</div>
              <div class="stat-label">Поездки</div>
              <div class="stat-progress" v-if="userStats.totalTrips > 0">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: `${Math.min((userTrips.filter(trip => trip.status === 'completed').length / userStats.totalTrips) * 100, 100)}%` }"></div>
                </div>
                <span class="progress-text">{{ completedTrips }}/{{ userStats.totalTrips }} завершено</span>
              </div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <Icon icon="mdi:calendar-check" class="icon" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ userStats.totalReservations }}</div>
              <div class="stat-label">Бронирования</div>
              <div class="stat-trend" v-if="userStats.totalReservations > 0">
                <Icon icon="mdi:trending-up" class="trend-icon" />
                <span class="trend-text">+{{ Math.floor(userStats.totalReservations * 0.2) }} в этом месяце</span>
              </div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <Icon icon="mdi:comment-text" class="icon" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ userStats.approvedComments }}</div>
              <div class="stat-label">Отзывы</div>
              <div class="stat-badge" v-if="userStats.approvedComments > 0">
                <Icon icon="mdi:check-circle" class="badge-icon" />
                <span class="badge-text">Проверенные</span>
              </div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <Icon icon="mdi:heart" class="icon" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ userFavorites.length }}</div>
              <div class="stat-label">Избранное</div>
              <div class="stat-categories" v-if="userFavorites.length > 0">
                <span class="category-count">{{ getFavoriteCategories().length }} категорий</span>
              </div>
            </div>
          </div>
        </div>

        <div class="quick-actions-section">
          <h3>Быстрые действия</h3>
          <div class="quick-actions-grid">
            <button class="action-btn" @click="showAddTripModal = true">
              <Icon icon="mdi:plus" class="action-icon" />
              <span>Добавить поездку</span>
            </button>
            <button class="action-btn" @click="showCommentModal = true">
              <Icon icon="mdi:comment-plus" class="action-icon" />
              <span>Оставить отзыв</span>
            </button>
            <button class="action-btn" @click="$router.push('/guides')">
              <Icon icon="mdi:account-group" class="action-icon" />
              <span>Найти гидов</span>
            </button>
            <button class="action-btn" @click="$router.push('/chat')">
              <Icon icon="mdi:chat" class="action-icon" />
              <span>Сообщения</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'trips'" class="tab-content">
        <div class="section-header">
          <h2>Мои поездки</h2>
          <p>Планируйте и отслеживайте свои путешествия</p>
          <button class="section-action" @click="showAddTripModal = true">
            <Icon icon="mdi:plus" />
            Добавить поездку
          </button>
        </div>

        <div v-if="userTrips.length === 0" class="empty-state">
          <Icon icon="mdi:map-outline" class="empty-icon" />
          <h3>Нет поездок</h3>
          <p>Добавьте свои первые поездки и путешествия</p>
          <button class="explore-btn" @click="showAddTripModal = true">
            <Icon icon="mdi:plus" />
            Добавить поездку
          </button>
        </div>

        <div v-else class="trips-list">
          <div v-for="trip in userTrips" :key="trip.id" class="trip-card">
            <div class="trip-info">
              <h3 class="trip-name">{{ trip.attractionName }}</h3>
              <p class="trip-type">{{ getItemTypeLabel(trip.attractionType) }}</p>
              <p class="trip-city">{{ trip.city }}</p>
              <p class="trip-date">{{ formatDate(trip.date) }}</p>
              <div class="trip-status">
                <span class="status-badge" :class="getTripStatusClass(trip.status)">
                  {{ getTripStatusLabel(trip.status) }}
                </span>
              </div>
            </div>
            <div class="trip-actions">
              <button class="action-btn small" @click="editTrip(trip)">
                <Icon icon="mdi:pencil" />
              </button>
              <button class="action-btn small" @click="deleteTrip(trip.id)">
                <Icon icon="mdi:delete" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'reservations'" class="tab-content">
        <div class="section-header">
          <h2>Мои бронирования</h2>
          <p>Ваши активные и завершённые бронирования</p>
        </div>

        <div v-if="userReservations.length === 0" class="empty-state">
          <Icon icon="mdi:calendar-outline" class="empty-icon" />
          <h3>Нет бронирований</h3>
          <p>Забронируйте экскурсию или событие</p>
          <router-link to="/guides" class="explore-btn">
            <Icon icon="mdi:account-tie" />
            Найти гида
          </router-link>
        </div>

        <div v-else class="reservations-list">
          <div v-for="reservation in userReservations" :key="reservation.id" class="reservation-card">
            <div class="reservation-status" :class="reservation.status">
              <Icon :icon="getStatusIcon(reservation.status)" />
              <span>{{ getStatusLabel(reservation.status) }}</span>
            </div>
            <div class="reservation-info">
              <h3 class="reservation-title">{{ reservation.serviceName }}</h3>
              <div class="reservation-details">
                <div class="detail-item">
                  <Icon icon="mdi:calendar" />
                  <span>{{ formatDate(reservation.date) }}</span>
                </div>
                <div class="detail-item">
                  <Icon icon="mdi:clock" />
                  <span>{{ reservation.time }}</span>
                </div>
                <div class="detail-item">
                  <Icon icon="mdi:account-group" />
                  <span>{{ reservation.participants }} человек</span>
                </div>
                <div v-if="reservation.totalPrice" class="detail-item">
                  <Icon icon="mdi:currency-rub" />
                  <span>{{ reservation.totalPrice }} ₽</span>
                </div>
              </div>
              <div v-if="reservation.notes" class="reservation-notes">
                <strong>Примечания:</strong> {{ reservation.notes }}
              </div>
            </div>
            <div class="reservation-actions">
              <button v-if="reservation.status === 'pending'" @click="cancelReservation(reservation.id)" class="action-btn danger">
                <Icon icon="mdi:cancel" />
                Отменить
              </button>
              <button @click="viewReservationDetails(reservation.id)" class="action-btn primary">
                <Icon icon="mdi:eye" />
                Подробнее
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'trips'" class="tab-content">
        <div class="section-header">
          <h2>Мои маршруты</h2>
          <p>Созданные вами маршруты и планы поездок</p>
        </div>

        <div class="trip-actions">
          <button @click="createNewTrip" class="action-btn primary">
            <Icon icon="mdi:plus" />
            Создать маршрут
          </button>
          <button @click="importTrip" class="action-btn secondary">
            <Icon icon="mdi:import" />
            Импортировать
          </button>
        </div>

        <div v-if="userTrips.length === 0" class="empty-state">
          <Icon icon="mdi:map-marker-path" class="empty-icon" />
          <h3>Нет маршрутов</h3>
          <p>Создайте свой первый маршрут для путешествий</p>
        </div>

      </div>

      <div v-if="activeTab === 'comments'" class="tab-content">
        <div class="section-header">
          <h2>Мои отзывы</h2>
          <p>Ваши отзывы о посещённых местах</p>
          <button class="section-action" @click="showCommentModal = true">
            <Icon icon="mdi:comment-plus" />
            Оставить отзыв
          </button>
        </div>

        <div v-if="userComments.length === 0" class="empty-state">
          <Icon icon="mdi:comment-outline" class="empty-icon" />
          <h3>Нет отзывов</h3>
          <p>Оставьте свой первый отзыв о посещённом месте</p>
          <button class="explore-btn" @click="showCommentModal = true">
            <Icon icon="mdi:comment-plus" />
            Оставить отзыв
          </button>
        </div>

        <div v-else class="comments-list">
          <div v-for="comment in userComments" :key="comment.id" class="comment-card">
            <div class="comment-header">
              <h3 class="comment-attraction">Место</h3>
              <div class="comment-rating">
                <div class="stars">
                  <Icon 
                    v-for="i in 5" 
                    :key="i" 
                    icon="mdi:star" 
                    :class="{ filled: i <= comment.rating }"
                  />
                </div>
              </div>
            </div>
            <p class="comment-content">{{ comment.content }}</p>
            <div class="comment-footer">
              <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
              <span class="comment-status" :class="getCommentStatusClass(comment.status)">
                {{ getCommentStatusLabel(comment.status) }}
              </span>
              <span v-if="comment.isVerified" class="verified-badge">
                <Icon icon="mdi:check-circle" />
                Подтверждено посещение
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'profile'" class="tab-content">
        <div class="section-header">
          <h2>Настройки профиля</h2>
          <p>Управление вашими данными и настройками</p>
        </div>

        <div class="profile-form">
          <div class="form-section">
            <h3>Личная информация</h3>
            <div class="form-group">
              <label>Имя</label>
              <input v-model="profileForm.name" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input v-model="profileForm.email" type="email" class="form-input" />
            </div>
            <div class="form-group">
              <label>Телефон</label>
              <input v-model="profileForm.mobile" type="tel" class="form-input" disabled />
            </div>
          </div>

          <div class="form-section">
            <h3>Настройки уведомлений</h3>
            <div class="notification-settings">
              <label class="checkbox-label">
                <input v-model="profileForm.notifications.email" type="checkbox" />
                <span>Email уведомления</span>
              </label>
              <label class="checkbox-label">
                <input v-model="profileForm.notifications.sms" type="checkbox" />
                <span>SMS уведомления</span>
              </label>
              <label class="checkbox-label">
                <input v-model="profileForm.notifications.reservations" type="checkbox" />
                <span>Уведомления о бронированиях</span>
              </label>
              <label class="checkbox-label">
                <input v-model="profileForm.notifications.events" type="checkbox" />
                <span>Уведомления о событиях</span>
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button @click="saveProfile" class="action-btn primary">
              <Icon icon="mdi:content-save" />
              Сохранить изменения
            </button>
            <button @click="changePassword" class="action-btn secondary">
              <Icon icon="mdi:key" />
              Сменить пароль
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAddTripModal" class="modal-overlay" @click="showAddTripModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Добавить поездку</h3>
          <button class="modal-close" @click="showAddTripModal = false">
            <Icon icon="mdi:close" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="addTrip">
            <div class="form-group">
              <label>Название места</label>
              <input v-model="newTrip.attractionName" type="text" required />
            </div>
            <div class="form-group">
              <label>Тип места</label>
              <select v-model="newTrip.attractionType" required>
                <option value="attraction">Достопримечательность</option>
                <option value="event">Событие</option>
                <option value="excursion">Экскурсия</option>
              </select>
            </div>
            <div class="form-group">
              <label>Город</label>
              <input v-model="newTrip.city" type="text" required />
            </div>
            <div class="form-group">
              <label>Дата поездки</label>
              <input v-model="newTrip.date" type="date" required />
            </div>
            <div class="form-group">
              <label>Заметки</label>
              <textarea v-model="newTrip.notes" rows="3"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" @click="showAddTripModal = false">Отмена</button>
              <button type="submit">Добавить поездку</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="showCommentModal" class="modal-overlay" @click="showCommentModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Оставить отзыв</h3>
          <button class="modal-close" @click="showCommentModal = false">
            <Icon icon="mdi:close" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="addComment">
            <div class="form-group">
              <label>Выберите место</label>
              <select v-model="newComment.attractionId" required>
                <option value="">Выберите место</option>
                <option v-for="trip in completedTrips" :key="trip.id" :value="trip.attractionId">
                  {{ trip.attractionName }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Рейтинг</label>
              <div class="rating-input">
                <button 
                  v-for="i in 5" 
                  :key="i" 
                  type="button"
                  class="star-btn"
                  :class="{ active: i <= newComment.rating }"
                  @click="newComment.rating = i"
                >
                  <Icon icon="mdi:star" />
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>Отзыв</label>
              <textarea v-model="newComment.content" rows="4" required></textarea>
            </div>
            <div class="form-actions">
              <button type="button" @click="showCommentModal = false">Отмена</button>
              <button type="submit">Отправить отзыв</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { 
  getUserFavorites, 
  removeFromFavorites as removeFavorite,
  getReservationsByUser,
  updateReservationStatus,
  getUserTrips,
  addUserTrip,
  deleteUserTrip,
  getComments,
  addComment as addNewComment,
  getUserStats,
  type FavoriteItem,
  type Reservation,
  type UserTrip,
  type Comment
} from '../../Data'
import { Icon } from '@iconify/vue'

const authStore = useAuthStore()

// Tab management
const activeTab = ref('dashboard')
const userTabs = ref([
  { id: 'dashboard', name: 'Обзор', icon: 'mdi:view-dashboard', badge: null as string | null },
  { id: 'trips', name: 'Поездки', icon: 'mdi:map-marker-path', badge: null as string | null },
  { id: 'favorites', name: 'Избранное', icon: 'mdi:heart', badge: null as string | null },
  { id: 'reservations', name: 'Бронирования', icon: 'mdi:calendar', badge: null as string | null },
  { id: 'comments', name: 'Отзывы', icon: 'mdi:comment-text', badge: null as string | null },
  { id: 'profile', name: 'Профиль', icon: 'mdi:account', badge: null as string | null }
])

// User data
const userFavorites = ref<FavoriteItem[]>([])
const userReservations = ref<Reservation[]>([])
const userTrips = ref<UserTrip[]>([])
const userComments = ref<Comment[]>([])
const userStats = ref({
  totalTrips: 0,
  completedTrips: 0,
  plannedTrips: 0,
  totalComments: 0,
  approvedComments: 0,
  totalReservations: 0,
  activeReservations: 0
})

// Modals
const showAddTripModal = ref(false)
const showCommentModal = ref(false)
const favoriteFilter = ref('all')

// Form data
const newTrip = ref({
  attractionName: '',
  attractionType: 'attraction' as 'attraction' | 'event' | 'excursion',
  city: '',
  date: '',
  notes: ''
})

const newComment = ref({
  attractionId: '',
  rating: 5,
  content: ''
})

// Profile form
const profileForm = ref({
  name: '',
  email: '',
  mobile: '',
  notifications: {
    email: true,
    sms: true,
    reservations: true,
    events: true
  }
})

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU')
}

const getItemTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    attraction: 'Достопримечательность',
    event: 'Событие',
    trail: 'Маршрут',
    restaurant: 'Ресторан',
    place: 'Место'
  }
  return labels[type] || type
}

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    pending: 'mdi:clock-outline',
    confirmed: 'mdi:check-circle',
    cancelled: 'mdi:cancel',
    completed: 'mdi:check-circle-outline',
    rejected: 'mdi:close-circle'
  }
  return icons[status] || 'mdi:help-circle'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Ожидает подтверждения',
    confirmed: 'Подтверждено',
    cancelled: 'Отменено',
    completed: 'Завершено',
    rejected: 'Отклонено'
  }
  return labels[status] || status
}


const removeFromFavorites = (itemId: string) => {
  if (authStore.user?.id) {
    removeFavorite(authStore.user.id, itemId)
    loadUserFavorites()
  }
}

const cancelReservation = (reservationId: string) => {
  if (confirm('Вы уверены, что хотите отменить бронирование?')) {
    updateReservationStatus(reservationId, 'cancelled', 'Отменено пользователем')
    loadUserReservations()
  }
}

const viewReservationDetails = (reservationId: string) => {
  console.log('Viewing reservation details:', reservationId)
}

// Trip management methods
const addTrip = () => {
  if (!authStore.user?.id) return
  
  const trip: Omit<UserTrip, 'id' | 'createdAt'> = {
    userId: authStore.user.id,
    attractionId: `temp_${Date.now()}`,
    attractionName: newTrip.value.attractionName,
    attractionType: newTrip.value.attractionType,
    city: newTrip.value.city,
    date: newTrip.value.date,
    status: 'planned',
    notes: newTrip.value.notes
  }
  
  addUserTrip(trip)
  showAddTripModal.value = false
  resetNewTrip()
  loadUserData()
}

const editTrip = (trip: UserTrip) => {
  // Implementation for editing trip
  console.log('Edit trip:', trip)
}

const deleteTrip = (tripId: string) => {
  if (confirm('Вы уверены, что хотите удалить эту поездку?')) {
    deleteUserTrip(tripId)
    loadUserData()
  }
}

const resetNewTrip = () => {
  newTrip.value = {
    attractionName: '',
    attractionType: 'attraction',
    city: '',
    date: '',
    notes: ''
  }
}

// Comment management methods
const addComment = () => {
  if (!authStore.user?.id) return
  
  const comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
    attractionId: newComment.value.attractionId,
    attractionType: 'attraction', // This should be determined from the trip
    userId: authStore.user.id,
    userName: authStore.userDisplayName || 'Пользователь',
    userRole: authStore.userRole || 'user',
    rating: newComment.value.rating,
    content: newComment.value.content,
    isVerified: true, // User can only comment on places they've visited
    visitDate: new Date().toISOString()
  }
  
  addNewComment(comment)
  showCommentModal.value = false
  resetNewComment()
  loadUserData()
}

const resetNewComment = () => {
  newComment.value = {
    attractionId: '',
    rating: 5,
    content: ''
  }
}

// Status and label methods
const getTripStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    planned: 'status-planned',
    completed: 'status-completed',
    cancelled: 'status-cancelled'
  }
  return classes[status] || ''
}

const getTripStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    planned: 'Запланировано',
    completed: 'Завершено',
    cancelled: 'Отменено'
  }
  return labels[status] || status
}

const getCommentStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'status-pending',
    approved: 'status-approved',
    rejected: 'status-rejected'
  }
  return classes[status] || ''
}

const getCommentStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'На модерации',
    approved: 'Одобрено',
    rejected: 'Отклонено'
  }
  return labels[status] || status
}

// Computed properties
const completedTrips = computed(() => {
  return userTrips.value.filter(trip => trip.status === 'completed')
})

// Filtered favorites based on category
const filteredFavorites = computed(() => {
  if (favoriteFilter.value === 'all') {
    return userFavorites.value
  }
  return userFavorites.value.filter(fav => getItemTypeLabel(fav.itemType) === favoriteFilter.value)
})

// Get unique categories from favorites
const getFavoriteCategories = () => {
  const categories = new Set(userFavorites.value.map(fav => getItemTypeLabel(fav.itemType)))
  return Array.from(categories)
}

// Set favorite filter
const setFavoriteFilter = (category: string) => {
  favoriteFilter.value = category
}

// Get icon for item type
const getItemTypeIcon = (itemType: string) => {
  const iconMap: Record<string, string> = {
    'attraction': 'mdi:map-marker',
    'event': 'mdi:calendar',
    'excursion': 'mdi:map-marker-path',
    'restaurant': 'mdi:food',
    'hotel': 'mdi:bed'
  }
  return iconMap[itemType] || 'mdi:map-marker'
}

// View favorite item
const viewFavorite = (_favorite: FavoriteItem) => {
  // Navigate to the appropriate page based on item type
  // const routeMap: Record<string, string> = {
  //   'attraction': '/attraction',
  //   'event': '/event',
  //   'excursion': '/excursion',
  //   'restaurant': '/restaurant',
  //   'hotel': '/hotel'
  // }
  // const route = routeMap[favorite.itemType] || '/'
  // router.push(`${route}/${favorite.itemId}`)
}

const createNewTrip = () => {
  // Navigate to trip creation page
  console.log('Creating new trip')
}

const importTrip = () => {
  console.log('Importing trip')
}



const saveProfile = () => {
  console.log('Saving profile:', profileForm.value)
  // Update user profile in auth store
}

const changePassword = () => {
  // Navigate to change password page
  console.log('Changing password')
}

const loadUserFavorites = () => {
  if (authStore.user?.id) {
    userFavorites.value = getUserFavorites(authStore.user.id)
  }
}

const loadUserReservations = () => {
  if (authStore.user?.id) {
    userReservations.value = getReservationsByUser(authStore.user.id)
  }
}

const loadUserTrips = () => {
  if (authStore.user?.id) {
    userTrips.value = getUserTrips(authStore.user.id)
  }
}

const loadUserComments = () => {
  if (authStore.user?.id) {
    userComments.value = getComments().filter(comment => comment.userId === authStore.user?.id)
  }
}

const loadUserStats = () => {
  if (authStore.user?.id) {
    userStats.value = getUserStats(authStore.user.id)
  }
}

const loadUserData = () => {
  loadUserFavorites()
  loadUserReservations()
  loadUserTrips()
  loadUserComments()
  loadUserStats()
}

const loadProfileData = () => {
  if (authStore.user) {
    profileForm.value.name = authStore.user.name
    profileForm.value.email = authStore.user.email || ''
    profileForm.value.mobile = authStore.user.mobile
  }
}

// Initialize data
onMounted(() => {
  loadUserData()
  loadProfileData()
  
  // Update badges
  userTabs.value[0].badge = userFavorites.value.length > 0 ? userFavorites.value.length.toString() : null
  userTabs.value[1].badge = userReservations.value.length > 0 ? userReservations.value.length.toString() : null
})
</script>

<style scoped>
.user-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f5f2 0%, #e8e5e2 50%, #f0ede8 100%);
}

.dashboard-page-header {
  background: linear-gradient(135deg, #1a3a6b 0%, #2c5282 100%);
  color: white;
  border-bottom: none;
  margin-bottom: 2rem;
  box-shadow: 0 8px 25px rgba(26, 58, 107, 0.15);
  padding-top: calc(80px + 2rem);
  position: relative;
}

.dashboard-page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  transition: color 0.3s ease;
}

.breadcrumb-item:hover {
  color: white;
}

.breadcrumb-separator {
  color: rgba(255, 255, 255, 0.6);
}

.breadcrumb-current {
  color: white;
  font-weight: 500;
}

.dashboard-welcome {
  text-align: center;
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dashboard-subtitle {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.dashboard-nav {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-bottom: none;
  padding: 0;
  display: flex;
  gap: 0;
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.dashboard-nav-btn {
  background: none;
  border: none;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  color: #6b7280;
  font-weight: 600;
  border-radius: 20px 20px 0 0;
  position: relative;
}

.dashboard-nav-btn:hover {
  color: #1a3a6b;
  background: rgba(26, 58, 107, 0.08);
  transform: translateY(-2px);
}

.dashboard-nav-btn.active {
  color: #1a3a6b;
  background: linear-gradient(135deg, rgba(26, 58, 107, 0.1) 0%, rgba(44, 82, 130, 0.1) 100%);
  border-bottom-color: #1a3a6b;
  box-shadow: 0 4px 15px rgba(26, 58, 107, 0.2);
}

.dashboard-nav-btn:first-child {
  border-radius: 20px 0 0 0;
}

.dashboard-nav-btn:last-child {
  border-radius: 0 20px 0 0;
}

.badge {
  background: #dc2626;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-top: none;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  min-height: 600px;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

/* Dashboard Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #1a3a6b 0%, #2c5282 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* Quick Actions */
.quick-actions-section {
  margin-bottom: 2rem;
}

.quick-actions-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(26, 58, 107, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  color: #1f2937;
  font-weight: 500;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.quick-action-btn:hover {
  background: rgba(26, 58, 107, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(26, 58, 107, 0.15);
  border-color: rgba(26, 58, 107, 0.2);
}

.quick-action-btn .icon {
  font-size: 1.25rem;
  color: #1a3a6b;
}

/* Enhanced Stats */
.stat-progress {
  margin-top: 0.75rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(26, 58, 107, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1a3a6b, #2c5282);
  border-radius: 3px;
  transition: width 0.6s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.trend-icon {
  font-size: 0.875rem;
  color: #10b981;
}

.trend-text {
  font-size: 0.75rem;
  color: #10b981;
  font-weight: 500;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.badge-icon {
  font-size: 0.875rem;
  color: #10b981;
}

.badge-text {
  font-size: 0.75rem;
  color: #10b981;
  font-weight: 500;
}

.stat-categories {
  margin-top: 0.5rem;
}

.category-count {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

/* Enhanced Empty States */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  min-height: 400px;
}

.empty-illustration {
  position: relative;
  margin-bottom: 2rem;
}

.empty-icon {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-decoration {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  width: 1rem;
  height: 1rem;
  background: linear-gradient(135deg, #1a3a6b, #2c5282);
  border-radius: 50%;
  opacity: 0.6;
}

.empty-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.75rem;
}

.empty-content p {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 2rem;
  max-width: 400px;
  line-height: 1.6;
}

.empty-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.explore-btn.primary {
  background: linear-gradient(135deg, #1a3a6b 0%, #2c5282 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(26, 58, 107, 0.3);
}

.explore-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(26, 58, 107, 0.4);
}

.explore-btn.secondary {
  background: rgba(255, 255, 255, 0.95);
  color: #1a3a6b;
  border: 2px solid rgba(26, 58, 107, 0.2);
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.explore-btn.secondary:hover {
  background: rgba(26, 58, 107, 0.05);
  border-color: rgba(26, 58, 107, 0.3);
  transform: translateY(-2px);
}

/* Category Filter */
.category-filter {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(26, 58, 107, 0.2);
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1a3a6b;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.filter-btn:hover {
  background: rgba(26, 58, 107, 0.05);
  border-color: rgba(26, 58, 107, 0.3);
}

.filter-btn.active {
  background: linear-gradient(135deg, #1a3a6b 0%, #2c5282 100%);
  color: white;
  border-color: transparent;
}

/* Enhanced Favorites */
.favorites-container {
  margin-top: 1rem;
}

.favorite-badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  color: #1a3a6b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.favorite-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(26, 58, 107, 0.1);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(26, 58, 107, 0.05);
  border: 1px solid rgba(26, 58, 107, 0.2);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1a3a6b;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  justify-content: center;
}

.action-btn:hover {
  background: rgba(26, 58, 107, 0.1);
  border-color: rgba(26, 58, 107, 0.3);
  transform: translateY(-1px);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-header {
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.section-header p {
  color: #666;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  margin: 0 0 2rem 0;
}

.explore-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #1a3a6b;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.explore-btn:hover {
  background: #2c5282;
  transform: translateY(-2px);
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.favorite-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.favorite-card:hover {
  transform: translateY(-4px);
}

.favorite-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.favorite-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-favorite-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #dc2626;
  transition: all 0.3s ease;
}

.remove-favorite-btn:hover {
  background: white;
  transform: scale(1.1);
}

.favorite-info {
  padding: 1rem;
}

.favorite-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.favorite-type {
  color: #1a3a6b;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
}

.favorite-date {
  color: #666;
  font-size: 0.875rem;
  margin: 0;
}

.reservations-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.reservation-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.reservation-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
}

.reservation-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.reservation-status.confirmed {
  background: #d1fae5;
  color: #065f46;
}

.reservation-status.cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.reservation-status.completed {
  background: #e0e7ff;
  color: #3730a3;
}

.reservation-status.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.reservation-info {
  flex: 1;
}

.reservation-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 1rem 0;
}

.reservation-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.875rem;
}

.reservation-notes {
  background: #f9fafb;
  padding: 0.75rem;
  border-radius: 6px;
  color: #374151;
  font-size: 0.875rem;
}

.reservation-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.action-btn.primary {
  background: #1a3a6b;
  color: white;
}

.action-btn.primary:hover {
  background: #2c5282;
}

.action-btn.secondary {
  background: #6b7280;
  color: white;
}

.action-btn.secondary:hover {
  background: #4b5563;
}

.action-btn.danger {
  background: #ef4444;
  color: white;
}

.action-btn.danger:hover {
  background: #dc2626;
}

.trip-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.trip-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.trip-card:hover {
  transform: translateY(-4px);
}

.trip-image {
  height: 200px;
  overflow: hidden;
}

.trip-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.trip-info {
  padding: 1.5rem;
}

.trip-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 1rem 0;
}

.trip-meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.trip-duration,
.trip-distance,
.trip-difficulty {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.875rem;
}

.trip-stops {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1a3a6b;
  font-weight: 500;
  margin-bottom: 1rem;
}

.trip-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0 1.5rem 1.5rem;
}

.profile-form {
  max-width: 600px;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 1rem 0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #1a3a6b;
  box-shadow: 0 0 0 3px rgba(26, 58, 107, 0.1);
}

.form-input:disabled {
  background: #f9fafb;
  color: #6b7280;
}

.notification-settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: #374151;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .dashboard-page-header {
    padding-top: calc(80px + 1rem);
  }
  
  .dashboard-page-content {
    padding: 1rem;
  }
  
  .breadcrumb {
    margin-bottom: 1rem;
    font-size: 0.75rem;
  }
  
  .dashboard-title {
    font-size: 2rem;
  }
  
  .dashboard-nav {
    overflow-x: auto;
    border-radius: 8px 8px 0 0;
  }
  
  .dashboard-nav-btn {
    padding: 0.75rem 1rem;
    white-space: nowrap;
    font-size: 0.875rem;
  }
  
  .dashboard-content {
    padding: 1rem;
    border-radius: 0 0 8px 8px;
  }

  /* Mobile Dashboard Stats */
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .quick-actions-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .quick-action-btn {
    padding: 0.75rem;
    font-size: 0.875rem;
  }

  /* Mobile Enhanced Features */
  .empty-state {
    padding: 2rem 1rem;
    min-height: 300px;
  }

  .empty-icon {
    font-size: 3rem;
  }

  .empty-content h3 {
    font-size: 1.25rem;
  }

  .empty-content p {
    font-size: 0.875rem;
  }

  .empty-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .explore-btn.primary,
  .explore-btn.secondary {
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
  }

  .category-filter {
    gap: 0.375rem;
    margin-bottom: 1.5rem;
  }

  .filter-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }

  .favorite-badge {
    width: 28px;
    height: 28px;
    font-size: 0.75rem;
  }

  .action-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }

  .stat-progress,
  .stat-trend,
  .stat-badge,
  .stat-categories {
    margin-top: 0.375rem;
  }

  .progress-text,
  .trend-text,
  .badge-text,
  .category-count {
    font-size: 0.625rem;
  }
  
  .favorites-grid,
  .trips-grid {
    grid-template-columns: 1fr;
  }
  
  .reservation-card {
    flex-direction: column;
    gap: 1rem;
  }
  
  .reservation-actions {
    flex-direction: row;
    justify-content: flex-end;
  }
  
  .trip-actions,
  .form-actions {
    flex-direction: column;
  }
  
  .trip-meta {
    grid-template-columns: 1fr;
  }
}
</style>
