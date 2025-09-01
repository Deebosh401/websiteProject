<template>
  <div class="filter-modal-overlay" @click.self="close">
    <div class="filter-modal">
      <div class="modal-header">
        <h2>Фильтры – {{ category }}</h2>
        <button class="close-btn" @click="close" aria-label="Закрыть">
          <span>×</span>
        </button>
      </div>
      


      <div v-if="options" class="filters-wrapper">
        <div v-for="(config, key) in options" :key="key" class="filter-block">
          <label class="filter-label">{{ config.label }}</label>

          <div v-if="config.type === 'single'" class="filter-single">
            <div class="chip-row">
              <!-- For yes/no filters, don't show "Все" option -->
              <template v-if="isYesNoFilter(config.options)">
                <button
                  v-for="opt in config.options"
                  :key="String(opt)"
                  class="chip"
                  :class="{ active: activeSingle(key, String(opt)) }"
                  @click="onChipSelect(key, String(opt))"
                >{{ opt }}</button>
              </template>
              <!-- For other single filters, show "Все" option -->
              <template v-else>
                <button class="chip" :class="{ active: activeSingle(key, '') }" @click="onChipSelect(key, '')">Все</button>
                <button
                  v-for="opt in config.options"
                  :key="String(opt)"
                  class="chip"
                  :class="{ active: activeSingle(key, String(opt)) }"
                  @click="onChipSelect(key, String(opt))"
                >{{ opt }}</button>
              </template>
            </div>
            <!-- Individual reset button for yes/no filters -->
            <button 
              v-if="isYesNoFilter(config.options) && filters[key]" 
              @click="resetFilter(key)" 
              class="reset-filter-btn"
              title="Сбросить фильтр"
            >
              ×
            </button>
          </div>

          <div v-else-if="config.type === 'multi'" class="filter-multi">
            <template v-if="category === 'Где поесть' && key === 'Кухня'">
              <label
                v-for="opt in config.options"
                :key="opt"
                class="filter-checkbox"
              >
                <input
                  type="checkbox"
                  :value="opt"
                  v-model="filters[key]"
                />
                {{ opt }}
              </label>
            </template>
            <!-- For other multi → chips -->
            <template v-else>
              <button
                v-for="opt in config.options"
                :key="String(opt)"
                class="chip"
                :class="{ active: multiActive(key, String(opt)) }"
                @click="onMultiToggle(key, String(opt))"
              >{{ opt }}</button>
            </template>
          </div>

                    <!-- PRICE RANGE with suggestions -->
          <div v-else-if="config.type === 'range'" class="filter-range">
            <div class="range-values">
              <input class="num" type="number" :min="config.min" :max="config.max" :step="config.step" v-model.number="filters[key][0]" @input="normalizeRange(key, config, 'min')" />
              <span>—</span>
              <input class="num" type="number" :min="config.min" :max="config.max" :step="config.step" v-model.number="filters[key][1]" @input="normalizeRange(key, config, 'max')" />
            </div>
            <div class="price-suggestions">
              <button class="chip" @click="setPriceRange(key, config, 0, 1000)">до 1000 ₽/чел</button>
              <button class="chip" @click="setPriceRange(key, config, 1000, 3000)">1000-3000 ₽/чел</button>
              <button class="chip" @click="setPriceRange(key, config, 3000, 5000)">3000-5000 ₽/чел</button>
              <button class="chip" @click="setPriceRange(key, config, 5000, 10000)">5000-10000 ₽/чел</button>
            </div>
          </div>

          <!-- TIME RANGE PICKER -->
          <div v-else-if="config.type === 'timeRange'" class="filter-time-range">
            <div class="time-range-inputs">
              <div class="time-input-group">
                <label>Открыто с:</label>
                <input
                  type="time"
                  v-model="filters[key].open"
                  class="filter-time"
                />
              </div>
              <div class="time-input-group">
                <label>До:</label>
                <input
                  type="time"
                  v-model="filters[key].close"
                  class="filter-time"
                />
              </div>
            </div>
          </div>

          <!-- TIME PICKER (legacy) -->
          <input
            v-else-if="config.type === 'time'"
            type="time"
            v-model="filters[key]"
            class="filter-time"
          />
        </div>
      </div>

      <!-- Rating sorting moved to top -->

      <div class="filter-modal-footer">
        <button @click="resetAll" class="reset-all-btn">
          <span>Сбросить</span>
        </button>
        <button @click="apply" class="apply-btn">
          <span>Применить</span>
          <span class="match-count-badge">{{ matchCount || 0 }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import { filterOptions } from '../filterConfig'
import { allAttractions } from '../Data'

// Props
const props = defineProps<{
  category: string
  existingFilters: Record<string, any>
  currentMatchCount?: number
}>()

const emit = defineEmits(['apply', 'close'])
const options = computed<Record<string, any>>(() => filterOptions[props.category] || {})
const filters = reactive<Record<string, any>>({})

// Match count for current filters - reactive to modal filter changes
const matchCount = computed(() => {
  // Get all attractions for the current category
  const source = Array.isArray(allAttractions) ? allAttractions : []
  let attractions = source.filter(a => a.categories && a.categories.includes(props.category))
  
  // Apply current filter selections from the modal
  Object.entries(filters).forEach(([key, value]) => {
    if (!value || (typeof value === 'string' && value === '') || (Array.isArray(value) && value.length === 0)) {
      return // Skip empty filters
    }
    
    attractions = attractions.filter(a => {
      const lc = (s: any) => String(s ?? '').toLowerCase()
      const isYes = (v: any) => lc(v) === 'да'
      
      switch (key) {
        case 'Кухня':
          if (Array.isArray(value) && value.length) {
            const have = (a['Кухня'] || []).map(lc)
            const want = value.map(lc)
            return want.some((w: string) => have.includes(w))
          }
          return true
        case 'Средний чек':
          return lc(a['Средний чек']) === lc(value)
        case 'Тип заведения':
          return lc(a['Тип заведения']) === lc(value)
        case 'Завтраки':
          return (a['Завтраки'] ?? false) === isYes(value)
        case 'Бронирование':
          return (a['Бронирование'] ?? false) === isYes(value)
        case 'Открыто сейчас':
          const hasWorkingHours = !!(a['Время работы'])
          return hasWorkingHours === isYes(value)
        case 'Ценовой диапазон':
          if (Array.isArray(value) && value.length === 2) {
            const price = a.price || 0
            return price >= value[0] && price <= value[1]
          }
          return true
        default:
          return true
      }
    })
  })
  
  return attractions.length
})



watch(
  () => props.existingFilters,
  (val) => {
    Object.keys(options.value).forEach((key) => {
      if (options.value[key].type === 'multi') {
        filters[key] = val[key] || []
      } else if (options.value[key].type === 'range') {
        filters[key] = val[key] || [options.value[key].min, options.value[key].max]
      } else if (options.value[key].type === 'timeRange') {
        filters[key] = val[key] || { open: '', close: '' }
      } else {
        filters[key] = val[key] || ''
      }
    })
    

  },
  { immediate: true }
)

// Emit applied filters with animation
function apply() {
  // Add closing animation
  const modal = document.querySelector('.filter-modal') as HTMLElement
  if (modal) {
    modal.style.animation = 'slideDown 0.3s ease-in forwards'
  }
  
  // Close modal after animation
  setTimeout(() => {
    emit('apply', { ...filters })
  }, 250)
}

function activeSingle(key: any, opt: any): boolean {
  // For "Все" (empty string), check if no specific option is selected
  if (opt === '') {
    return !filters[key] || filters[key] === ''
  }
  // For specific options, check if this option is selected
  return String(filters[key] ?? '') === String(opt ?? '')
}
function onChipSelect(key: any, opt: any) {
  // If selecting "Все" (empty string), clear the filter
  if (opt === '') {
    filters[key] = ''
  } else {
    // Select the specific option
    filters[key] = String(opt ?? '')
  }
}
function multiActive(key: any, opt: any): boolean {
  const arr: string[] = Array.isArray(filters[key]) ? filters[key] : []
  return arr.map(String).includes(String(opt))
}
function onMultiToggle(key: any, opt: any) {
  const arr: string[] = Array.isArray(filters[key]) ? filters[key] : []
  const s = String(opt)
  const i = arr.map(String).indexOf(s)
  if (i >= 0) arr.splice(i, 1)
  else arr.push(s)
  filters[key] = [...arr]
}



function clamp(val: number, min: number, max: number) { return Math.max(min, Math.min(max, val)) }

function setPriceRange(key: string, _config: any, min: number, max: number) {
  filters[key] = [min, max]
}

function isYesNoFilter(options: any[]): boolean {
  return options.length === 2 && options.includes('да') && options.includes('нет')
}

function resetFilter(key: string) {
  filters[key] = ''
}
function normalizeRange(key: any, cfg: any, which: 'min' | 'max') {
  const arr = Array.isArray(filters[key]) ? filters[key] : [cfg.min, cfg.max]
  const min = Number(cfg.min) || 0
  const max = Number(cfg.max) || 100

  
  // Allow manual input without aggressive rounding
  let lo = Number(arr[0]) || min
  let hi = Number(arr[1]) || max
  
  // Only clamp to min/max bounds, don't force step alignment for manual input
  lo = clamp(lo, min, max)
  hi = clamp(hi, min, max)
  
  // Ensure min doesn't exceed max
  if (which === 'min' && lo > hi) lo = hi
  if (which === 'max' && hi < lo) hi = lo
  
  filters[key] = [lo, hi]
}







// function clearFilters() {
//   Object.keys(options.value).forEach((key) => {
//     if (options.value[key].type === 'multi') filters[key] = []
//     else if (options.value[key].type === 'range')
//       filters[key] = [options.value[key].min, options.value[key].max]
//     else if (options.value[key].type === 'timeRange')
//       filters[key] = { open: '', close: '' }
//     else filters[key] = ''
//   })
// }



function resetAll() {
  Object.keys(options.value).forEach((key) => {
    if (options.value[key].type === 'multi') filters[key] = []
    else if (options.value[key].type === 'range') filters[key] = [options.value[key].min, options.value[key].max]
    else if (options.value[key].type === 'timeRange') filters[key] = { open: '', close: '' }
    else filters[key] = ''
  })
  const modal = document.querySelector('.filter-modal') as HTMLElement
  if (modal) modal.style.animation = 'slideDown 0.3s ease-in forwards'
  setTimeout(() => emit('apply', { ...filters }), 250)
}

function close() {
  emit('close')
}
</script>


<style scoped>
.filter-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 50;
}
.filter-modal {
  background: white;
  width: 100%;
  max-height: 70vh;
  overflow-y: auto;
  border-radius: 20px 20px 0 0;
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.5rem;
  color: #6b7280;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}
@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100%);
  }
}
.filters-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1rem 1.5rem;
}
.filter-block {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.filter-label {
  font-weight: bold;
  font-size: 0.95rem;
}
.filter-select,
.filter-time {
  padding: 0.4rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.filter-time-range {
  margin-top: 0.5rem;
}

.time-range-inputs {
  display: flex;
  gap: 1rem;
  align-items: end;
}

.time-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.time-input-group label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #666;
}
.filter-multi {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.filter-checkbox {
  font-size: 0.85rem;
}

.range-values { display: flex; align-items: center; gap: 0.4rem; margin-top: 0.2rem; }
.range-values .num { 
  width: 45%; 
  padding: 0.5rem; 
  border: 1px solid #ddd; 
  border-radius: 8px; 
  font-size: 0.9rem;
  text-align: center;
  background: #fff;
  cursor: text;
}

.range-values .num:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.price-suggestions {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}
.range-label { margin-left: auto; font-size: 0.9rem; opacity: 0.75; }
.range-inputs { display: grid; gap: 0.25rem; }


/* Filter single layout */
.filter-single {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.filter-single .chip-row {
  flex: 1;
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.reset-filter-btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  color: #64748b;
  font-weight: bold;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.reset-filter-btn:hover {
  background: #e2e8f0;
  color: #475569;
  border-color: #cbd5e1;
}

/* Chips */
.chip-row { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.chip { border: 1px solid rgba(0,0,0,0.1); background: #fff; border-radius: 999px; padding: 0.35rem 0.7rem; font-size: 0.9rem; cursor: pointer; }
.chip.active { background: #f3f7ff; border-color: rgba(37,99,235,0.35); box-shadow: 0 2px 8px rgba(37,99,235,0.15); }
.filter-modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #f1f5f9;
  background: #fafafa;
  align-items: center;
}



.reset-all-btn,
.apply-btn {
  flex: 1;
  padding: 0.875rem 1.25rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reset-all-btn {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.reset-all-btn:hover {
  background: #f1f5f9;
  color: #475569;
  border-color: #cbd5e1;
}

.apply-btn {
  background: #3b82f6;
  color: white;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3);
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.match-count-badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 20px;
  line-height: 1;
  text-align: center;
}

.apply-btn:hover {
  background: #2563eb;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
}


</style>

<script lang="ts">
export default {}
</script>