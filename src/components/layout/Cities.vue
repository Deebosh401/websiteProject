<template>
  <div class="cities-header">
    <p class="cities-list animate-left">Города</p>
    <span class="cities-link animate-right" @click="goToAllCities">Все города</span>
  </div>

    <div class="slideshow-container">
      <div class="slideshow">
        <div v-for="(city, index) in cities" :key="index" class="card">
          <div class="card-image-container" @click="goToCity(city)">
            <template v-if="city.image.endsWith('.mp4')">
              <video autoplay loop muted playsinline preload="metadata" class="city-image">
                <source :src="city.image" type="video/mp4" />
              </video>
            </template>
            <template v-else>
              <img :src="city.image" alt="City Image" class="city-image"/>
            </template>
            <button class = "overlay-button" @click="goToCity(city)">{{ city.name }} </button>
          </div>
        </div>
         <div class="end-spacer" aria-hidden="true"></div>
      </div>
    </div>
</template>


<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

interface City {
  name: string;
  description: string;
  image: string;
  attractions: number;
}

export default defineComponent({
  setup() {
    const cities = ref<City[]>([
      { name: 'Калининград', description: 'City of Light', image: 'Kaliningrad.jpeg', attractions: 50 },
      { name: 'Светлогорск', description: 'The Big Apple', image: '/Svetlogorsk.jpeg', attractions: 70 },
      { name: 'Зеленоградск', description: 'Land of the Rising Sun', image: '/Zelenogradsk.jpeg', attractions: 60 },
      { name: 'Янтарный', description: 'The Old Smoke', image: '/Yantarnyi.jpeg', attractions: 40 },
      { name: 'Советск', description: 'The Eternal City', image: '/Sovetsk.jpeg', attractions: 30 },
    ]);

    const router = useRouter();

    const goToAllCities = () => {
      router.push({ name: 'all-cities' });
    };

    const goToCity = (city: City) => {router.push({ name: 'city-detail', params: { name: city.name } })}

    return { cities, goToCity,goToAllCities };
  }
});
</script>

<style scoped>


.cities-list{
  text-align: left;
  margin: 5;
}

.slideshow-container {
  background-color: transparent;
  padding: 0;
  margin: 0;
  overflow-x: scroll;
  width: 100vw;
  height: fit-content;
  position: relative;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; 
  -ms-overflow-style: none; 
  padding-bottom: 10%;
  padding-top: 2%;
}

.slideshow-container::-webkit-scrollbar {
  display: none; 
}

.slideshow {
  display: flex;
  gap: 5vw;
  display: flex;
  padding-left: 5vw;
  scroll-snap-type: x mandatory;
  scroll-padding-left: 7vw;
  padding-right: 30vw;
  display: flex;
}

.card {
  flex: 0 0 calc(70vw - 2.5vw);
  background-color: #f8f5f2; 
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 5px 15px 15px rgba(0, 0, 0, 0.22);
  scroll-snap-align: center;
  display: flex;
  flex-direction: column;
}

.card:hover {
  animation: popBounce 0.5s ease;
  box-shadow: 0 6px 20px rgba(255, 140, 0, 0.3);
}

.card-image-container {
  position: relative;
  width: 100%;
  height: 35vh;
  overflow: hidden;
  transition: transform 0.3s ease, filter 0.3s ease;
}

.city-image,
.city-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease, filter 0.3s ease;
  border-radius: 20px;
}

.card-image-container:hover .city-image,
.card-image-container:hover .city-video {
  transform: scale(1.03);
  filter: brightness(1.1);
}

.overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: transparent;
  color: #ffffff;
  padding: 10px;
  text-align: center;
}
.overlay h3 {
  font-size: 10px;
  margin: 0;
  letter-spacing: 1px;
}
.overlay h1 {
  font-size: 26px;
  font-weight: 700;
}

.overlay-button {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: transparent; 
  color: white;
  border:thick double white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.overlay-button:hover {
  transform: translateX(-50%) scale(1.05);
  background-color: transparent;
  font:bold;
}

.cities-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 5vw 10px;
  padding-top: 20px;
}

.cities-list {
  font-size: 20px;
  font-weight: bold;
  opacity: 0;
  transform: translateX(-20px);
  animation: slideInLeft 0.6s ease-out forwards;
}

.cities-link {
  font-size: 16px;
  font-weight: 500;
  color: rgb(26,58,107);
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 8px;
  transition: background-color 0.3s ease, color 0.3s ease;
  opacity: 0;
  transform: translateX(20px);
  animation: slideInRight 0.6s ease-out forwards;
  animation-delay: 0.2s;
}

.cities-link:hover {
  background-color: rgba(255, 218, 185, 0.3); 
  transform: scale(1.05);
  border-radius: 16px;
  color: #00b4d8; 
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.end-spacer {
  flex: 0 0 0.1vw; 
  pointer-events: none;
}


@keyframes slideInLeft {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes popBounce {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.03) translateY(-2px); }
  70%  { transform: scale(0.98) translateY(0px); }
  100% { transform: scale(1); }
}
</style>