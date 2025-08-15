<template>
  <div class="favorites-manager">
    <!-- Favorites Button -->
    <button 
      class="favorites-toggle"
      @click="toggleFavoritesPanel"
      :class="{ 'active': showFavorites }"
      :title="showFavorites ? 'Закрыть избранное' : 'Открыть избранное'"
      aria-label="Управление избранным"
    >
      <Icon :icon="showFavorites ? 'mdi:heart' : 'mdi:heart-outline'" />
      <span v-if="favoritesCount > 0" class="favorites-count">{{ favoritesCount }}</span>
    </button>

    <!-- Favorites Panel -->
    <div v-if="showFavorites" class="favorites-panel">
      <div class="favorites-header">
        <h3>Избранное</h3>
        <button class="close-btn" @click="toggleFavoritesPanel" aria-label="Закрыть">
          <Icon icon="mdi:close" />
        </button>
      </div>

      <!-- Favorites Tabs -->
      <div class="favorites-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="{ 'active': activeTab === tab.key }"
          class="tab-btn"
        >
          <Icon :icon="tab.icon" />
          {{ tab.label }}
          <span class="tab-count">{{ getTabCount(tab.key) }}</span>
        </button>
      </div>

      <!-- Favorites Content -->
      <div class="favorites-content">
        <!-- Empty State -->
        <div v-if="getTabItems(activeTab).length === 0" class="empty-state">
          <Icon icon="mdi:heart-outline" class="empty-icon" />
          <h4>Нет избранных {{ getTabLabel(activeTab) }}</h4>
          <p>Добавляйте интересные места в избранное, чтобы вернуться к ним позже</p>
        </div>

        <!-- Favorites List -->
        <div v-else class="favorites-list">
          <div 
            v-for="item in getTabItems(activeTab)" 
            :key="item.id"
            class="favorite-item"
          >
            <div class="item-image">
              <img :src="item.image || '/default-avatar.png'" :alt="item.name" />
            </div>
            <div class="item-info">
              <h4>{{ item.name }}</h4>
              <p v-if="item.category">{{ item.category }}</p>
              <p v-if="item.city">{{ item.city }}</p>
              <div class="item-meta">
                <span v-if="item.rating" class="rating">⭐ {{ item.rating.toFixed(1) }}</span>
                <span v-if="item.price !== undefined" class="price">
                  {{ item.price === 0 ? 'Бесплатно' : `${item.price} ₽` }}
                </span>
              </div>
            </div>
            <div class="item-actions">
              <button 
                @click="removeFromFavorites(item)"
                class="remove-btn"
                aria-label="Удалить из избранного"
              >
                <Icon icon="mdi:heart-off" />
              </button>
              <button 
                @click="viewItem(item)"
                class="view-btn"
                aria-label="Просмотреть"
              >
                <Icon icon="mdi:eye" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Favorites Actions -->
      <div class="favorites-actions">
        <button 
          v-if="favoritesCount > 0"
          @click="exportFavorites"
          class="action-btn export-btn"
        >
          <Icon icon="mdi:download" />
          Экспорт
        </button>
        <button 
          v-if="favoritesCount > 0"
          @click="clearAllFavorites"
          class="action-btn clear-btn"
        >
          <Icon icon="mdi:delete" />
          Очистить все
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// State
const showFavorites = ref(false)
const activeTab = ref('attractions')
const favorites = ref({
  attractions: [],
  cities: [],
  guides: [],
  events: []
})

// Tabs configuration
const tabs = [
  { key: 'attractions', label: 'Места', icon: 'mdi:map-marker' },
  { key: 'cities', label: 'Города', icon: 'mdi:city' },
  { key: 'guides', label: 'Гиды', icon: 'mdi:account-tie' },
  { key: 'events', label: 'События', icon: 'mdi:calendar' }
]

// Computed
const favoritesCount = computed(() => {
  return Object.values(favorites.value).reduce((total, items) => total + items.length, 0)
})

// Methods
const toggleFavoritesPanel = () => {
  showFavorites.value = !showFavorites.value
}

const getTabCount = (tabKey) => {
  return favorites.value[tabKey]?.length || 0
}

const getTabItems = (tabKey) => {
  return favorites.value[tabKey] || []
}

const getTabLabel = (tabKey) => {
  const tab = tabs.find(t => t.key === tabKey)
  return tab ? tab.label.toLowerCase() : ''
}

const addToFavorites = (item, type) => {
  if (!favorites.value[type]) {
    favorites.value[type] = []
  }
  
  // Check if already exists
  const exists = favorites.value[type].find(fav => fav.id === item.id)
  if (!exists) {
    favorites.value[type].push(item)
    saveFavorites()
    showNotification('Добавлено в избранное')
  }
}

const removeFromFavorites = (item) => {
  const type = activeTab.value
  favorites.value[type] = favorites.value[type].filter(fav => fav.id !== item.id)
  saveFavorites()
  showNotification('Удалено из избранного')
}

const viewItem = (item) => {
  // Navigate to item detail based on type
  switch (activeTab.value) {
    case 'attractions':
    case 'events':
      router.push({ name: 'event-detail', params: { id: item.id } })
      break
    case 'cities':
      router.push({ name: 'city-detail', params: { name: item.name } })
      break
    case 'guides':
      // Navigate to guide detail (implement when available)
      break
  }
  showFavorites.value = false
}

const clearAllFavorites = () => {
  if (confirm('Вы уверены, что хотите очистить все избранное?')) {
    favorites.value = {
      attractions: [],
      cities: [],
      guides: [],
      events: []
    }
    saveFavorites()
    showNotification('Избранное очищено')
  }
}

const exportFavorites = () => {
  const dataStr = JSON.stringify(favorites.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'favorites.json'
  link.click()
  URL.revokeObjectURL(url)
  showNotification('Избранное экспортировано')
}

const saveFavorites = () => {
  localStorage.setItem('favorites', JSON.stringify(favorites.value))
}

const loadFavorites = () => {
  const saved = localStorage.getItem('favorites')
  if (saved) {
    try {
      favorites.value = JSON.parse(saved)
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }
}

const showNotification = (message) => {
  // Simple notification - could be enhanced with a proper notification system
  const notification = document.createElement('div')
  notification.className = 'favorites-notification'
  notification.textContent = message
  document.body.appendChild(notification)
  
  setTimeout(() => {
    notification.remove()
  }, 3000)
}

// Lifecycle
onMounted(() => {
  loadFavorites()
})

// Expose methods for parent components
defineExpose({
  addToFavorites,
  removeFromFavorites,
  isInFavorites: (item, type) => {
    return favorites.value[type]?.some(fav => fav.id === item.id) || false
  }
})
</script>

<style scoped>
.favorites-manager {
  position: relative;
}

.favorites-toggle {
  position: fixed;
  bottom: 140px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: var(--primary-color, #3b82f6);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 1000;
  position: relative;
}

.favorites-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.favorites-toggle.active {
  background: var(--danger-color, #ef4444);
}

.favorites-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background: var(--accent-color, #f59e0b);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.favorites-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: var(--bg-primary, white);
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  animation: slideInRight 0.3s ease;
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.favorites-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.favorites-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background-color: var(--bg-secondary, #f8f9fa);
}

.favorites-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.tab-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s ease;
  position: relative;
}

.tab-btn.active {
  color: var(--primary-color, #3b82f6);
  background-color: var(--bg-secondary, #f8f9fa);
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--primary-color, #3b82f6);
}

.tab-count {
  font-size: 0.75rem;
  background: var(--accent-color, #f59e0b);
  color: white;
  border-radius: 10px;
  padding: 0.125rem 0.375rem;
  min-width: 20px;
  text-align: center;
}

.favorites-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-secondary, #666);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.favorite-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  background: var(--bg-secondary, #f8f9fa);
  transition: all 0.2s ease;
}

.favorite-item:hover {
  border-color: var(--primary-color, #3b82f6);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.2;
}

.item-info p {
  margin: 0 0 0.125rem 0;
  font-size: 0.75rem;
  color: var(--text-secondary, #666);
  line-height: 1.2;
}

.item-meta {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.rating, .price {
  font-size: 0.75rem;
  font-weight: 500;
}

.rating {
  color: var(--accent-color, #f59e0b);
}

.price {
  color: var(--success-color, #22c55e);
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.remove-btn, .view-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-btn {
  background: var(--danger-color, #ef4444);
  color: white;
}

.remove-btn:hover {
  background: #dc2626;
}

.view-btn {
  background: var(--primary-color, #3b82f6);
  color: white;
}

.view-btn:hover {
  background: #2563eb;
}

.favorites-actions {
  padding: 1rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.export-btn {
  background: var(--success-color, #22c55e);
  color: white;
}

.export-btn:hover {
  background: #16a34a;
}

.clear-btn {
  background: var(--danger-color, #ef4444);
  color: white;
}

.clear-btn:hover {
  background: #dc2626;
}

/* Notification */
.favorites-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: var(--success-color, #22c55e);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  animation: slideInDown 0.3s ease;
}

@keyframes slideInDown {
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .favorites-panel {
    width: 100%;
  }
  
  .favorites-toggle {
    width: 45px;
    height: 45px;
    font-size: 1.1rem;
    bottom: 120px;
  }
  
  .favorites-count {
    width: 18px;
    height: 18px;
    font-size: 11px;
  }
}

/* Dark mode support */
[data-theme="dark"] .favorites-panel {
  background: var(--bg-primary, #1a1a1a);
  border-left: 1px solid var(--border-color, #404040);
}

[data-theme="dark"] .favorite-item {
  background: var(--bg-secondary, #2d2d2d);
  border-color: var(--border-color, #404040);
}

[data-theme="dark"] .tab-btn.active {
  background-color: var(--bg-secondary, #2d2d2d);
}
</style>
