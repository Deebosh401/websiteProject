<template>
    <div class="date-picker-container">
      <button @click="prevWeek" class="nav-button">&lt;</button>
  
      <div
        ref="scrollContainer"
        class="date-list"
        @wheel="onWheelScroll"
        @scroll="updateMonthLabel"
        @touchstart="startTouch"
        @touchmove="moveTouch"
        @touchend="endTouch"
      >
        <div
          v-for="(date) in visibleDates"
          :key="date.toISOString()"
          @click="selectDate(date)"
          :class="['date-item', { selected: date.getTime() === selectedDate.getTime(), range: isInRange(date) }]"
        >
          <span class="day">{{ formatDay(date) }}</span>
          <small class="date">{{ formatDate(date) }}</small>
          <span v-if="isSpecialDate(date)" class="event-dot"></span>
        </div>
      </div>
  
      <button @click="nextWeek" class="nav-button">&gt;</button>
  
      <div class="month-label" :style="monthLabelStyle">
        {{ currentMonth }}
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { format, addDays, subDays, startOfWeek, isSameMonth, isWithinInterval } from 'date-fns'
  
  // State
  const selectedDate = ref(new Date())
  const returnDate = ref(null)
  const currentStartDate = ref(new Date())
  const currentMonth = ref(format(selectedDate.value, 'MMMM yyyy'))
  
  // Generate a large buffer of dates for infinite scrolling
  const totalDays = 365
  const visibleDates = computed(() => {
  const today = new Date()
  const start = subDays(today, 183) // 6 months before today
  const end = addDays(today, 182) // 6 months after today
  const dates = []

  for (let d = start; d <= end; d = addDays(d, 1)) {
    dates.push(new Date(d))
  }

  return dates
})

  
  // Handle Date Selection
  function selectDate(date) {
    if (!selectedDate.value || returnDate.value) {
      selectedDate.value = date
      returnDate.value = null
    } else {
      if (date < selectedDate.value) {
        returnDate.value = selectedDate.value
        selectedDate.value = date
      } else {
        returnDate.value = date
      }
    }
    centerSelectedDate()
  }
  
  // Scroll Logic
  const scrollContainer = ref(null)
  let isDragging = false
  let startX = 0
  let scrollLeft = 0
  
  function startTouch(event) {
    isDragging = true
    startX = event.touches[0].pageX - scrollContainer.value.offsetLeft
    scrollLeft = scrollContainer.value.scrollLeft
  }
  
  function moveTouch(event) {
    if (!isDragging) return
    event.preventDefault()
    const x = event.touches[0].pageX - scrollContainer.value.offsetLeft
    const walk = (startX - x) * 1.5
    scrollContainer.value.scrollLeft = scrollLeft + walk
  }
  
  function endTouch() {
    isDragging = false
  }
  
  function centerSelectedDate() {
    const selected = scrollContainer.value.querySelector('.selected')
    if (selected) {
      const containerWidth = scrollContainer.value.offsetWidth
      const itemWidth = selected.offsetWidth
      const offset = selected.offsetLeft - (containerWidth / 2 - itemWidth / 2)
      scrollContainer.value.scrollTo({
        left: offset,
        behavior: 'smooth',
      })
      updateMonthLabel()
    }
  }
  
  // Update Month Label on Scroll
  function updateMonthLabel() {
    const items = scrollContainer.value.querySelectorAll('.date-item')
    const containerWidth = scrollContainer.value.offsetWidth
    const centerX = scrollContainer.value.scrollLeft + containerWidth / 2
  
    items.forEach(item => {
      const rect = item.getBoundingClientRect()
      const offsetLeft = rect.left + scrollContainer.value.scrollLeft
      const offsetRight = offsetLeft + rect.width
  
      if (offsetLeft <= centerX && offsetRight >= centerX) {
        const dateIndex = Array.from(items).indexOf(item)
        const currentDate = visibleDates.value[dateIndex]
        currentMonth.value = format(currentDate, 'MMMM yyyy')
      }
    })
  }
  
  // Helpers
  function formatDay(date) {
    return format(date, 'EEE')
  }
  
  function formatDate(date) {
    return format(date, 'dd')
  }
  
  function isInRange(date) {
    if (!selectedDate.value || !returnDate.value) return false
    return isWithinInterval(date, { start: selectedDate.value, end: returnDate.value })
  }
  
  function isSpecialDate(date) {
    const specialDates = [
      new Date(2025, 11, 25), // Christmas
      new Date(2025, 0, 1), // New Year
      new Date(2025, 6, 4), // Independence Day
    ]
    return specialDates.some(d => d.getTime() === date.getTime())
  }
  
  // Initialize
  onMounted(() => {
    centerSelectedDate()
  })
  </script>
  
  <style scoped>
  .date-picker-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 2rem auto;
  width: 100%;
  max-width: 1600px; /* Increase the maximum width */
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
  
.date-list {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  gap: 1rem;
  padding: 0 1rem;
  background-color: #ffffff;
  border-radius: 15px;
  width: 100%;
  scrollbar-width: none; /* Firefox */
  padding: 10px 20px;
}

  
  .date-list::-webkit-scrollbar {
    display: none;
  }
  
  .date-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem 1.5rem; /* Increase horizontal padding */
  border-radius: 10px;
  background-color: #ffffff;
  min-width: 100px; /* Increase min width */
  transition: background-color 0.3s, transform 0.2s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

  
  .date-item.selected,
  .date-item.range {
    background-color: #2563eb;
    color: white;
    font-weight: bold;
    transform: scale(1.1);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  }
  
  .date-item:hover {
    background-color: #e0edff;
    transform: scale(1.05);
  }
  
  .event-dot {
    width: 8px;
    height: 8px;
    background-color: #ff4d4d;
    border-radius: 50%;
    margin-top: 5px;
  }
  
  .month-label {
    position: absolute;
    bottom: -2.5rem;
    font-size: 1rem;
    font-weight: bold;
    color: #333;
    transition: left 0.3s;
    width: 150px;
    text-align: center;
    left: 50%;
    transform: translateX(-50%);
  }

  @media (min-width: 1400px) {
  .date-picker-container {
    max-width: 1800px;
  }

  .date-item {
    min-width: 120px;
    padding: 0.5rem 2rem;
  }
}
  </style>