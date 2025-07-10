<template>
  <div class="guides-section">
    <div class="guides-header">
      <h2>Наши гиды</h2>
      <span class="view-all" @click="goToAllGuides">Все гиды</span>
    </div>

    <div class="guides-slider">
      <div
        v-for="guide in guides"
        :key="guide.id"
        class="guide-card"
      >
        <img :src="guide.avatar" alt="Guide Avatar" class="guide-avatar" />
        <div class="guide-info">
          <h3>{{ guide.name }}</h3>
          <p>{{ guide.language }}</p>
          <p class="guide-rating">⭐ {{ guide.rating }}</p>
          <button class="details-button" @click="showDetails(guide)">Подробнее</button>
        </div>
      </div>
    </div>

    <!-- Guide Modal -->
    <div v-if="activeGuide" class="guide-modal-overlay" @click.self="closeModal">
      <div class="guide-modal">
        <img :src="activeGuide.avatar" class="modal-avatar" />
        <h3>{{ activeGuide.name }}</h3>
        <p><strong>Языки:</strong> {{ activeGuide.language }}</p>
        <p><strong>Рейтинг:</strong> ⭐ {{ activeGuide.rating }}</p>
        <button @click="closeModal" class="close-button">Закрыть</button>
      </div>
    </div>

    <div class="end-spacer" aria-hidden="true"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Guide {
  id: number;
  name: string;
  language: string;
  rating: number;
  avatar: string;
}

const guides = ref<Guide[]>([
  { id: 1, name: 'Анна', language: 'Русский, Английский', rating: 4.8, avatar: '/guide1.png' },
  { id: 2, name: 'Илья', language: 'Русский, Испанский', rating: 4.9, avatar: '/guide2.png' },
  { id: 3, name: 'Мария', language: 'Русский, Немецкий', rating: 5.0, avatar: '/guide3.png' },
])

const activeGuide = ref<Guide | null>(null)
const showDetails = (guide: Guide) => {
  activeGuide.value = guide
}
const closeModal = () => {
  activeGuide.value = null
}

const goToAllGuides = () => {
  console.log("Going to all guides");
}
</script>

<style scoped>
.guides-section {
  margin-top: 0;
}

.guides-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 5vw 0.5rem;
}

.guides-header h2 {
  font-size: clamp(1.2rem, 3.5vw, 1.5rem);
  font-weight: bold;
}

.view-all {
  font-size: 16px;
  font-weight: 500;
  color: rgb(26,58,107);
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 8px;
  animation: slideInRight 0.6s ease-out 0.2s forwards;
}

.view-all:hover {
  background-color: rgba(255, 218, 185, 0.3); 
  transform: scale(1.05);
  border-radius: 16px;
  color: #00b4d8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.guides-slider {
  display: flex;
  overflow-x: auto;
  gap: 1rem;
  padding: 0 5vw 2rem;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  animation: fadeInSlider 1s ease-out;
}

.guides-slider::-webkit-scrollbar {
  display: none;
}

.guide-card {
  flex: 0 0 70vw;
  height: 35vh;
  max-height: 320px;
  background: linear-gradient(160deg, #d8d7d5, #fae0b966,#f7950347);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  padding: 1.2rem;
  scroll-snap-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between; 
  align-items: center;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
  animation: fadeSlideUp 0.5s ease both;
  overflow: hidden;
  box-shadow: 
  1.5px 3px 3px 3px #6662625c,
  1.5px 3px 3px 3px #dfdcd6;
}

.guide-card:hover {
  transform: translateY(-6px) scale(1.015);
  box-shadow: 0 10px 20px rgba(255, 144, 7, 0.3);
  background: linear-gradient(145deg, #ffeac7, #ffd59e);
}

.guide-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 0.75rem;
  border: 3px solid #b1b5bb;
  transition: transform 0.3s ease;
}

.guide-card:hover .guide-avatar {
  transform: scale(1.05);
}

.guide-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}


.guide-info h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: bold;
}

.guide-info p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #666262;
}

.guide-rating {
  font-weight: 600;
  color: #f59e0b;
}

.details-button {
  background:rgba(45, 45, 45, 0.383);
  color: rgb(255, 255, 255);
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 10px;
  margin-top: 0.1rem;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: 600;
  transition: background 0.3s ease, transform 0.2s ease;
  backdrop-filter: blur(10px);
}

.details-button:hover {
  background: rgba(45, 45, 45, 0.383);
  transform: scale(1.08);
}

.end-spacer {
  flex: 0 0 0.3px;
  pointer-events: none;
}

@keyframes fadeSlideUp {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeInSlider {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Modal */
.guide-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 9999;
}

.guide-modal {
  background: white;
  padding: 1.5rem;
  border-radius: 16px 16px 0 0;
  width: 100%;
  max-width: 100%;
  animation: slideUp 0.3s ease;
  text-align: center;
}

.modal-avatar {
  display: block;
  margin: 0 auto 1rem;
  width: 90px;
  height: 90px;
  border-radius: 50%;
}

.close-button {
  margin-top: 1rem;
  background: #e5e7eb;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@media (min-width: 768px) {
  .guide-card {
    flex: 0 0 32vw;
  }

  .guide-avatar {
    width: 100px;
    height: 100px;
  }
}

@media (min-width: 1024px) {
  .guide-card {
    flex: 0 0 22vw;
  }

  .guides-slider {
    gap: 1.5rem;
  }
}
</style>