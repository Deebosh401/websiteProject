<template>
  <div class="guides-page">
    <div class="page-header">
      <h1>Местные гиды</h1>
      <p>Профессиональные экскурсоводы и местные эксперты</p>
    </div>

    <div class="search-filter-bar">
      <div class="search-section">
        <input
          v-model="searchQuery"
          class="search-input"
          type="search"
          placeholder="Поиск гидов по имени, специализации, описанию…"
          aria-label="Поиск гидов"
        />
      </div>
      <div class="filter-section">
        <select v-model="selectedSpecialty" class="specialty-select">
          <option value="">Все специализации</option>
          <option value="История">История</option>
          <option value="Архитектура">Архитектура</option>
          <option value="Природа">Природа</option>
          <option value="Кулинария">Кулинария</option>
          <option value="Искусство">Искусство</option>
          <option value="Военная история">Военная история</option>
          <option value="Семейные туры">Семейные туры</option>
        </select>
        <select v-model="selectedLanguage" class="language-select">
          <option value="">Все языки</option>
          <option value="Русский">Русский</option>
          <option value="Английский">Английский</option>
          <option value="Немецкий">Немецкий</option>
          <option value="Польский">Польский</option>
        </select>
        <label class="rating-filter">
          <input type="checkbox" v-model="rating4p" />
          <span>Рейтинг 4+</span>
        </label>
      </div>
    </div>

    <div class="featured-guide" v-if="featuredGuide">
      <div class="featured-badge">⭐ Рекомендуемый гид</div>
      <div class="guide-card featured">
        <div class="guide-avatar">
          <img :src="featuredGuide.avatar" :alt="featuredGuide.name" />
          <div class="online-status" :class="{ online: featuredGuide.available }">
            {{ featuredGuide.available ? 'Доступен' : 'Недоступен' }}
          </div>
        </div>
        <div class="guide-info">
          <h2>{{ featuredGuide.name }}</h2>
          <p class="guide-specialty">{{ featuredGuide.specialties.join(', ') }}</p>
          <div class="guide-rating">
            <StarRating :rating="featuredGuide.rating" :show-text="true" />
          </div>
          <p class="guide-description">{{ featuredGuide.description }}</p>
          <div class="guide-languages">
            <span v-for="lang in featuredGuide.languages" :key="lang" class="language-tag">{{ lang }}</span>
          </div>
          <div class="guide-stats">
            <span class="stat">📅 {{ featuredGuide.experience }} лет опыта</span>
            <span class="stat">💰 от {{ featuredGuide.price }} ₽/час</span>
          </div>
        </div>
        <div class="guide-actions">
          <button class="contact-btn primary" @click="contactGuide(featuredGuide)">
            Связаться
          </button>
          <button class="contact-btn secondary" @click="viewProfile(featuredGuide)">
            Профиль
          </button>
        </div>
      </div>
    </div>

    <div class="guides-grid">
      <div
        class="guide-card"
        v-for="guide in filteredGuides"
        :key="guide.id"
        @click="viewProfile(guide)"
      >
        <div class="guide-avatar">
          <img :src="guide.avatar" :alt="guide.name" />
          <div class="online-status" :class="{ online: guide.available }">
            {{ guide.available ? 'Доступен' : 'Недоступен' }}
          </div>
        </div>
        <div class="guide-info">
          <h3>{{ guide.name }}</h3>
          <p class="guide-specialty">{{ guide.specialties.join(', ') }}</p>
          <div class="guide-rating">
            <StarRating :rating="guide.rating" :show-text="true" />
          </div>
          <p class="guide-description">{{ guide.description }}</p>
          <div class="guide-languages">
            <span v-for="lang in guide.languages" :key="lang" class="language-tag">{{ lang }}</span>
          </div>
          <div class="guide-stats">
            <span class="stat">📅 {{ guide.experience }} лет</span>
            <span class="stat">💰 от {{ guide.price }} ₽</span>
          </div>
        </div>
        <div class="guide-actions">
          <button class="contact-btn primary" @click.stop="contactGuide(guide)">
            Связаться
          </button>
        </div>
      </div>
    </div>

    <div v-if="!filteredGuides.length" class="empty-state">
      <p>По вашему запросу гиды не найдены.</p>
      <button class="clear-filters-btn" @click="clearFilters">Очистить фильтры</button>
    </div>

    <div v-if="showContactModal" class="modal-overlay" @click="closeContactModal">
      <div class="contact-modal" @click.stop>
        <div class="modal-header">
          <h3>Связаться с гидом</h3>
          <button class="close-btn" @click="closeContactModal">×</button>
        </div>
        <div class="modal-content">
          <div class="guide-summary">
            <img :src="selectedGuide?.avatar" :alt="selectedGuide?.name" />
            <div>
              <h4>{{ selectedGuide?.name }}</h4>
              <p>{{ selectedGuide?.specialty }}</p>
            </div>
          </div>
          <div class="contact-options">
            <button class="contact-option" @click="contactViaTelegram">
              <span class="icon">📱</span>
              Telegram
            </button>
            <button class="contact-option" @click="contactViaPhone">
              <span class="icon">📞</span>
              Позвонить
            </button>
            <button class="contact-option" @click="contactViaEmail">
              <span class="icon">✉️</span>
              Email
            </button>
          </div>
        </div>
      </div>
    </div>

    <button class="back-floating-btn" @click="goBack">
      ← Назад
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { allGuides, getGuidesByCity } from '../Data'
import { intelligentTextSearch } from '../utils/intelligentSearch'
import StarRating from '../components/StarRating.vue'

const router = useRouter()

// Search and filter state
const searchQuery = ref('')
const selectedSpecialty = ref('')
const selectedLanguage = ref('')
const rating4p = ref(false)

// Modal state
const showContactModal = ref(false)
const selectedGuide = ref<any>(null)

const selectedCity = ref<string>(localStorage.getItem('selectedCity') || 'Калининград')

// Listen for city changes
window.addEventListener('city:changed', (e: any) => {
  const c = e?.detail
  if (c) selectedCity.value = c
})

// Use centralized guides data with city filtering
const guides = computed(() => {
  if (selectedCity.value) {
    return getGuidesByCity(selectedCity.value)
  }
  return allGuides.value
})

// Computed properties
const featuredGuide = computed(() => 
  guides.value.length > 0 ? guides.value[0] : null
)

const filteredGuides = computed(() => {
  let filtered = [...guides.value]

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(guide => {
      const searchText = `${guide.name} ${guide.specialties.join(' ')} ${guide.description}`
      return intelligentTextSearch(searchText, query)
    })
  }

  if (selectedSpecialty.value) {
    filtered = filtered.filter(guide => 
      guide.specialties.includes(selectedSpecialty.value)
    )
  }

  if (selectedLanguage.value) {
    filtered = filtered.filter(guide => 
      guide.languages.includes(selectedLanguage.value)
    )
  }

  if (rating4p.value) {
    filtered = filtered.filter(guide => guide.rating >= 4)
  }

  return filtered
})

// Methods
function contactGuide(guide: any) {
  selectedGuide.value = guide
  showContactModal.value = true
}

function viewProfile(guide: any) {
  // In a real app, this would navigate to a detailed guide profile page
  console.log('Viewing profile for:', guide.name)
}

function closeContactModal() {
  showContactModal.value = false
  selectedGuide.value = null
}

function contactViaTelegram() {
  // In a real app, this would open Telegram with the guide's contact
  alert(`Открыть Telegram для связи с ${selectedGuide.value?.name}`)
  closeContactModal()
}

function contactViaPhone() {
  // In a real app, this would initiate a phone call
  alert(`Позвонить ${selectedGuide.value?.name}`)
  closeContactModal()
}

function contactViaEmail() {
  // In a real app, this would open email client
  alert(`Отправить email ${selectedGuide.value?.name}`)
  closeContactModal()
}

function clearFilters() {
  searchQuery.value = ''
  selectedSpecialty.value = ''
  selectedLanguage.value = ''
  rating4p.value = false
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.guides-page {
  font-family: sans-serif;
  padding-top: 4.3rem;
  width: 100%;
  margin: 0 auto;
  background: rgba(225, 245, 254, 0.18);
  min-height: 100vh;
}

.page-header {
  text-align: center;
  padding: 2rem 1rem 1rem;
  background: white;
  margin-bottom: 1rem;
}

.page-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.page-header p {
  margin: 0;
  color: #6b7280;
  font-size: 1.1rem;
}

/* Search and Filter Bar */
.search-filter-bar {
  background: white;
  padding: 1rem;
  margin: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-section {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.filter-section {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.specialty-select,
.language-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  min-width: 150px;
}

.rating-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
}

/* Featured Guide */
.featured-guide {
  margin: 1rem;
  position: relative;
}

.featured-badge {
  position: absolute;
  top: -0.5rem;
  left: 1rem;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 2;
}

.guide-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  cursor: pointer;
}

.guide-card:hover {
  transform: translateY(-2px);
}

.guide-card.featured {
  border: 2px solid #fbbf24;
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
}

.guide-avatar {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
}

.guide-avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e5e7eb;
}

.online-status {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #6b7280;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
}

.online-status.online {
  background: #059669;
}

.guide-info h2,
.guide-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #1f2937;
}

.guide-specialty {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
}

.guide-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.stars {
  display: flex;
  gap: 0.1rem;
}

.star {
  font-size: 0.8rem;
  opacity: 0.3;
}

.star.filled {
  opacity: 1;
}

.rating-text {
  font-weight: 600;
  font-size: 0.9rem;
  color: #f59e0b;
}

.reviews-count {
  font-size: 0.8rem;
  color: #6b7280;
}

.guide-description {
  color: #374151;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0.5rem 0;
}

.guide-languages {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin: 0.5rem 0;
}

.language-tag {
  background: #e0f2fe;
  color: #0c4a6e;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
}

.guide-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin: 0.5rem 0;
}

.stat {
  font-size: 0.8rem;
  color: #6b7280;
}

.guide-actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}

.contact-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.contact-btn.primary {
  background: #3b82f6;
  color: white;
}

.contact-btn.primary:hover {
  background: #2563eb;
}

.contact-btn.secondary {
  background: #f3f4f6;
  color: #374151;
}

.contact-btn.secondary:hover {
  background: #e5e7eb;
}

/* Guides Grid */
.guides-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.contact-modal {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
}

.guide-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.guide-summary img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.guide-summary h4 {
  margin: 0 0 0.2rem 0;
  font-size: 1.1rem;
}

.guide-summary p {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.contact-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contact-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.contact-option:hover {
  background: #f9fafb;
  border-color: #3b82f6;
}

.contact-option .icon {
  font-size: 1.2rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.clear-filters-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1rem;
}

.back-floating-btn {
  position: fixed;
  bottom: 1.2rem;
  right: 1.2rem;
  background: rgba(255, 255, 255, 0.8);
  color: #333;
  border: 1px solid #ccc;
  border-radius: 999px;
  padding: 0.6rem 1.1rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  transition: background 0.3s ease;
  z-index: 10;
}

.back-floating-btn:hover {
  border-color: #aaa;
}

@media (max-width: 768px) {
  .guides-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .guide-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>


