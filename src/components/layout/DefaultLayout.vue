<template>
  <div class="app-container" :class="{ 'dark-mode': isDarkMode }">
    <PageHeader />
    <main class="main-content">
      <router-view />
    </main>
    <PageFooter />
    
    <!-- Favorites Manager -->
    <FavoritesManager ref="favoritesManager" />
    
    <!-- Theme Toggle Button -->
    <button 
      class="theme-toggle" 
      @click="toggleTheme"
      :title="isDarkMode ? 'Переключить на светлую тему' : 'Переключить на темную тему'"
      aria-label="Переключить тему"
    >
      <Icon :icon="isDarkMode ? 'mdi:weather-sunny' : 'mdi:weather-night'" />
    </button>
    
    <!-- Back to Top Button -->
    <button 
      v-if="showBackToTop" 
      class="back-to-top" 
      @click="scrollToTop"
      aria-label="Вернуться наверх"
    >
      <Icon icon="mdi:arrow-up" />
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import PageHeader from './PageHeader.vue'
import PageFooter from './PageFooter.vue'
import FavoritesManager from './FavoritesManager.vue'

const isDarkMode = ref(false)
const showBackToTop = ref(false)
const favoritesManager = ref(null)

// Load theme preference from localStorage
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
  } else {
    // Check system preference
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme()
  
  // Listen for scroll to show/hide back to top button
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
  applyTheme()
}

const applyTheme = () => {
  document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light')
}

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// Expose favorites manager methods
defineExpose({
  addToFavorites: (item, type) => favoritesManager.value?.addToFavorites(item, type),
  removeFromFavorites: (item) => favoritesManager.value?.removeFromFavorites(item),
  isInFavorites: (item, type) => favoritesManager.value?.isInFavorites(item, type)
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  transition: all 0.3s ease;
}

.main-content {
  flex: 1;
}

.theme-toggle {
  position: fixed;
  bottom: 20px;
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
}

.theme-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.back-to-top {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: var(--secondary-color, #10b981);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 1000;
  opacity: 0;
  transform: translateY(20px);
}

.back-to-top:hover {
  transform: translateY(0) scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.back-to-top:not([style*="display: none"]) {
  opacity: 1;
  transform: translateY(0);
}

/* Dark mode styles */
.dark-mode {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --border-color: #404040;
  --shadow-color: rgba(0, 0, 0, 0.3);
}

/* Light mode styles */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --text-primary: #333333;
  --text-secondary: #666666;
  --border-color: #e5e7eb;
  --shadow-color: rgba(0, 0, 0, 0.1);
}

/* Global theme variables */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #10b981;
  --accent-color: #f59e0b;
  --danger-color: #ef4444;
  --success-color: #22c55e;
  --warning-color: #f59e0b;
  --info-color: #06b6d4;
}

/* Responsive design */
@media (max-width: 768px) {
  .theme-toggle,
  .back-to-top {
    width: 45px;
    height: 45px;
    font-size: 1.1rem;
  }
  
  .back-to-top {
    bottom: 70px;
  }
}
</style>

<style>
/* Global dark mode styles */
[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --border-color: #404040;
  --shadow-color: rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

[data-theme="dark"] .card,
[data-theme="dark"] .modal,
[data-theme="dark"] .panel {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

[data-theme="dark"] input,
[data-theme="dark"] textarea,
[data-theme="dark"] select {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

[data-theme="dark"] .btn {
  background-color: var(--primary-color);
  color: white;
}

[data-theme="dark"] .btn.ghost {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border-color: var(--border-color);
}

/* Smooth transitions for theme switching */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
</style>