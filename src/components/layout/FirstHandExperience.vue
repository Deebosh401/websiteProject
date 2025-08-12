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
        <span>＋</span>
        <em>Создать маршрут</em>
      </button>
    </div>

    <!-- Filters (mobile first) -->
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
            <span class="rate" :title="ratingTitle(t)">
              ⭐ {{ t.ratings.overall.toFixed(1) }}
            </span>
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
        <div class="sheet-bar">
          <div class="drag"></div>
        </div>

        <div class="sheet-head">
          <h3 class="sheet-title">{{ active.title }}</h3>
          <div class="sheet-metrics">
            <span><Icon icon="mdi:clock-outline" /> {{ active.duration }}ч</span>
            <span><Icon icon="mdi:map-marker-distance" /> {{ active.distance }}км</span>
            <span class="diff" :data-diff="active.difficulty">{{ diffLabel(active.difficulty) }}</span>
            <span class="rate">⭐ {{ active.ratings.overall.toFixed(1) }}</span>
          </div>
        </div>

        <!-- Media slider (simple) -->
        <div class="media-slider">
          <div class="media-track">
            <div v-for="(m, i) in active.media" :key="i" class="media-slide">
              <template v-if="isVideo(m)">
                <video controls playsinline preload="metadata"><source :src="m" type="video/mp4" /></video>
              </template>
              <template v-else>
                <img :src="m" :alt="active.title + ' media ' + i" loading="lazy" />
              </template>
            </div>
          </div>
        </div>

        <!-- Map placeholder -->
        <div class="map">
          <Icon icon="mdi:map" />
          <span>Здесь будет интерактивная карта маршрута</span>
        </div>

        <!-- Steps / Itinerary -->
        <div class="steps" v-if="active.stops?.length">
          <h4>Остановки</h4>
          <ol>
            <li v-for="(s, i) in active.stops" :key="i">
              <span class="s-idx">{{ i + 1 }}</span>
              <div class="s-body">
                <strong class="s-title">{{ s.title }}</strong>
                <p class="s-note">{{ s.note }}</p>
              </div>
            </li>
          </ol>
        </div>

        <!-- Ratings breakdown -->
        <div class="breakdown">
          <h4>Оценки</h4>
          <div class="rows">
            <div class="row"><span>Виды</span><meter :value="active.ratings.scenery" min="0" max="5"></meter><b>{{ active.ratings.scenery.toFixed(1) }}</b></div>
            <div class="row"><span>Доступность</span><meter :value="active.ratings.access" min="0" max="5"></meter><b>{{ active.ratings.access.toFixed(1) }}</b></div>
            <div class="row"><span>Комфорт</span><meter :value="active.ratings.comfort" min="0" max="5"></meter><b>{{ active.ratings.comfort.toFixed(1) }}</b></div>
          </div>
        </div>

        <!-- Comments -->
        <div class="comments">
          <h4>Комментарии ({{ active.comments.length }})</h4>
          <div class="c-list">
            <div class="c-item" v-for="(c, i) in active.comments" :key="i">
              <img :src="c.user.avatar" />
              <div class="c-body">
                <div class="c-meta">
                  <b>{{ c.user.name }}</b>
                  <span class="c-date">{{ c.date }}</span>
                </div>
                <p class="c-text">{{ c.text }}</p>
              </div>
            </div>
          </div>

          <div class="c-form">
            <input v-model="newComment" type="text" placeholder="Оставьте комментарий…" />
            <button class="btn" @click="addComment" :disabled="!newComment.trim()">Отправить</button>
          </div>
        </div>

        <div class="sheet-actions">
          <button class="btn ghost" @click="closeDetail">Закрыть</button>
          <button class="btn" @click="toggleSave(active.id)">
            <Icon :icon="saved.has(active.id) ? 'mdi:bookmark' : 'mdi:bookmark-outline'" />
            {{ saved.has(active.id) ? 'Сохранено' : 'Сохранить' }}
          </button>
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
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'

type Difficulty = 'easy' | 'moderate' | 'hard'

type Ratings = { overall: number; scenery: number; access: number; comfort: number }
type Comment = { user: { name: string; avatar: string }, text: string, date: string }
type Stop = { title: string; note: string }

type Trail = {
  id: number
  title: string
  cover: string
  media: string[]
  duration: number // hours
  distance: number // km
  difficulty: Difficulty
  tags: string[]
  facilities: { toilets: boolean; rest: boolean; playground: boolean; accessible: boolean }
  ratings: Ratings
  stops: Stop[]
  comments: Comment[]
  owner: { name: string; avatar: string }
  featured?: boolean
}

const isVideo = (src: string) => src.toLowerCase().endsWith('.mp4')
const diffLabel = (d: Difficulty) => d === 'easy' ? 'Лёгкий' : d === 'moderate' ? 'Средний' : 'Сложный'
const ratingTitle = (t: Trail) =>
  `Виды: ${t.ratings.scenery.toFixed(1)} • Доступность: ${t.ratings.access.toFixed(1)} • Комфорт: ${t.ratings.comfort.toFixed(1)}`

/** Demo data: put files in /public */
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
      { title: 'Кафедральный собор', note: 'Кантов остров, музыка органа' },
      { title: 'Рыбная деревня', note: 'Мосты и видовые площадки' }
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
      { title: 'Набережная', note: 'Лучшие фото у моря' },
      { title: 'Парк', note: 'Тихие дорожки среди сосен' }
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
      { title: 'Кафедральный собор', note: 'Кантов остров, музыка органа' },
      { title: 'Рыбная деревня', note: 'Мосты и видовые площадки' }
    ],
    comments: [
      { user: { name: 'Анна', avatar: '/guide1.png' }, text: 'Очень уютно вечером!', date: '2025-08-01' }
    ],
    owner: { name: 'Илья', avatar: '/guide2.png' },
    featured: true
  },
])

/* Featured subset */
const featured = computed(() => trails.value.filter(t => t.featured))

/* Social state (persist lightweight) */
const saved = ref<Set<number>>(new Set())
const likes = ref<Set<number>>(new Set())
onMounted(() => {
  const s = localStorage.getItem('fhe_saved'); if (s) saved.value = new Set(JSON.parse(s))
  const l = localStorage.getItem('fhe_likes'); if (l) likes.value = new Set(JSON.parse(l))
})
const persist = () => {
  localStorage.setItem('fhe_saved', JSON.stringify(Array.from(saved.value)))
  localStorage.setItem('fhe_likes', JSON.stringify(Array.from(likes.value)))
}
const toggleSave = (id: number) => { saved.value.has(id) ? saved.value.delete(id) : saved.value.add(id); persist() }
const toggleLike = (id: number) => { likes.value.has(id) ? likes.value.delete(id) : likes.value.add(id); persist() }
const likeCount = (id: number) =>  (likes.value.has(id) ? 1 : 0)

/* Filters */
const q = ref('')
const fDuration = ref('')  
const fDistance = ref('') 
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
  { key: 'rest', label: 'Место для отдыха', short: 'Rest', icon: 'mdi:bench' },
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
    const passTags = !fTags.value.size || Array.from(fTags.value).every(tag => t.tags.includes(tag))
    const passFacilities = !fFacilities.value.size || Array.from(fFacilities.value).every(k => (t.facilities as any)[k])
    return passQ && passDur && passDist && passDiff && passTags && passFacilities
  })
)

/* Simple sort: featured first, then by rating */
const shown = computed(() => {
  const arr = [...filtered.value]
  arr.sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || b.ratings.overall - a.ratings.overall)
  return arr
})

const toggleTag = (tag: string) => { fTags.value.has(tag) ? fTags.value.delete(tag) : fTags.value.add(tag) }
const toggleFacility = (key: string) => { fFacilities.value.has(key) ? fFacilities.value.delete(key) : fFacilities.value.add(key) }

/* Detail drawer */
const active = ref<Trail | null>(null)
const newComment = ref('')
const openDetail = (t: Trail) => { active.value = t; newComment.value = '' }
const closeDetail = () => { active.value = null }
const addComment = () => {
  if (!active.value) return
  const txt = newComment.value.trim()
  if (!txt) return
  active.value.comments.push({
    user: { name: 'Гость', avatar: '/guide2.png' },
    text: txt,
    date: new Date().toISOString().slice(0, 10)
  })
  newComment.value = ''
}

/* Share */
const share = async (t: Trail) => {
  const url = location.origin + '/routes/' + t.id
  if ((navigator as any).share) {
    try { await (navigator as any).share({ title: t.title, url }) } catch {}
  } else {
    await navigator.clipboard.writeText(url)
    alert('Ссылка скопирована!')
  }
}

/* Create Route modal */
const showCreate = ref(false)
const form = ref({
  title: '',
  duration: null as number | null,
  distance: null as number | null,
  difficulty: '' as '' | Difficulty,
  summary: '',
  tags: [] as string[],
  facilities: { toilets: false, rest: false, playground: false, accessible: false },
  media: [] as string[]
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
  // In prod: upload and save URLs. For demo we just make blob URLs.
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
    ratings: { overall: 5, scenery: 5, access: 5, comfort: 5 }, // default; could ask in form
    stops: [],
    comments: [],
    owner: { name: 'Вы', avatar: '/guide1.png' },
    featured: false
  })
  // reset
  showCreate.value = false
  form.value = {
    title: '',
    duration: null,
    distance: null,
    difficulty: '',
    summary: '',
    tags: [],
    facilities: { toilets: false, rest: false, playground: false, accessible: false },
    media: []
  }
}

/* Nav stub */
const goAll = () => {
  // this.$router?.push({ name: 'all-routes' })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
/* --- Section --- */
.fhe { padding: 0; }
.fhe-header{
  display:flex;justify-content:space-between;align-items:center;
  margin:0 5vw .5rem; padding-top: 12px;
}
.fhe-header h2{font-size:clamp(1.2rem,3.5vw,1.5rem);font-weight:800;margin:0}
.link{
  background:transparent;border:none;color:rgb(26,58,107);font-weight:600;
  padding:6px 10px;border-radius:10px;cursor:pointer;
}
.link:hover{background:rgba(255,218,185,.3);color:#00b4d8}

/* --- Featured carousel --- */
.carousel{
  display:flex;gap:5vw;padding:8px 5vw 14px;overflow-x:auto;scroll-snap-type:x mandatory;
}
.carousel::-webkit-scrollbar{display:none}
.feat-card{
  flex:0 0 70vw; border-radius:18px;overflow:hidden;position:relative;scroll-snap-align:center;
  box-shadow:0 10px 20px rgba(0,0,0,.12);
}
.feat-media{position:relative;height:36vh}
.feat-img{width:100%;height:100%;object-fit:cover;display:block}
.feat-overlay{
  position:absolute;inset:auto 0 0 0;padding:10px 12px;
  background:linear-gradient(transparent,rgba(0,0,0,.55));
  color:#fff;display:grid;row-gap:6px;
}
.feat-title{margin:0;font-weight:800;font-size:1.05rem}
.feat-meta{display:flex;gap:10px;align-items:center;font-weight:700;font-size:.92rem}
.diff[data-diff="easy"]{background:#00ffaadc;color:#075d44;padding:2px 8px;border-radius:8px}
.diff[data-diff="moderate"]{background:#f3dd87;color:#6b5302;padding:2px 8px;border-radius:8px}
.diff[data-diff="hard"]{background:#eeb2b2;color:#901d1d;padding:2px 8px;border-radius:8px}
.feat-create{
  flex:0 0 42vw;height:25vh;align-self:center;
  border-radius:16px;border:2px dashed #3b82f6;color:#0b5bd7;background:linear-gradient(135deg,#e0f2ff77,#c7e9ff66);
  display:grid;place-items:center;gap:6px;font-weight:800;cursor:pointer;scroll-snap-align:center;
}
.feat-create span{font-size:2rem}

.filters{padding:4px 5vw 12px;display:grid;row-gap:8px}
.f-input{
  width:100%;height:42px;padding:0 12px;border-radius:10px;border:1px solid #e5e7eb;background:#fff;
  font-size:.96rem;
}
.f-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
.f-select{
  width:100%;height:42px;padding:0 10px;border-radius:10px;border:1px solid #e5e7eb;background:#fff;font-size:.95rem;
}
.chip-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:2px}
.chip{
  border:1px solid rgba(0,0,0,.08);background:#fff;border-radius:999px;padding:6px 10px;font-weight:700;font-size:.85rem;
  display:inline-flex;align-items:center;gap:6px;
}
.chip.active{background:#eef6ff;border-color:#a7ccff}
.chip-split{width:1px;height:20px;background:#e5e7eb;margin:0 4px}

/* --- Grid list --- */
.grid{
  display:grid;grid-template-columns:1fr;gap:10px;padding:0 5vw 22px;
}
@media(min-width:768px){ .grid{ grid-template-columns:repeat(3,1fr);} }

.card{
  border-radius:16px;overflow:hidden;background:#fff;box-shadow:0 10px 20px rgba(0,0,0,.08);
  display:grid;grid-template-rows:auto 1fr;
}
.media{position:relative;height:180px}
.thumb{width:100%;height:100%;object-fit:cover;display:block}
.badge-diff{
  position:absolute;
  left:10px;
  top:10px;
  padding:3px 8px;
  border-radius:10px;
  background:#00000055;
  color:#fff;
  font-weight:800;
  font-size:.8rem;
}
.save{
  position:absolute;right:10px;top:10px;width:40px;height:40px;border-radius:10px;border:1px solid rgba(255,255,255,.5);
  background:rgba(0,0,0,.35);backdrop-filter:blur(4px);color:#fff;display:grid;place-items:center;cursor:pointer;
}

.body{padding:10px 12px 10px;display:grid;row-gap:8px}
.title{margin:0;font-weight:800;font-size:1.02rem}
.line-2{
  display:-webkit-box;
  -webkit-box-orient:vertical;
  line-clamp: 2;
  -webkit-line-clamp:2;
  overflow:hidden;
}
.metrics{display:flex;gap:10px;align-items:center;color:#374151;font-size:.92rem;flex-wrap:wrap}
.rate{font-weight:800;color:#f59e0b}
.facilities{display:flex;gap:10px;font-size:1.05rem}
.tags{display:flex;gap:6px;flex-wrap:wrap}
.tag{background:#f7f7f9;border:1px solid #ececf2;border-radius:999px;padding:2px 8px;font-weight:700;font-size:.78rem}

.actions{display:flex;align-items:center;gap:8px;margin-top:2px}
.actions button{height:36px;border-radius:10px;border:1px solid #e5e7eb;background:#fff;padding:0 10px;display:inline-flex;align-items:center;gap:6px;cursor:pointer}
.like{color:#ef4444}
.owner{margin-left:auto;display:inline-flex;align-items:center;gap:6px}
.owner img{width:26px;height:26px;border-radius:50%;object-fit:cover}
.owner-name{font-weight:700;font-size:.9rem}

/* --- Empty state --- */
.empty{text-align:center;padding:12px 0 24px;color:#6b7280}

/* --- Drawer (detail) --- */
.drawer{
  position:fixed;inset:0;background:rgba(0,0,0,.3);backdrop-filter:blur(6px);
  display:grid;place-items:end;z-index:60;
}
.sheet{
  width:100%;max-height:92vh;background:#fff;border-radius:16px 16px 0 0;overflow:auto;animation:slideUp .25s ease;
  display:grid;row-gap:12px;padding-bottom:14px;
}
.sheet-bar{display:grid;place-items:center;padding-top:6px}
.drag{width:46px;height:5px;border-radius:999px;background:#e5e7eb}
.sheet-head{padding:6px 14px 0}
.sheet-title{margin:8px 0 4px;font-weight:900;font-size:1.2rem}
.sheet-metrics{display:flex;gap:10px;align-items:center;flex-wrap:wrap;color:#374151}
.media-slider{padding:10px 10px 0}
.media-track{display:grid;grid-auto-flow:column;grid-auto-columns:85%;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory}
.media-track::-webkit-scrollbar{display:none}
.media-slide{scroll-snap-align:center;border-radius:12px;overflow:hidden;background:#000}
.media-slide img,.media-slide video{width:100%;height:240px;object-fit:cover;display:block}

.map{
  margin:10px 14px 0;border:1px dashed #d1d5db;border-radius:12px;padding:14px;display:flex;gap:10px;align-items:center;color:#6b7280
}

.steps{padding:8px 14px 0}
.steps h4{margin:0 0 6px}
.steps ol{list-style:none;margin:0;padding:0;display:grid;row-gap:8px}
.steps li{display:grid;grid-template-columns:auto 1fr;gap:10px}
.s-idx{width:28px;height:28px;border-radius:999px;background:#eef2ff;display:grid;place-items:center;font-weight:800}
.s-title{display:block}
.s-note{margin:.5px 0 0;color:#4b5563}

.breakdown{padding:2px 14px 0}
.breakdown h4{margin:0 0 6px}
.rows{display:grid;row-gap:6px}
.row{display:grid;grid-template-columns:120px 1fr auto;align-items:center;gap:10px}
meter{width:100%;height:10px}

.comments{padding:6px 14px 0;display:grid;row-gap:10px}
.c-list{display:grid;row-gap:10px}
.c-item{display:grid;grid-template-columns:auto 1fr;gap:10px}
.c-item img{width:34px;height:34px;border-radius:50%;object-fit:cover}
.c-meta{display:flex;gap:8px;align-items:center}
.c-date{color:#6b7280;font-size:.85rem}
.c-text{margin:2px 0 0}
.c-form{display:grid;grid-template-columns:1fr auto;gap:8px}
.c-form input{height:40px;border:1px solid #e5e7eb;border-radius:10px;padding:0 10px}
.btn{height:40px;border:none;border-radius:10px;background:linear-gradient(135deg,#2563eb,#00bcd4);color:#fff;padding:0 14px;font-weight:800;cursor:pointer}
.btn.ghost{background:#eceff3;color:#111827}

.sheet-actions{display:flex;gap:10px;justify-content:center;padding:4px 14px 0}

/* --- Create modal --- */
.modal{
  position:fixed;inset:0;background:rgba(0,0,0,.3);backdrop-filter:blur(6px);
  display:grid;place-items:end;z-index:70;
}
.panel{
  width:100%;max-height:92vh;overflow:auto;background:#fff;border-radius:16px 16px 0 0;padding:14px;animation:slideUp .25s ease;
  display:grid;row-gap:10px;
}
.panel h3{margin:0 0 4px}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.panel input,.panel textarea,.panel select{
  width:100%;height:42px;border:1px solid #e5e7eb;border-radius:10px;padding:0 10px;font-size:.95rem
}
.panel textarea{height:88px;padding:8px 10px;resize:vertical}
.check{display:flex;align-items:center;gap:8px}
.tags-edit{display:flex;flex-wrap:wrap;gap:6px}
.tags-edit .tag{cursor:pointer}
.uploader{
  display:inline-flex;align-items:center;gap:8px;border:1px dashed #d1d5db;padding:10px;border-radius:10px;cursor:pointer
}
.uploader input{display:none}
.panel-actions{display:flex;gap:10px;justify-content:center;margin-top:4px}

/* --- Animations --- */
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
</style>
