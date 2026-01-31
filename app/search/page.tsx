'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import GlobalSearch from '@/components/GlobalSearch'

interface SearchResult {
  type: string
  id: string
  title: string
  subtitle?: string
  icon?: string
  url: string
}

const TYPE_CONFIG: Record<string, { color: string; label: string }> = {
  group: { color: 'bg-blue-100 text-blue-700', label: 'Groups' },
  business: { color: 'bg-green-100 text-green-700', label: 'Businesses' },
  location: { color: 'bg-purple-100 text-purple-700', label: 'Locations' },
  category: { color: 'bg-orange-100 text-orange-700', label: 'Categories' },
  news: { color: 'bg-gray-100 text-gray-700', label: 'News' },
  event: { color: 'bg-pink-100 text-pink-700', label: 'Events' },
  charity: { color: 'bg-red-100 text-red-700', label: 'Charities' },
  kallah: { color: 'bg-rose-100 text-rose-700', label: 'Kallah Services' },
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  const typeFilter = searchParams.get('type') || 'all'

  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState(typeFilter)

  // Подсчет по типам
  const typeCounts = results.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }

    const fetchResults = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${activeFilter}&limit=50`)
        const data = await res.json()
        setResults(data.results || [])
      } catch {
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [query, activeFilter])

  const filteredResults = activeFilter === 'all' 
    ? results 
    : results.filter(r => r.type === activeFilter)

  // Группировка по типам
  const groupedResults = filteredResults.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = []
    acc[result.type].push(result)
    return acc
  }, {} as Record<string, SearchResult[]>)

  const handleResultClick = (result: SearchResult) => {
    if (result.url.startsWith('http')) {
      window.open(result.url, '_blank')
    } else {
      router.push(result.url)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="text-gray-500 hover:text-gray-700 text-xl">
              ←
            </Link>
            <h1 className="text-xl font-semibold">Search</h1>
          </div>
          
          <GlobalSearch 
            className="max-w-2xl" 
            placeholder="Search groups, businesses, events..."
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {query && (
          <>
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors
                  ${activeFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border hover:bg-gray-50'}`}
              >
                All ({results.length})
              </button>
              
              {Object.entries(TYPE_CONFIG).map(([type, config]) => {
                const count = typeCounts[type] || 0
                if (count === 0) return null
                
                return (
                  <button
                    key={type}
                    onClick={() => setActiveFilter(type)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors
                      ${activeFilter === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border hover:bg-gray-50'}`}
                  >
                    {config.label} ({count})
                  </button>
                )
              })}
            </div>

            {/* Results */}
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-2">⏳</p>
                <p className="text-gray-500">Searching...</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-6xl mb-4">🔍</p>
                <h2 className="text-xl font-semibold mb-2">No results found</h2>
                <p className="text-gray-500">
                  We couldn't find anything for "{query}"
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                <p className="text-sm text-gray-500">
                  Found {filteredResults.length} results for "{query}"
                </p>

                {Object.entries(groupedResults).map(([type, items]) => (
                  <div key={type}>
                    {activeFilter === 'all' && (
                      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${TYPE_CONFIG[type]?.color || 'bg-gray-100'}`}>
                          {TYPE_CONFIG[type]?.label || type}
                        </span>
                        <span className="text-gray-400">({items.length})</span>
                      </h2>
                    )}
                    
                    <div className="grid gap-3">
                      {items.map((result) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleResultClick(result)}
                          className="block w-full bg-white p-4 rounded-xl border text-left
                                     hover:border-blue-300 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center 
                                            justify-center ${TYPE_CONFIG[result.type]?.color || 'bg-gray-100'}`}>
                              <span className="text-2xl">{result.icon || '📌'}</span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium">{result.title}</h3>
                              {result.subtitle && (
                                <p className="text-sm text-gray-500">{result.subtitle}</p>
                              )}
                            </div>
                            
                            <span className="text-gray-400">→</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!query && (
          <div className="text-center py-12">
            <p className="text-6xl mb-4">🔍</p>
            <h2 className="text-xl font-semibold mb-2">Search Crown Heights</h2>
            <p className="text-gray-500">
              Find WhatsApp groups, businesses, events, and more
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-4xl">⏳</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
