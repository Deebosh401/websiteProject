<template>
  <header class="mobile-header">
    <!-- Logo -->
    <PageLogo />
    <Location />

    <!-- Search Bar -->
    <div class="search-container">
      <SearchBar />
    </div>

    <!-- Dropdown Menu -->
    <div class="menu-wrapper" ref="menuWrapper">
      <button @click="toggleMenu" ref="menuButton" class="avatar-button" aria-label="Открыть меню пользователя">
        <img src="/default-avatar.png" alt="User Avatar" class="avatar-icon" />
    </button>

      <ul v-if="showMenu" class="menu-dropdown">
        <li @click="selectItem('Home')">  Главная</li>
        <li @click="selectItem('Categories')">Категории</li>
        <li @click="selectItem('Login')"> Логин</li>
        <li @click="selectItem('Sign Up')"> Регистрация</li>
      </ul>
    </div>
  </header>
</template>

<script setup>
import PageLogo from './components/layout/PageLogo.vue'
import SearchBar from './components/layout/SearchBar.vue'
import Location from './components/layout/Location.vue'
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

const showMenu = ref(false)

function toggleMenu() {
  showMenu.value = !showMenu.value
  nextTick(() => {
  const button = document.querySelector('.avatar-button')
  const dropdown = document.querySelector('.menu-dropdown')

  document.activeElement?.blur()

  if (button && dropdown) {
    const rect = button.getBoundingClientRect()
    const screenWidth = window.innerWidth
    const dropdownWidth = Math.min(screenWidth * 0.66, 320)
    const offset = 8

    dropdown.style.width = `${dropdownWidth}px`
    dropdown.style.top = `${rect.bottom + 20}px`

    let left = rect.left + rect.width / 2 - dropdownWidth / 2

    if (left < offset) {
      left = offset
    } else if (left + dropdownWidth > screenWidth - offset) {
      left = screenWidth - dropdownWidth - offset
    }

dropdown.style.left = `${left}px`
dropdown.style.right = 'auto'

    // Vertical fallback
    const dropdownBottom = rect.bottom + dropdown.offsetHeight + 16
    const viewportHeight = window.innerHeight

    if (dropdownBottom > viewportHeight) {
      dropdown.style.top = `${rect.top - dropdown.offsetHeight - 8}px`
    }
  }
})
}


function selectItem(item) {
  console.log(item)
  showMenu.value = false
}

function handleOutsideClick(event) {
  const dropdown = document.querySelector('.menu-dropdown')
  const button = document.querySelector('.avatar-button')

  if (
    dropdown &&
    !dropdown.contains(event.target) &&
    button &&
    !button.contains(event.target)
  ) {
    showMenu.value = false
  }

}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<style scoped>
.mobile-header {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 9999;
  background-color: #fff;
  padding: 0rem rem;
  box-shadow: 0 7px 10px rgba(0, 0, 0, 0.05);
  height: 77px; 
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  
}

/* Logo */
.mobile-header .logo {
  flex-shrink: 0;
  font-size: 1.75rem;
}

/* Search Bar */
.search-container {
  flex-grow: 1;
}

/* Menu Wrapper */
.menu-wrapper {
  position: relative;
}

.avatar-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  width: 44px;
  height: 44px;
  padding: 0;
  margin: 0 0.75rem;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  transition: box-shadow 0.3s ease, transform 0.2s ease;
  outline: none;
}

.avatar-button:hover {
  box-shadow: 0 0 0 4px rgba(30, 78, 216, 0.1), 0 0 10px rgba(0, 0, 0, 0.08);
  transform: scale(1.04);
}

.avatar-button:active {
  animation: pressPop 180ms ease-in-out;
}

.avatar-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
  border: 1px solid #e5e7eb;
  background-color: transparent;
  transition: transform 0.2s ease;
}

.avatar-button::after {
  content: "";
  position: absolute;
  bottom: -32px;
  left: 50%;
  transform: translateX(-50%);
  background: #1f2937;
  color: white;
  padding: 4px 8px;
  font-size: 0.75rem;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.avatar-button:hover::after {
  opacity: 1;
}

@keyframes pressPop {
  0% { transform: scale(1); }
  50% { transform: scale(0.9); }
  100% { transform: scale(1); }
}

@keyframes slideFadeIn {
  0% {
    transform: translateY(-15px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Dropdown Menu */
.menu-dropdown {
  position: fixed;
  background-color: white;
  border-radius: 10px;
  padding: 0.75rem ;
  width: min(66vw,320px); /* ⬅️ 2/3 of screen */
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 60vh;
  overflow-y: auto;
}

.menu-dropdown li {
  padding: 0.5rem 0.25rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
  transition: background-color 0.25s ease, color 0.25s ease, transform 0.2s ease;
  border-bottom: 2px solid #f0f0f0;
  border-radius: 8px;
  margin: 4px 8px;
}

.menu-dropdown li:last-child {
  border-bottom: none;
}

.menu-dropdown li:hover {
  background-color: #1e4ed8;
  color: #fff;
  transform: translateX(4px);
  box-shadow: 0 2px 10px rgba(30, 78, 216, 0.15);
}

.menu-dropdown li.active {
  background-color: #2563eb;
  color: white;
  font-weight: 500;
}

.menu-dropdown li:last-child {
  border-bottom: none;
}

</style>