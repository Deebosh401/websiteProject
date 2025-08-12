<template>
  <div class="guides-section">
    <!-- Header -->
    <div class="guides-header">
      <h2>Наши гиды</h2>
      <span class="view-all" @click="goToAllGuides">Все гиды</span>
    </div>

    <!-- Filters -->
    <div class="filters">
      <input
        v-model="query"
        class="filter-input"
        type="search"
        placeholder="Поиск по имени или экскурсии…"
        aria-label="Поиск гида"
      />

      <select v-model="selectedCity" class="filter-select" aria-label="Город">
        <option value="">Все города</option>
        <option v-for="c in citiesList" :key="c" :value="c">{{ c }}</option>
      </select>

      <select v-model="selectedLang" class="filter-select" aria-label="Язык">
        <option value="">Любой язык</option>
        <option v-for="l in languagesList" :key="l" :value="l">{{ l }}</option>
      </select>

      <input
        v-model="selectedDate"
        class="filter-date"
        type="date"
        aria-label="Дата доступности"
      />

      <select v-model="sortBy" class="filter-select" aria-label="Сортировка">
        <option value="rating">По рейтингу</option>
        <option value="price">По цене</option>
        <option value="reviews">По отзывам</option>
      </select>
    </div>

    <!-- Listing: slider on mobile, grid on desktop -->
    <div class="guides-list">
      <div
        v-for="guide in displayedGuides"
        :key="guide.id"
        class="guide-card compact"
        @click="goToGuide(guide)"
        role="button"
        :aria-label="`Открыть профиль гида ${guide.name}`"
      >
        <!-- avatar top-left -->
        <img :src="guide.avatar" class="guide-avatar tl" :alt="`Фото гида ${guide.name}`" loading="lazy" />

        <!-- top row: name + rating -->
        <div class="row-top">
          <h3 class="guide-name">{{ guide.name }}</h3>
          <div class="guide-rating" :title="`${guide.rating} • ${guide.reviews} отзывов`">⭐ {{ guide.rating.toFixed(1) }}</div>
        </div>

        <!-- second row: city + price -->
        <div class="row-meta">
          <span class="meta-item">
            <Icon icon="mdi:map-marker" class="meta-icon" /> {{ guide.city }}
          </span>
          <span class="meta-item">
            <Icon icon="mdi:ticket-confirmation-outline" class="meta-icon" /> от {{ guide.priceFrom }} ₽
          </span>
        </div>

        <!-- languages inline, abbreviated -->
        <div class="row-langs">
          <span v-for="lang in guide.languages" :key="lang" class="chip chip-lang">
            {{ langCode(lang) }}
          </span>
        </div>

        <!-- actions: details + fixed heart -->
        <div class="row-actions" @click.stop>
          <button class="details-button" @click="showDetails(guide)">Подробнее</button>
          <button
            class="heart-button"
            @click="toggleFavorite(guide)"
            :aria-pressed="favorites.has(guide.id)"
            :title="favorites.has(guide.id) ? 'В избранном' : 'В избранное'"
          >
            <Icon :icon="favorites.has(guide.id) ? 'mdi:heart' : 'mdi:heart-outline'" />
          </button>
        </div>

        <!-- availability hint if date selected -->
        <div class="row-availability" v-if="selectedDate">
          <span :class="guideIsAvailable(guide, selectedDate) ? 'avail ok' : 'avail no'">
            <Icon :icon="guideIsAvailable(guide, selectedDate) ? 'mdi:check' : 'mdi:close'" />
            {{ guideIsAvailable(guide, selectedDate) ? 'Свободен' : 'Занят' }} в выбранную дату
          </span>
        </div>
      </div>

      <p v-if="!displayedGuides.length" class="empty-hint">
        Ничего не найдено. Попробуйте изменить фильтры.
      </p>
    </div>

    <!-- Guide Modal -->
    <div v-if="activeGuide" class="guide-modal-overlay" @click.self="closeModal">
      <div class="guide-modal">
  <img :src="activeGuide.avatar" class="modal-avatar" :alt="`Фото гида ${activeGuide.name}`" />
  <h3 class="modal-name">{{ activeGuide.name }}</h3>

  <!-- meta row -->
  <div class="modal-meta">
    <span class="meta-item">
      <Icon icon="mdi:map-marker" /> {{ activeGuide.city }}
    </span>
    <span class="meta-item">
      <Icon icon="mdi:star" /> {{ activeGuide.rating.toFixed(1) }} ({{ activeGuide.reviews }})
    </span>
    <span class="meta-item">
      <Icon icon="mdi:cash-multiple" /> от {{ activeGuide.priceFrom }} ₽
    </span>
  </div>

  <!-- languages -->
  <div class="modal-langs">
    <span class="langs-label">Языки:</span>
    <div class="langs-chips">
      <span v-for="lang in activeGuide.languages" :key="lang" class="chip chip-pill">
        {{ langCode(lang) }}
      </span>
    </div>
  </div>

  <p class="modal-bio">{{ activeGuide.bio }}</p>

  <div class="modal-actions">
    <button class="cta" @click="book(activeGuide)">
      <Icon icon="mdi:calendar" /> Забронировать
    </button>
    <button class="secondary" @click="closeModal">Закрыть</button>
  </div>
</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

type Guide = {
  id: number
  name: string
  city: string
  languages: string[]
  rating: number
  reviews: number
  priceFrom: number
  verified: boolean
  avatar: string
  bio: string
  availability: string[] // ISO 'YYYY-MM-DD'
}

const router = useRouter()

// Demo data (move to API/store). Ensure avatars are in /public.
const guides = ref<Guide[]>([
  {
    id: 1,
    name: 'Анна',
    city: 'Калининград',
    languages: ['Русский', 'Английский',"Немецкий","Французский","Испанский"],
    rating: 4.8,
    reviews: 57,
    priceFrom: 2500,
    verified: true,
    avatar: '/guide1.png',
    bio: 'Лицензированный гид. История Кёнигсберга, прогулки по Кантовскому острову и Янтарному.',
    availability: ['2025-08-14', '2025-08-16', '2025-08-20']
  },
  {
    id: 2,
    name: 'Илья',
    city: 'Светлогорск',
    languages: ['Русский', 'Испанский'],
    rating: 4.9,
    reviews: 81,
    priceFrom: 3000,
    verified: true,
    avatar: '/guide2.png',
    bio: 'Морская тематика, закаты на набережной, камерные экскурсии для пар.',
    availability: ['2025-08-13', '2025-08-14', '2025-08-21']
  },
  {
    id: 3,
    name: 'Мария',
    city: 'Зеленоградск',
    languages: ['Русский', 'Немецкий'],
    rating: 5.0,
    reviews: 102,
    priceFrom: 2800,
    verified: false,
    avatar: '/guide3.png',
    bio: 'Семейные маршруты, дюны и зелёные зоны, кафе с лучшими десертами.',
    availability: ['2025-08-15', '2025-08-18', '2025-08-22']
  }
])

// Filters / sorting
const query = ref('')
const selectedCity = ref('')
const selectedLang = ref('')
const selectedDate = ref<string>('')
const sortBy = ref<'rating' | 'price' | 'reviews'>('rating')

const favorites = ref<Set<number>>(new Set())

const citiesList = computed(() =>
  Array.from(new Set(guides.value.map(g => g.city))).sort()
)
const languagesList = computed(() => {
  const set = new Set<string>()
  for (const g of guides.value) for (const l of g.languages) set.add(l)
  return Array.from(set).sort()
})

function guideIsAvailable(g: Guide, dateISO: string) {
  return g.availability.includes(dateISO)
}

// Abbreviations RU/EN/DE/ES/FR (+ fallback)
const LANG_MAP: Record<string, string> = {
  'русский': 'RU', 'русский язык': 'RU', 'ru': 'RU',
  'английский': 'EN', 'english': 'EN', 'en': 'EN',
  'немецкий': 'DE', 'deutsch': 'DE', 'de': 'DE',
  'испанский': 'ES', 'español': 'ES', 'es': 'ES',
  'французский': 'FR', 'français': 'FR', 'fr': 'FR'
}
function langCode(name: string) {
  const key = name.trim().toLowerCase()
  return LANG_MAP[key] ?? key.slice(0, 2).toUpperCase()
}

const filteredGuides = computed(() => {
  const q = query.value.trim().toLowerCase()
  return guides.value.filter(g => {
    const matchesQuery = !q || g.name.toLowerCase().includes(q) || g.bio.toLowerCase().includes(q)
    const matchesCity = !selectedCity.value || g.city === selectedCity.value
    const matchesLang = !selectedLang.value || g.languages.includes(selectedLang.value)
    const matchesDate = !selectedDate.value || guideIsAvailable(g, selectedDate.value)
    return matchesQuery && matchesCity && matchesLang && matchesDate
  })
})

const displayedGuides = computed(() => {
  const s = [...filteredGuides.value]
  if (sortBy.value === 'rating') s.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
  else if (sortBy.value === 'price') s.sort((a, b) => a.priceFrom - b.priceFrom)
  else if (sortBy.value === 'reviews') s.sort((a, b) => b.reviews - a.reviews)
  return s
})

// actions
const activeGuide = ref<Guide | null>(null)
function showDetails(g: Guide) { activeGuide.value = g }
function closeModal() { activeGuide.value = null }
function toggleFavorite(g: Guide) {
  favorites.value.has(g.id) ? favorites.value.delete(g.id) : favorites.value.add(g.id)
}
function goToAllGuides() { router.push({ name: 'all-guides' }).catch(() => {}) }
function goToGuide(g: Guide) { showDetails(g) }
function book(g: Guide) { alert(`Забронировать ${g.name} — скоро подключим бронирование 🙂`) }
</script>

<style scoped>
.guides-section { margin-top: 0; }

.guides-header{
  display:flex;justify-content:space-between;align-items:center;
  margin:0 5vw .5rem;
}
.guides-header h2{font-size:clamp(1.2rem,3.5vw,1.5rem);font-weight:700}
.view-all{
  font-size:16px;font-weight:500;color:rgb(26,58,107);cursor:pointer;
  padding:5px 10px;border-radius:8px;
  transition:background-color .3s ease,color .3s ease,transform .2s ease;
}
.view-all:hover{
  background-color:rgba(255,218,185,.3);transform:scale(1.05);
  border-radius:16px;color:#00b4d8;box-shadow:0 2px 8px rgba(0,0,0,.06);
}

.filters{
  display:grid;grid-template-columns:1fr 140px 160px 150px 160px;
  gap:.6rem;padding:.5rem 5vw 1rem;
}
.filter-input,.filter-select,.filter-date{
  width:100%;height:40px;padding:0 .75rem;border-radius:10px;
  border:1px solid #e5e7eb;background:#fff;font-size:.95rem;
}
.filter-input:focus,.filter-select:focus,.filter-date:focus{
  outline:none;border-color:#cbd5e1;box-shadow:0 0 0 3px rgba(59,130,246,.15);
}

.guides-list{
  display:grid;grid-auto-flow:column;grid-auto-columns:80%;
  gap:.5rem;padding:0 5vw 2rem;overflow-x:auto;
  scroll-snap-type:x mandatory;scrollbar-width:none;
}
.guides-list::-webkit-scrollbar{display:none}
@media (min-width:768px){
  .guides-list{
    overflow:visible;grid-auto-flow:initial;grid-auto-columns:initial;
    grid-template-columns:repeat(3,1fr);
  }
}

.guide-card.compact{
  position:relative;padding:.9rem;
  background:linear-gradient(160deg,#d8d7d5,#fae0b966,#f7950347);
  border-radius:20px;box-shadow:2px 6px 14px rgba(0,0,0,.08);
  transition:transform .2s ease,box-shadow .25s ease,background .3s ease;
  display:grid;grid-template-columns:72px 1fr;grid-template-rows:auto auto auto;
  column-gap:.5rem;row-gap:.3rem;scroll-snap-align:center;
}
.guide-card.compact:hover{
  transform:translateY(-3px);
  box-shadow:0 10px 22px rgba(255,144,7,.22);
  background:linear-gradient(145deg,#ffeac7,#ffd59e);
}

.guide-avatar.tl{
  grid-column:1/2;grid-row:1/2;width:72px;height:72px;border-radius:50%;
  object-fit:cover;border:3px solid #b1b5bb;background:#fff;
  align-self:start;justify-self:start;
}

.row-top{
  grid-column:2/3;
  grid-row:1/2;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:.5rem
}
.row-meta{grid-column:2/3;grid-row:2/3;display:flex;align-items:center;gap:.9rem;flex-wrap:wrap;color:#4b5563;font-size:.92rem}
.row-actions{grid-column:2/3;grid-row:3/4;display:flex;align-items:center;gap:.6rem}
.row-availability{grid-column:2/3}

.row-langs{
  grid-column:1/2;grid-row:2/4;display:grid;grid-template-columns:repeat(2,1fr);
  gap:6px;align-content:start;
}

.guide-name{
  font-size:1rem;
  font-weight:800;
  letter-spacing:.2px;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.guide-rating{font-weight:800;color:#f59e0b;white-space:nowrap}

.meta-item{display:inline-flex;align-items:center;gap:.35rem}
.meta-icon{font-size:1rem}

.chip{background:rgba(255,255,255,.75);border:1px solid rgba(0,0,0,.06)}
.chip-lang{
  padding:.18rem .35rem;border-radius:999px;font-weight:700;font-size:.72rem;
  letter-spacing:.3px;min-width:auto;text-align:center;background:rgba(255,255,255,.85);
}

.details-button{
  background:rgba(45,45,45,.38);color:#fff;border:none;padding:.44rem .8rem;
  border-radius:10px;cursor:pointer;font-size:.92rem;font-weight:700;
  transition:transform .2s ease,background .3s ease;backdrop-filter:blur(8px);
  flex:0 0 auto;
}
.details-button:hover{transform:scale(1.04)}
.heart-button{
  width:40px;height:40px;flex:0 0 40px;display:grid;place-items:center;
  border-radius:10px;border:1px solid rgba(0,0,0,.08);background:rgba(255,255,255,.7);
}

.avail{
  display:inline-flex;align-items:center;gap:.35rem;
  font-size:.86rem;padding:.2rem .5rem;border-radius:8px;
}
.avail.ok{background:rgba(16,185,129,.1);color:#065f46}
.avail.no{background:rgba(239,68,68,.12);color:#7f1d1d}

.guide-modal-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,.3);backdrop-filter:blur(6px);
  display:grid;place-items:end;z-index:9999;
}

.guide-modal{
  background:#fff;width:100%;max-width:560px;margin:0 auto;
  border-radius:16px 16px 0 0;padding:20px 18px 22px;
  animation:slideUp .25s ease;display:grid;row-gap:12px;
}
.modal-avatar{
  width:96px;height:96px;border-radius:50%;object-fit:cover;margin:0 auto 6px;
}
.modal-name{margin:0 0 2px;text-align:center;font-size:1.25rem;font-weight:800}

.modal-meta{
  display:grid;grid-template-columns:repeat(3,1fr);gap:8px;color:#374151;font-size:.98rem;
}
.modal-meta .meta-item{justify-content:center;white-space:nowrap}

.modal-langs{
  display:grid;grid-template-columns:auto 1fr;align-items:center;column-gap:10px;row-gap:8px;
}
.modal-langs .langs-label{font-weight:800;white-space:nowrap}
.modal-langs .langs-chips{display:flex;flex-wrap:wrap;gap:6px}
.chip-pill{
  background:#f7f7f9;border:1px solid #e7e7ee;border-radius:999px;
  padding:4px 10px;font-weight:700;font-size:.85rem;letter-spacing:.3px;
}

/* Description & actions */
.modal-bio{margin:6px 0 4px;color:#3a3f47;font-size:1.02rem;line-height:1.55;text-align:center}
.modal-actions{
  display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:6px;
}
.cta,.secondary{
  height:48px;border-radius:12px;font-weight:800;display:inline-flex;
  align-items:center;justify-content:center;gap:8px;
}
.cta{background:linear-gradient(135deg,#2563eb,#00bcd4);color:#fff;border:none}
.secondary{background:#eceff3;color:#111827;border:none}

@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}

/* Small screens */
@media (max-width:360px){
  .guide-card.compact{column-gap:.6rem}
  .guide-avatar.tl{width:64px;height:64px}
  .row-langs{grid-template-columns:1fr 1fr;gap:5px}
  .modal-meta{grid-template-columns:1fr;row-gap:6px}
}

/* Responsive filters: collapse to 2 columns */
@media (max-width:860px){
  .filters{grid-template-columns:1fr 1fr}
}

</style>