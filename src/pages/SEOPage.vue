<template>
  <div class="seo-page">
    <div class="seo-header">
      <h1>SEO Optimization Tools</h1>
      <p>Generate sitemaps, robots.txt, and manage search engine optimization</p>
    </div>

    <div class="seo-tools">
      <div class="tool-section">
        <h2>📄 Sitemap Generation</h2>
        <p>Generate XML sitemap for all attractions, cities, and categories</p>
        <div class="tool-actions">
          <button @click="generateSitemap" class="generate-btn">
            Generate Sitemap
          </button>
          <button @click="downloadSitemap" class="download-btn" :disabled="!sitemapXml">
            Download sitemap.xml
          </button>
        </div>
        <div v-if="sitemapStats" class="stats">
          <div class="stat-item">
            <span class="stat-label">Total URLs:</span>
            <span class="stat-value">{{ sitemapStats.totalUrls }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Cities:</span>
            <span class="stat-value">{{ sitemapStats.cities }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Attractions:</span>
            <span class="stat-value">{{ sitemapStats.attractions }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Categories:</span>
            <span class="stat-value">{{ sitemapStats.categories }}</span>
          </div>
        </div>
      </div>

      <div class="tool-section">
        <h2>🤖 Robots.txt</h2>
        <p>Generate robots.txt file for search engine crawlers</p>
        <div class="tool-actions">
          <button @click="generateRobots" class="generate-btn">
            Generate Robots.txt
          </button>
          <button @click="downloadRobots" class="download-btn" :disabled="!robotsTxt">
            Download robots.txt
          </button>
        </div>
      </div>

      <div class="tool-section">
        <h2>🔍 Search Optimization</h2>
        <p>Test location-based search optimization</p>
        <div class="search-test">
          <input 
            v-model="testQuery" 
            placeholder="Enter search query (e.g., 'Замок в Черняховске')"
            class="test-input"
          />
          <button @click="testOptimizedQuery" class="test-btn">
            Test Optimization
          </button>
        </div>
        <div v-if="optimizedQuery" class="optimization-result">
          <h3>Optimized Query:</h3>
          <p class="optimized-text">{{ optimizedQuery }}</p>
        </div>
      </div>

      <div class="tool-section">
        <h2>📊 SEO Analytics</h2>
        <p>View SEO statistics and recommendations</p>
        <div class="analytics">
          <div class="analytics-item">
            <h4>Page Coverage</h4>
            <div class="coverage-stats">
              <div class="coverage-item">
                <span class="coverage-label">Cities:</span>
                <span class="coverage-value">{{ citiesData.length }} pages</span>
              </div>
              <div class="coverage-item">
                <span class="coverage-label">Attractions:</span>
                <span class="coverage-value">{{ allAttractions.length }} pages</span>
              </div>
              <div class="coverage-item">
                <span class="coverage-label">Categories:</span>
                <span class="coverage-value">{{ uniqueCategories.length }} pages</span>
              </div>
            </div>
          </div>
          
          <div class="analytics-item">
            <h4>Content Quality</h4>
            <div class="quality-stats">
              <div class="quality-item">
                <span class="quality-label">Attractions with descriptions:</span>
                <span class="quality-value">{{ attractionsWithDescriptions }}%</span>
              </div>
              <div class="quality-item">
                <span class="quality-label">Attractions with images:</span>
                <span class="quality-value">{{ attractionsWithImages }}%</span>
              </div>
              <div class="quality-item">
                <span class="quality-label">Attractions with ratings:</span>
                <span class="quality-value">{{ attractionsWithRatings }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="sitemapXml" class="sitemap-preview">
      <h3>Sitemap Preview (first 20 URLs)</h3>
      <pre class="sitemap-content">{{ sitemapPreview }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { allAttractions, citiesData } from '../Data'
import { SitemapGenerator } from '../utils/sitemapGenerator'
import { SEOOptimizer } from '../utils/seoOptimization'

const sitemapXml = ref('')
const robotsTxt = ref('')
const testQuery = ref('')
const optimizedQuery = ref('')
const sitemapStats = ref<any>(null)

// Generate sitemap
function generateSitemap() {
  const xml = SitemapGenerator.generateSitemap(allAttractions.value, citiesData.value.map(c => c.name))
  sitemapXml.value = xml
  
  // Calculate stats
  const cities = citiesData.value.length
  const attractions = allAttractions.value.length
  const categories = uniqueCategories.value.length
  const totalUrls = 4 + cities + attractions + categories // 4 main pages
  
  sitemapStats.value = {
    totalUrls,
    cities,
    attractions,
    categories
  }
}

// Download sitemap
function downloadSitemap() {
  if (sitemapXml.value) {
    SitemapGenerator.downloadSitemap(sitemapXml.value)
  }
}

// Generate robots.txt
function generateRobots() {
  robotsTxt.value = SitemapGenerator.generateRobotsTxt()
}

// Download robots.txt
function downloadRobots() {
  if (robotsTxt.value) {
    SitemapGenerator.downloadRobotsTxt(robotsTxt.value)
  }
}

// Test optimized query
function testOptimizedQuery() {
  if (testQuery.value.trim()) {
    // Extract city from query if present
    const cityMatch = testQuery.value.match(/в\s+(\w+)/i)
    const city = cityMatch ? cityMatch[1] : 'Калининград'
    
    optimizedQuery.value = SEOOptimizer.optimizeLocationQuery(testQuery.value, city)
  }
}

// Computed properties for analytics
const uniqueCategories = computed(() => {
  return [...new Set(allAttractions.value.flatMap(a => a.categories || []))]
})

const attractionsWithDescriptions = computed(() => {
  const withDesc = allAttractions.value.filter(a => a.description && a.description.trim().length > 50)
  return Math.round((withDesc.length / allAttractions.value.length) * 100)
})

const attractionsWithImages = computed(() => {
  const withImages = allAttractions.value.filter(a => a.image && a.image.trim().length > 0)
  return Math.round((withImages.length / allAttractions.value.length) * 100)
})

const attractionsWithRatings = computed(() => {
  const withRatings = allAttractions.value.filter(a => a.rating && a.rating > 0)
  return Math.round((withRatings.length / allAttractions.value.length) * 100)
})

const sitemapPreview = computed(() => {
  if (!sitemapXml.value) return ''
  
  const lines = sitemapXml.value.split('\n')
  const previewLines = lines.slice(0, 50) // First 50 lines
  return previewLines.join('\n') + '\n... (truncated)'
})
</script>

<style scoped>
.seo-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.seo-header {
  text-align: center;
  margin-bottom: 3rem;
}

.seo-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.seo-header p {
  font-size: 1.1rem;
  color: #7f8c8d;
}

.seo-tools {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.tool-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
}

.tool-section h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tool-section p {
  color: #7f8c8d;
  margin-bottom: 1.5rem;
}

.tool-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.generate-btn, .download-btn, .test-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.generate-btn, .test-btn {
  background: #3498db;
  color: white;
}

.generate-btn:hover, .test-btn:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.download-btn {
  background: #27ae60;
  color: white;
}

.download-btn:hover:not(:disabled) {
  background: #229954;
  transform: translateY(-1px);
}

.download-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.search-test {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.test-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
}

.test-input:focus {
  outline: none;
  border-color: #3498db;
}

.optimization-result {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.optimization-result h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.optimized-text {
  margin: 0;
  font-weight: 600;
  color: #27ae60;
}

.analytics {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.analytics-item h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.coverage-stats, .quality-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.coverage-item, .quality-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.coverage-label, .quality-label {
  color: #7f8c8d;
}

.coverage-value, .quality-value {
  font-weight: 600;
  color: #2c3e50;
}

.sitemap-preview {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
}

.sitemap-preview h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.sitemap-content {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #2c3e50;
  white-space: pre-wrap;
  word-break: break-all;
}

@media (max-width: 768px) {
  .seo-page {
    padding: 1rem;
  }
  
  .seo-tools {
    grid-template-columns: 1fr;
  }
  
  .tool-actions {
    flex-direction: column;
  }
  
  .search-test {
    flex-direction: column;
  }
  
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
