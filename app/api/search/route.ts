// app/api/search/route.ts
// Глобальный поиск по всему контенту

import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

function getRedis() {
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (url && token) {
    return new Redis({ url, token })
  }
  return null
}

interface SearchResult {
  type: string
  id: string
  title: string
  subtitle?: string
  icon?: string
  url: string
  score: number
}

// Категории групп
const CATEGORIES = [
  { id: 'torah', name: 'Torah Study', icon: '📖' },
  { id: 'prayer', name: 'Prayer / Minyan', icon: '🙏' },
  { id: 'women', name: "Women's Groups", icon: '👩' },
  { id: 'youth', name: 'Youth / Teens', icon: '👦' },
  { id: 'singles', name: 'Singles', icon: '💑' },
  { id: 'families', name: 'Families', icon: '👨‍👩‍👧‍👦' },
  { id: 'seniors', name: 'Seniors', icon: '👴' },
  { id: 'health', name: 'Health & Wellness', icon: '💪' },
  { id: 'mental', name: 'Mental Health', icon: '🧠' },
  { id: 'support', name: 'Support Groups', icon: '🤝' },
  { id: 'chesed', name: 'Chesed / Charity', icon: '❤️' },
  { id: 'bikur', name: 'Bikur Cholim', icon: '🏥' },
  { id: 'hachnasas', name: 'Hachnasas Orchim', icon: '🏠' },
  { id: 'kallah', name: 'Hachnasat Kallah', icon: '👰' },
  { id: 'shidduch', name: 'Shidduchim', icon: '💒' },
  { id: 'parenting', name: 'Parenting', icon: '👶' },
  { id: 'education', name: 'Education', icon: '🎓' },
  { id: 'business', name: 'Business / Networking', icon: '💼' },
  { id: 'jobs', name: 'Jobs / Career', icon: '📋' },
  { id: 'housing', name: 'Housing', icon: '🏡' },
  { id: 'marketplace', name: 'Buy/Sell', icon: '🛒' },
  { id: 'lost', name: 'Lost & Found', icon: '🔍' },
  { id: 'community', name: 'Community News', icon: '📰' },
  { id: 'other', name: 'Other', icon: '📌' },
]

// Локации
const LOCATIONS = [
  { id: 'crown-heights', name: 'Crown Heights', region: 'Brooklyn, NY' },
  { id: 'brooklyn', name: 'Brooklyn', region: 'New York' },
  { id: 'flatbush', name: 'Flatbush', region: 'Brooklyn, NY' },
  { id: 'williamsburg', name: 'Williamsburg', region: 'Brooklyn, NY' },
  { id: 'boro-park', name: 'Boro Park', region: 'Brooklyn, NY' },
  { id: 'manhattan', name: 'Manhattan', region: 'New York' },
  { id: 'queens', name: 'Queens', region: 'New York' },
  { id: 'monsey', name: 'Monsey', region: 'New York' },
  { id: 'lakewood', name: 'Lakewood', region: 'New Jersey' },
  { id: 'israel', name: 'Israel', region: 'International' },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.toLowerCase().trim() || ''
  const type = searchParams.get('type') || 'all'
  const limit = parseInt(searchParams.get('limit') || '10')
  const suggestionsOnly = searchParams.get('suggestions') === 'true'

  if (!query || query.length < 2) {
    return NextResponse.json({ 
      results: [], 
      suggestions: [],
      message: 'Query must be at least 2 characters' 
    })
  }

  const redis = getRedis()
  if (!redis) {
    return NextResponse.json({ error: 'Database not available' }, { status: 500 })
  }

  try {
    const results: SearchResult[] = []
    const suggestions: { text: string; type: string; count?: number }[] = []

    // ==========================================
    // Поиск по категориям
    // ==========================================
    if (type === 'all' || type === 'categories') {
      const matchingCategories = CATEGORIES.filter(cat =>
        cat.name.toLowerCase().includes(query) ||
        cat.id.toLowerCase().includes(query)
      )
      
      // Получаем группы для подсчёта
      const groupsData = await redis.get('groups')
      const groups = groupsData 
        ? (typeof groupsData === 'string' ? JSON.parse(groupsData) : groupsData)
        : []
      
      for (const cat of matchingCategories) {
        const count = Array.isArray(groups) 
          ? groups.filter((g: any) => g.category === cat.id).length 
          : 0
        results.push({
          type: 'category',
          id: cat.id,
          title: cat.name,
          subtitle: `${count} groups`,
          icon: cat.icon,
          url: `/groups?category=${cat.id}`,
          score: calculateScore(cat.name, query, 1.5),
        })
        suggestions.push({ text: cat.name, type: 'category', count })
      }
    }

    // ==========================================
    // Поиск по локациям
    // ==========================================
    if (type === 'all' || type === 'locations') {
      const matchingLocations = LOCATIONS.filter(loc =>
        loc.name.toLowerCase().includes(query) ||
        loc.region.toLowerCase().includes(query)
      )
      
      for (const loc of matchingLocations) {
        results.push({
          type: 'location',
          id: loc.id,
          title: loc.name,
          subtitle: loc.region,
          icon: '📍',
          url: `/groups?location=${loc.id}`,
          score: calculateScore(loc.name, query, 1.3),
        })
        suggestions.push({ text: `${loc.name}, ${loc.region}`, type: 'location' })
      }
    }

    // ==========================================
    // Поиск по группам
    // ==========================================
    if (type === 'all' || type === 'groups') {
      const groupsData = await redis.get('groups')
      const groups = groupsData 
        ? (typeof groupsData === 'string' ? JSON.parse(groupsData) : groupsData)
        : []
      
      if (Array.isArray(groups)) {
        for (const group of groups) {
          const name = (group.name || '').toLowerCase()
          const description = (group.description || '').toLowerCase()
          
          if (name.includes(query) || description.includes(query)) {
            const categoryInfo = CATEGORIES.find(c => c.id === group.category)
            results.push({
              type: 'group',
              id: group.id || group.name,
              title: group.name,
              subtitle: categoryInfo?.name || group.category || 'Group',
              icon: categoryInfo?.icon || '👥',
              url: group.link || `/groups?search=${encodeURIComponent(group.name)}`,
              score: calculateScore(group.name, query, name.startsWith(query) ? 2 : 1),
            })
          }
        }
      }
    }

    // ==========================================
    // Поиск по бизнесам
    // ==========================================
    if (type === 'all' || type === 'businesses') {
      const bizData = await redis.get('businesses')
      const businesses = bizData 
        ? (typeof bizData === 'string' ? JSON.parse(bizData) : bizData)
        : []
      
      if (Array.isArray(businesses)) {
        for (const biz of businesses) {
          const name = (biz.name || '').toLowerCase()
          const description = (biz.description || '').toLowerCase()
          const city = (biz.city || '').toLowerCase()
          
          if (name.includes(query) || description.includes(query) || city.includes(query)) {
            results.push({
              type: 'business',
              id: biz.id || biz.name,
              title: biz.name,
              subtitle: biz.city ? `${biz.city}${biz.country ? ', ' + biz.country : ''}` : biz.category,
              icon: '🏪',
              url: `/business?search=${encodeURIComponent(biz.name)}`,
              score: calculateScore(biz.name, query, name.startsWith(query) ? 2 : 1),
            })
          }
        }
      }
    }

    // ==========================================
    // Поиск по новостям
    // ==========================================
    if (type === 'all' || type === 'news') {
      const newsData = await redis.get('news')
      const news = newsData 
        ? (typeof newsData === 'string' ? JSON.parse(newsData) : newsData)
        : []
      
      if (Array.isArray(news)) {
        for (const item of news) {
          const title = (item.title || '').toLowerCase()
          const content = (item.content || '').toLowerCase()
          
          if (title.includes(query) || content.includes(query)) {
            results.push({
              type: 'news',
              id: item.id || item.title,
              title: item.title,
              subtitle: formatDate(item.createdAt || item.date),
              icon: '📰',
              url: `/news`,
              score: calculateScore(item.title, query, 1),
            })
          }
        }
      }
    }

    // ==========================================
    // Поиск по событиям
    // ==========================================
    if (type === 'all' || type === 'events') {
      const eventsData = await redis.get('events')
      const events = eventsData 
        ? (typeof eventsData === 'string' ? JSON.parse(eventsData) : eventsData)
        : []
      
      if (Array.isArray(events)) {
        for (const event of events) {
          const title = (event.title || event.name || '').toLowerCase()
          const description = (event.description || '').toLowerCase()
          
          if (title.includes(query) || description.includes(query)) {
            results.push({
              type: 'event',
              id: event.id || event.title,
              title: event.title || event.name,
              subtitle: formatDate(event.date),
              icon: '📅',
              url: `/events`,
              score: calculateScore(event.title || event.name, query, 1.2),
            })
          }
        }
      }
    }

    // ==========================================
    // Поиск по благотворительности
    // ==========================================
    if (type === 'all' || type === 'charity') {
      const charityData = await redis.get('charities')
      const charities = charityData 
        ? (typeof charityData === 'string' ? JSON.parse(charityData) : charityData)
        : []
      
      if (Array.isArray(charities)) {
        for (const charity of charities) {
          const name = (charity.name || '').toLowerCase()
          const description = (charity.description || '').toLowerCase()
          
          if (name.includes(query) || description.includes(query)) {
            results.push({
              type: 'charity',
              id: charity.id || charity.name,
              title: charity.name,
              subtitle: 'Charity',
              icon: '❤️',
              url: `/charity`,
              score: calculateScore(charity.name, query, 1),
            })
          }
        }
      }
    }

    // ==========================================
    // Поиск по Kallah сервисам
    // ==========================================
    if (type === 'all' || type === 'kallah') {
      // Пробуем разные ключи, которые могут использоваться
      let kallahServices: any[] = []
      
      const kallahData = await redis.get('kallah:services') || await redis.get('kallahServices')
      if (kallahData) {
        kallahServices = typeof kallahData === 'string' ? JSON.parse(kallahData) : kallahData
      }
      
      if (Array.isArray(kallahServices)) {
        for (const service of kallahServices) {
          const name = (service.name || '').toLowerCase()
          const description = (service.description || '').toLowerCase()
          
          if (name.includes(query) || description.includes(query)) {
            results.push({
              type: 'kallah',
              id: service.id || service.name,
              title: service.name,
              subtitle: service.category || 'Kallah Service',
              icon: '👰',
              url: `/kallah`,
              score: calculateScore(service.name, query, 1),
            })
          }
        }
      }
    }

    // Сортируем по релевантности
    results.sort((a, b) => b.score - a.score)

    // Если нужны только подсказки
    if (suggestionsOnly) {
      const uniqueSuggestions = Array.from(
        new Map(suggestions.map(s => [s.text, s])).values()
      ).sort((a, b) => (b.count || 0) - (a.count || 0))
      
      return NextResponse.json({ suggestions: uniqueSuggestions.slice(0, 8) })
    }

    return NextResponse.json({
      results: results.slice(0, limit),
      total: results.length,
      suggestions: suggestions.slice(0, 5),
      query,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

function calculateScore(text: string, query: string, multiplier: number = 1): number {
  if (!text) return 0
  
  const textLower = text.toLowerCase()
  const queryLower = query.toLowerCase()
  
  let score = 0
  
  if (textLower === queryLower) {
    score = 150
  } else if (textLower.startsWith(queryLower)) {
    score = 100
  } else if (textLower.split(' ').some(word => word === queryLower)) {
    score = 80
  } else if (textLower.split(' ').some(word => word.startsWith(queryLower))) {
    score = 60
  } else if (textLower.includes(queryLower)) {
    score = 40
  }
  
  score += Math.max(0, 20 - text.length)
  
  return score * multiplier
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}
