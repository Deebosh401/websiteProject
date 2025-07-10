<template>
  <div class="local-lingo-slider">
    <div class="icon-button-row">
      <button class="icon-button" @click="showDictionary = true">📖</button>
      <button class="icon-button" @click="showWeather = true">🌤️</button>
    </div>

    <!-- Dictionary Modal -->
    <div v-if="showDictionary" class="modal-overlay" @click.self="closeModals">
      <div class="modal-content scrollable">
        <div class="modal-header">
          <h3>Локальный словарь</h3>
          <button class="close-btn" @click="closeModals">✕</button>
        </div>
        <div class="expandable-list">
          <div v-for="(phrase, i) in phrases" :key="i" class="expandable-item">
            <div class="expandable-header" @click="toggleExpand(i)">
              <span class="label">{{ phrase.short }}</span>
              <span class="chevron">{{ expanded.includes(i) ? '▲' : '▼' }}</span>
            </div>
            <transition name="expand">
              <div v-if="expanded.includes(i)" class="expandable-body">
                <p>{{ phrase.full }}</p>
                <ul>
                  <li v-for="(ex, j) in phrase.examples" :key="j">{{ ex }}</li>
                </ul>
              </div>
            </transition>
          </div>
        </div>
        <button class="ack-btn" @click="closeModals">Закрыть</button>
      </div>
    </div>

    <!-- Weather Modal -->
    <div v-if="showWeather" class="modal-overlay" @click.self="closeModals">
      <div class="weather-modal">
        <div class="modal-header">
          <h3></h3>
          <!-- <button class="close-btn" @click="closeModals">✕</button> -->
        </div>
        <WeatherApp />
         <button class="ack-btn" @click="closeModals">Закрыть</button>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">

import { ref } from 'vue'
import WeatherApp from './WeatherApp.vue'
const showDictionary = ref(false)
const showWeather = ref(false)
const expanded = ref<number[]>([])

const closeModals = () => {
  showDictionary.value = false
  showWeather.value = false
}

const toggleExpand = (index: number) => {
  const i = expanded.value.indexOf(index)
  if (i > -1) {
    expanded.value.splice(i, 1)
  } else {
    expanded.value.push(index)
  }
}

const phrases = [
  { short: 'Кёниг', full: 'Кёнигсберг кратко', examples: ['"1200" – парковка', '"Южный" – вокзал'] },
  { short: 'Башня', full: 'Форт или сторожевая башня', examples: ['Башня Дона'] },
  { short: 'Балтон', full: 'Балтийская набережная', examples: ['Поехали в Балтон!'] },
  { short: 'Победка', full: 'Улица Победы', examples: ['Живу на Победке'] },
  { short: 'Коса', full: 'Куршская Коса', examples: ['Поехали на Косу'] },
]


</script>

<style scoped>
.icon-button-row {
  display: flex;
  justify-content: center;
  gap: 5%;
  padding: 2rem 0;
  flex-wrap: wrap;
}

.icon-button {
  width: 30vw;
  aspect-ratio: 1 / 1;
  font-size: clamp(3rem, 4vw, 3rem);
  border-radius: 16px;
  border: none;
  background: rgba(225, 245, 254, 0.9);
  color: #064047;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.3s ease, background 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-button:hover {
  background: linear-gradient(135deg, #dba400ba, #ffc500ba, #44b78bba);
  color: white;
  transform: scale(1.05);
}

@media (max-width: 600px) {
  .icon-button {
    width: 32vw;
    font-size: 2.4rem;
  }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-end;
  z-index: 10000;
}

.modal-content {
  background: white;
  width: 100%;
  border-radius: 1.2rem 1.2rem 0 0;
  padding: 1.5rem 1.25rem;
  animation: slideUp 0.3s ease;
  max-height: 90vh;
  overflow-y: auto;
}

.weather-modal {
  background: white;
  width: 100%;
  border-radius: 1rem 1rem 0 0;
  padding: 0.5rem 0;
  animation: slideUp 0.3s ease;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.ack-btn {
  display: block;
  margin: 1rem auto 0;
  background: rgba(45, 45, 45, 0.707);
  color: white;
  padding: 0.7rem 1.2rem;
  border-radius: 14px;
  font-size: 1rem;
  border: none;
  cursor: pointer;
}

.expandable-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  cursor: pointer;
  padding: 0.5rem 0;
}

.expandable-body {
  padding-left: 0.8rem;
  font-size: 0.95rem;
}

.expand-enter-active,
.expand-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}
.expand-enter-to,
.expand-leave-from {
  max-height: 300px;
  opacity: 1;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
