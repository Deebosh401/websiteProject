<template>
  <div class="star-rating" :class="{ 'star-rating--small': small }">
    <div 
      v-for="i in 5" 
      :key="i" 
      class="star-container"
      :class="{ 'star-container--partial': isPartialStar(i) }"
    >
      <Icon 
        icon="lucide:star" 
        class="star star--background" 
        :class="{ 'star--small': small }"
      />
      
      <Icon 
        icon="lucide:star" 
        class="star star--foreground" 
        :class="{ 'star--small': small }"
        :style="getStarStyle(i)"
      />
    </div>
    
    <span v-if="showText" class="rating-text">
      {{ rating.toFixed(1) }}/5
    </span>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface Props {
  rating: number
  showText?: boolean
  small?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showText: false,
  small: false
})

function getStarStyle(starIndex: number) {
  const rating = props.rating
  const fullStars = Math.floor(rating)
  const partialStar = rating - fullStars
  
  if (starIndex <= fullStars) {
    // Fully filled star
    return {
      clipPath: 'inset(0 0 0 0)'
    }
  } else if (starIndex === fullStars + 1 && partialStar > 0) {
    // Partially filled star
    const fillPercentage = Math.round(partialStar * 100)
    return {
      clipPath: `inset(0 ${100 - fillPercentage}% 0 0)`
    }
  } else {
    // Empty star
    return {
      clipPath: 'inset(0 100% 0 0)'
    }
  }
}

function isPartialStar(starIndex: number): boolean {
  const rating = props.rating
  const fullStars = Math.floor(rating)
  const partialStar = rating - fullStars
  return starIndex === fullStars + 1 && partialStar > 0
}
</script>

<style scoped>
.star-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.star-rating--small {
  gap: 0.15rem;
}

.star-container {
  position: relative;
  display: inline-block;
}

.star-container--partial .star--background {
  /* Make the unfilled portion more visible for partial stars */
  color: #6b7280; /* gray-500 - darker gray for better contrast */
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.15));
  /* Add a subtle outline to make the unfilled portion stand out */
  -webkit-text-stroke: 0.3px rgba(0, 0, 0, 0.2);
  text-stroke: 0.3px rgba(0, 0, 0, 0.2);
}

.star {
  width: 1rem;
  height: 1rem;
  color: #d1d5db; /* gray-300 */
  transition: color 0.2s ease;
}

.star--small {
  width: 0.875rem;
  height: 0.875rem;
}

.star--background {
  /* Background star is always visible */
  color: #d1d5db; /* gray-300 - subtle gray for unfilled portions */
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.star--foreground {
  position: absolute;
  top: 0;
  left: 0;
  color: #f59e0b; /* amber-500 - same as rating filter buttons */
  clip-path: inset(0 100% 0 0);
  transition: clip-path 0.2s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  /* Add a subtle stroke to make the filled portion more defined */
  -webkit-text-stroke: 0.5px rgba(0, 0, 0, 0.1);
  text-stroke: 0.5px rgba(0, 0, 0, 0.1);
}

.rating-text {
  margin-left: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280; /* gray-500 */
  font-weight: 500;
}

/* Mobile adjustments */
@media (max-width: 640px) {
  .star {
    width: 0.875rem;
    height: 0.875rem;
  }
  
  .star--small {
    width: 0.75rem;
    height: 0.75rem;
  }
  
  .rating-text {
    font-size: 0.8rem;
    margin-left: 0.375rem;
  }
}
</style>
