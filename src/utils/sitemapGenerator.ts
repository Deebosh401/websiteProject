import type { Attraction } from '../Data'

interface SitemapUrl {
  loc: string
  lastmod: string
  changefreq: string
  priority: string
}

// Sitemap generator for SEO
export class SitemapGenerator {
  
  // Generate XML sitemap
  static generateSitemap(attractions: Attraction[], cities: string[]): string {
    const baseUrl = window.location.origin
    const urls: SitemapUrl[] = []

    // Add main pages
    urls.push({
      loc: baseUrl,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: '1.0'
    })

    urls.push({
      loc: `${baseUrl}/events`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: '0.9'
    })

    urls.push({
      loc: `${baseUrl}/popular`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.8'
    })

    urls.push({
      loc: `${baseUrl}/guides`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.8'
    })

    // Add city pages
    cities.forEach(city => {
      urls.push({
        loc: `${baseUrl}/city/${city.toLowerCase()}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.8'
      })
    })

    // Add attraction pages
    attractions.forEach(attraction => {
      urls.push({
        loc: `${baseUrl}/attraction/${attraction.id}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: '0.6'
      })
    })

    // Add category pages
    const categories = [...new Set(attractions.flatMap(a => a.categories || []))]
    categories.forEach(category => {
      urls.push({
        loc: `${baseUrl}/category/${category.toLowerCase()}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.7'
      })
    })

    // Generate XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    urls.forEach(url => {
      xml += '  <url>\n'
      xml += `    <loc>${url.loc}</loc>\n`
      xml += `    <lastmod>${url.lastmod}</lastmod>\n`
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`
      xml += `    <priority>${url.priority}</priority>\n`
      xml += '  </url>\n'
    })
    
    xml += '</urlset>'
    
    return xml
  }

  // Generate robots.txt
  static generateRobotsTxt(): string {
    const baseUrl = window.location.origin
    return `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml

# Allow all search engines to crawl
Crawl-delay: 1

# Disallow admin areas (if any)
Disallow: /admin/
Disallow: /api/
`
  }

  // Download sitemap as file
  static downloadSitemap(xml: string, filename: string = 'sitemap.xml') {
    const blob = new Blob([xml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Download robots.txt as file
  static downloadRobotsTxt(robots: string) {
    const blob = new Blob([robots], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'robots.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}
