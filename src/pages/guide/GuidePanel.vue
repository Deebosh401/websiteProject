<template>
  <div class="guide-panel">
    <div class="panel-page-header">
      <div class="panel-page-content">
        <nav class="breadcrumb">
          <router-link to="/" class="breadcrumb-item">
            <Icon icon="mdi:home" />
            Главная
          </router-link>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">Панель гида</span>
        </nav>
        
        <div class="panel-welcome">
          <h1 class="panel-title">Панель гида</h1>
          <p class="panel-subtitle">Добро пожаловать, {{ authStore.userDisplayName }}!</p>
        </div>
      </div>
    </div>

    <div class="panel-nav">
      <button 
        v-for="tab in guideTabs" 
        :key="tab.id"
        :class="['panel-nav-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <Icon :icon="tab.icon" />
        <span>{{ tab.name }}</span>
        <span v-if="tab.badge" class="badge">{{ tab.badge }}</span>
      </button>
    </div>

    <div class="panel-content">
      <div v-if="activeTab === 'reservations'" class="tab-content">
        <div class="section-header">
          <h2>Управление бронированиями</h2>
          <p>Подтверждайте и управляйте бронированиями ваших услуг</p>
        </div>

        <div class="reservation-filters">
          <select v-model="reservationFilter" class="filter-select">
            <option value="all">Все бронирования</option>
            <option value="pending">Ожидают подтверждения</option>
            <option value="confirmed">Подтверждённые</option>
            <option value="completed">Завершённые</option>
            <option value="cancelled">Отменённые</option>
          </select>
          <input 
            v-model="reservationSearch" 
            type="text" 
            placeholder="Поиск по клиенту..." 
            class="search-input"
          />
        </div>

        <div v-if="filteredReservations.length === 0" class="empty-state">
          <Icon icon="mdi:calendar-outline" class="empty-icon" />
          <h3>Нет бронирований</h3>
          <p>Пока нет бронирований по выбранному фильтру</p>
        </div>

        <div v-else class="reservations-list">
          <div v-for="reservation in filteredReservations" :key="reservation.id" class="reservation-card">
            <div class="reservation-header">
              <div class="reservation-status" :class="reservation.status">
                <Icon :icon="getStatusIcon(reservation.status)" />
                <span>{{ getStatusLabel(reservation.status) }}</span>
              </div>
              <div class="reservation-date">
                {{ formatDate(reservation.date) }} в {{ reservation.time }}
              </div>
            </div>
            
            <div class="reservation-info">
              <h3 class="reservation-title">{{ reservation.serviceName }}</h3>
              <div class="client-info">
                <div class="client-name">
                  <Icon icon="mdi:account" />
                  <span>{{ reservation.userName }}</span>
                </div>
                <div class="client-contact">
                  <Icon icon="mdi:phone" />
                  <a :href="`tel:${reservation.userMobile}`">{{ reservation.userMobile }}</a>
                </div>
                <div v-if="reservation.userEmail" class="client-contact">
                  <Icon icon="mdi:email" />
                  <a :href="`mailto:${reservation.userEmail}`">{{ reservation.userEmail }}</a>
                </div>
              </div>
              
              <div class="reservation-details">
                <div class="detail-item">
                  <Icon icon="mdi:account-group" />
                  <span>{{ reservation.participants }} человек</span>
                </div>
                <div class="detail-item">
                  <Icon icon="mdi:clock" />
                  <span>{{ reservation.duration }} минут</span>
                </div>
                <div v-if="reservation.totalPrice" class="detail-item">
                  <Icon icon="mdi:currency-rub" />
                  <span>{{ reservation.totalPrice }} ₽</span>
                </div>
              </div>
              
              <div v-if="reservation.notes" class="reservation-notes">
                <strong>Примечания клиента:</strong> {{ reservation.notes }}
              </div>
              
              <div v-if="reservation.specialRequests" class="reservation-requests">
                <strong>Особые пожелания:</strong> {{ reservation.specialRequests }}
              </div>
            </div>
            
            <div class="reservation-actions">
              <div v-if="reservation.status === 'pending'" class="pending-actions">
                <button @click="confirmReservation(reservation.id)" class="action-btn success">
                  <Icon icon="mdi:check" />
                  Подтвердить
                </button>
                <button @click="rejectReservation(reservation.id)" class="action-btn danger">
                  <Icon icon="mdi:close" />
                  Отклонить
                </button>
              </div>
              
              <div v-if="reservation.status === 'confirmed'" class="confirmed-actions">
                <button @click="markCompleted(reservation.id)" class="action-btn primary">
                  <Icon icon="mdi:check-circle" />
                  Завершить
                </button>
                <button @click="sendNotification(reservation.id)" class="action-btn secondary">
                  <Icon icon="mdi:bell" />
                  Уведомить
                </button>
              </div>
              
              <button @click="viewReservationDetails(reservation.id)" class="action-btn outline">
                <Icon icon="mdi:eye" />
                Подробнее
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'services'" class="tab-content">
        <div class="section-header">
          <h2>Мои услуги</h2>
          <p>Управление вашими экскурсионными услугами</p>
        </div>

        <div class="service-actions">
          <button @click="createNewService" class="action-btn primary">
            <Icon icon="mdi:plus" />
            Добавить услугу
          </button>
        </div>

        <div v-if="guideServices.length === 0" class="empty-state">
          <Icon icon="mdi:map-marker-path" class="empty-icon" />
          <h3>Нет услуг</h3>
          <p>Создайте свою первую экскурсионную услугу</p>
        </div>

        <div v-else class="services-grid">
          <div v-for="service in guideServices" :key="service.id" class="service-card">
            <div class="service-header">
              <h3 class="service-title">{{ service.title }}</h3>
              <div class="service-status" :class="{ active: service.isActive }">
                {{ service.isActive ? 'Активна' : 'Неактивна' }}
              </div>
            </div>
            
            <div class="service-info">
              <p class="service-description">{{ service.description }}</p>
              
              <div class="service-details">
                <div class="detail-item">
                  <Icon icon="mdi:clock" />
                  <span>{{ service.duration }} минут</span>
                </div>
                <div class="detail-item">
                  <Icon icon="mdi:account-group" />
                  <span>до {{ service.maxParticipants }} человек</span>
                </div>
                <div class="detail-item">
                  <Icon icon="mdi:currency-rub" />
                  <span>{{ service.price }} ₽</span>
                </div>
                <div class="detail-item">
                  <Icon icon="mdi:map-marker" />
                  <span>{{ service.location }}</span>
                </div>
              </div>
              
              <div class="service-category">
                <Icon icon="mdi:tag" />
                <span>{{ service.category }}</span>
              </div>
            </div>
            
            <div class="service-actions">
              <button @click="editService(service.id)" class="action-btn secondary">
                <Icon icon="mdi:pencil" />
                Редактировать
              </button>
              <button @click="toggleServiceStatus(service.id)" class="action-btn" :class="service.isActive ? 'danger' : 'success'">
                <Icon :icon="service.isActive ? 'mdi:pause' : 'mdi:play'" />
                {{ service.isActive ? 'Приостановить' : 'Активировать' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'notifications'" class="tab-content">
        <div class="section-header">
          <h2>Уведомления и объявления</h2>
          <p>Отправляйте уведомления клиентам о важных изменениях</p>
        </div>

        <div class="notification-actions">
          <button @click="sendWeatherAlert" class="action-btn warning">
            <Icon icon="mdi:weather-cloudy" />
            Погодное предупреждение
          </button>
          <button @click="sendHealthAlert" class="action-btn danger">
            <Icon icon="mdi:medical-bag" />
            Уведомление о болезни
          </button>
          <button @click="sendGeneralNotification" class="action-btn secondary">
            <Icon icon="mdi:bell" />
            Общее уведомление
          </button>
        </div>

        <div class="notifications-list">
          <div v-for="notification in notifications" :key="notification.id" class="notification-card">
            <div class="notification-header">
              <div class="notification-type" :class="notification.type">
                <Icon :icon="getNotificationIcon(notification.type)" />
                <span>{{ getNotificationTypeLabel(notification.type) }}</span>
              </div>
              <div class="notification-date">
                {{ formatDate(notification.createdAt) }}
              </div>
            </div>
            
            <div class="notification-content">
              <h3 class="notification-title">{{ notification.title }}</h3>
              <p class="notification-message">{{ notification.message }}</p>
              
              <div class="notification-recipients">
                <strong>Получатели:</strong> {{ notification.recipientCount }} клиентов
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'analytics'" class="tab-content">
        <div class="section-header">
          <h2>Аналитика</h2>
          <p>Статистика вашей деятельности и доходов</p>
        </div>

        <div class="analytics-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <Icon icon="mdi:calendar-check" />
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ guideStats.completedReservations }}</div>
              <div class="stat-label">Завершённых экскурсий</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <Icon icon="mdi:currency-rub" />
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ guideStats.totalEarnings }} ₽</div>
              <div class="stat-label">Общий доход</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <Icon icon="mdi:star" />
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ guideStats.averageRating }}</div>
              <div class="stat-label">Средняя оценка</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <Icon icon="mdi:account-group" />
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ guideStats.totalClients }}</div>
              <div class="stat-label">Клиентов</div>
            </div>
          </div>
        </div>

        <div class="chart-section">
          <h3>Доходы по месяцам</h3>
          <div class="chart-placeholder">
            <Icon icon="mdi:chart-line" class="chart-icon" />
            <p>График доходов</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { 
  getReservationsByProvider,
  updateReservationStatus,
  getGuideServices,
  type Reservation,
  type GuideService
} from '../../Data'
import { Icon } from '@iconify/vue'

const authStore = useAuthStore()

// Tab management
const activeTab = ref('reservations')
const guideTabs = ref([
  { id: 'reservations', name: 'Бронирования', icon: 'mdi:calendar', badge: null as string | null },
  { id: 'services', name: 'Мои услуги', icon: 'mdi:map-marker-path', badge: null as string | null },
  { id: 'notifications', name: 'Уведомления', icon: 'mdi:bell', badge: null as string | null },
  { id: 'analytics', name: 'Аналитика', icon: 'mdi:chart-line', badge: null as string | null }
])

// Data
const reservations = ref<Reservation[]>([])
const guideServices = ref<GuideService[]>([])
const notifications = ref<any[]>([])

// Filters
const reservationFilter = ref('all')
const reservationSearch = ref('')

// Statistics
const guideStats = ref({
  completedReservations: 45,
  totalEarnings: 125000,
  averageRating: 4.8,
  totalClients: 32
})

// Computed
const filteredReservations = computed(() => {
  let filtered = reservations.value

  if (reservationFilter.value !== 'all') {
    filtered = filtered.filter(r => r.status === reservationFilter.value)
  }

  if (reservationSearch.value) {
    const search = reservationSearch.value.toLowerCase()
    filtered = filtered.filter(r => 
      r.userName.toLowerCase().includes(search) ||
      r.serviceName.toLowerCase().includes(search)
    )
  }

  return filtered
})

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU')
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

const getNotificationIcon = (type: string) => {
  const icons: Record<string, string> = {
    weather: 'mdi:weather-cloudy',
    health: 'mdi:medical-bag',
    general: 'mdi:bell'
  }
  return icons[type] || 'mdi:bell'
}

const getNotificationTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    weather: 'Погодное предупреждение',
    health: 'Уведомление о болезни',
    general: 'Общее уведомление'
  }
  return labels[type] || type
}

const confirmReservation = (reservationId: string) => {
  updateReservationStatus(reservationId, 'confirmed')
  loadReservations()
}

const rejectReservation = (reservationId: string) => {
  const reason = prompt('Причина отклонения:')
  if (reason) {
    updateReservationStatus(reservationId, 'rejected', reason)
    loadReservations()
  }
}

const markCompleted = (reservationId: string) => {
  updateReservationStatus(reservationId, 'completed')
  loadReservations()
}

const sendNotification = (reservationId: string) => {
  console.log('Sending notification for reservation:', reservationId)
}

const viewReservationDetails = (reservationId: string) => {
  console.log('Viewing reservation details:', reservationId)
}

const createNewService = () => {
  console.log('Creating new service')
}

const editService = (serviceId: string) => {
  console.log('Editing service:', serviceId)
}

const toggleServiceStatus = (serviceId: string) => {
  console.log('Toggling service status:', serviceId)
}

const sendWeatherAlert = () => {
  console.log('Sending weather alert')
}

const sendHealthAlert = () => {
  console.log('Sending health alert')
}

const sendGeneralNotification = () => {
  console.log('Sending general notification')
}

const loadReservations = () => {
  if (authStore.user?.id) {
    reservations.value = getReservationsByProvider(authStore.user.id)
  }
}

const loadGuideServices = () => {
  if (authStore.user?.id) {
    guideServices.value = getGuideServices(authStore.user.id)
  }
}

const loadNotifications = () => {
  // Mock notifications
  notifications.value = [
    {
      id: '1',
      type: 'weather',
      title: 'Погодное предупреждение',
      message: 'Из-за плохой погоды экскурсия может быть отменена',
      recipientCount: 5,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      type: 'general',
      title: 'Обновление маршрута',
      message: 'Маршрут экскурсии был обновлён',
      recipientCount: 3,
      createdAt: new Date().toISOString()
    }
  ]
}

// Initialize data
onMounted(() => {
  loadReservations()
  loadGuideServices()
  loadNotifications()
  
  // Update badges
  const pendingCount = reservations.value.filter(r => r.status === 'pending').length
  guideTabs.value[0].badge = pendingCount > 0 ? pendingCount.toString() : null
})
</script>

<style scoped>
.guide-panel {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f5f2 0%, #e8e5e2 50%, #f0ede8 100%);
}

.panel-page-header {
  background: linear-gradient(135deg, #1a3a6b 0%, #2c5282 100%);
  color: white;
  border-bottom: none;
  margin-bottom: 2rem;
  box-shadow: 0 8px 25px rgba(26, 58, 107, 0.15);
  padding-top: calc(80px + 2rem);
  position: relative;
}

.panel-page-content {
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
  background: rgba(255, 255, 255, 0.1);
  padding: 0.75rem 1rem;
  border-radius: 12px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  transition: color 0.3s ease;
  font-weight: 500;
}

.breadcrumb-item:hover {
  color: white;
}

.breadcrumb-separator {
  color: rgba(255, 255, 255, 0.6);
}

.breadcrumb-current {
  color: white;
  font-weight: 600;
}

.panel-welcome {
  text-align: center;
}

.panel-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.panel-subtitle {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.panel-nav {
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

.panel-nav-btn {
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

.panel-nav-btn:hover {
  color: #1a3a6b;
  background: rgba(26, 58, 107, 0.08);
  transform: translateY(-2px);
}

.panel-nav-btn.active {
  color: #1a3a6b;
  background: linear-gradient(135deg, rgba(26, 58, 107, 0.1) 0%, rgba(44, 82, 130, 0.1) 100%);
  border-bottom-color: #1a3a6b;
  box-shadow: 0 4px 15px rgba(26, 58, 107, 0.2);
}

.panel-nav-btn:first-child {
  border-radius: 20px 0 0 0;
}

.panel-nav-btn:last-child {
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

.panel-content {
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

.reservation-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  min-width: 200px;
}

.search-input {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
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
  border-left: 4px solid #e5e7eb;
}

.reservation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.reservation-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
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

.reservation-date {
  color: #666;
  font-size: 0.875rem;
}

.reservation-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 1rem 0;
}

.client-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.client-name,
.client-contact {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.875rem;
}

.client-contact a {
  color: #1a3a6b;
  text-decoration: none;
}

.client-contact a:hover {
  text-decoration: underline;
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

.reservation-notes,
.reservation-requests {
  background: #f9fafb;
  padding: 0.75rem;
  border-radius: 6px;
  color: #374151;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.reservation-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pending-actions,
.confirmed-actions {
  display: flex;
  gap: 0.5rem;
  flex: 1;
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

.action-btn.success {
  background: #10b981;
  color: white;
}

.action-btn.success:hover {
  background: #059669;
}

.action-btn.danger {
  background: #ef4444;
  color: white;
}

.action-btn.danger:hover {
  background: #dc2626;
}

.action-btn.warning {
  background: #f59e0b;
  color: white;
}

.action-btn.warning:hover {
  background: #d97706;
}

.action-btn.outline {
  background: transparent;
  color: #1a3a6b;
  border: 1px solid #1a3a6b;
}

.action-btn.outline:hover {
  background: #1a3a6b;
  color: white;
}

.service-actions,
.notification-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.service-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  border-left: 4px solid #10b981;
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.service-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.service-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #fee2e2;
  color: #991b1b;
}

.service-status.active {
  background: #d1fae5;
  color: #065f46;
}

.service-description {
  color: #666;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.service-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.service-category {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1a3a6b;
  font-weight: 500;
  margin-bottom: 1rem;
}

.service-actions {
  display: flex;
  gap: 0.5rem;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.notification-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  border-left: 4px solid #f59e0b;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.notification-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #fef3c7;
  color: #92400e;
}

.notification-type.weather {
  background: #dbeafe;
  color: #1e40af;
}

.notification-type.health {
  background: #fee2e2;
  color: #991b1b;
}

.notification-date {
  color: #666;
  font-size: 0.875rem;
}

.notification-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.notification-message {
  color: #666;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.notification-recipients {
  color: #666;
  font-size: 0.875rem;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  background: #1a3a6b;
  color: white;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

.stat-label {
  color: #666;
  font-size: 0.875rem;
}

.chart-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.chart-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 1rem 0;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border-radius: 8px;
  color: #666;
}

.chart-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .panel-page-header {
    padding-top: calc(80px + 1rem);
  }
  
  .panel-page-content {
    padding: 1rem;
  }
  
  .breadcrumb {
    margin-bottom: 1rem;
    font-size: 0.75rem;
  }
  
  .panel-title {
    font-size: 2rem;
  }
  
  .panel-nav {
    overflow-x: auto;
    border-radius: 8px 8px 0 0;
  }
  
  .panel-nav-btn {
    padding: 0.75rem 1rem;
    white-space: nowrap;
    font-size: 0.875rem;
  }
  
  .panel-content {
    padding: 1rem;
    border-radius: 0 0 8px 8px;
  }
  
  .reservation-filters {
    flex-direction: column;
  }
  
  .reservation-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .reservation-actions {
    flex-direction: column;
  }
  
  .pending-actions,
  .confirmed-actions {
    flex-direction: column;
  }
  
  .services-grid {
    grid-template-columns: 1fr;
  }
  
  .service-details {
    grid-template-columns: 1fr;
  }
  
  .service-actions,
  .notification-actions {
    flex-direction: column;
  }
  
  .analytics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
