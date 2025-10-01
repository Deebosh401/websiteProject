import type { Attraction } from '../Data'

// SEO utility for search engine optimization
export class SEOOptimizer {
  
  // Generate structured data for attractions (JSON-LD)
  static generateAttractionStructuredData(attraction: Attraction, city: string) {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "TouristAttraction",
      "name": attraction.name,
      "description": attraction.description,
      "url": `${window.location.origin}/attraction/${attraction.id}`,
      "image": attraction.image || '',
      "address": {
        "@type": "PostalAddress",
        "addressLocality": city,
        "addressCountry": "RU"
      },
      "geo": undefined, // Coordinates not available in current data structure
      "openingHours": attraction['Время работы'] || undefined,
      "priceRange": attraction['Средний чек'] || undefined,
      "telephone": undefined, // Phone not available in current data structure
      "sameAs": undefined, // Website not available in current data structure
      "aggregateRating": attraction.rating ? {
        "@type": "AggregateRating",
        "ratingValue": attraction.rating,
        "reviewCount": 1 // Review count not available in current data structure
      } : undefined,
      "amenityFeature": attraction['Удобства']?.map((facility: string) => ({
        "@type": "LocationFeatureSpecification",
        "name": facility
      })) || undefined,
      "category": attraction.categories?.join(', ') || undefined,
      "isAccessibleForFree": attraction.price === 0 || attraction.price === undefined,
      "publicAccess": true
    }

    // Remove undefined properties
    return JSON.stringify(structuredData, (_, value) => value === undefined ? undefined : value)
  }

  // Generate structured data for events
  static generateEventStructuredData(attraction: Attraction, city: string) {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": attraction.name,
      "description": attraction.description,
      "url": `${window.location.origin}/event/${attraction.id}`,
      "image": attraction.image || '',
      "location": {
        "@type": "Place",
        "name": attraction.location || city,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": city,
          "addressCountry": "RU"
        },
        "geo": undefined // Coordinates not available in current data structure
      },
      "startDate": attraction.date || undefined,
      "endDate": undefined, // End date not available in current data structure
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "organizer": {
        "@type": "Organization",
        "name": "Traveltis" // Organizer not available in current data structure
      },
      "offers": attraction['Средний чек'] ? {
        "@type": "Offer",
        "price": attraction['Средний чек'],
        "priceCurrency": "RUB",
        "availability": "https://schema.org/InStock"
      } : undefined,
      "category": attraction.categories?.join(', ') || undefined
    }

    return JSON.stringify(structuredData, (_, value) => value === undefined ? undefined : value)
  }

  // Generate structured data for places/locations
  static generatePlaceStructuredData(city: string, attractions: Attraction[]) {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "City",
      "name": city,
      "description": `Достопримечательности и развлечения в ${city}. Экскурсии, рестораны, музеи, парки и многое другое.`,
      "url": `${window.location.origin}/city/${city.toLowerCase()}`,
      "containsPlace": attractions.slice(0, 10).map(attraction => ({
        "@type": "TouristAttraction",
        "name": attraction.name,
        "description": attraction.description,
        "url": `${window.location.origin}/attraction/${attraction.id}`
      })),
      "touristType": "Leisure",
      "isPartOf": {
        "@type": "Country",
        "name": "Россия"
      }
    }

    return JSON.stringify(structuredData)
  }

  // Generate meta tags for location-based searches
  static generateLocationMetaTags(attraction: Attraction, city: string) {
    const baseUrl = window.location.origin
    const title = `${attraction.name} в ${city} - ${attraction.categories?.join(', ') || 'Достопримечательность'}`
    const description = `${attraction.description?.substring(0, 160)}... Посетите ${attraction.name} в ${city}. ${attraction['Средний чек'] ? `Цена: ${attraction['Средний чек']}.` : ''} Рейтинг: ${attraction.rating}/5.`
    
    return {
      title,
      description,
      keywords: [
        attraction.name,
        city,
        ...(attraction.categories || []),
        'достопримечательности',
        'экскурсии',
        'туризм',
        'развлечения',
        'отдых'
      ].join(', '),
      canonical: `${baseUrl}/attraction/${attraction.id}`,
      ogTitle: title,
      ogDescription: description,
      ogImage: attraction.image || '',
      ogUrl: `${baseUrl}/attraction/${attraction.id}`,
      ogType: 'website',
      twitterCard: 'summary_large_image',
      twitterTitle: title,
      twitterDescription: description,
      twitterImage: attraction.image || ''
    }
  }

  // Generate meta tags for city pages
  static generateCityMetaTags(city: string, attractions: Attraction[]) {
    const baseUrl = window.location.origin
    const title = `Достопримечательности ${city} - Экскурсии, рестораны, развлечения`
    const description = `Полный гид по ${city}. ${attractions.length} достопримечательностей, экскурсий и развлечений. Рестораны, музеи, парки, события. Рейтинги и отзывы.`
    
    const categories = [...new Set(attractions.flatMap(a => a.categories || []))]
    
    return {
      title,
      description,
      keywords: [
        city,
        'достопримечательности',
        'экскурсии',
        'рестораны',
        'музеи',
        'парки',
        'события',
        'развлечения',
        'туризм',
        'отдых',
        ...categories
      ].join(', '),
      canonical: `${baseUrl}/city/${city.toLowerCase()}`,
      ogTitle: title,
      ogDescription: description,
      ogImage: attractions[0]?.image || '',
      ogUrl: `${baseUrl}/city/${city.toLowerCase()}`,
      ogType: 'website',
      twitterCard: 'summary_large_image',
      twitterTitle: title,
      twitterDescription: description,
      twitterImage: attractions[0]?.image || ''
    }
  }

  // Apply meta tags to document head
  static applyMetaTags(metaData: any) {
    // Update title
    document.title = metaData.title

    // Update or create meta tags
    const metaTags = [
      { name: 'description', content: metaData.description },
      { name: 'keywords', content: metaData.keywords },
      { property: 'og:title', content: metaData.ogTitle },
      { property: 'og:description', content: metaData.ogDescription },
      { property: 'og:image', content: metaData.ogImage },
      { property: 'og:url', content: metaData.ogUrl },
      { property: 'og:type', content: metaData.ogType },
      { name: 'twitter:card', content: metaData.twitterCard },
      { name: 'twitter:title', content: metaData.twitterTitle },
      { name: 'twitter:description', content: metaData.twitterDescription },
      { name: 'twitter:image', content: metaData.twitterImage }
    ]

    metaTags.forEach(tag => {
      let element = document.querySelector(`meta[name="${tag.name}"], meta[property="${tag.property}"]`)
      if (!element) {
        element = document.createElement('meta')
        if (tag.name) element.setAttribute('name', tag.name)
        if (tag.property) element.setAttribute('property', tag.property)
        document.head.appendChild(element)
      }
      element.setAttribute('content', tag.content)
    })

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', metaData.canonical)
  }

  // Add structured data to document head
  static addStructuredData(structuredData: string) {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]')
    if (existingScript) {
      existingScript.remove()
    }

    // Add new structured data
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = structuredData
    document.head.appendChild(script)
  }

  // Generate sitemap data for all attractions
  static generateSitemapData(attractions: Attraction[], cities: string[]) {
    const baseUrl = window.location.origin
    const urls: Array<{loc: string, lastmod: string, changefreq: string, priority: string}> = []

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

    return urls
  }

  // Generate robots.txt content
  static generateRobotsTxt() {
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

  // Optimize search query for location-based results
  static optimizeLocationQuery(query: string, city: string): string {
    // Add location context to search queries
    const locationKeywords = [
      `в ${city}`,
      `${city} достопримечательности`,
      `${city} экскурсии`,
      `${city} развлечения`,
      `${city} туризм`
    ]

    // If query doesn't contain city name, add it
    if (!query.toLowerCase().includes(city.toLowerCase())) {
      return `${query} ${locationKeywords[0]}`
    }

    return query
  }

  // Generate breadcrumb structured data
  static generateBreadcrumbStructuredData(breadcrumbs: Array<{name: string, url: string}>) {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": crumb.url
      }))
    }

    return JSON.stringify(structuredData)
  }
}
