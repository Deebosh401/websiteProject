<template>
  <div class="admin-panel">
    <div class="breadcrumb">
      <router-link to="/" class="breadcrumb-link">Главная</router-link>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-current">Админ панель</span>
    </div>

    <div class="stats-card">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon">
            <Icon icon="mdi:account-group" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ totalUsers }}</div>
            <div class="stat-label">Пользователи</div>
            <div class="stat-change positive">+12%</div>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-icon">
            <Icon icon="mdi:map-marker" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ totalAttractions }}</div>
            <div class="stat-label">Достопримечательности</div>
            <div class="stat-change positive">+8%</div>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-icon">
            <Icon icon="mdi:comment-text" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ pendingReviews.length }}</div>
            <div class="stat-label">Отзывы на модерации</div>
            <div class="stat-change negative">+3</div>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-icon">
            <Icon icon="mdi:calendar" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ totalEvents }}</div>
            <div class="stat-label">События</div>
            <div class="stat-change positive">+15%</div>
          </div>
        </div>
      </div>
    </div>

    <div class="admin-tabs">
      <button 
        v-for="tab in adminTabs" 
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <Icon :icon="tab.icon" />
        {{ tab.name }}
        <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
      </button>
    </div>

    <div class="tab-content">
      <div v-if="activeTab === 'moderation'" class="tab-panel">
        <div class="panel-header">
          <h3>Модерация контента</h3>
          <p>Проверьте и одобрите пользовательский контент</p>
        </div>
        
        <div class="moderation-list">
          <div v-for="review in pendingReviews" :key="review.id" class="moderation-item">
            <div class="review-content">
              <div class="review-header">
                <span class="reviewer">{{ review.user }}</span>
                <span class="review-date">{{ formatTime(review.timestamp) }}</span>
              </div>
              <p class="review-text">{{ review.content }}</p>
              <div class="review-meta">
                <span class="attraction">{{ review.attraction }}</span>
                <span class="rating">⭐ {{ review.rating }}/5</span>
              </div>
            </div>
            <div class="moderation-actions">
              <button @click="approveReview(review.id)" class="approve-btn">
                <Icon icon="mdi:check" />
                Одобрить
              </button>
              <button @click="rejectReview(review.id)" class="reject-btn">
                <Icon icon="mdi:close" />
                Отклонить
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'dashboard'" class="tab-panel">
        <div class="panel-header">
          <h3>Административная панель</h3>
          <p>Обзор системы и быстрые действия</p>
        </div>
        
        <div class="dashboard-widgets">
          <div class="widget stats-widget">
            <div class="widget-header">
              <h4>Статистика</h4>
            </div>
            <div class="widget-content">
              <div class="stat-row">
                <div class="stat-item">
                  <Icon icon="mdi:account-group" class="stat-icon" />
                  <div class="stat-info">
                    <span class="stat-number">{{ getSystemStats().totalUsers }}</span>
                    <span class="stat-label">Пользователи</span>
                  </div>
                  <div class="stat-trend">
                    <Icon icon="mdi:trending-up" />
                    <span>+{{ getSystemStats().newUsersToday }}</span>
                  </div>
                </div>
                <div class="stat-item">
                  <Icon icon="mdi:store" class="stat-icon" />
                  <div class="stat-info">
                    <span class="stat-number">{{ getSystemStats().totalBusinesses }}</span>
                    <span class="stat-label">Бизнесы</span>
                  </div>
                  <div class="stat-pending">
                    <Icon icon="mdi:clock" />
                    <span>{{ getSystemStats().pendingBusinesses }}</span>
                  </div>
                </div>
                <div class="stat-item">
                  <Icon icon="mdi:comment-text" class="stat-icon" />
                  <div class="stat-info">
                    <span class="stat-number">{{ getSystemStats().totalComments }}</span>
                    <span class="stat-label">Отзывы</span>
                  </div>
                  <div class="stat-pending">
                    <Icon icon="mdi:shield-alert" />
                    <span>{{ pendingReviews.length }}</span>
                  </div>
                </div>
                <div class="stat-item">
                  <Icon icon="mdi:map-marker" class="stat-icon" />
                  <div class="stat-info">
                    <span class="stat-number">{{ getSystemStats().totalCities }}</span>
                    <span class="stat-label">Города</span>
                  </div>
                  <div class="stat-active">
                    <Icon icon="mdi:check-circle" />
                    <span>{{ getSystemStats().activeCities }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="widget todo-widget">
            <div class="widget-header">
              <h4>Задачи</h4>
              <span class="todo-count">{{ getPendingTasks().length }}</span>
            </div>
            <div class="widget-content">
              <div class="todo-list">
                <div v-for="task in getPendingTasks()" :key="task.id" class="todo-item" @click="handleTask(task)">
                  <div class="todo-icon" :class="task.type">
                    <Icon :icon="task.icon" />
                  </div>
                  <div class="todo-content">
                    <div class="todo-title">{{ task.title }}</div>
                    <div class="todo-subtitle">{{ task.subtitle }}</div>
                  </div>
                  <div class="todo-badge">{{ task.count }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="widget actions-widget">
            <div class="widget-header">
              <h4>Быстрые действия</h4>
            </div>
            <div class="widget-content">
              <div class="actions-grid">
                <button @click="activeTab = 'business-approval'" class="action-btn">
                  <Icon icon="mdi:store-check" />
                  <span>Бизнес</span>
                </button>
                <button @click="activeTab = 'moderation'" class="action-btn">
                  <Icon icon="mdi:shield-check" />
                  <span>Отзывы</span>
                </button>
                <button @click="activeTab = 'city-management'" class="action-btn">
                  <Icon icon="mdi:city" />
                  <span>Города</span>
                </button>
                <button @click="showBulkActions = true" class="action-btn">
                  <Icon icon="mdi:select-multiple" />
                  <span>Массовые</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'business-approval'" class="tab-panel">
        <div class="panel-header">
          <h3>Одобрение бизнеса</h3>
          <p>Проверьте и одобрите регистрации новых бизнесов</p>
        </div>
        
        <div class="business-approval-list">
          <div v-for="business in pendingBusinesses" :key="business.id" class="business-item">
            <div class="business-info">
              <div class="business-header">
                <h4 class="business-name">{{ business.name }}</h4>
                <span class="business-type">{{ business.type }}</span>
              </div>
              <div class="business-details">
                <div class="detail-item">
                  <Icon icon="mdi:map-marker" />
                  <span>{{ business.location }}</span>
                </div>
                <div class="detail-item">
                  <Icon icon="mdi:email" />
                  <span>{{ business.email }}</span>
                </div>
                <div class="detail-item">
                  <Icon icon="mdi:calendar" />
                  <span>Заявка от {{ new Date(business.createdAt).toLocaleDateString('ru-RU') }}</span>
                </div>
              </div>
              <p class="business-description">{{ business.description }}</p>
            </div>
            <div class="business-actions">
              <button @click="approveBusiness(business.id.toString())" class="approve-btn">
                <Icon icon="mdi:check" />
                Одобрить
              </button>
              <button @click="rejectBusiness(business.id.toString())" class="reject-btn">
                <Icon icon="mdi:close" />
                Отклонить
              </button>
              <button @click="viewBusinessDetails(business.id.toString())" class="view-btn">
                <Icon icon="mdi:eye" />
                Подробнее
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'city-management'" class="tab-panel">
        <div class="panel-header">
          <h3>Управление городами</h3>
          <p>Добавляйте новые города и регионы</p>
          <button @click="showAddCity = true" class="action-btn">
            <Icon icon="mdi:plus" />
            Добавить город
          </button>
        </div>
        
        <div class="city-management-grid">
          <div class="cities-list">
            <h4>Существующие города</h4>
            <div class="cities-table">
              <div class="table-header">
                <span>Город</span>
                <span>Регион</span>
                <span>Достопримечательности</span>
                <span>Действия</span>
              </div>
              <div v-for="city in cities" :key="city.id" class="table-row">
                <span class="city-name">{{ city.name }}</span>
                <span class="city-region">{{ city.region }}</span>
                <span class="city-attractions">{{ city.attractions }}</span>
                <div class="city-actions">
                  <button @click="editCity(city.id.toString())" class="edit-btn">
                    <Icon icon="mdi:pencil" />
                  </button>
                  <button @click="deleteCity(city.id.toString())" class="delete-btn">
                    <Icon icon="mdi:delete" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="regions-list">
            <h4>Регионы</h4>
            <div class="regions-table">
              <div class="table-header">
                <span>Регион</span>
                <span>Центр</span>
                <span>Города</span>
                <span>Действия</span>
              </div>
              <div v-for="region in regions" :key="region.id" class="table-row">
                <span class="region-name">{{ region.name }}</span>
                <span class="region-center">{{ region.center }}</span>
                <span class="region-cities">{{ region.cities }}</span>
                <div class="region-actions">
                  <button @click="editRegion(region.id.toString())" class="edit-btn">
                    <Icon icon="mdi:pencil" />
                  </button>
                  <button @click="deleteRegion(region.id.toString())" class="delete-btn">
                    <Icon icon="mdi:delete" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'content'" class="tab-panel">
        <div class="panel-header">
          <h3>Управление контентом</h3>
          <p>Добавьте новые достопримечательности и события</p>
        </div>
        
        <div class="content-actions">
          <button @click="showAddAttraction = true" class="action-btn">
            <Icon icon="mdi:plus" />
            Добавить достопримечательность
          </button>
          <button @click="showAddEvent = true" class="action-btn">
            <Icon icon="mdi:calendar-plus" />
            Добавить событие
          </button>
        </div>
      </div>

      <div v-if="activeTab === 'users'" class="tab-panel">
        <div class="panel-header">
          <h3>Управление пользователями</h3>
          <p>Просмотр и управление пользователями системы</p>
        </div>
        
        <div class="users-list">
          <div v-for="user in users" :key="user.id" class="user-item">
            <div class="user-info">
              <img :src="user.avatar || '/default-avatar.png'" :alt="user.name" class="user-avatar" />
              <div class="user-details">
                <div class="user-name">{{ user.name }}</div>
                <div class="user-role">{{ getUserRoleLabel(user.role) }}</div>
                <div class="user-email">{{ user.email }}</div>
              </div>
            </div>
            <div class="user-actions">
              <button @click="editUser(user.id)" class="edit-btn">
                <Icon icon="mdi:pencil" />
              </button>
              <button @click="deleteUser(user.id)" class="delete-btn">
                <Icon icon="mdi:delete" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'analytics'" class="tab-panel">
        <div class="panel-header">
          <h3>Аналитика</h3>
          <p>Статистика использования платформы</p>
        </div>
        
        <div class="analytics-grid">
          <div class="analytics-card">
            <h4>Популярные достопримечательности</h4>
            <div class="analytics-list">
              <div v-for="attraction in popularAttractions" :key="attraction.id" class="analytics-item">
                <span class="item-name">{{ attraction.name }}</span>
                <span class="item-count">{{ attraction.views }} просмотров</span>
              </div>
            </div>
          </div>
          
          <div class="analytics-card">
            <h4>Активные пользователи</h4>
            <div class="analytics-list">
              <div v-for="user in activeUsers" :key="user.id" class="analytics-item">
                <span class="item-name">{{ user.name }}</span>
                <span class="item-count">{{ user.activity }} действий</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { 
  getCitiesWithAttractionCounts
} from '../../Data'

// State
const activeTab = ref('dashboard')
const showBulkActions = ref(false)
const showAddAttraction = ref(false)
const showAddEvent = ref(false)
const showAddCity = ref(false)

// Admin tabs
const adminTabs = ref([
  { id: 'dashboard', name: 'Обзор', icon: 'mdi:view-dashboard', badge: null },
  { id: 'moderation', name: 'Модерация', icon: 'mdi:shield-check', badge: '3' },
  { id: 'business-approval', name: 'Одобрение бизнеса', icon: 'mdi:store-check', badge: null },
  { id: 'city-management', name: 'Города', icon: 'mdi:city', badge: null },
  { id: 'content', name: 'Контент', icon: 'mdi:plus-circle', badge: null },
  { id: 'users', name: 'Пользователи', icon: 'mdi:account-group', badge: null },
  { id: 'analytics', name: 'Аналитика', icon: 'mdi:chart-line', badge: null }
])

// Mock users data
const mockUsers = ref([
  { id: '1', name: 'Админ Админов', role: 'admin', email: 'admin@example.com', avatar: '/default-avatar.png' },
  { id: '2', name: 'Иван Петров', role: 'user', email: 'ivan@example.com', avatar: '/default-avatar.png' },
  { id: '3', name: 'Мария Сидорова', role: 'guide', email: 'maria@example.com', avatar: '/default-avatar.png' },
  { id: '4', name: 'Алексей Козлов', role: 'business_owner', email: 'alex@example.com', avatar: '/default-avatar.png' }
])

// Computed
const users = computed(() => mockUsers.value)

const totalUsers = computed(() => users.value.length)

const totalAttractions = computed(() => {
  const cities = getCitiesWithAttractionCounts()
  return cities.reduce((total, city) => total + city.attractions, 0)
})

const pendingReviews = computed(() => {
  // Mock pending reviews
  return [
    {
      id: 1,
      user: 'Анна Петрова',
      content: 'Отличное место для семейного отдыха!',
      attraction: 'Замок Кёнигсберг',
      rating: 5,
      timestamp: Date.now() - 3600000
    },
    {
      id: 2,
      user: 'Иван Сидоров',
      content: 'Красивые виды, но дорого',
      attraction: 'Кафедральный собор',
      rating: 3,
      timestamp: Date.now() - 7200000
    },
    {
      id: 3,
      user: 'Мария Козлова',
      content: 'Очень интересная экскурсия',
      attraction: 'Музей янтаря',
      rating: 4,
      timestamp: Date.now() - 10800000
    }
  ]
})

// Enhanced admin functions
const getSystemStats = () => {
  return {
    totalUsers: 1234,
    newUsersToday: 23,
    totalBusinesses: 89,
    pendingBusinesses: 7,
    totalComments: 5678,
    totalCities: 45,
    activeCities: 42
  }
}


const getPendingTasks = () => {
  const tasks = []
  
  if (pendingReviews.value.length > 0) {
    tasks.push({
      id: 'moderate-reviews',
      type: 'warning',
      icon: 'mdi:shield-alert',
      title: 'Модерация отзывов',
      subtitle: 'Требуют проверки',
      count: pendingReviews.value.length
    })
  }
  
  const pendingBusinesses = getSystemStats().pendingBusinesses
  if (pendingBusinesses > 0) {
    tasks.push({
      id: 'approve-business',
      type: 'info',
      icon: 'mdi:store-clock',
      title: 'Одобрение бизнеса',
      subtitle: 'Новые регистрации',
      count: pendingBusinesses
    })
  }
  
  return tasks
}

const handleTask = (task: any) => {
  if (task.id === 'moderate-reviews') {
    activeTab.value = 'moderation'
  } else if (task.id === 'approve-business') {
    activeTab.value = 'business-approval'
  }
}

const totalEvents = computed(() => {
  // Mock total events
  return 24
})

const popularAttractions = computed(() => {
  // Mock popular attractions
  return [
    { id: 1, name: 'Замок Кёнигсберг', views: 1250 },
    { id: 2, name: 'Кафедральный собор', views: 980 },
    { id: 3, name: 'Музей янтаря', views: 750 }
  ]
})

const activeUsers = computed(() => {
  // Mock active users
  return [
    { id: 1, name: 'Анна Петрова', activity: 45 },
    { id: 2, name: 'Иван Сидоров', activity: 32 },
    { id: 3, name: 'Мария Козлова', activity: 28 }
  ]
})

// Mock pending businesses
const pendingBusinesses = computed(() => {
  return [
    {
      id: 1,
      name: 'Ресторан "Золотая рыбка"',
      type: 'Ресторан',
      location: 'Калининград, ул. Ленина, 15',
      email: 'restaurant@example.com',
      description: 'Традиционная русская кухня с современным подходом',
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Отель "Балтика"',
      type: 'Отель',
      location: 'Калининград, пр. Мира, 45',
      email: 'hotel@example.com',
      description: 'Комфортабельный отель в центре города',
      createdAt: new Date().toISOString()
    }
  ]
})

// Mock cities data
const cities = computed(() => {
  const citiesData = getCitiesWithAttractionCounts()
  return citiesData.map((city, index) => ({
    id: index + 1,
    name: city.name,
    region: 'Калининградская область',
    attractions: city.attractions
  }))
})

// Mock regions data
const regions = computed(() => {
  return [
    { id: 1, name: 'Калининградская область', center: 'Калининград', cities: 15 },
    { id: 2, name: 'Московская область', center: 'Москва', cities: 8 },
    { id: 3, name: 'Ленинградская область', center: 'Санкт-Петербург', cities: 12 }
  ]
})

// Methods
const getUserRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    admin: 'Администратор',
    user: 'Пользователь',
    guide: 'Гид',
    business_owner: 'Владелец бизнеса'
  }
  return labels[role] || 'Пользователь'
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const approveReview = (reviewId: number) => {
  console.log('Approving review:', reviewId)
  // Implementation for approving review
}

const rejectReview = (reviewId: number) => {
  console.log('Rejecting review:', reviewId)
  // Implementation for rejecting review
}

const editUser = (userId: string) => {
  console.log('Editing user:', userId)
  // Implementation for editing user
}

const deleteUser = (userId: string) => {
  console.log('Deleting user:', userId)
  // Implementation for deleting user
}

// Business approval methods
const approveBusiness = (businessId: string) => {
  console.log('Approve business:', businessId)
  // In real app, call API to approve business
}

const rejectBusiness = (businessId: string) => {
  console.log('Reject business:', businessId)
  // In real app, call API to reject business
}

const viewBusinessDetails = (businessId: string) => {
  console.log('View business details:', businessId)
  // In real app, show business details modal
}

// City management methods
const editCity = (cityId: string) => {
  console.log('Edit city:', cityId)
  // In real app, show edit city modal
}

const deleteCity = (cityId: string) => {
  console.log('Delete city:', cityId)
  // In real app, call API to delete city
}

const editRegion = (regionId: string) => {
  console.log('Edit region:', regionId)
  // In real app, show edit region modal
}

const deleteRegion = (regionId: string) => {
  console.log('Delete region:', regionId)
  // In real app, call API to delete region
}

onMounted(() => {
  // Initialize admin panel
})
</script>

<style scoped>
.admin-panel {
  padding: 2rem;
  padding-top: calc(80px + 2rem);
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f8f5f2 0%, #e8e5e2 50%, #f0ede8 100%);
  min-height: calc(100vh - 80px);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  font-size: 0.875rem;
  color: #666;
  background: rgba(255, 255, 255, 0.8);
  padding: 0.75rem 1rem;
  border-radius: 12px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.breadcrumb-link {
  color: #1a3a6b;
  text-decoration: none;
  transition: color 0.3s ease;
  font-weight: 500;
}

.breadcrumb-link:hover {
  color: #2c5282;
}

.breadcrumb-separator {
  color: #d1d5db;
}

.breadcrumb-current {
  color: #374151;
  font-weight: 600;
}

.stats-card {
  background: linear-gradient(135deg, #1a3a6b 0%, #2c5282 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 25px rgba(26, 58, 107, 0.15);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.25rem;
}

.stat-change {
  font-size: 0.75rem;
  font-weight: 600;
}

.stat-change.positive {
  color: #10b981;
}

.stat-change.negative {
  color: #ef4444;
}

.admin-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 0.5rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s ease;
  color: #666;
  font-weight: 600;
  position: relative;
  flex: 1;
  justify-content: center;
}

.tab-btn:hover {
  background: rgba(26, 58, 107, 0.08);
  color: #1a3a6b;
  transform: translateY(-2px);
}

.tab-btn.active {
  background: linear-gradient(135deg, #1a3a6b 0%, #2c5282 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(26, 58, 107, 0.3);
}

.tab-badge {
  background: #dc2626;
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 600;
}

.tab-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.tab-panel {
  padding: 2rem;
}

.panel-header {
  margin-bottom: 2rem;
}

.panel-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.panel-header p {
  color: #6b7280;
  font-size: 0.875rem;
}

.moderation-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.moderation-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.review-content {
  flex: 1;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.reviewer {
  font-weight: 600;
  color: #374151;
}

.review-date {
  font-size: 0.875rem;
  color: #6b7280;
}

.review-text {
  color: #4b5563;
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.review-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
}

.attraction {
  color: #1a3a6b;
  font-weight: 500;
}

.rating {
  color: #f59e0b;
  font-weight: 600;
}

.moderation-actions {
  display: flex;
  gap: 0.5rem;
}

.approve-btn, .reject-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.approve-btn {
  background: #10b981;
  color: white;
}

.approve-btn:hover {
  background: #059669;
}

.reject-btn {
  background: #ef4444;
  color: white;
}

.reject-btn:hover {
  background: #dc2626;
}

.content-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: #1a3a6b;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.action-btn:hover {
  background: #2c5282;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.user-role {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.user-email {
  font-size: 0.875rem;
  color: #9ca3af;
}

.user-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-btn, .delete-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn {
  background: #3b82f6;
  color: white;
}

.edit-btn:hover {
  background: #2563eb;
}

.delete-btn {
  background: #ef4444;
  color: white;
}

.delete-btn:hover {
  background: #dc2626;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.analytics-card {
  background: #f9fafb;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.analytics-card h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.analytics-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.analytics-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.item-name {
  font-weight: 500;
  color: #374151;
}

.item-count {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Dashboard Widgets */
.dashboard-widgets {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

.widget {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: rgba(26, 58, 107, 0.05);
  border-bottom: 1px solid rgba(26, 58, 107, 0.1);
}

.widget-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.todo-count {
  background: linear-gradient(135deg, #1a3a6b, #2c5282);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.widget-content {
  padding: 1.25rem;
}

/* Stats Widget */
.stats-widget {
  grid-column: 1;
}

.stat-row {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(226, 232, 240, 0.5);
}

.stat-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #1a3a6b, #2c5282);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  color: white;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-number {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 0.125rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-trend,
.stat-pending,
.stat-active {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.stat-trend {
  color: #10b981;
}

.stat-pending {
  color: #f59e0b;
}

.stat-active {
  color: #10b981;
}

/* Todo Widget */
.todo-widget {
  grid-column: 2;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(226, 232, 240, 0.5);
  cursor: pointer;
  transition: all 0.2s ease;
}

.todo-item:hover {
  background: rgba(26, 58, 107, 0.05);
  border-color: rgba(26, 58, 107, 0.2);
  transform: translateY(-1px);
}

.todo-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.todo-icon.info {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.todo-icon.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.todo-content {
  flex: 1;
  min-width: 0;
}

.todo-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 0.125rem;
}

.todo-subtitle {
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1;
}

.todo-badge {
  background: linear-gradient(135deg, #1a3a6b, #2c5282);
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  min-width: 20px;
  text-align: center;
}

/* Actions Widget */
.actions-widget {
  grid-column: 1 / -1;
  margin-top: 1rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0.75rem;
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.5);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #1f2937;
  font-weight: 500;
}

.action-btn:hover {
  background: rgba(26, 58, 107, 0.05);
  border-color: rgba(26, 58, 107, 0.2);
  transform: translateY(-2px);
}

.action-btn .icon {
  font-size: 1.25rem;
  color: #1a3a6b;
}

.action-btn span {
  font-size: 0.75rem;
  text-align: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .admin-panel {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .stat-item {
    padding: 1rem;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .admin-tabs {
    flex-wrap: wrap;
  }
  
  .tab-btn {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
  
  .moderation-item {
    flex-direction: column;
    gap: 1rem;
  }
  
  .moderation-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .content-actions {
    flex-direction: column;
  }
  
  .user-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .user-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .analytics-grid {
    grid-template-columns: 1fr;
  }

  /* Mobile Widget Layout */
  .dashboard-widgets {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .stats-widget,
  .todo-widget,
  .actions-widget {
    grid-column: 1;
  }

  .actions-widget {
    margin-top: 0.75rem;
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .widget-content {
    padding: 1rem;
  }

  .stat-item {
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .stat-icon {
    width: 28px;
    height: 28px;
    font-size: 0.75rem;
  }

  .stat-number {
    font-size: 1rem;
  }

  .stat-label {
    font-size: 0.625rem;
  }

  .todo-item {
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .todo-icon {
    width: 24px;
    height: 24px;
    font-size: 0.625rem;
  }

  .todo-title {
    font-size: 0.75rem;
  }

  .todo-subtitle {
    font-size: 0.625rem;
  }

  .todo-badge {
    font-size: 0.5rem;
    padding: 0.125rem 0.375rem;
  }

  .action-btn {
    padding: 0.75rem 0.5rem;
    gap: 0.375rem;
  }

  .action-btn .icon {
    font-size: 1rem;
  }

  .action-btn span {
    font-size: 0.625rem;
  }
}

@media (max-width: 480px) {
  .stats-card {
    padding: 1.5rem;
  }
  
  .tab-panel {
    padding: 1rem;
  }
  
  .panel-header h3 {
    font-size: 1.25rem;
  }
}

/* Dashboard Styles */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.dashboard-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.dashboard-card h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(26, 58, 107, 0.05);
  border: 1px solid rgba(26, 58, 107, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  color: #1f2937;
  font-weight: 500;
}

.quick-action-btn:hover {
  background: rgba(26, 58, 107, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(26, 58, 107, 0.15);
}

.quick-action-btn .badge {
  background: #dc2626;
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 600;
  margin-left: auto;
}

.system-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: #6b7280;
}

.info-value {
  font-weight: 600;
  color: #1f2937;
}

.status-online {
  color: #10b981 !important;
}

/* Business Approval Styles */
.business-approval-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.business-item {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
}

.business-info {
  flex: 1;
}

.business-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.business-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.business-type {
  background: rgba(26, 58, 107, 0.1);
  color: #1a3a6b;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.business-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.business-description {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

.business-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 150px;
}

.view-btn {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.view-btn:hover {
  background: rgba(59, 130, 246, 0.2);
}

/* City Management Styles */
.city-management-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.cities-list,
.regions-list {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.cities-list h4,
.regions-list h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.cities-table,
.regions-table {
  display: flex;
  flex-direction: column;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(26, 58, 107, 0.05);
  border-radius: 8px;
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 1rem;
  padding: 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  align-items: center;
}

.table-row:last-child {
  border-bottom: none;
}

.city-name,
.region-name {
  font-weight: 500;
  color: #1f2937;
}

.city-region,
.region-center {
  color: #6b7280;
  font-size: 0.875rem;
}

.city-attractions,
.region-cities {
  color: #6b7280;
  font-size: 0.875rem;
  text-align: center;
}

.city-actions,
.region-actions {
  display: flex;
  gap: 0.5rem;
}

/* Mobile Responsive Updates */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .business-item {
    flex-direction: column;
    gap: 1rem;
  }

  .business-actions {
    width: 100%;
    flex-direction: row;
  }

  .city-management-grid {
    grid-template-columns: 1fr;
  }

  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .city-actions,
  .region-actions {
    justify-content: flex-start;
  }
}
</style>