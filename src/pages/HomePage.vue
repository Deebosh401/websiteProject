<template>
    <div class="home-page">
      <div class="site-motto pushkin-motto">
        <div class="motto-line">
          <h2>Мир ближе, чем кажется. </h2>
          <h3> Путешествуйте со вкусом…</h3>
        </div>
      </div>


      <nav class="scroll-nav">
      <button @click="scrollTo('cities')">Города</button>
      <button @click="scrollTo('categories')">Категории</button>
      <button @click="scrollTo('afisha')">Афиша</button>
      <button @click="scrollTo('popular')">Популярное</button>
      <button @click="scrollTo('guides')">Гиды</button>
      <button @click="scrollTo('slang')">Словарь/Погода</button>
      <button @click="scrollTo('firsthand')">Личный опыт</button>
      <button @click="scrollTo('map')">Карта</button>
      </nav>

      <div id="cities"><Cities /></div>
      <div id="categories"><Categories /></div>
      <div id ="afisha"><Afisha/></div>
      <div id="weather"><WeatherApp /></div>
      <div id="popular"><Popular /></div>
      <div id="guides"><Guides /></div>
      <div id="slang"><SlangJokes /></div>
      <div id="firsthand"><FirstHandExperience /></div>
      <div id="map"><Map/></div>

    <!-- Back to Top Button -->
    <button v-if="showTopButton" class="back-to-top" @click="scrollToTop"><span class="arrow-icon"></span> </button>

    </div>
  </template>
  
  <script setup>
  import Cities from "../components/layout/Cities.vue"
  import Categories from "../components/layout/Categories.vue"
  import Popular from "../components/layout/Popular.vue";
  import Guides from "../components/layout/Guides.vue";
  import SlangJokes from "../components/layout/SlangJokes.vue";
  import FirstHandExperience from "../components/layout/FirstHandExperience.vue";
  import Map from "../components/layout/Map.vue";
  import Afisha from "../components/layout/Afisha.vue";
  import { ref, onMounted, onUnmounted } from 'vue'

const showTopButton = ref(false)

const scrollTo = (id) => {
  const el = document.getElementById(id)
  if (el) {
    const yOffset = -80 // height of fixed header
    const y = el.getBoundingClientRect().top + window.scrollY + yOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const checkScroll = () => {
  showTopButton.value = window.scrollY > 250
}

onMounted(() => {
  window.addEventListener('scroll', checkScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
})

</script>
  
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500&display=swap');
  
  .home-page {
    margin-top: 70px;
    position: relative;
    z-index: 1;
    background-color: rgba(249, 233, 208, 0);
  }


.pushkin-motto {
  padding-inline: clamp(1rem, 4vw, 5rem);
  margin: 0;
  animation: fadeZoomIn 2.2s ease-out;
  text-align: center;
  
}

.motto-line {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: baseline;
  gap: 0.1rem;
}

.pushkin-motto h2,
.pushkin-motto h3 {
  font-family: 'Dancing Script', cursive;
  font-weight: 650;
  font-size: clamp(1.5rem, 3.5vw, 2.3rem);
  line-height: 1.2;
  margin: 0;
  margin-right: 0.5rem;
  padding: 0.2rem 0.4rem;
  border-radius: 8px;
  letter-spacing: 0.5px;
  background: transparent;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
  color: #19212c;
}

.pushkin-motto h2 {
  color: linear-gradient(135deg, #121821, #1f2937, #3b4759);
}

.pushkin-motto h3 {
  color: linear-gradient(135deg, #121821, #1f2937, #3b4759);
}

.pushkin-motto h2:hover,
.pushkin-motto h3:hover {
  transform: scale(1.15);
}

.scroll-nav {
  position: sticky;
  top: 0;
  background-color: rgba(254, 227, 203, 0);
  display: flex;
  overflow-x: auto;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  scrollbar-width: none;
}

.scroll-nav::-webkit-scrollbar {
  display: none;
}

.scroll-nav button {
  background: rgba(225,245,254,255);
  color: rgba(54,123,130,255);
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  white-space: nowrap;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s ease;
}

.scroll-nav button:hover {
  background: #c7d2fe;
}

.back-to-top {
  position: fixed;
  bottom: 1.5rem;
  right: 1.2rem;
  background: rgba(225,245,254,255); 
  border: none;
  border-radius: 12px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7);
  transition: transform 0.2s ease, box-shadow 0.3s ease, opacity 0.3s ease;
  opacity: 0.65;
  z-index: 999;
}

.back-to-top:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  opacity: 1;
  background: linear-gradient(145deg, rgba(255, 140, 0, 0.879),rgba(195, 116, 19, 0.751),rgba(151, 95, 26, 0.551));
}

.arrow-icon::after {
  content: '';
  display: block;
  width: 12px;
  height: 12px;
  border-left: 3px solid black;
  border-top: 3px solid black;
  transform: rotate(45deg);
  margin-top: 4px;
  color:black;
}


@media (max-width: 480px) {
  .back-to-top {
    width: 60px;
    height: 60px;
    font-size: 1rem;
    line-height: 40px;
  }

  .back-to-top img {
    width: 60px;
    height: 42px;
  }
}

@media (max-width: 768px) {
  .motto-line {
    flex-direction: column;
    align-items: center;
  }
}

</style>