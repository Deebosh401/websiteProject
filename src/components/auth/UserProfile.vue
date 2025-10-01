<template>
  <div class="user-profile">
    <div v-if="authStore.isAuthenticated" class="authenticated-user">
      <div class="user-info">
        <div class="user-avatar">
          {{ authStore.userDisplayName.charAt(0).toUpperCase() }}
        </div>
        <div class="user-details">
          <div class="user-name">{{ authStore.userDisplayName }}</div>
          <div class="user-mobile">{{ authStore.user?.mobile }}</div>
        </div>
      </div>
      
      <div class="dropdown">
        <button class="dropdown-toggle" @click="toggleDropdown">
          <Icon icon="mdi:chevron-down" :class="{ 'rotated': isDropdownOpen }" />
        </button>
        
        <div v-if="isDropdownOpen" class="dropdown-menu">
          <router-link to="/profile" class="dropdown-item" @click="closeDropdown">
            <Icon icon="mdi:account" />
            <span>Профиль</span>
          </router-link>
          <router-link to="/settings" class="dropdown-item" @click="closeDropdown">
            <Icon icon="mdi:cog" />
            <span>Настройки</span>
          </router-link>
          <hr class="dropdown-divider">
          <button class="dropdown-item logout-btn" @click="handleLogout">
            <Icon icon="mdi:logout" />
            <span>Выйти</span>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="guest-user">
      <router-link to="/auth/login" class="login-btn">
        <Icon icon="mdi:login" />
        <span>Войти</span>
      </router-link>
      <router-link to="/auth/register" class="register-btn">
        <Icon icon="mdi:account-plus" />
        <span>Регистрация</span>
      </router-link>
    </div>

    <div v-if="isDropdownOpen" class="dropdown-overlay" @click="closeDropdown"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// State
const isDropdownOpen = ref(false)

// Methods
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

const handleLogout = async () => {
  await authStore.logout()
  closeDropdown()
  router.push('/')
}
</script>

<style scoped>
.user-profile {
  position: relative;
}

/* Authenticated User Styles */
.authenticated-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.authenticated-user:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
}

.user-mobile {
  color: #6b7280;
  font-size: 0.75rem;
}

.dropdown {
  position: relative;
}

.dropdown-toggle {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.dropdown-toggle:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #374151;
}

.dropdown-toggle .rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 50;
  margin-top: 0.5rem;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #374151;
  text-decoration: none;
  font-size: 0.875rem;
  transition: background-color 0.2s ease;
  width: 100%;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
}

.dropdown-item:hover {
  background-color: #f3f4f6;
}

.dropdown-item.logout-btn {
  color: #dc2626;
}

.dropdown-item.logout-btn:hover {
  background-color: #fef2f2;
}

.dropdown-divider {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 0.25rem 0;
}

.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
}

/* Guest User Styles */
.guest-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.login-btn,
.register-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.login-btn {
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.login-btn:hover {
  background-color: #f9fafb;
  color: #374151;
}

.register-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.register-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .user-info {
    gap: 0.5rem;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
  }
  
  .user-name {
    font-size: 0.8125rem;
  }
  
  .user-mobile {
    font-size: 0.6875rem;
  }
  
  .guest-user {
    gap: 0.5rem;
  }
  
  .login-btn,
  .register-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
  }
}

@media (max-width: 480px) {
  .authenticated-user {
    padding: 0.375rem;
  }
  
  .user-info {
    gap: 0.375rem;
  }
  
  .user-details {
    display: none; /* Hide user details on very small screens */
  }
  
  .guest-user {
    flex-direction: column;
    gap: 0.375rem;
  }
  
  .login-btn,
  .register-btn {
    width: 100%;
    justify-content: center;
    padding: 0.5rem;
  }
}
</style>

