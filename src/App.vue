<template>
  <div id="app">
    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    </div>
    
    <!-- Main App Content -->
    <router-view v-slot="{ Component, route }">
      <transition 
        name="page" 
        mode="out-in"
        @before-enter="beforeEnter"
        @enter="enter"
        @leave="leave"
      >
        <component 
          :is="Component" 
          :key="route.path"
          @loading="handleLoading"
        />
      </transition>
    </router-view>
    
    <!-- Global Notifications -->
    <div class="notifications-container">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        class="notification"
        :class="notification.type"
      >
        <Icon :icon="getNotificationIcon(notification.type)" />
        <span>{{ notification.message }}</span>
        <button @click="removeNotification(notification.id)" class="close-notification">
          <Icon icon="mdi:close" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref(false)
const notifications = ref([])

// Loading state management
const handleLoading = (loading) => {
  isLoading.value = loading
}

// Page transition animations
const beforeEnter = (el) => {
  el.style.opacity = '0'
  el.style.transform = 'translateY(20px)'
}

const enter = (el, done) => {
  setTimeout(() => {
    el.style.transition = 'all 0.3s ease'
    el.style.opacity = '1'
    el.style.transform = 'translateY(0)'
    done()
  }, 50)
}

const leave = (el, done) => {
  el.style.transition = 'all 0.3s ease'
  el.style.opacity = '0'
  el.style.transform = 'translateY(-20px)'
  setTimeout(done, 300)
}

// Notification system
const showNotification = (message, type = 'info', duration = 5000) => {
  const id = Date.now()
  const notification = {
    id,
    message,
    type,
    duration
  }
  
  notifications.value.push(notification)
  
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(id)
    }, duration)
  }
}

const removeNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

const getNotificationIcon = (type) => {
  const icons = {
    success: 'mdi:check-circle',
    error: 'mdi:alert-circle',
    warning: 'mdi:alert',
    info: 'mdi:information'
  }
  return icons[type] || icons.info
}

// Global notification methods
const notify = {
  success: (message, duration) => showNotification(message, 'success', duration),
  error: (message, duration) => showNotification(message, 'error', duration),
  warning: (message, duration) => showNotification(message, 'warning', duration),
  info: (message, duration) => showNotification(message, 'info', duration)
}

// Expose notification methods globally
window.notify = notify

// Router loading states
router.beforeEach((to, from, next) => {
  isLoading.value = true
  next()
})

router.afterEach(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 300)
})

onMounted(() => {
  // Initial loading state
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})
</script>

<style>
/* Global styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: var(--text-primary, #333);
  background-color: var(--bg-primary, #fff);
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

[data-theme="dark"] .loading-overlay {
  background: rgba(26, 26, 26, 0.9);
}

.loading-content {
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color, #3b82f6);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Notifications */
.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10001;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 400px;
}

.notification {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: white;
  font-weight: 500;
  animation: slideInRight 0.3s ease;
  max-width: 100%;
}

.notification.success {
  background: var(--success-color, #22c55e);
}

.notification.error {
  background: var(--danger-color, #ef4444);
}

.notification.warning {
  background: var(--warning-color, #f59e0b);
}

.notification.info {
  background: var(--info-color, #06b6d4);
}

.close-notification {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  margin-left: auto;
}

.close-notification:hover {
  background: rgba(255, 255, 255, 0.2);
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .notifications-container {
    left: 20px;
    right: 20px;
    max-width: none;
  }
  
  .notification {
    font-size: 0.875rem;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus styles for accessibility */
*:focus {
  outline: 2px solid var(--primary-color, #3b82f6);
  outline-offset: 2px;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary, #f8f9fa);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color, #e5e7eb);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary, #666);
}

[data-theme="dark"] ::-webkit-scrollbar-track {
  background: var(--bg-secondary, #2d2d2d);
}

[data-theme="dark"] ::-webkit-scrollbar-thumb {
  background: var(--border-color, #404040);
}

[data-theme="dark"] ::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary, #b3b3b3);
}
</style>