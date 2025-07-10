<template>
  <div class="cities-header">
    <p class="cities-list animate-left">От первого лица</p>
    <span class="cities-link animate-right" @click="goToAllCities">Все маршруты</span>
  </div>

    <div class="slideshow-container">
      <div class="slideshow">
        <div v-for="(city, index) in cities" :key="index" class="card" >
          <div class="card-image-container">
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

        
        <div class="card create-card" @click="openForm">
        <div class="card-image-container">
            <div class="create-content">
            <span>＋</span>
            <p>Создать маршрут</p>
            </div>
        </div>
        </div>
         <div class="end-spacer" aria-hidden="true"></div>
      </div>
    </div>

    <div v-if="showFormModal" class="form-modal-overlay" @click.self="closeForm">
  <div class="form-modal">
    <h3>🧭 Новый маршрут</h3>

    <!-- Basic Info -->
    <input v-model="newTrip.name" placeholder="* Название маршрута" />
    <input v-model="newTrip.travelers" type="number" placeholder="Кол-во путешественников" />

    <!-- Route Info -->
    <textarea v-model="newTrip.stops" placeholder="Какие остановки были?"></textarea>

    <label>Тип транспорта:</label>
    <select v-model="newTrip.transportType">
      <option>Общественный транспорт</option>
      <option>Собственный автомобиль</option>
      <option>Велосипед</option>
      <option>Арендованный автомобиль</option>
    </select>

    <!-- Rental Company if needed -->
    <div v-if="newTrip.transportType === 'Арендованный автомобиль'">
      <label>Компания аренды:</label>
      <select v-model="newTrip.rentalCompany">
        <option v-for="company in rentalCompanies" :key="company" :value="company">{{ company }}</option>
      </select>
    </div>

    <!-- Facilities -->
    <div class="checkbox-group">
      <label><input type="checkbox" v-model="newTrip.hasToilets" /> Туалеты</label>
      <label><input type="checkbox" v-model="newTrip.hasRestArea" /> Место для отдыха</label>
      <label><input type="checkbox" v-model="newTrip.hasPlayground" /> Детская площадка</label>
    </div>

    <!-- Payments -->
    <label>Типы оплаты:</label>
    <div class="checkbox-group">
      <label><input type="checkbox" v-model="newTrip.paymentTypes" value="MasterCard" /> MasterCard</label>
      <label><input type="checkbox" v-model="newTrip.paymentTypes" value="Visa" /> Visa</label>
      <label><input type="checkbox" v-model="newTrip.paymentTypes" value="UnionPay" /> UnionPay</label>
      <label><input type="checkbox" v-model="newTrip.paymentTypes" value="МИР" /> МИР</label>
      <label><input type="checkbox" v-model="newTrip.paymentTypes" value="Наличные" /> Наличные</label>
    </div>

    <!-- Tags -->
    <label>Выберите теги:</label>
    <div class="checkbox-group tags">
      <label><input type="checkbox" v-model="newTrip.tags" value="Семейный" /> Семейный</label>
      <label><input type="checkbox" v-model="newTrip.tags" value="Экономно" /> Экономно</label>
      <label><input type="checkbox" v-model="newTrip.tags" value="Для новичков" /> Для новичков</label>
      <label><input type="checkbox" v-model="newTrip.tags" value="Сложный маршрут" /> Сложный маршрут</label>
    </div>

    <!-- Recommendation -->
    <label><input type="checkbox" v-model="newTrip.recommend" /> Рекомендуете ли вы это место?</label>

    <!-- Comments & Media -->
    <textarea v-model="newTrip.comments" placeholder="Оставьте комментарий..." />
    <input type="file" multiple @change="handleFiles" accept="image/*,video/*" />

    <!-- Form Buttons -->
    <div class="form-actions">
      <button @click="closeForm">Отмена</button>
      <button @click="submitTrip" :disabled="!newTrip.name || !newTrip.image">Создать</button>
    </div>
  </div>
</div>

</template>


<script lang="ts">
import { defineComponent, ref,reactive } from 'vue';

interface City {
  name: string;
  description: string;
  image: string;
  attractions: number;
}

export default defineComponent({
  setup() {
    const cities = ref<City[]>([
      { name: 'Экскурсии', description: 'City of Light', image: '/Paris.mp4', attractions: 50 },
      { name: 'Где поесть', description: 'The Big Apple', image: '/NewYork.mp4', attractions: 70 },
      { name: 'Размещение', description: 'Land of the Rising Sun', image: '/Tokyo.mp4', attractions: 60 },
      { name: 'Исторические места', description: 'The Old Smoke', image: '/London.mp4', attractions: 40 },
      { name: 'Идём семьёй', description: 'The Eternal City', image: '/Rome.mp4', attractions: 30 },
      { name: 'Вечерний город', description: 'The Eternal City', image: '/Rome.mp4', attractions: 30 },
      { name: 'Концерты', description: 'The Eternal City', image: '/Rome.mp4', attractions: 30 },
      { name: 'Музеи и выставки', description: 'The Eternal City', image: '/Rome.mp4', attractions: 30 },
    ]);

    const showFormModal = ref(false);

    const rentalCompanies = ['RentRide', 'AvtoProkat', 'DriveNow', 'GoCar']

    const openForm = () => {
      showFormModal.value = true;
    };

    const closeForm = () => {
      showFormModal.value = false;
    };

    const submitTrip = () => {
      if (!newTrip.name || !newTrip.image) return;
      cities.value.push({
        name: newTrip.name,
        description: newTrip.comments || 'Без описания',
        image: newTrip.image,
        attractions: 0,
      });
    closeForm();

Object.assign(newTrip, {
  name: '',
  travelers: 1,
  stops: '',
  transportType: '',
  rentalCompany: '',
  hasToilets: false,
  hasRestArea: false,
  hasPlayground: false,
  paymentTypes: [],
  tags: [],
  recommend: false,
  comments: '',
  image: '',
  files: [],
});

    };

    const goToAllCities = () => {
      console.log('Navigating to all cities...');
    };

    const goToCity = (city: City) => {
      console.log(`Navigating to ${city.name} with ${city.attractions} attractions.`);
    };

  const newTrip = reactive({
  name: '',
  travelers: 1,
  stops: '',
  transportType: '',
  rentalCompany: '',
  hasToilets: false,
  hasRestArea: false,
  hasPlayground: false,
  paymentTypes: [] as string[],
  tags: [] as string[],
  recommend: false,
  comments: '',
  image: '',
  files: [] as File[]
})

const handleFiles = (e: Event) => {
  const target = e.target as HTMLInputElement
  newTrip.files = Array.from(target.files || [])
}
    return {
      cities,
      showFormModal,
      newTrip,
      openForm,
      closeForm,
      submitTrip,
      goToAllCities,
      goToCity,
      rentalCompanies,
      handleFiles
    };
  }
});
</script>


<style scoped>

.overlay-button:hover {
  transform: translateX(-50%) scale(1.05);
  background-color: rgba(45, 45, 45, 0.707);
}


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
  flex: 0 0 70vw;
  background-color: #f8f5f2; 
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 5px 15px 15px rgba(0, 0, 0, 0.22);
  scroll-snap-align: center;
  display: flex;
  flex-direction: column;
}

.card:hover {
  box-shadow: 0.5px 15px 20px #ff8c00a8;
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
  filter: brightness(1.15);
  transform: scale(1.01);
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
  background-color: rgba(45, 45, 45, 0.707); 
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.3s ease, background-color 0.3s ease;
  backdrop-filter: blur(4px);
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
  color: #00b4d8; /* more vivid yellow */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.end-spacer {
  flex: 0 0 0.1vw; /* Adjust for more/less breathing room */
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

.create-card {
  background: linear-gradient(to bottom right, rgba(66, 153, 225, 0.396), rgba(0, 166, 232, 0.333));
  border: 2px dashed #3b83f6bd;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  display: flex;
  color: rgb(255, 255, 255);
  font-weight: bold;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-top: 12%;
  flex: 0 0 42vw;
  height: 25vh;
  scroll-snap-align: center;
}

.create-card:hover {
  transform: scale(1.04);
  box-shadow: 0 10px 30px rgba(0, 168, 232, 0.4);
}

.create-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.create-content span {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.25rem;
}

.form-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-end;
  z-index: 9999;
  justify-content: center;
  align-items: flex-end;
}

.form-modal {
  background: white;
  padding: 1.5rem;
  border-radius: 16px 16px 0 0;
  width: 100%;
  max-width: 100%;
  max-height: 90vh;
  overflow-y:auto;
  animation: slideUp 0.3s ease;
}

.form-modal h3 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
  text-align: center;
}

.form-modal input,
.form-modal textarea,
.form-modal select {
  width: 100%;
  margin-bottom: 0.9rem;
  padding: 0.65rem;
  border-radius: 10px;
  border: 1px solid #ccc;
  font-size: 1rem;
}

.form-modal label {
  font-weight: 500;
  margin: 0.5rem 0 0.3rem;
  display: block;
}

.form-modal input:focus,
.form-modal textarea:focus,
.form-modal select:focus {
  border-color: #2563eb;
  outline: none;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  transition: box-shadow 0.2s ease;
}

.form-modal ::placeholder {
  color: #999;
  font-style: italic;
}

.checkbox-group.tags {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.4rem 1rem;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.form-actions button {
  flex: 1;
  padding: 0.6rem;
  font-size: 1rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.form-actions button:first-child {
  background: #e5e7eb;
}

.form-actions button:last-child {
  background: #2563eb;
  color: white;
}

.end-spacer {
  flex: 0 0 0.1px; 
  pointer-events: none;
}

.form-modal-overlay {
  animation: fadeIn 0.2s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes slideUp {
  0% { transform: translateY(100%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

input[type="file"] {
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  background-color: #f3f4f6;
  padding: 0.4rem;
  border-radius: 8px;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

</style>