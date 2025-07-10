<template>
  <div class="header" :class="{ 'search-active': isSearchActive }">
    <div v-if="!isSearchActive" class="icon-wrapper" @click="toggleSearch">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" >
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
      </svg>
    </div>
    <div v-else class="search-container">
      <button class="back-button" @click="toggleSearch">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <input
        type="text"
        v-model="searchQuery"
        id="search-input"
        name="search"
        placeholder="Поиск..."
        class="search-input"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch,nextTick } from 'vue'

const searchQuery = ref('')
const isSearchActive = ref(false)

function toggleSearch() {
  isSearchActive.value = !isSearchActive.value;
  nextTick(() => {
    const input = document.querySelector('.search-input');
    if (isSearchActive.value && input) {
      input.focus();
    } else {
      document.activeElement?.blur(); 
      window.scrollTo(0, 0); 
    }
  });
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  position: relative;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  padding: 0.5rem 0.5rem;
}

.icon-wrapper {
  cursor: pointer;
  margin-left: auto;
  transition: transform 0.3s ease;
  width: clamp(2.2rem, 3vw, 3rem);
  height: clamp(2.2rem, 3vw, 3rem);
}

.icon-wrapper:hover {
  transform: scale(1.1) rotate(15deg);
}

.search-active {
  position: absolute;
  top: 0;
  left: 0;
  right:0;
  width: 95%;
  align-items: center;
  background-color: #f8f8f8;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  padding: 0.75rem 1rem;
  z-index: 9999;
  max-width: 100%;
  margin: 0 auto;
  transition: all 0.2s ease-in-out;
  height: 75px;
}

.search-container {
  display: flex;
  align-items: center;
  width: 100%;
}

.back-button {
  background: none;
  border: none;
  cursor: pointer;
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  padding: 0;
  transition: transform 0.3s ease;
}

.back-button:hover {
  transform: rotate(-15deg) scale(1.1);
}

.search-input {
  font-size:16px;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid #ccc;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #007bff;
  background-color: #f0f8ff;
}

</style>