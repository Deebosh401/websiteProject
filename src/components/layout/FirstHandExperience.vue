<template>
  <section class="fhe">
    <!-- Header -->
    <div class="fhe-header">
      <h2>От первого лица</h2>
      <button class="link" @click="goAll">Все маршруты</button>
    </div>

    <!-- Feature Carousel -->
    <div class="carousel" v-if="featured.length">
      <article
        v-for="t in featured"
        :key="t.id"
        class="feat-card"
        @click="openDetail(t)"
      >
        <div class="feat-media">
          <template v-if="isVideo(t.cover)">
            <video class="feat-img" autoplay muted loop playsinline preload="metadata">
              <source :src="t.cover" type="video/mp4" />
            </video>
          </template>
          <template v-else>
            <img :src="t.cover" class="feat-img" :alt="t.title" loading="lazy" />
          </template>
          <div class="feat-overlay">
            <h3 class="feat-title line-2">{{ t.title }}</h3>
            <div class="feat-meta">
              <span><Icon icon="mdi:clock-outline" /> {{ t.duration }}ч</span>
              <span><Icon icon="mdi:map-marker-distance" /> {{ t.distance }}км</span>
              <span class="diff" :data-diff="t.difficulty">{{ diffLabel(t.difficulty) }}</span>
            </div>
          </div>
        </div>
      </article>

      <!-- Create new route -->
      <button class="feat-create" @click="showCreate = true">
        <span>＋</span><em>Создать маршрут</em>
      </button>
    </div>

    <!-- Filters -->
    <div class="filters">
      <input v-model="q" class="f-input" type="search" placeholder="Поиск по названию, тегам…" />
      <div class="f-row">
        <select v-model="fDuration" class="f-select">
          <option value="">Длительность</option>
          <option value="0-2">до 2ч</option>
          <option value="2-4">2–4ч</option>
          <option value="4-8">4–8ч</option>
          <option value="8+">8+ ч</option>
        </select>
        <select v-model="fDistance" class="f-select">
          <option value="">Дистанция</option>
          <option value="0-5">до 5км</option>
          <option value="5-10">5–10км</option>
          <option value="10-20">10–20км</option>
          <option value="20+">20+ км</option>
        </select>
        <select v-model="fDifficulty" class="f-select">
          <option value="">Сложность</option>
          <option value="easy">Лёгкий</option>
          <option value="moderate">Средний</option>
          <option value="hard">Сложный</option>
        </select>
      </div>

      <div class="chip-row">
        <button
          v-for="tag in allTags"
          :key="tag"
          class="chip"
          :class="{ active: fTags.has(tag) }"
          @click="toggleTag(tag)"
        >#{{ tag }}</button>

        <div class="chip-split"></div>

        <button
          v-for="f in facilities"
          :key="f.key"
          class="chip"
          :class="{ active: fFacilities.has(f.key) }"
          @click="toggleFacility(f.key)"
          :title="f.label"
        >
          <Icon :icon="f.icon" /> {{ f.short }}
        </button>
      </div>
    </div>

    <!-- List -->
    <div class="grid">
      <article
        v-for="t in shown"
        :key="t.id"
        class="card"
        @click="openDetail(t)"
      >
        <div class="media">
          <template v-if="isVideo(t.cover)">
            <video class="thumb" autoplay muted loop playsinline preload="metadata">
              <source :src="t.cover" type="video/mp4" />
            </video>
          </template>
          <template v-else>
            <img :src="t.cover" class="thumb" :alt="t.title" loading="lazy" />
          </template>
          <div class="badge-diff" :data-diff="t.difficulty">{{ diffLabel(t.difficulty) }}</div>
          <button
            class="save"
            @click.stop="toggleSave(t.id)"
            :aria-pressed="saved.has(t.id)"
            :title="saved.has(t.id) ? 'В сохранённых' : 'Сохранить'"
          >
            <Icon :icon="saved.has(t.id) ? 'mdi:bookmark' : 'mdi:bookmark-outline'" />
          </button>
        </div>

        <div class="body">
          <h3 class="title line-2">{{ t.title }}</h3>

          <div class="metrics">
            <span><Icon icon="mdi:clock-outline" /> {{ t.duration }}ч</span>
            <span><Icon icon="mdi:map-marker-distance" /> {{ t.distance }}км</span>
            <span class="rate" :title="ratingTitle(t)">⭐ {{ t.ratings.overall.toFixed(1) }}</span>
          </div>

          <div class="facilities">
            <span v-if="t.facilities.toilets" title="Туалеты"><Icon icon="mdi:toilet" /></span>
            <span v-if="t.facilities.rest" title="Место отдыха"><Icon icon="mdi:bench" /></span>
            <span v-if="t.facilities.playground" title="Детская площадка"><Icon icon="mdi:castle" /></span>
            <span v-if="t.facilities.accessible" title="Доступность"><Icon icon="mdi:wheelchair-accessibility" /></span>
          </div>

          <div class="tags">
            <span class="tag" v-for="tag in t.tags.slice(0, 4)" :key="tag">#{{ tag }}</span>
          </div>

          <div class="actions" @click.stop>
            <button class="like" @click="toggleLike(t.id)" :aria-pressed="likes.has(t.id)">
              <Icon :icon="likes.has(t.id) ? 'mdi:heart' : 'mdi:heart-outline'" /> {{ likeCount(t.id) }}
            </button>
            <button class="comment" @click="openDetail(t)">
              <Icon icon="mdi:comment-outline" /> {{ t.comments.length }}
            </button>
            <button class="share" @click="share(t)">
              <Icon icon="mdi:share-variant" />
            </button>

            <div class="owner">
              <img :src="t.owner.avatar" alt="" />
              <span class="owner-name">{{ t.owner.name }}</span>
            </div>
          </div>
        </div>
      </article>
    </div>

    <!-- Empty state -->
    <p v-if="!shown.length" class="empty">Ничего не найдено. Измените фильтры.</p>

    <!-- Detail Drawer -->
    <div class="drawer" v-if="active" @click.self="closeDetail">
      <div class="sheet">
        <div class="sheet-bar"><div class="drag"></div></div>

        <div class="sheet-head">
          <h3 class="sheet-title">{{ active.title }}</h3>

          <!-- Centered responsive metric bar -->
          <div class="sheet-metrics">
            <div class="chip-metric"><Icon icon="mdi:clock-outline" /> {{ active.duration }}ч</div>
            <div class="chip-metric"><Icon icon="mdi:map-marker-distance" /> {{ active.distance }}км</div>
            <div class="chip-metric diff-pill" :data-diff="active.difficulty">{{ diffLabel(active.difficulty) }}</div>
            <div class="chip-metric rating">⭐ {{ active.ratings.overall.toFixed(1) }}</div>
          </div>
        </div>

        <!-- Media slider (openable) -->
        <div class="media-slider">
          <div class="media-track">
            <div v-for="(m, i) in active.media" :key="i" class="media-slide" @click="openViewer(m)">
              <template v-if="isVideo(m)">
                <video controls playsinline preload="metadata"><source :src="m" type="video/mp4" /></video>
              </template>
              <template v-else>
                <img :src="m" :alt="active.title + ' media ' + i" loading="lazy" />
              </template>
            </div>
          </div>
        </div>

        <!-- Map with animated pins -->
        <div class="map-box">
          <div ref="mapEl" class="map-frame">
            <!-- Map overlay elements -->
            <div class="map-overlay">
              <div class="map-stats">
                <div class="stat-item">
                  <Icon icon="mdi:map-marker-distance" />
                  <span>{{ active.stops.length }} остановок</span>
                </div>
                <div class="stat-item">
                  <Icon icon="mdi:clock-outline" />
                  <span>{{ active.duration }}ч</span>
                </div>
                <div class="stat-item">
                  <Icon icon="mdi:map-marker-path" />
                  <span>{{ active.distance }}км</span>
                </div>
              </div>
            </div>
          </div>
          <div class="map-hint">
            <Icon icon="mdi:information-outline" />
            Используйте элементы управления карты для навигации
          </div>
        </div>

        <!-- External Maps Button -->
        <div class="external-maps-section">
          <button class="btn external-maps-btn" @click="showExternalMapsModal = true">
            <Icon icon="mdi:map-marker" />
            <span>Открыть в картах</span>
            <Icon icon="mdi:open-in-new" class="external-icon" />
          </button>
        </div>

        <!-- Steps / Itinerary -->
        <div class="steps" v-if="active.stops?.length">
          <div class="steps-header">
            <h4>📍 Остановки</h4>
            <div class="steps-count">{{ active.stops.length }} мест</div>
          </div>
          <div class="steps-list">
            <div
              v-for="(s,i) in active.stops"
              :key="i"
              class="step-item"
              @mouseenter="focusPinAt(i)"
              @click="focusPinAt(i)"
            >
              <div class="step-number">{{ i + 1 }}</div>
              <div class="step-content">
                <div class="step-title">{{ s.title }}</div>
                <div class="step-note" v-if="s.note">{{ s.note }}</div>
                <div class="step-coordinates" v-if="s.lat && s.lng">
                  {{ s.lat.toFixed(4) }}, {{ s.lng.toFixed(4) }}
                </div>
              </div>
              <div class="step-actions">
                <Icon icon="mdi:map-marker" class="step-icon" />
                <Icon icon="mdi:chevron-right" class="step-arrow" />
              </div>
            </div>
          </div>
        </div>

        <!-- Ratings breakdown -->
        <div class="breakdown">
          <div class="breakdown-header">
            <h4>⭐ Оценки</h4>
            <div class="overall-rating">
              <span class="rating-number">{{ active.ratings.overall.toFixed(1) }}</span>
              <span class="rating-label">Общая оценка</span>
            </div>
          </div>
          <div class="rows">
            <div class="row">
              <div class="rating-label">
                <Icon icon="mdi:image" />
                <span>Виды</span>
              </div>
              <div class="bar"><div class="bar-fill" :style="barStyle(active.ratings.scenery)"></div></div>
              <b>{{ active.ratings.scenery.toFixed(1) }}</b>
            </div>
            <div class="row">
              <div class="rating-label">
                <Icon icon="mdi:wheelchair-accessibility" />
                <span>Доступность</span>
              </div>
              <div class="bar"><div class="bar-fill" :style="barStyle(active.ratings.access)"></div></div>
              <b>{{ active.ratings.access.toFixed(1) }}</b>
            </div>
            <div class="row">
              <div class="rating-label">
                <Icon icon="mdi:sofa" />
                <span>Комфорт</span>
              </div>
              <div class="bar"><div class="bar-fill" :style="barStyle(active.ratings.comfort)"></div></div>
              <b>{{ active.ratings.comfort.toFixed(1) }}</b>
            </div>
          </div>
        </div>

        <!-- Comments -->
        <div class="comments">
          <div class="comments-header">
            <h4>💬 Комментарии</h4>
            <div class="comments-count">{{ active.comments.length }} отзывов</div>
          </div>

          <div class="c-list">
            <div class="c-item" v-for="(c, i) in active.comments" :key="i">
              <img :src="c.user.avatar" />
              <div class="c-body">
                <div class="c-meta">
                  <b>{{ c.user.name }}</b>
                  <span class="c-date">{{ c.date }}</span>
                </div>
                <p class="c-text">{{ c.text }}</p>

                <!-- media thumbs in comments -->
                <div v-if="c.media?.length" class="c-media">
                  <div v-for="(m, k) in c.media" :key="k" class="c-thumb" @click="openViewer(m)">
                    <template v-if="isVideo(m)">
                      <video muted><source :src="m" type="video/mp4" /></video>
                    </template>
                    <template v-else>
                      <img :src="m" alt="" />
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- add comment -->
          <div class="c-form" @submit.prevent>
            <label class="attach">
              <input type="file" multiple accept="image/*,video/*" @change="handleCommentFiles" />
              <Icon icon="mdi:paperclip" />
            </label>
            <input v-model="newComment" type="text" placeholder="Оставьте комментарий…" />
            <button class="btn plane" @click="addComment" :disabled="!newComment.trim() && !pendingCommentMedia.length">
              <Icon icon="mdi:send" />
            </button>
          </div>

          <!-- selected files preview -->
          <div v-if="pendingCommentMedia.length" class="attach-previews">
            <div v-for="(m, i) in pendingCommentMedia" :key="i" class="ap-item" @click="openViewer(m)">
              <template v-if="isVideo(m)"><video muted><source :src="m" type="video/mp4" /></video></template>
              <template v-else><img :src="m" alt="" /></template>
            </div>
          </div>
        </div>

        <div class="sheet-actions">
          <button class="btn ghost" @click="closeDetail">Закрыть</button>
          <button class="btn save-btn" @click="toggleSave(active.id)">
            <Icon :icon="saved.has(active.id) ? 'mdi:bookmark' : 'mdi:bookmark-outline'" />
            {{ saved.has(active.id) ? 'Сохранено' : 'Сохранить' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Fullscreen viewer -->
    <div v-if="viewer.src" class="viewer" @click.self="closeViewer">
      <button class="viewer-close" @click="closeViewer"><Icon icon="mdi:close" /></button>
      <div class="viewer-body">
        <template v-if="isVideo(viewer.src)">
          <video controls playsinline autoplay class="viewer-media"><source :src="viewer.src" type="video/mp4" /></video>
        </template>
        <template v-else>
          <img :src="viewer.src" class="viewer-media" alt="" />
        </template>
      </div>
    </div>

    <!-- External Maps Modal -->
    <div class="modal" v-if="showExternalMapsModal" @click.self="showExternalMapsModal=false">
      <div class="panel external-maps-panel">
        <h3>🗺️ Открыть маршрут</h3>
        <p>Выберите, где открыть маршрут:</p>
        
        <div class="maps-options">
          <button class="map-option" @click="openInGoogleMaps">
            <div class="map-icon">🗺️</div>
            <div class="map-info">
              <strong>Google Maps</strong>
              <span>Открыть в браузере</span>
            </div>
          </button>
          
          <button class="map-option" @click="openInYandexMaps">
            <div class="map-icon">🧭</div>
            <div class="map-info">
              <strong>Яндекс.Карты</strong>
              <span>Открыть в браузере</span>
            </div>
          </button>
        </div>

        <div class="panel-actions">
          <button class="btn ghost" @click="showExternalMapsModal=false">Отмена</button>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <div class="modal" v-if="showCreate" @click.self="showCreate=false">
      <div class="panel">
        <h3>🧭 Новый маршрут</h3>
        <input v-model="form.title" placeholder="* Название" />
        <div class="row2">
          <input v-model.number="form.duration" type="number" min="0" placeholder="* Часы (напр. 3)" />
          <input v-model.number="form.distance" type="number" min="0" step="0.1" placeholder="* Км (напр. 5.5)" />
        </div>
        <select v-model="form.difficulty">
          <option disabled value="">* Сложность</option>
          <option value="easy">Лёгкий</option>
          <option value="moderate">Средний</option>
          <option value="hard">Сложный</option>
        </select>

        <textarea v-model="form.summary" placeholder="Краткое описание…"></textarea>
        
        <!-- Map for adding stops -->
        <div class="stops-section">
          <h4>📍 Остановки</h4>
          <div class="stops-map-container">
            <div ref="createMapEl" class="create-map-frame"></div>
            <div class="map-controls">
              <button class="btn small" @click="addStopFromMap">
                <Icon icon="mdi:map-marker-plus" />
                Добавить остановку
              </button>
            </div>
          </div>
          <div class="stops-list">
            <div v-for="(stop, index) in form.stops" :key="index" class="stop-item">
              <span class="stop-number">{{ index + 1 }}</span>
              <div class="stop-info">
                <input v-model="stop.title" placeholder="Название остановки" />
                <input v-model="stop.note" placeholder="Описание (необязательно)" />
              </div>
              <button class="remove-stop" @click="removeStop(index)">×</button>
            </div>
          </div>
        </div>

        <div class="row2">
          <label class="check"><input type="checkbox" v-model="form.facilities.toilets" /> Туалеты</label>
          <label class="check"><input type="checkbox" v-model="form.facilities.rest" /> Место отдыха</label>
        </div>
        <div class="row2">
          <label class="check"><input type="checkbox" v-model="form.facilities.playground" /> Детская площадка</label>
          <label class="check"><input type="checkbox" v-model="form.facilities.accessible" /> Доступность</label>
        </div>

        <input v-model="tagInput" @keydown.enter.prevent="addTag" placeholder="Теги (Enter)" />
        <div class="tags-edit">
          <span class="tag" v-for="(t, i) in form.tags" :key="t" @click="removeTag(i)">#{{ t }} ×</span>
        </div>

        <label class="uploader">
          <input type="file" multiple accept="image/*,video/*" @change="handleUpload" />
          <Icon icon="mdi:file-upload-outline" /> Медиa (фото/видео)
        </label>

        <div class="panel-actions">
          <button class="btn ghost" @click="showCreate=false">Отмена</button>
          <button class="btn" :disabled="!canCreate" @click="createRoute">Создать</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import maplibregl, { Map, Marker, LngLatBounds } from 'maplibre-gl'
import type { LngLatLike, GeoJSONSource,StyleSpecification } from 'maplibre-gl'
import type { LineString, Feature } from 'geojson'

// -------------------- Types --------------------
type Difficulty = 'easy' | 'moderate' | 'hard'
type Ratings = { overall: number; scenery: number; access: number; comfort: number }
type Comment = { user: { name: string; avatar: string }, text: string, date: string, media?: string[] }
type Stop = { title: string; note?: string; lat: number; lng: number }
type Trail = {
  id: number
  title: string
  cover: string
  media: string[]
  duration: number     // hours
  distance: number     // km
  difficulty: Difficulty
  tags: string[]
  facilities: { toilets: boolean; rest: boolean; playground: boolean; accessible: boolean }
  ratings: Ratings
  stops: Stop[]
  comments: Comment[]
  owner: { name: string; avatar: string }
  featured?: boolean
}

// -------------------- Utils --------------------
const isVideo = (src: string) => src.toLowerCase().endsWith('.mp4')
const diffLabel = (d: Difficulty) => d === 'easy' ? 'Лёгкий' : d === 'moderate' ? 'Средний' : 'Сложный'
const ratingTitle = (t: Trail) =>
  `Виды: ${t.ratings.scenery.toFixed(1)} • Доступность: ${t.ratings.access.toFixed(1)} • Комфорт: ${t.ratings.comfort.toFixed(1)}`

// -------------------- Demo data --------------------
const trails = ref<Trail[]>([
  {
    id: 1,
    title: 'Прогулка по Канта и Рыбной деревне',
    cover: '/Kaliningrad.jpeg',
    media: ['/Kaliningrad.jpeg', '/Svetlogorsk.jpeg'],
    duration: 3, distance: 4.8, difficulty: 'easy',
    tags: ['история', 'город', 'семейный'],
    facilities: { toilets: true, rest: true, playground: false, accessible: true },
    ratings: { overall: 4.7, scenery: 4.6, access: 4.8, comfort: 4.5 },
    stops: [
      { title: 'Кафедральный собор', note: 'Кантов остров, музыка органа', lat: 54.7100, lng: 20.5072 },
      { title: 'Рыбная деревня', note: 'Мосты и видовые площадки', lat: 54.7095, lng: 20.5137 }
    ],
    comments: [
      { user: { name: 'Анна', avatar: '/guide1.png' }, text: 'Очень уютно вечером!', date: '2025-08-01' }
    ],
    owner: { name: 'Илья', avatar: '/guide2.png' },
    featured: true
  },
  {
    id: 2,
    title: 'Закат в Светлогорске: набережная и парковая тропа',
    cover: '/Svetlogorsk.jpeg',
    media: ['/Svetlogorsk.jpeg'],
    duration: 2.5, distance: 5.2, difficulty: 'moderate',
    tags: ['море', 'виды', 'романтика'],
    facilities: { toilets: true, rest: true, playground: true, accessible: false },
    ratings: { overall: 4.9, scenery: 5.0, access: 4.2, comfort: 4.6 },
    stops: [
      { title: 'Набережная', note: 'Лучшие фото у моря', lat: 54.9431, lng: 20.1565 },
      { title: 'Парк', note: 'Тихие дорожки среди сосен', lat: 54.9439, lng: 20.1438 }
    ],
    comments: [],
    owner: { name: 'Мария', avatar: '/guide3.png' },
    featured: true
  },
  {
    id: 3,
    title: 'Дюны Зеленоградска: семейная прогулка',
    cover: '/Zelenogradsk.jpeg',
    media: ['/Zelenogradsk.jpeg'],
    duration: 4, distance: 8.3, difficulty: 'easy',
    tags: ['семейный', 'природа'],
    facilities: { toilets: false, rest: true, playground: true, accessible: false },
    ratings: { overall: 4.6, scenery: 4.8, access: 4.1, comfort: 4.2 },
    stops: [],
    comments: [],
    owner: { name: 'Артём', avatar: '/guide1.png' }
  },
  {
    id: 4,
    title: 'Прогулка по Канта и Рыбной деревне',
    cover: '/Kaliningrad.jpeg',
    media: ['/Kaliningrad.jpeg', '/Svetlogorsk.jpeg'],
    duration: 3, distance: 4.8, difficulty: 'hard',
    tags: ['история', 'город', 'семейный'],
    facilities: { toilets: true, rest: true, playground: false, accessible: true },
    ratings: { overall: 4.7, scenery: 4.6, access: 4.8, comfort: 4.5 },
    stops: [
      { title: 'Кафедральный собор', note: 'Кантов остров, музыка органа', lat: 54.7100, lng: 20.5072 },
      { title: 'Рыбная деревня', note: 'Мосты и видовые площадки', lat: 54.7095, lng: 20.5137 }
    ],
    comments: [],
    owner: { name: 'Илья', avatar: '/guide2.png' },
    featured: true
  },
])

const featured = computed(() => trails.value.filter(t => t.featured))

// -------------------- Social (likes/saves) --------------------
const saved = ref<Set<number>>(new Set())
const likes = ref<Set<number>>(new Set())

onMounted(() => {
  const s = localStorage.getItem('fhe_saved'); if (s) saved.value = new Set(JSON.parse(s))
  const l = localStorage.getItem('fhe_likes'); if (l) likes.value = new Set(JSON.parse(l))
})

const persist = () => {
  localStorage.setItem('fhe_saved', JSON.stringify([...saved.value]))
  localStorage.setItem('fhe_likes', JSON.stringify([...likes.value]))
}
const toggleSave = (id: number) => { saved.value.has(id) ? saved.value.delete(id) : saved.value.add(id); persist() }
const toggleLike = (id: number) => { likes.value.has(id) ? likes.value.delete(id) : likes.value.add(id); persist() }
const likeCount = (id: number) => (likes.value.has(id) ? 1 : 0)

// ---- Fullscreen viewer state & actions (used by the template) ----
const viewer = ref<{ open: boolean; src: string | null; isVideo: boolean }>({
  open: false,
  src: null,
  isVideo: false
})

const openViewer = (src: string) => {
  viewer.value.open = true
  viewer.value.src = src
  viewer.value.isVideo = isVideo(src)
}

const closeViewer = () => {
  viewer.value.open = false
  viewer.value.src = null
  viewer.value.isVideo = false
}


// -------------------- Filters --------------------
const q = ref('')
const fDuration = ref('')                 // "0-2" | "2-4" | "8+"
const fDistance = ref('')                 // "0-5" | "5-10" | "20+"
const fDifficulty = ref<Difficulty | ''>('') 
const fTags = ref<Set<string>>(new Set())
const fFacilities = ref<Set<string>>(new Set())

const allTags = computed(() => {
  const s = new Set<string>()
  trails.value.forEach(t => t.tags.forEach(tag => s.add(tag)))
  return Array.from(s).sort()
})

const facilities = [
  { key: 'toilets', label: 'Туалеты', short: 'WC', icon: 'mdi:toilet' },
  { key: 'rest', label: 'Место отдыха', short: 'Rest', icon: 'mdi:bench' },
  { key: 'playground', label: 'Площадка', short: 'Kids', icon: 'mdi:castle' },
  { key: 'accessible', label: 'Доступно', short: 'ACC', icon: 'mdi:wheelchair-accessibility' }
] as const

const matchesRange = (val: number, spec: string) => {
  if (!spec) return true
  if (spec.endsWith('+')) return val >= parseFloat(spec)
  const [a, b] = spec.split('-').map(parseFloat)
  return val >= a && val < b
}

const filtered = computed(() =>
  trails.value.filter(t => {
    const text = `${t.title} ${t.tags.join(' ')}`.toLowerCase()
    const passQ = !q.value || text.includes(q.value.trim().toLowerCase())
    const passDur = matchesRange(t.duration, fDuration.value)
    const passDist = matchesRange(t.distance, fDistance.value)
    const passDiff = !fDifficulty.value || t.difficulty === fDifficulty.value
    const passTags = !fTags.value.size || [...fTags.value].every(tag => t.tags.includes(tag))
    const passFacilities = !fFacilities.value.size || [...fFacilities.value].every(k => (t.facilities as any)[k])
    return passQ && passDur && passDist && passDiff && passTags && passFacilities
  })
)

const shown = computed(() => {
  const arr = [...filtered.value]
  arr.sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || b.ratings.overall - a.ratings.overall)
  return arr
})

const toggleTag = (tag: string) => { fTags.value.has(tag) ? fTags.value.delete(tag) : fTags.value.add(tag) }
const toggleFacility = (key: string) => { fFacilities.value.has(key) ? fFacilities.value.delete(key) : fFacilities.value.add(key) }

// -------------------- Drawer / Detail --------------------
const active = ref<Trail | null>(null)
const newComment = ref('')
const newCommentFiles = ref<File[]>([])
const showExternalMapsModal = ref(false)

const openDetail = (t: Trail) => { active.value = t; newComment.value = ''; newCommentFiles.value = [] }
const closeDetail = () => { active.value = null }

const addComment = () => {
  if (!active.value) return
  const txt = newComment.value.trim()
  if (!txt && newCommentFiles.value.length === 0) return
  const media: string[] = []
  newCommentFiles.value.forEach(f => media.push(URL.createObjectURL(f)))
  active.value.comments.push({
    user: { name: 'Гость', avatar: '/guide2.png' },
    text: txt || '📎 Вложение',
    date: new Date().toISOString().slice(0, 10),
    media
  })
  newComment.value = ''
  newCommentFiles.value = []
}

// -------------------- Share --------------------
const share = async (t: Trail) => {
  const url = location.origin + '/routes/' + t.id
  if ((navigator as any).share) {
    try { await (navigator as any).share({ title: t.title, url }) } catch {}
  } else {
    await navigator.clipboard.writeText(url)
    alert('Ссылка скопирована!')
  }
}

// -------------------- Create route modal --------------------
const showCreate = ref(false)
const form = ref({
  title: '',
  duration: null as number | null,
  distance: null as number | null,
  difficulty: '' as '' | Difficulty,
  summary: '',
  tags: [] as string[],
  facilities: { toilets: false, rest: false, playground: false, accessible: false },
  media: [] as string[],
  stops: [] as { title: string; note?: string; lat: number; lng: number }[]
})
const tagInput = ref('')

const addTag = () => {
  const v = tagInput.value.trim().toLowerCase()
  if (v && !form.value.tags.includes(v)) form.value.tags.push(v)
  tagInput.value = ''
}
const removeTag = (i: number) => form.value.tags.splice(i, 1)
const handleUpload = (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files || [])
  files.forEach(f => form.value.media.push(URL.createObjectURL(f)))
}
const canCreate = computed(() =>
  !!form.value.title && !!form.value.duration && !!form.value.distance && !!form.value.difficulty && form.value.media.length > 0
)
const createRoute = () => {
  const id = Math.max(0, ...trails.value.map(t => t.id)) + 1
  const cover = form.value.media[0]
  trails.value.unshift({
    id,
    title: form.value.title,
    cover,
    media: [...form.value.media],
    duration: form.value.duration!,
    distance: form.value.distance!,
    difficulty: form.value.difficulty as Difficulty,
    tags: [...form.value.tags],
    facilities: { ...form.value.facilities },
    ratings: { overall: 5, scenery: 5, access: 5, comfort: 5 },
    stops: [],
    comments: [],
    owner: { name: 'Вы', avatar: '/guide1.png' },
    featured: false
  })
  showCreate.value = false
  form.value = {
    title: '',
    duration: null,
    distance: null,
    difficulty: '',
    summary: '',
    tags: [],
    facilities: { toilets: false, rest: false, playground: false, accessible: false },
    media: [],
    stops: []
  }
}

// -------------------- Nav stub --------------------
const goAll = () => window.scrollTo({ top: 0, behavior: 'smooth' })

// -------------------- Map (MapLibre GL JS) --------------------
const mapEl = ref<HTMLDivElement | null>(null)
let map: Map | null = null
let markers: Marker[] = []

const ROUTE_SOURCE_ID = 'route-src'
const ROUTE_LAYER_ID = 'route-line'
const ROUTE_PROGRESS_SOURCE_ID = 'route-progress-src'
const ROUTE_PROGRESS_LAYER_ID = 'route-progress-line'

const makePinEl = (delayMs = 0) => {
  const el = document.createElement('div')
  el.className = 'apple-pin pin-drop'
  el.innerHTML = `<div class="pin-emoji" style="animation-delay:${delayMs}ms">📍</div>`
  return el
}



const cleanupMap = () => {
  if (!map) return
  markers.forEach(m => m.remove())
  markers = []
  if (map.getLayer(ROUTE_PROGRESS_LAYER_ID)) map.removeLayer(ROUTE_PROGRESS_LAYER_ID)
  if (map.getLayer(ROUTE_LAYER_ID)) map.removeLayer(ROUTE_LAYER_ID)
  if (map.getSource(ROUTE_PROGRESS_SOURCE_ID)) map.removeSource(ROUTE_PROGRESS_SOURCE_ID)
  if (map.getSource(ROUTE_SOURCE_ID)) map.removeSource(ROUTE_SOURCE_ID)
  map.remove()
  map = null
}

const MAPTILER_STYLE:StyleSpecification = {
  version: 8,
  sources: {
    maptiler: {
      type: 'raster',
      tiles: ['https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=Fuo1P4u5HZvd7RfCDyrP'],
      tileSize: 256,
      attribution: '© MapTiler © OpenStreetMap contributors'
    }
  },
  layers: [
    { id: 'maptiler', type: 'raster', source: 'maptiler' }
  ]
} 

// ---- Distance & helpers ----
type LngLat = [number, number];

function toLngLat(s: { lng: number; lat: number }): LngLat {
  return [s.lng, s.lat];
}

// Haversine (meters)
function haversine(a: LngLat, b: LngLat): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Find index of closest vertex on the route polyline to a given stop
function closestIndexOnRoute(route: LngLat[], stop: LngLat): number {
  let best = 0, bestD = Number.POSITIVE_INFINITY;
  for (let i = 0; i < route.length; i++) {
    const d = haversine(route[i], stop);
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
}

// Preprocess route with cumulative meters
function preprocessRoute(route: LngLat[]) {
  const cum: number[] = [0];
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    total += haversine(route[i - 1], route[i]);
    cum.push(total);
  }
  return { cum, total };
}

// ---- Fetch a real walking route from OSRM ----

async function fetchOSRMRoute(stops: Stop[]): Promise<LngLat[]> {
  const coords = stops.map(s => `${s.lng},${s.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/foot/${coords}?overview=simplified&geometries=geojson&steps=false`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('OSRM request failed');
  const json = await res.json();
  const line: LngLat[] = json?.routes?.[0]?.geometry?.coordinates ?? [];
  
  // Simplify route for better performance - reduce coordinates by 50%
  if (line.length > 10) {
    const simplified = [];
    for (let i = 0; i < line.length; i += 2) {
      simplified.push(line[i]);
    }
    // Always include the last point
    if (line.length > 1 && simplified[simplified.length - 1] !== line[line.length - 1]) {
      simplified.push(line[line.length - 1]);
    }
    return simplified;
  }
  
  return line;
}

// ---- Animate the blue "snake" line and trigger pins as it passes stops ----
let animationRAF: number | null = null;

function animateSnake(
  route: LngLat[],
  onProgressVertex: (vertexIdx: number) => void,
  metersPerSecond = 200    // Much faster for better performance
) {
  if (!map) return;
  if (animationRAF) cancelAnimationFrame(animationRAF);

  const { cum, total } = preprocessRoute(route);
  const start = performance.now();
  const src = map.getSource(ROUTE_SOURCE_ID) as GeoJSONSource;

  let lastVertex = 0;
  let lastBoundsCheck = 0;
  let boundsUpdateInProgress = false;
  let currentZoomLevel = map.getZoom();
  let zoomOutStep = 0.5; // Zoom out by 0.5 levels each time

  const step = (t: number) => {
    const elapsed = (t - start) / 1000;        // seconds
    
    // Smooth easing function for more natural animation
    const easeProgress = 1 - Math.pow(1 - Math.min(elapsed / (total / metersPerSecond), 1), 3);
    const traveled = total * easeProgress;

    // find the last vertex whose cumulative distance <= traveled
    let i = lastVertex;
    while (i < cum.length && cum[i] <= traveled) i++;
    const currVertex = Math.min(i, route.length - 1);

    // Smooth interpolation between vertices
    let smoothRoute = route.slice(0, currVertex + 1);
    
    if (currVertex < route.length - 1 && currVertex > 0) {
      const prevDist = cum[currVertex];
      const nextDist = cum[currVertex + 1];
      const progress = (traveled - prevDist) / (nextDist - prevDist);
      
      if (progress > 0 && progress < 1) {
        const prevPoint = route[currVertex];
        const nextPoint = route[currVertex + 1];
        
        // Linear interpolation between points
        const interpolatedPoint = [
          prevPoint[0] + (nextPoint[0] - prevPoint[0]) * progress,
          prevPoint[1] + (nextPoint[1] - prevPoint[1]) * progress
        ];
        
        smoothRoute.push(interpolatedPoint as LngLat);
      }
    }

    // update polyline with smooth route
    src.setData({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: smoothRoute },
      properties: {}
    });

    // Update progress layer for smooth animation
    if (map) {
      const progressSrc = map.getSource(ROUTE_PROGRESS_SOURCE_ID) as GeoJSONSource;
      if (progressSrc) {
        progressSrc.setData({
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: smoothRoute },
          properties: {}
        });
      }
    }

    // Progressive bounds checking every 0.3 seconds for better performance
    const timeSinceLastCheck = elapsed - lastBoundsCheck;
    if (timeSinceLastCheck >= 0.3 && !boundsUpdateInProgress && map) {
      const currentPoint = route[currVertex];
      const currentMapBounds = map.getBounds();
      
      // Check if current point is out of bounds
      const margin = 0.001; // Larger margin for step-by-step approach
      const isOutOfBounds = !currentMapBounds.contains(currentPoint);
      const isNearEdge = 
        currentPoint[0] <= currentMapBounds.getWest() + margin ||
        currentPoint[0] >= currentMapBounds.getEast() - margin ||
        currentPoint[1] <= currentMapBounds.getSouth() + margin ||
        currentPoint[1] >= currentMapBounds.getNorth() - margin;

      if (isOutOfBounds || isNearEdge || currVertex === route.length - 1) {
        boundsUpdateInProgress = true;
        
        if (isOutOfBounds || isNearEdge) {
          // Step-by-step zoom OUT to see more of the trail
          const newZoom = Math.max(10, currentZoomLevel - zoomOutStep);
          currentZoomLevel = newZoom;
          
          // Calculate new center to keep trail visible
          const currentCenter = map.getCenter();
          const directionToPoint = [
            currentPoint[0] - currentCenter.lng,
            currentPoint[1] - currentCenter.lat
          ];
          
          // Move center towards the trail point
          const newCenter = [
            currentCenter.lng + directionToPoint[0] * 0.3,
            currentCenter.lat + directionToPoint[1] * 0.3
          ];
          
          // Smooth zoom OUT and center adjustment
          map.easeTo({
            center: newCenter as [number, number],
            zoom: newZoom,
            duration: 800,
            easing: (t) => t * (2 - t)
          });
        } else {
          // Final zoom to fit entire trail with 5% extra space
          const finalBounds = new LngLatBounds();
          route.forEach(coord => finalBounds.extend(coord as LngLatLike));
          
          // Add 5% padding to the bounds
          const lngPadding = (finalBounds.getEast() - finalBounds.getWest()) * 0.05;
          const latPadding = (finalBounds.getNorth() - finalBounds.getSouth()) * 0.05;
          
          finalBounds.extend([finalBounds.getWest() - lngPadding, finalBounds.getSouth() - latPadding]);
          finalBounds.extend([finalBounds.getEast() + lngPadding, finalBounds.getNorth() + latPadding]);
          
          map.fitBounds(finalBounds, {
            padding: { top: 20, bottom: 20, left: 20, right: 20 },
            duration: 1200,
            easing: (t) => t * (2 - t)
          });
        }
        
        map.once('moveend', () => {
          boundsUpdateInProgress = false;
        });
        
        lastBoundsCheck = elapsed;
      }
    }

    // notify when we advance past a new vertex
    if (currVertex > lastVertex) {
      onProgressVertex(currVertex);
      lastVertex = currVertex;
    }

    if (traveled < total) {
      // Use requestAnimationFrame directly for smoother animation
      animationRAF = requestAnimationFrame(step);
    } else {
      animationRAF = null;
    }
  };

  animationRAF = requestAnimationFrame(step);
}


const initMap = async (trail: Trail) => {
  if (!mapEl.value || !trail?.stops?.length) return;

  cleanupMap();

  map = new maplibregl.Map({
    container: mapEl.value,
    style: MAPTILER_STYLE,
    attributionControl: false
  });

  // Enable basic map interactions
  map.scrollZoom.enable();
  map.boxZoom.enable();
  map.dragPan.enable();
  map.keyboard.enable();
  map.doubleClickZoom.enable();
  map.touchZoomRotate.enable();
  // Keep drag rotate disabled for better UX
  map.dragRotate.disable();

  const lnglats: LngLat[] = trail.stops.map(toLngLat);
  const bounds = lnglats.reduce(
    (b, [lng, lat]) => b.extend([lng, lat] as LngLatLike),
    new LngLatBounds(lnglats[0], lnglats[0])
  );

  map.on('load', async () => {
    console.log('Map loaded, starting pin creation...');
    
    // Add visual enhancements
    map!.addControl(new maplibregl.NavigationControl(), 'top-right');
    map!.addControl(new maplibregl.FullscreenControl(), 'top-right');
    
    // Start with a zoomed-in view of the first stop
    map!.setCenter(lnglats[0]);
    map!.setZoom(14);

    // Add pins with drop animation
    markers.forEach(m => m.remove());
    markers = [];
    

    
    // Drop pins with staggered delay
    console.log('Creating', trail.stops.length, 'pins');
    for (let i = 0; i < trail.stops.length; i++) {
      const s = trail.stops[i];
      const el = makePinEl(i * 150); // Staggered drop timing
      const mk = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([s.lng, s.lat])
        .addTo(map!);
      el.title = `${s.title}\n${s.note ?? ''}`.trim();
      markers.push(mk);
      console.log(`Pin ${i + 1} created at [${s.lng}, ${s.lat}]`);
      
      // Remove drop class after animation (Apple-style timing)
      setTimeout(() => {
        el.classList.remove('pin-drop');
        console.log(`Pin ${i + 1} dropped, classes:`, el.className);
        // Add bounce after drop animation completes
        setTimeout(() => {
          el.classList.add('pin-bounce');
          console.log(`Pin ${i + 1} bouncing, classes:`, el.className);
          setTimeout(() => {
            el.classList.remove('pin-bounce');
            console.log(`Pin ${i + 1} bounce finished, classes:`, el.className);
          }, 800);
        }, 100);
      }, i * 200 + 600);
    }

    // Wait for all pins to drop and bounce, then zoom to fit entire trail
    const totalDropTime = trail.stops.length * 200 + 1500; // All drops + bounce time
    setTimeout(async () => {
      // Start with zoom that shows the entire trail
      map!.fitBounds(bounds, { 
        padding: { top: 80, bottom: 80, left: 80, right: 80 },
        duration: 1000,
        easing: (t) => t * (2 - t) // Smooth easing
      });

      // Wait for zoom to complete, then start the snake
      setTimeout(async () => {
        // Prepare route layer
        const emptyLine: Feature<LineString> = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        };

        map!.addSource(ROUTE_SOURCE_ID, {
          type: 'geojson',
          data: emptyLine
        });

        map!.addLayer({
          id: ROUTE_LAYER_ID,
          type: 'line',
          source: ROUTE_SOURCE_ID,
          paint: {
            'line-color': '#3b82f6',
            'line-width': 6,
            'line-opacity': 0.9,
            'line-blur': 1,
            'line-dasharray': [0, 0]
          }
        });

        // Add a glowing effect layer
        map!.addLayer({
          id: 'route-glow',
          type: 'line',
          source: ROUTE_SOURCE_ID,
          paint: {
            'line-color': '#60a5fa',
            'line-width': 12,
            'line-opacity': 0.3,
            'line-blur': 3
          }
        }, ROUTE_LAYER_ID);

        // Add smooth progress layer
        map!.addSource(ROUTE_PROGRESS_SOURCE_ID, {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] }, properties: {} }
        });

        map!.addLayer({
          id: ROUTE_PROGRESS_LAYER_ID,
          type: 'line',
          source: ROUTE_PROGRESS_SOURCE_ID,
          paint: {
            'line-color': '#ffffff',
            'line-width': 3,
            'line-opacity': 0.8,
            'line-blur': 0
          }
        }, ROUTE_LAYER_ID);

        // Bind events after the layer exists
        map!.on('click', ROUTE_LAYER_ID, () => showExternalMapsModal.value = true);
        map!.on('mouseenter', ROUTE_LAYER_ID, () => (map!.getCanvas().style.cursor = 'pointer'));
        map!.on('mouseleave', ROUTE_LAYER_ID, () => (map!.getCanvas().style.cursor = ''));

        // Fetch and animate the route with timeout and fallback
        let routed: LngLat[] = [];
        try {
          // Add timeout to prevent stalling
          const routePromise = fetchOSRMRoute(trail.stops);
          const timeoutPromise = new Promise<LngLat[]>((_, reject) => 
            setTimeout(() => reject(new Error('Route fetch timeout')), 3000)
          );
          
          routed = await Promise.race([routePromise, timeoutPromise]);
          console.log('OSRM route fetched:', routed.length, 'points');
          
          if (!routed.length) throw new Error('Empty route geometry');
        } catch (e) {
          console.warn('OSRM routing failed, using straight segments:', e);
          // Create smooth straight segments with interpolation
          routed = [];
          for (let i = 0; i < trail.stops.length - 1; i++) {
            const start = toLngLat(trail.stops[i]);
            const end = toLngLat(trail.stops[i + 1]);
            
            // Add start point
            if (i === 0) routed.push(start);
            
            // Interpolate intermediate points for smoother animation
            const steps = Math.max(5, Math.floor(haversine(start, end) / 50)); // 50m intervals
            for (let j = 1; j <= steps; j++) {
              const t = j / steps;
              const lng = start[0] + (end[0] - start[0]) * t;
              const lat = start[1] + (end[1] - start[1]) * t;
              routed.push([lng, lat]);
            }
            
            // Add end point
            if (i === trail.stops.length - 2) routed.push(end);
          }
        }

        const stopVertexIdx: number[] = new Array(trail.stops.length).fill(-1);
        for (let s = 0; s < trail.stops.length; s++) {
          stopVertexIdx[s] = closestIndexOnRoute(routed, toLngLat(trail.stops[s]));
        }

        // Animate the snake through the route
        const seen = new Set<number>();
        animateSnake(routed, (vIdx) => {
          // did we pass a stop?
          for (let s = 0; s < stopVertexIdx.length; s++) {
            if (!seen.has(s) && vIdx >= stopVertexIdx[s]) {
              seen.add(s);
              const el = markers[s]?.getElement();
              if (el) {
                el.classList.add('pin-bounce');
                setTimeout(() => el.classList.remove('pin-bounce'), 900);
              }
            }
          }
        }, 400); // Much faster for better performance
      }, 1200); // Wait for zoom to complete
    }, totalDropTime);

    // ensure rendering if container size changes
    setTimeout(() => map?.resize(), 250);
  });
};

const focusPinAt = (idx: number) => {
  const m = markers[idx]; if (!m || !map) return;
  const ll = m.getLngLat();
  map.easeTo({ center: ll, duration: 500, zoom: Math.max(map.getZoom(), 15) });
  pulsePinAt(idx);
};

// Track which pin is currently vibrating
let vibratingPinIdx: number | null = null;

const pulsePinAt = (idx: number) => {
  // Stop previous vibrating pin
  if (vibratingPinIdx !== null && vibratingPinIdx !== idx) {
    const prevM = markers[vibratingPinIdx];
    if (prevM) {
      const prevEl = prevM.getElement();
      prevEl.classList.remove('pin-vibrate', 'pin-pulsate');
    }
  }
  
  const m = markers[idx];
  if (!m) return;
  
  const el = m.getElement();
  vibratingPinIdx = idx;
  
  // Start with vibration for 1 second
  el.classList.add('pin-vibrate');
  setTimeout(() => {
    if (vibratingPinIdx === idx) {
      el.classList.remove('pin-vibrate');
      // Then switch to pulsation for 2 seconds
      el.classList.add('pin-pulsate');
      setTimeout(() => {
        if (vibratingPinIdx === idx) {
          el.classList.remove('pin-pulsate');
          vibratingPinIdx = null;
        }
      }, 2000);
    }
  }, 1000);
};


const openInGoogleMaps = () => {
  if (!active.value?.stops?.length) return;
  const pts = active.value.stops.map(s => `${s.lat},${s.lng}`);
  const google = `https://www.google.com/maps/dir/?api=1&origin=${pts[0]}&destination=${pts[pts.length-1]}&waypoints=${encodeURIComponent(pts.slice(1,-1).join('|'))}&travelmode=walking`;
  window.open(google, '_blank');
  showExternalMapsModal.value = false;
};

const openInYandexMaps = () => {
  if (!active.value?.stops?.length) return;
  const pts = active.value.stops.map(s => `${s.lat},${s.lng}`);
  const yandex = `https://yandex.ru/maps/?rtext=${encodeURIComponent(pts.join('~'))}&rtt=auto`;
  window.open(yandex, '_blank');
  showExternalMapsModal.value = false;
};

// init map when drawer opens
watch(active, async (val) => {
  if (!val) return
  await nextTick()
  initMap(val)
})

// clean up when drawer closes (optional safety)
watch(() => !!active.value, (open) => {
  if (!open) cleanupMap()
})

// --- Rating bar color helper (for meters / bars) ---

// color utilities
const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n))
const hexToRgb = (hex: string) => {
  const m = hex.replace('#', '')
  const int = parseInt(m.length === 3 ? m.split('').map(c => c + c).join('') : m, 16)
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 }
}
const rgbToHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
const mix = (a: string, b: string, t: number) => {
  const A = hexToRgb(a), B = hexToRgb(b)
  const r = Math.round(A.r + (B.r - A.r) * t)
  const g = Math.round(A.g + (B.g - A.g) * t)
  const bch = Math.round(A.b + (B.b - A.b) * t)
  return rgbToHex(r, g, bch)
}
const tint = (hex: string, t = 0.35) => mix(hex, '#ffffff', clamp(t))

/**
 * Gradient scale:
 * 4.3 – 5.0 → green (#16a34a)
 * 3.5 – 4.3 → amber (#f59e0b)
 * 0 – 3.5   → red   (#dc2626)
 */
const barStyle = (score: number) => {
  const pct = clamp(score / 5) * 100

  const GREEN = '#16a34a'
  const AMBER = '#f59e0b'
  const RED   = '#dc2626'

  let color = GREEN

  if (score >= 4.3) {
    // green zone (fixed)
    color = GREEN
  } else if (score >= 3.5) {
    const t = (score - 3.5) / (4.3 - 3.5)  // 0 at 3.5, 1 at 4.3
    color = mix(AMBER, GREEN, t)
  } else {
    // red zone
    color = RED
  }

  const soft = tint(color, 0.35)

  return {
    width: `${pct}%`,
    background: `linear-gradient(90deg, ${soft} 0%, ${color} 100%)`,
    boxShadow: `0 0 0 1px ${soft} inset`
  }
}

// --- ROUTING (OSRM demo; switch to your provider in prod) ---




// --- Comment attachments (paperclip) ---
const pendingCommentMedia = ref<string[]>([])     // previews for UI
const handleCommentFiles = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  newCommentFiles.value = files ? Array.from(files) : []
  pendingCommentMedia.value = newCommentFiles.value.map(f => URL.createObjectURL(f))
}

// Create form map functions
const createMapEl = ref<HTMLDivElement | null>(null)
let createMapInstance: any = null

const addStopFromMap = () => {
  if (!createMapInstance) return
  const center = createMapInstance.getCenter()
  const newStop = {
    title: `Остановка ${form.value.stops.length + 1}`,
    note: '',
    lat: center.lat,
    lng: center.lng
  }
  form.value.stops.push(newStop)
}

const removeStop = (index: number) => {
  form.value.stops.splice(index, 1)
}
</script>

<style scoped>
.fhe { padding: 0; }
.fhe-header{ display:flex; justify-content:space-between; align-items:center; margin:0 5vw .5rem; padding-top:12px; }
.fhe-header h2{ font-size:clamp(1.2rem,3.5vw,1.5rem); font-weight:800; margin:0 }
.link{ background:transparent; border:none; color:rgb(26,58,107); font-weight:600; padding:6px 10px; border-radius:10px; cursor:pointer; }
.link:hover{ background:rgba(255,218,185,.3); color:#00b4d8 }

/* Carousel */
.carousel{ display:flex; gap:2vw; padding:8px 5vw 14px; overflow-x:auto; scroll-snap-type:x mandatory; }
.carousel::-webkit-scrollbar{ display:none }
.feat-card{ flex:0 0 70vw; border-radius:18px; overflow:hidden; position:relative; scroll-snap-align:center; box-shadow:0 10px 20px rgba(0,0,0,.12); }
.feat-media{ position:relative; height:36vh }
.feat-img{ width:100%; height:100%; object-fit:cover; display:block }
.feat-overlay{ position:absolute; inset:auto 0 0 0; padding:10px 12px; background:linear-gradient(transparent,rgba(0,0,0,.55)); color:#fff; display:grid; row-gap:6px; }
.feat-title{ margin:0; font-weight:800; font-size:1.05rem }
.feat-meta{ display:flex; gap:10px; align-items:center; font-weight:700; font-size:.92rem }
.diff[data-diff="easy"]{ background:#00ffaadc; color:#075d44; padding:2px 8px; border-radius:8px }
.diff[data-diff="moderate"]{ background:#f3dd87; color:#6b5302; padding:2px 8px; border-radius:8px }
.diff[data-diff="hard"]{ background:#eeb2b2; color:#901d1d; padding:2px 8px; border-radius:8px }
.feat-create{ flex:0 0 42vw; height:25vh; align-self:center; border-radius:16px; border:2px dashed #3b82f6; color:#0b5bd7; background:linear-gradient(135deg,#e0f2ff77,#c7e9ff66); display:grid; place-items:center; gap:6px; font-weight:800; cursor:pointer; scroll-snap-align:center; }
.feat-create span{ font-size:2rem }

/* Filters */
.filters{ padding:4px 5vw 12px; display:grid; row-gap:8px }
.f-input,.f-select{ width:100%; height:42px; padding:0 12px; border-radius:10px; border:1px solid #e5e7eb; background:#fff; font-size:.96rem; }
.f-row{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px }
.chip-row{ display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin-top:2px }
.chip{ border:1px solid rgba(0,0,0,.08); background:#fff; border-radius:999px; padding:6px 10px; font-weight:700; font-size:.85rem; display:inline-flex; align-items:center; gap:6px; }
.chip.active{ background:#eef6ff; border-color:#a7ccff }
.chip-split{ width:1px; height:20px; background:#e5e7eb; margin:0 4px }

/* Cards */
.grid{ display:grid; grid-template-columns:1fr; gap:10px; padding:0 5vw 22px; }
@media(min-width:768px){ .grid{ grid-template-columns:repeat(3,1fr); } }
.card{ border-radius:16px; overflow:hidden; background:#fff; box-shadow:0 10px 20px rgba(0,0,0,.08); display:grid; grid-template-rows:auto 1fr; }
.media{ position:relative; height:180px }
.thumb{ width:100%; height:100%; object-fit:cover; display:block }
.badge-diff{ position:absolute; left:10px; top:10px; padding:3px 8px; border-radius:10px; background:#00000055; color:#fff; font-weight:800; font-size:.8rem; }
.save{ position:absolute; right:10px; top:10px; width:40px; height:40px; border-radius:10px; border:1px solid rgba(255,255,255,.5); background:rgba(0,0,0,.35); backdrop-filter:blur(4px); color:#fff; display:grid; place-items:center; cursor:pointer; }
.body{ padding:10px 12px 10px; display:grid; row-gap:8px }
.title{ margin:0; font-weight:800; font-size:1.02rem; }
.line-2{ display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2;line-clamp: 2; overflow:hidden; }
.metrics{ display:flex; gap:10px; align-items:center; color:#374151; font-size:.92rem; flex-wrap:wrap }
.rate{ font-weight:800; color:#f59e0b }
.facilities{ display:flex; gap:10px; font-size:1.05rem }
.tags{ display:flex; gap:6px; flex-wrap:wrap }
.tag{ background:#f7f7f9; border:1px solid #ececf2; border-radius:999px; padding:2px 8px; font-weight:700; font-size:.78rem }
.actions{ display:flex; align-items:center; gap:8px; margin-top:2px }
.actions button{ height:36px; border-radius:10px; border:1px solid #e5e7eb; background:#fff; padding:0 10px; display:inline-flex; align-items:center; gap:6px; cursor:pointer }
.like{ color:#ef4444 }
.owner{ margin-left:auto; display:inline-flex; align-items:center; gap:6px }
.owner img{ width:26px; height:26px; border-radius:50%; object-fit:cover }
.owner-name{ font-weight:700; font-size:.9rem }
.empty{ text-align:center; padding:12px 0 24px; color:#6b7280 }

/* Drawer */
.drawer{ position:fixed; inset:0; background:rgba(0,0,0,.3); backdrop-filter:blur(6px); display:grid; place-items:end; z-index:60; }
.sheet{ width:100%; max-height:92vh; background:#fff; border-radius:16px 16px 0 0; overflow:auto; animation:slideUp .25s ease; display:grid; row-gap:12px; padding-bottom:14px; }
.sheet-bar{ display:grid; place-items:center; padding-top:6px }
.drag{ width:46px; height:5px; border-radius:999px; background:#e5e7eb }
.sheet-head{ padding:6px 14px 0 }
.sheet-title{ margin:8px 0 4px; font-weight:900; font-size:1.2rem }

/* centered metric bar */
.sheet-metrics{ width:100%; display:flex; justify-content:center; align-items:center; gap:10px; flex-wrap:wrap; margin-top:6px }
.chip-metric{ display:inline-flex; align-items:center; gap:6px; padding:6px 10px; border-radius:999px; background:#f3f4f6; font-weight:700; }
.chip-metric.rating{ background:#fff7ed; border:1px solid #fed7aa }
.diff-pill[data-diff="easy"]{ background:linear-gradient(90deg,#b6ffd8,#1dbf73); color:#064e3b }
.diff-pill[data-diff="moderate"]{ background:linear-gradient(90deg,#ffeaa7,#ff9f1a); color:#7c2d12 }
.diff-pill[data-diff="hard"]{ background:linear-gradient(90deg,#ffb3b3,#ff2d2d); color:#7f1d1d }

/* media slider */
.media-slider{ padding:10px 10px 0 }
.media-track{ display:grid; grid-auto-flow:column; grid-auto-columns:85%; gap:10px; overflow-x:auto; scroll-snap-type:x mandatory; }
.media-track::-webkit-scrollbar{ display:none }
.media-slide{ scroll-snap-align:center; border-radius:12px; overflow:hidden; background:#000; cursor:pointer }
.media-slide img,.media-slide video{ width:100%; height:240px; object-fit:cover; display:block }

/* Map */
.map{ margin:10px 14px 0; border:1px solid #e5e7eb; border-radius:12px; padding:0; display:flex; flex-direction:column; overflow:hidden }
.map-canvas{ width:100%; height:260px }
.map-hint{ font-size:.85rem; color:#6b7280;  padding: 6px 2px 0; }
.map-box { margin: 10px 14px 0; }
.map-frame {
  width: 100%;
  height: 260px;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  position: relative;
}

.map-frame::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.05) 100%);
  pointer-events: none;
  z-index: 1;
  border-radius: 16px;
}

/* Map Overlay */
.map-overlay {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
  pointer-events: none;
}

.map-stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* External Maps Section */
.external-maps-section {
  padding: 16px 14px 0;
}

.external-maps-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.external-maps-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.external-icon {
  font-size: 14px;
  opacity: 0.8;
}

/* Enhanced Map Hint */
.map-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin: 8px 14px 0;
  font-size: 13px;
  color: #64748b;
}

/* Apple Maps style pins */
  .apple-pin { 
    position: relative; 
    width: 60px; 
    height: 60px; 
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transform-origin: center bottom;
  }

.pin-emoji {
  font-size: 48px;
  line-height: 1;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform-origin: center bottom;
}

/* Apple-style drop animation */
.apple-pin.pin-drop { 
  transform: translateY(-60px) scale(0.2); 
  opacity: 0; 
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.apple-pin.pin-drop .pin-emoji {
  transform: scale(0.2);
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Steps (carved card) */
.steps{ padding:8px 14px 0 }
.steps-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 12px;
}
.steps h4{ margin: 0; font-weight:800; font-size:1.1rem }
.steps-count {
  padding: 4px 10px;
  background: #eef6ff;
  color: #1d4ed8;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}
.steps-list{ display:grid; row-gap:8px }
.step-item{ 
  display:flex; gap:12px; padding:16px; 
  border-radius:16px; background:#f8fafc; 
  border:1px solid #e2e8f0; cursor:pointer; 
  transition:all .2s ease;
  position: relative;
  overflow: hidden;
}
.step-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.2s ease;
}
.step-item:hover{ 
  background:#eef6ff; border-color:#a7ccff; 
  transform:translateX(4px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}
.step-item:hover::before {
  opacity: 1;
}
.step-number{ 
  width:32px; height:32px; border-radius:50%; 
  background:linear-gradient(135deg, #3b82f6, #1d4ed8); 
  color:#fff; display:grid; place-items:center; 
  font-weight:800; font-size:.9rem;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  position: relative;
  z-index: 1;
}
.step-content{ flex:1; display:grid; row-gap:6px; position: relative; z-index: 1 }
.step-title{ margin:0; font-weight:700; font-size:.95rem; color: #1f2937 }
.step-note{ margin:0; color:#6b7280; font-size:.85rem; line-height:1.4 }
.step-coordinates {
  font-size: 11px;
  color: #9ca3af;
  font-family: 'Courier New', monospace;
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}
.step-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
}
.step-icon {
  color: #3b82f6;
  font-size: 18px;
}
.step-arrow {
  color: #9ca3af;
  font-size: 16px;
  transition: transform 0.2s ease;
}
.step-item:hover .step-arrow {
  transform: translateX(2px);
  color: #3b82f6;
}

/* Ratings */
.breakdown{ padding:2px 14px 0 }
.breakdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 12px;
}
.breakdown h4{ margin: 0; font-weight:800; font-size:1.1rem }
.overall-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.rating-number {
  font-size: 24px;
  font-weight: 900;
  color: #f59e0b;
  line-height: 1;
}
.rating-label {
  font-size: 11px;
  color: #6b7280;
  font-weight: 600;
}
.rows{ display:grid; row-gap:12px }
.row{ display:grid; grid-template-columns:140px 1fr auto; align-items:center; gap:12px }
.rating-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}
.bar{ width:100%; height:12px; background:#f1f5f9; border-radius:999px; overflow:hidden; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1); }
.bar-fill{
  height:100%;
  border-radius:999px;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
  transition: width .45s ease, background .45s ease, box-shadow .45s ease;
}


/* Comments */
.comments{ padding:6px 14px 0; display:grid; row-gap:10px }
.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 12px;
}
.comments h4{ margin: 0; font-weight:800; font-size:1.1rem }
.comments-count {
  padding: 4px 10px;
  background: #fef3c7;
  color: #d97706;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}
.c-list{ display:grid; row-gap:10px }
.c-item{ display:grid; grid-template-columns:auto 1fr; gap:10px }
.c-item img{ width:34px; height:34px; border-radius:50%; object-fit:cover }
.c-meta{ display:flex; gap:8px; align-items:center }
.c-date{ color:#6b7280; font-size:.85rem }
.c-text{ margin:2px 0 0 }
.c-media{ display:flex; gap:6px; margin-top:6px }
.c-thumb{ width:70px; height:70px; border-radius:10px; overflow:hidden; cursor:pointer; background:#000 }
.c-thumb img,.c-thumb video{ width:100%; height:100%; object-fit:cover }

.c-form{ display:grid; grid-template-columns:auto 1fr auto; gap:8px; align-items:center }
.attach input{ display:none }
.attach{ width:40px; height:40px; border-radius:10px; border:1px solid #e5e7eb; display:grid; place-items:center; cursor:pointer; background:#fff; }
.btn{ height:40px; border:none; border-radius:10px; background:linear-gradient(135deg,#2563eb,#00bcd4); color:#fff; padding:0 14px; font-weight:800; cursor:pointer; }
.btn.ghost{ background:#eceff3; color:#111827; }
.btn.plane{ display:grid; place-items:center; width:40px; padding:0 }
.btn.plane:active{ animation:takeoff .6s ease forwards }
@keyframes takeoff{ 0%{ transform:translate(0) rotate(0) } 60%{ transform:translate(6px,-8px) rotate(-10deg) } 100%{ transform:translate(14px,-18px) rotate(-18deg); opacity:.2 } }

/* External Maps Modal */
.external-maps-panel { max-width: 400px; margin: 0 auto; }
.maps-options { display: grid; gap: 12px; margin: 20px 0; }
.map-option { 
  display: flex; align-items: center; gap: 12px; padding: 16px; 
  border: 2px solid #e5e7eb; border-radius: 12px; background: #fff; 
  cursor: pointer; transition: all 0.2s ease;
}
.map-option:hover { border-color: #3b82f6; background: #f8fafc; }
.map-icon { font-size: 24px; }
.map-info { text-align: left; }
.map-info strong { display: block; margin-bottom: 4px; }
.map-info span { color: #6b7280; font-size: 14px; }

/* Create Form Map */
.stops-section { margin: 16px 0; }
.stops-map-container { margin: 12px 0; }
.create-map-frame { 
  width: 100%; height: 200px; border-radius: 12px; 
  border: 2px solid #e5e7eb; margin-bottom: 8px;
}
.map-controls { display: flex; gap: 8px; }
.btn.small { padding: 8px 12px; font-size: 14px; }
.stops-list { display: grid; gap: 8px; margin-top: 12px; }
.stop-item { 
  display: flex; align-items: center; gap: 8px; padding: 8px; 
  border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb;
}
.stop-number { 
  width: 24px; height: 24px; border-radius: 50%; 
  background: #3b82f6; color: #fff; display: grid; place-items: center; 
  font-weight: 700; font-size: 12px;
}
.stop-info { flex: 1; display: grid; gap: 4px; }
.stop-info input { 
  padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 6px; 
  font-size: 14px;
}
.remove-stop { 
  width: 24px; height: 24px; border-radius: 50%; border: none; 
  background: #ef4444; color: #fff; cursor: pointer; font-weight: 700;
}

.attach-previews{ display:flex; gap:8px; flex-wrap:wrap; margin-top:6px }
.ap-item{ width:70px; height:70px; border-radius:10px; overflow:hidden; background:#000; cursor:pointer }
.ap-item img,.ap-item video{ width:100%; height:100%; object-fit:cover }

.sheet-actions{ display:flex; gap:10px; justify-content:center; padding:6px 14px 8px; }
.save-btn{ display:inline-flex; align-items:center; gap:6px }

/* Viewer */
.viewer{ position:fixed; inset:0; background:rgba(0,0,0,.85); display:grid; place-items:center; z-index:80; }
.viewer-body{ width:min(100vw,900px); max-height:90vh; display:grid; place-items:center; padding:10px }
.viewer-media{ width:100%; max-height:88vh; object-fit:contain; }
.viewer-close{ position:absolute; top:10px; right:10px; width:44px; height:44px; border-radius:12px; border:none; background:#111827; color:#fff; display:grid; place-items:center; cursor:pointer }

/* Modal (create) */
.modal{ position:fixed; inset:0; background:rgba(0,0,0,.3); backdrop-filter:blur(6px); display:grid; place-items:end; z-index:70; }
.panel{ width:100%; max-height:92vh; overflow:auto; background:#fff; border-radius:16px 16px 0 0; padding:14px; animation:slideUp .25s ease; display:grid; row-gap:10px; }
.panel h3{ margin:0 0 4px }
.row2{ display:grid; grid-template-columns:1fr 1fr; gap:8px }
.panel input,.panel textarea,.panel select{ width:100%; height:42px; border:1px solid #e5e7eb; border-radius:10px; padding:0 10px; font-size:.95rem; }
.panel textarea{ height:88px; padding:8px 10px; resize:vertical; }
.check{ display:flex; align-items:center; gap:8px }
.tags-edit{ display:flex; flex-wrap:wrap; gap:6px }
.tags-edit .tag{ cursor:pointer }
.uploader{ display:inline-flex; align-items:center; gap:8px; border:1px dashed #d1d5db; padding:10px; border-radius:10px; cursor:pointer }
.uploader input{ display:none }

/* Animations */
@keyframes slideUp{ from{ transform:translateY(100%) } to{ transform:translateY(0) } }


@keyframes drop {
  0%   { transform: translateY(-20px) scale(.8) rotate(-45deg); opacity: 0; }
  60%  { transform: translateY(6px) scale(1.05) rotate(-45deg); opacity: 1; }
  100% { transform: translateY(0) rotate(-45deg); }
}

.pin-body {
  width: 18px; height: 18px;
  background: #e11d48;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  box-shadow: 0 0 0 2px #fff inset, 0 2px 8px rgba(0,0,0,.25);
  animation: drop .5s ease forwards;
}

/* Apple-style bounce animation */
@keyframes appleBounce {
  0%, 100% { transform: translateY(0) scale(1) }
  25%      { transform: translateY(-12px) scale(1.15) }
  50%      { transform: translateY(-4px) scale(1.08) }
  75%      { transform: translateY(-8px) scale(1.12) }
}
.apple-pin.pin-bounce .pin-emoji { 
  animation: appleBounce 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  filter: drop-shadow(0 6px 12px rgba(0,0,0,0.5));
}

/* Apple-style pulse for hover */
@keyframes applePulse {
  0%, 100% { transform: scale(1) }
  50%      { transform: scale(1.2) }
}
.apple-pin.pin-pulse .pin-emoji { 
  animation: applePulse 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
  filter: drop-shadow(0 6px 16px rgba(0,0,0,0.6));
}

/* Apple-style vibration for active selection */
@keyframes appleVibrate {
  0%, 100% { transform: translateX(0) rotate(0deg) scale(1); }
  10% { transform: translateX(-6px) rotate(-3deg) scale(1.2); }
  20% { transform: translateX(6px) rotate(3deg) scale(1.15); }
  30% { transform: translateX(-6px) rotate(-3deg) scale(1.25); }
  40% { transform: translateX(6px) rotate(3deg) scale(1.1); }
  50% { transform: translateX(-3px) rotate(-1.5deg) scale(1.2); }
  60% { transform: translateX(3px) rotate(1.5deg) scale(1.15); }
  70% { transform: translateX(-3px) rotate(-1.5deg) scale(1.2); }
  80% { transform: translateX(3px) rotate(1.5deg) scale(1.1); }
  90% { transform: translateX(-1px) rotate(-0.5deg) scale(1.05); }
}

.apple-pin.pin-vibrate .pin-emoji { 
  animation: appleVibrate 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
  filter: drop-shadow(0 8px 20px rgba(0,0,0,0.7));
}

/* Enhanced pulsation effect */
@keyframes applePulsate {
  0%, 100% { transform: scale(1); opacity: 1; }
  25% { transform: scale(1.3); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 0.9; }
  75% { transform: scale(1.4); opacity: 0.7; }
}

.apple-pin.pin-pulsate .pin-emoji { 
  animation: applePulsate 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
  filter: drop-shadow(0 10px 25px rgba(0,0,0,0.8));
}
</style>