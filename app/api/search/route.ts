// app/api/search/route.ts
// Глобальный поиск - все данные из Redis

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.toLowerCase().trim() || ''
  const type = searchParams.get('type') || 'all'
  const limit = parseInt(searchParams.get('limit') || '10')

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

  const results: SearchResult[] = []
  const suggestions: { text: string; type: string; count?: number }[] = []

  try {
    // Загружаем все данные из Redis
    const [
      locationsData,
      groupCategoriesData,
      serviceCategoriesData,
      groupsData,
      servicesData,
      eventsData,
      campaignsData,
      newsData,
      businessesData
    ] = await Promise.all([
      redis.get('locations'),
      redis.get('group-categories'),
      redis.get('service-categories'),
      redis.get('groups'),
      redis.get('services'),
      redis.get('events'),
      redis.get('campaigns'),
      redis.get('news'),
      redis.get('businesses'),
    ])

    // Парсим данные
    const locations = parseData(locationsData)
    const groupCategories = parseData(groupCategoriesData)
    const serviceCategories = parseData(serviceCategoriesData)
    const groups = parseData(groupsData)
    const services = parseData(servicesData)
    const events = parseData(eventsData)
    const campaigns = parseData(campaignsData)
    const news = parseData(newsData)
    const businesses = parseData(businessesData)

    // ==========================================
    // 1. Поиск по ЛОКАЦИЯМ
    // ==========================================
    if (type === 'all' || type === 'locations') {
      for (const loc of locations) {
        const searchText = `${loc.neighborhood || ''} ${loc.city || ''} ${loc.state || ''} ${loc.country || ''}`.toLowerCase()
        
        if (searchText.includes(query)) {
          // Считаем группы в этой локации
          const groupsCount = groups.filter((g: any) => g.locationId === loc.id).length
          
          results.push({
            type: 'location',
            id: loc.id,
            title: loc.neighborhood || loc.city,
            subtitle: [loc.city, loc.state].filter(Boolean).join(', '),
            icon: '📍',
            url: `/groups?location=${loc.id}`,
            score: calculateScore(loc.neighborhood || loc.city, query, 1.5),
          })
          
          suggestions.push({ 
            text: `${loc.neighborhood || loc.city}, ${loc.state || ''}`.trim(), 
            type: 'location',
            count: groupsCount
          })
        }
      }
    }

    // ==========================================
    // 2. Поиск по КАТЕГОРИЯМ ГРУПП
    // ==========================================
    if (type === 'all' || type === 'categories') {
      for (const cat of groupCategories) {
        const searchText = `${cat.name || ''} ${cat.nameRu || ''}`.toLowerCase()
        
        if (searchText.includes(query)) {
          const groupsCount = groups.filter((g: any) => g.categoryId === cat.id).length
          
          results.push({
            type: 'category',
            id: cat.id,
            title: cat.name,
            subtitle: `${groupsCount} groups`,
            icon: cat.icon || '📁',
            url: `/groups?category=${cat.id}`,
            score: calculateScore(cat.name, query, 1.4),
          })
          
          suggestions.push({ 
            text: cat.name, 
            type: 'category',
            count: groupsCount
          })
        }
      }
    }

    // ==========================================
    // 3. Поиск по ГРУППАМ
    // ==========================================
    if (type === 'all' || type === 'groups') {
      for (const group of groups) {
        const title = (group.title || '').toLowerCase()
        const description = (group.description || '').toLowerCase()
        const tags = (group.tags || []).join(' ').toLowerCase()
        
        // Получаем данные о локации группы
        const location = locations.find((l: any) => l.id === group.locationId)
        const locationText = location 
          ? `${location.neighborhood || ''} ${location.city || ''} ${location.state || ''}`.toLowerCase()
          : ''
        
        // Получаем категорию
        const category = groupCategories.find((c: any) => c.id === group.categoryId)
        
        if (title.includes(query) || description.includes(query) || 
            tags.includes(query) || locationText.includes(query)) {
          
          results.push({
            type: 'group',
            id: group.id,
            title: group.title,
            subtitle: [location?.neighborhood, category?.name].filter(Boolean).join(' • '),
            icon: category?.icon || '👥',
            url: group.whatsappLinks?.[0] || group.whatsappLink || `/groups`,
            score: calculateScore(group.title, query, title.includes(query) ? 2 : 1),
          })
        }
      }
    }

    // ==========================================
    // 4. Поиск по СЕРВИСАМ
    // ==========================================
    if (type === 'all' || type === 'services') {
      // Категории сервисов
      for (const cat of serviceCategories) {
        const searchText = `${cat.name || ''} ${cat.nameRu || ''}`.toLowerCase()
        
        if (searchText.includes(query)) {
          results.push({
            type: 'service',
            id: `cat-${cat.id}`,
            title: cat.name,
            subtitle: 'Service Category',
            icon: cat.icon || '🔧',
            url: `/services?category=${cat.id}`,
            score: calculateScore(cat.name, query, 1.3),
          })
        }
      }
      
      // Контакты сервисов
      for (const service of services) {
        const name = (service.name || '').toLowerCase()
        const description = (service.description || '').toLowerCase()
        
        if (name.includes(query) || description.includes(query)) {
          const category = serviceCategories.find((c: any) => c.id === service.categoryId)
          
          results.push({
            type: 'service',
            id: service.id,
            title: service.name,
            subtitle: category?.name || 'Service',
            icon: category?.icon || '🔧',
            url: `/services`,
            score: calculateScore(service.name, query, 1.2),
          })
        }
      }
    }

    // ==========================================
    // 5. Поиск по СОБЫТИЯМ
    // ==========================================
    if (type === 'all' || type === 'events') {
      for (const event of events) {
        const title = (event.title || '').toLowerCase()
        const description = (event.description || '').toLowerCase()
        const location = (event.location || '').toLowerCase()
        
        if (title.includes(query) || description.includes(query) || location.includes(query)) {
          results.push({
            type: 'event',
            id: event.id,
            title: event.title,
            subtitle: event.date ? formatDate(event.date) : 'Event',
            icon: '📅',
            url: `/events`,
            score: calculateScore(event.title, query, 1.2),
          })
        }
      }
    }

    // ==========================================
    // 6. Поиск по КАМПАНИЯМ (Charity)
    // ==========================================
    if (type === 'all' || type === 'charity') {
      for (const campaign of campaigns) {
        const title = (campaign.title || '').toLowerCase()
        const description = (campaign.description || '').toLowerCase()
        
        if (title.includes(query) || description.includes(query)) {
          results.push({
            type: 'charity',
            id: campaign.id,
            title: campaign.title,
            subtitle: campaign.goal ? `Goal: $${campaign.goal}` : 'Campaign',
            icon: '💝',
            url: `/charity`,
            score: calculateScore(campaign.title, query, 1),
          })
        }
      }
    }

    // ==========================================
    // 7. Поиск по НОВОСТЯМ
    // ==========================================
    if (type === 'all' || type === 'news') {
      for (const item of news) {
        const title = (item.title || '').toLowerCase()
        const content = (item.content || '').toLowerCase()
        
        if (title.includes(query) || content.includes(query)) {
          results.push({
            type: 'news',
            id: item.id,
            title: item.title,
            subtitle: formatDate(item.createdAt || item.date),
            icon: '📰',
            url: `/news`,
            score: calculateScore(item.title, query, 1),
          })
        }
      }
    }

    // ==========================================
    // 8. Поиск по БИЗНЕСАМ
    // ==========================================
    if (type === 'all' || type === 'businesses') {
      for (const biz of businesses) {
        const name = (biz.name || '').toLowerCase()
        const description = (biz.description || '').toLowerCase()
        const city = (biz.city || '').toLowerCase()
        const state = (biz.state || '').toLowerCase()
        const country = (biz.country || '').toLowerCase()
        
        if (name.includes(query) || description.includes(query) || 
            city.includes(query) || state.includes(query) || country.includes(query)) {
          results.push({
            type: 'business',
            id: biz.id || biz.name,
            title: biz.name,
            subtitle: [biz.city, biz.state, biz.country].filter(Boolean).join(', ') || biz.category,
            icon: '🏪',
            url: `/business`,
            score: calculateScore(biz.name, query, name.includes(query) ? 1.5 : 1),
          })
        }
      }
    }

    // Сортируем по релевантности
    results.sort((a, b) => b.score - a.score)

    // Убираем дубликаты подсказок
    const uniqueSuggestions = Array.from(
      new Map(suggestions.map(s => [s.text.toLowerCase(), s])).values()
    ).sort((a, b) => (b.count || 0) - (a.count || 0))

    return NextResponse.json({
      results: results.slice(0, limit),
      total: results.length,
      suggestions: uniqueSuggestions.slice(0, 5),
      query,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

// Парсинг данных из Redis
function parseData(data: any): any[] {
  if (!data) return []
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// Расчет релевантности
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

// Форматирование даты
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
