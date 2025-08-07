<template>
  <div class="filter-modal-overlay" @click.self="close">
    <div class="filter-modal">
      <h2>Фильтры – {{ category }}</h2>
      <div v-if="options" class="filters-wrapper">
        <div v-for="(config, key) in options" :key="key" class="filter-block">
          <label class="filter-label">{{ config.label }}</label>

          <!-- SINGLE SELECT -->
          <select v-if="config.type === 'single'" v-model="filters[key]" class="filter-select">
            <option value="">Все</option>
            <option v-for="opt in config.options" :key="opt" :value="opt">
              {{ opt }}
            </option>
          </select>

          <!-- MULTI SELECT -->
          <div v-else-if="config.type === 'multi'" class="filter-multi">
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
          </div>

          <!-- RANGE SLIDER -->
          <div v-else-if="config.type === 'range'" class="filter-range">
            <input
              type="range"
              :min="config.min"
              :max="config.max"
              :step="config.step"
              v-model.number="filters[key][0]"
            />
            <input
              type="range"
              :min="config.min"
              :max="config.max"
              :step="config.step"
              v-model.number="filters[key][1]"
            />
            <p>{{ filters[key][0] }} ₽ - {{ filters[key][1] }} ₽</p>
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

const options = computed(() => filterOptions[props.category] || {})

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

// Clear all filters
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