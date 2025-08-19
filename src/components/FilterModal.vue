<template>
  <div class="filter-modal-overlay" @click.self="close">
    <div class="filter-modal">
      <h2>Фильтры – {{ category }}</h2>
      <div v-if="options" class="filters-wrapper">
        <div v-for="(config, key) in options" :key="key" class="filter-block">
          <label class="filter-label">{{ config.label }}</label>

          <!-- SINGLE SELECT → chips -->
          <div v-if="config.type === 'single'" class="chip-row">
            <button class="chip" :class="{ active: !activeSingle(key, '') }" @click="onChipSelect(key, '')">Все</button>
            <button
              v-for="opt in config.options"
              :key="String(opt)"
              class="chip"
              :class="{ active: activeSingle(key, String(opt)) }"
              @click="onChipSelect(key, String(opt))"
            >{{ opt }}</button>
          </div>

          <!-- MULTI SELECT -->
          <div v-else-if="config.type === 'multi'" class="filter-multi">
            <!-- Keep checkboxes for cuisines in 'Где поесть' -->
            <template v-if="category === 'Где поесть' && key === 'cuisine'">
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

          <!-- RANGE SLIDER with presets -->
          <div v-else-if="config.type === 'range'" class="filter-range">
            <div class="range-shell">
              <div class="range-track">
                <div class="range-fill" :style="rangeFillStyle(config, filters[key])"></div>
              </div>
              <input
                class="thumb left"
                type="range"
                :min="config.min"
                :max="config.max"
                :step="config.step"
                v-model.number="filters[key][0]"
                @input="normalizeRange(key, config, 'min')"
              />
              <input
                class="thumb right"
                type="range"
                :min="config.min"
                :max="config.max"
                :step="config.step"
                v-model.number="filters[key][1]"
                @input="normalizeRange(key, config, 'max')"
              />
            </div>
            <div class="range-values">
              <input class="num" type="number" :min="config.min" :max="config.max" :step="config.step" v-model.number="filters[key][0]" @input="normalizeRange(key, config, 'min')" />
              <span>—</span>
              <input class="num" type="number" :min="config.min" :max="config.max" :step="config.step" v-model.number="filters[key][1]" @input="normalizeRange(key, config, 'max')" />
              <span class="range-label">{{ formatRangeValue(key, config, filters[key][0]) }} – {{ formatRangeValue(key, config, filters[key][1]) }}</span>
            </div>
            <div class="preset-row">
              <button class="chip" @click="setRangePreset(key, config, 'low')">до {{ formatRangeValue(key, config, presetLabelNum(config, 'low')) }}</button>
              <button class="chip" @click="setRangePreset(key, config, 'mid')">{{ formatRangeValue(key, config, presetLabelNum(config, 'midLo')) }}–{{ formatRangeValue(key, config, presetLabelNum(config, 'midHi')) }}</button>
              <button class="chip" @click="setRangePreset(key, config, 'high')">{{ formatRangeValue(key, config, presetLabelNum(config, 'high')) }}+</button>
              <button class="chip" @click="setRangePreset(key, config, 'all')">Все</button>
            </div>
          </div>

          <!-- TIME PICKER -->
          <input
            v-else-if="config.type === 'time'"
            type="time"
            v-model="filters[key]"
            class="filter-time"
          />
        </div>
      </div>

      <div class="filter-modal-footer">
        <button @click="clearFilters" class="clear-btn">Сбросить</button>
        <button @click="apply" class="apply-btn">Применить</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import { filterOptions } from '../filterConfig'

// Props
const props = defineProps<{
  category: string
  existingFilters: Record<string, any>
}>()

const emit = defineEmits(['apply', 'close'])
const options = computed<Record<string, any>>(() => filterOptions[props.category] || {})
const filters = reactive<Record<string, any>>({})

watch(
  () => props.existingFilters,
  (val) => {
    Object.keys(options.value).forEach((key) => {
      if (options.value[key].type === 'multi') {
        filters[key] = val[key] || []
      } else if (options.value[key].type === 'range') {
        filters[key] = val[key] || [options.value[key].min, options.value[key].max]
      } else {
        filters[key] = val[key] || ''
      }
    })
  },
  { immediate: true }
)

// Emit applied filters
function apply() {
  emit('apply', { ...filters })
}

function activeSingle(key: any, opt: any): boolean {
  return String(filters[key] ?? '') === String(opt ?? '')
}
function onChipSelect(key: any, opt: any) {
  filters[key] = String(opt ?? '')
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

function setRangePreset(key: string, cfg: any, which: 'low' | 'mid' | 'high' | 'all') {
  const min = Number(cfg.min) || 0
  const max = Number(cfg.max) || 100
  const lo = Math.round(min + (max - min) * 0.33)
  const hi = Math.round(min + (max - min) * 0.66)
  if (which === 'low') filters[key] = [min, lo]
  else if (which === 'mid') filters[key] = [lo, hi]
  else if (which === 'high') filters[key] = [hi, max]
  else filters[key] = [min, max]
}

function presetLabelNum(cfg: any, which: 'low' | 'midLo' | 'midHi' | 'high') {
  const min = Number(cfg.min) || 0
  const max = Number(cfg.max) || 100
  const lo = Math.round(min + (max - min) * 0.33)
  const hi = Math.round(min + (max - min) * 0.66)
  if (which === 'low') return lo
  if (which === 'midLo') return lo
  if (which === 'midHi') return hi
  return hi
}

function clamp(val: number, min: number, max: number) { return Math.max(min, Math.min(max, val)) }
function normalizeRange(key: any, cfg: any, which: 'min' | 'max') {
  const arr = Array.isArray(filters[key]) ? filters[key] : [cfg.min, cfg.max]
  const min = Number(cfg.min) || 0
  const max = Number(cfg.max) || 100
  const step = Number(cfg.step) || 1
  let lo = Math.round(arr[0] / step) * step
  let hi = Math.round(arr[1] / step) * step
  lo = clamp(lo, min, max)
  hi = clamp(hi, min, max)
  if (which === 'min' && lo > hi - step) lo = hi - step
  if (which === 'max' && hi < lo + step) hi = lo + step
  filters[key] = [lo, hi]
}

function formatCurrency(n: any) {
  try { return new Intl.NumberFormat('ru-RU').format(Number(n) || 0) + ' ₽' } catch { return `${n} ₽` }
}

function rangeFillStyle(cfg: any, arr: any) {
  const min = Number(cfg.min) || 0
  const max = Number(cfg.max) || 100
  const total = Math.max(1, max - min)
  const lo = clamp(Array.isArray(arr) ? Number(arr[0]) : min, min, max)
  const hi = clamp(Array.isArray(arr) ? Number(arr[1]) : max, min, max)
  const left = ((lo - min) / total) * 100
  const width = ((Math.max(hi, lo) - lo) / total) * 100
  return { left: left + '%', width: width + '%' }
}

function formatRangeValue(key: any, cfg: any, value: any) {
  const k = String(key).toLowerCase()
  const isMoney = k.includes('price') || k.includes('ticket') || k.includes('range') || k.includes('check')
  const num = Number(value) || 0
  return isMoney ? formatCurrency(num) : String(num)
}

function clearFilters() {
  Object.keys(options.value).forEach((key) => {
    if (options.value[key].type === 'multi') filters[key] = []
    else if (options.value[key].type === 'range')
      filters[key] = [options.value[key].min, options.value[key].max]
    else filters[key] = ''
  })
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
  padding: 1rem;
  animation: slideUp 0.3s ease-out;
}
@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
.filters-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
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
.filter-multi {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.filter-checkbox {
  font-size: 0.85rem;
}
.filter-range input {
  width: 100%;
}
.range-shell { position: relative; height: 28px; margin-bottom: 6px; }
.range-track { position: absolute; left: 0; right: 0; top: 50%; height: 4px; background: #e5e7eb; border-radius: 999px; transform: translateY(-50%); }
.range-fill { position: absolute; height: 100%; background: #3b82f6; border-radius: 999px; }
.thumb { position: absolute; left: 0; right: 0; top: 0; width: 100%; background: none; pointer-events: none; -webkit-appearance: none; appearance: none; }
.thumb::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; pointer-events: auto; width: 20px; height: 20px; border-radius: 50%; background: #fff; border: 2px solid #3b82f6; box-shadow: 0 1px 4px rgba(0,0,0,0.15); }
.thumb::-moz-range-thumb { pointer-events: auto; width: 20px; height: 20px; border-radius: 50%; background: #fff; border: 2px solid #3b82f6; box-shadow: 0 1px 4px rgba(0,0,0,0.15); }
.thumb.left { z-index: 2; }
.thumb.right { z-index: 3; }
.range-values { display: flex; align-items: center; gap: 0.4rem; margin-top: 0.2rem; }
.range-values .num { width: 45%; padding: 0.35rem; border: 1px solid #ddd; border-radius: 8px; }
.range-label { margin-left: auto; font-size: 0.9rem; opacity: 0.75; }
.range-inputs { display: grid; gap: 0.25rem; }
.range-values { display: flex; align-items: center; gap: 0.4rem; margin-top: 0.2rem; }
.range-values .num { width: 45%; padding: 0.35rem; border: 1px solid #ddd; border-radius: 8px; }
.preset-row { display: flex; gap: 0.35rem; flex-wrap: wrap; margin-top: 0.35rem; }

/* Chips */
.chip-row { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.chip { border: 1px solid rgba(0,0,0,0.1); background: #fff; border-radius: 999px; padding: 0.35rem 0.7rem; font-size: 0.9rem; cursor: pointer; }
.chip.active { background: #f3f7ff; border-color: rgba(37,99,235,0.35); box-shadow: 0 2px 8px rgba(37,99,235,0.15); }
.filter-modal-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}
.clear-btn,
.apply-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}
.clear-btn {
  background: #f3f4f6;
  color: #333;
}
.apply-btn {
  background: #3b82f6;
  color: white;
}
</style>

<script lang="ts">
export default {}
</script>