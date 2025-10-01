<template>
  <header class="mobile-header" :class="{ scrolled }">
    <div class="logo-section">
      <PageLogo />
    </div>

    <div class="center-section">
      <Location />
    </div>

    <div class="right-section">
      <div class="search-container">
        <SearchBar />
      </div>

      <button class="lang-toggle" @click="toggleLang" :aria-label="`Change language, current: ${lang.toUpperCase()}`">
        {{ lang.toUpperCase() }}
      </button>

      <div class="menu-wrapper" ref="menuWrapper">
        <button @click="toggleMenu" ref="menuButton" class="avatar-button" aria-label="Открыть меню пользователя" aria-haspopup="menu" :aria-expanded="showMenu">
          <img src="/default-avatar.png" alt="User Avatar" class="avatar-icon" />
        </button>

        <ul v-if="showMenu" class="menu-dropdown">
          <li @click="goToHome">Главная</li>
          <li @click="goToCategories">Категории</li>
          <li @click="openCityConfirm">Сменить город</li>
          <li class="menu-divider"></li>
          <li @click="goToAdmin" class="panel-link admin">
            <Icon icon="mdi:shield-crown" />
            Админ панель
          </li>
          <li @click="goToUser" class="panel-link user">
            <Icon icon="mdi:account" />
            Мой профиль
          </li>
          <li @click="goToGuide" class="panel-link guide">
            <Icon icon="mdi:account-tie" />
            Панель гида
          </li>
          <li @click="goToBusiness" class="panel-link business">
            <Icon icon="mdi:store" />
            Панель бизнеса
          </li>
          <li @click="goToChat" class="panel-link chat">
            <Icon icon="mdi:message" />
            Сообщения
          </li>
          <li class="menu-divider"></li>
          <li @click="goToLogin">Логин</li>
          <li @click="goToRegister">Регистрация</li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script setup>
import PageLogo from './components/layout/PageLogo.vue'
import SearchBar from './components/layout/SearchBar.vue'
import Location from './components/layout/Location.vue'
import { Icon } from '@iconify/vue'
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const showMenu = ref(false)
const scrolled = ref(false)
const lang = ref(localStorage.getItem('lang') || 'ru')

function onScroll() {
  scrolled.value = window.scrollY > 6
}

function toggleLang() {
  lang.value = lang.value === 'ru' ? 'en' : 'ru'
  localStorage.setItem('lang', lang.value)
}

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


function goToHome() {
  showMenu.value = false
  router.push('/')
}

function goToCategories() {
  showMenu.value = false
  router.push('/categories')
}

function goToAdmin() {
  showMenu.value = false
  router.push('/admin')
}

function goToUser() {
  showMenu.value = false
  router.push('/user')
}

function goToGuide() {
  showMenu.value = false
  router.push('/guide')
}

function goToBusiness() {
  showMenu.value = false
  router.push('/business')
}

function goToChat() {
  showMenu.value = false
  router.push('/chat')
}

function goToLogin() {
  showMenu.value = false
  router.push('/auth/login')
}

function goToRegister() {
  showMenu.value = false
  router.push('/auth/register')
}

function openCityConfirm() {
  showMenu.value = false
  window.dispatchEvent(new Event('city:openConfirm'))
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
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.mobile-header {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 9999;
  background: rgba(255,255,255,0.85);
  backdrop-filter: saturate(120%) blur(8px);
  padding: 0 16px;
  box-shadow: 0 0 0 rgba(0,0,0,0);
  height: 4rem; 
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: box-shadow .2s ease, background .2s ease;
}

/* Header Sections */
.logo-section {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: fit-content;
}

.center-section {
  flex: 0 0 auto;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  min-width: 0;
  margin-left: 0.25rem;
  max-width: 200px;
}

.right-section {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  min-width: 160px;
}
.mobile-header.scrolled {
  background: rgba(255,255,255,0.9);
  box-shadow: 0 6px 16px rgba(0,0,0,0.08);
}

.logo-link { display:inline-flex; align-items:center; cursor:pointer; }
.logo-link:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; border-radius: 8px; }

/* Logo */
.mobile-header .logo {
  flex-shrink: 0;
  font-size: 1.75rem;
  max-width: 120px;
  height: auto;
}

/* Search Bar */
.search-container {
  flex-grow: 1;
}

/* Menu Wrapper */
.menu-wrapper {
  position: relative;
}

.lang-toggle {
  height: 36px;
  min-width: 44px;
  padding: 5px;
  margin-right: 3px;
  margin-left: 3px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  font-weight: 700;
  cursor: pointer;
}

.avatar-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  width: 50px;
  height: 50px;
  padding: 0;
  margin: 0 ;
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

.menu-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0.5rem 0;
  border: none;
  padding: 0;
  cursor: default;
}

.menu-divider:hover {
  background: #e5e7eb;
  transform: none;
  box-shadow: none;
}

.panel-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.panel-link.admin:hover {
  background-color: #dc2626;
  color: white;
}

.panel-link.user:hover {
  background-color: #3b82f6;
  color: white;
}

.panel-link.guide:hover {
  background-color: #f59e0b;
  color: white;
}

.panel-link.business:hover {
  background-color: #10b981;
  color: white;
}

.panel-link.chat:hover {
  background-color: #8b5cf6;
  color: white;
}

/* Responsive Design */
@media (min-width: 768px) {
  .mobile-header {
    padding: 0 24px;
    height: 80px;
  }
  

  
  .center-section {
    margin: 0 12px 0 0.25rem;
  }
  
  .right-section {
    gap: 16px;
    min-width: 140px;
  }
  
  .mobile-header .logo {
    font-size: 2rem;
    max-width: 140px;
  }
  
  .lang-toggle {
    height: 40px;
    min-width: 48px;
    font-size: 0.9rem;
  }
  
  .avatar-button {
    width: 44px;
    height: 44px;
  }
  
  .menu-dropdown {
    width: 280px;
    padding: 1rem;
  }
  
  .menu-dropdown li {
    font-size: 1rem;
    padding: 0.75rem 0.5rem;
  }
  
}

@media (min-width: 1024px) {
  .mobile-header {
    padding: 0 32px;
    height: 85px;
  }
  

  
  .center-section {
    margin: 0 16px 0 0.25rem;
  }
  
  .right-section {
    gap: 20px;
    min-width: 160px;
  }
  
  .mobile-header .logo {
    font-size: 2.25rem;
    max-width: 160px;
  }
  
  .lang-toggle {
    height: 44px;
    min-width: 52px;
    font-size: 1rem;
  }
  
  .avatar-button {
    width: 48px;
    height: 48px;
  }
  
  .menu-dropdown {
    width: 320px;
    padding: 1.25rem;
  }
  
  .menu-dropdown li {
    font-size: 1.1rem;
    padding: 0.875rem 0.75rem;
  }
  
}

@media (min-width: 1280px) {
  .mobile-header {
    padding: 0 40px;
    height: 90px;
  }
  

  
  .center-section {
    margin: 0 20px 0 0.25rem;
  }
  
  .right-section {
    gap: 24px;
    min-width: 180px;
  }
  
  .mobile-header .logo {
    font-size: 2.5rem;
    max-width: 180px;
  }
  
  .lang-toggle {
    height: 48px;
    min-width: 56px;
    font-size: 1.1rem;
  }
  
  .avatar-button {
    width: 52px;
    height: 52px;
  }
  
  .menu-dropdown {
    width: 360px;
    padding: 1.5rem;
  }
  
  .menu-dropdown li {
    font-size: 1.2rem;
    padding: 1rem 1rem;
  }
  
}

@media (min-width: 1536px) {
  .mobile-header {
    padding: 0 48px;
    height: 95px;
  }
  

  
  .center-section {
    margin: 0 24px 0 0.25rem;
  }
  
  .right-section {
    gap: 28px;
    min-width: 200px;
  }
  
  .mobile-header .logo {
    font-size: 2.75rem;
    max-width: 200px;
  }
  
  .lang-toggle {
    height: 52px;
    min-width: 60px;
    font-size: 1.2rem;
  }
  
  .avatar-button {
    width: 56px;
    height: 56px;
  }
  
  .menu-dropdown {
    width: 400px;
    padding: 1.75rem;
  }
  
  .menu-dropdown li {
    font-size: 1.3rem;
    padding: 1.125rem 1.25rem;
  }
  
}

/* Mobile-specific adjustments */
@media (max-width: 767px) {
  .mobile-header {
    padding: 0 12px;
  }
  
  .center-section {
    margin: 0 6px 0 0.25rem;
    max-width: 150px;
  }
  
  .right-section {
    gap: 8px;
  }
  
  .mobile-header .logo {
    font-size: 1.5rem;
    max-width: 100px;
  }
  
  .lang-toggle {
    height: 32px;
    min-width: 40px;
    font-size: 0.8rem;
  }
  
  .avatar-button {
    width: 46px;
    height: 46px;
  }
  
}

@media (max-width: 480px) {
  .mobile-header {
    padding: 0 0.5rem;
  }
  
  .center-section {
    margin: 0;
    max-width: 120px;
  }
  
  .right-section {
    gap: 6px;
  }
  
  .mobile-header .logo {
    font-size: 1.25rem;
    max-width: 80px;
  }
  
  .lang-toggle {
    height: 28px;
    min-width: 36px;
    font-size: 0.75rem;
  }
  
  .avatar-button {
    width: 42px;
    height: 42px;
  }
  
}

/* Specific adjustment for 375px width devices */
@media (max-width: 375px) {
  .mobile-header {
    padding: 0 12px;
  }
  
  .center-section {
    max-width: 100px;
  }
  
  .right-section {
    gap: 4px;
    min-width: 100px;
  }
  
  .avatar-button {
    width: 46px;
    height: 46px;
    padding: 4px;
  }
  
  .avatar-icon {
    width: 38px;
    height: 100%;
  }
}

</style>