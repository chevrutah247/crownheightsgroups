'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  type: string
  id: string
  title: string
  subtitle?: string
  icon?: string
  url: string
}

interface GlobalSearchProps {
  placeholder?: string
  className?: string
}

const TYPE_COLORS: Record<string, string> = {
  group: 'bg-blue-100 text-blue-700',
  business: 'bg-green-100 text-green-700',
  location: 'bg-purple-100 text-purple-700',
  category: 'bg-orange-100 text-orange-700',
  news: 'bg-gray-100 text-gray-700',
  event: 'bg-pink-100 text-pink-700',
  charity: 'bg-red-100 text-red-700',
  kallah: 'bg-rose-100 text-rose-700',
}

const TYPE_LABELS: Record<string, string> = {
  group: 'Group',
  business: 'Business',
  location: 'Location',
  category: 'Category',
  news: 'News',
  event: 'Event',
  charity: 'Charity',
  kallah: 'Kallah',
}

export default function GlobalSearch({ 
  placeholder = 'Search groups, businesses, events...', 
  className = '' 
}: GlobalSearchProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [suggestions, setSuggestions] = useState<{ text: string; type: string }[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Загрузка недавних поисков
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recentSearches')
      if (saved) setRecentSearches(JSON.parse(saved))
    } catch {}
  }, [])

  // Debounced поиск
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`)
        const data = await res.json()
        setResults(data.results || [])
        setSuggestions(data.suggestions || [])
      } catch {
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Клавиатурная навигация
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = results.length + (query.length < 2 ? recentSearches.length : 0)
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : totalItems - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultClick(results[selectedIndex])
        } else if (query.length >= 2) {
          goToSearchPage()
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  // Клик по результату
  const handleResultClick = (result: SearchResult) => {
    saveRecentSearch(query)
    setIsOpen(false)
    setQuery('')
    
    // Если это внешняя ссылка (WhatsApp группа)
    if (result.url.startsWith('http')) {
      window.open(result.url, '_blank')
    } else {
      router.push(result.url)
    }
  }

  // Переход на страницу поиска
  const goToSearchPage = () => {
    if (query.length >= 2) {
      saveRecentSearch(query)
      setIsOpen(false)
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  // Сохранение недавнего поиска
  const saveRecentSearch = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
    setRecentSearches(updated)
    try {
      localStorage.setItem('recentSearches', JSON.stringify(updated))
    } catch {}
  }

  // Закрытие при клике вне
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     bg-white text-gray-900 placeholder-gray-500"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {isLoading ? '⏳' : '✕'}
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 
                        max-h-[70vh] overflow-y-auto">
          
          {/* Suggestions */}
          {suggestions.length > 0 && query.length >= 2 && (
            <div className="p-2 border-b">
              <p className="text-xs text-gray-500 px-2 mb-1">Suggestions</p>
              <div className="flex flex-wrap gap-1">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(s.text)}
                    className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                  >
                    {s.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="p-2">
              {results.map((result, idx) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors
                    ${selectedIndex === idx ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                    ${TYPE_COLORS[result.type] || 'bg-gray-100'}`}>
                    <span className="text-lg">{result.icon || '📌'}</span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{result.title}</p>
                    {result.subtitle && (
                      <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                    )}
                  </div>
                  
                  {/* Type Badge */}
                  <span className={`flex-shrink-0 px-2 py-1 text-xs rounded-full ${TYPE_COLORS[result.type] || 'bg-gray-100'}`}>
                    {TYPE_LABELS[result.type] || result.type}
                  </span>
                </button>
              ))}
              
              {/* View All */}
              <button
                onClick={goToSearchPage}
                className="w-full mt-2 p-3 text-center text-blue-600 hover:bg-blue-50 
                           rounded-lg font-medium"
              >
                View all results for "{query}" →
              </button>
            </div>
          )}

          {/* No Results */}
          {query.length >= 2 && !isLoading && results.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <p className="text-4xl mb-2">🔍</p>
              <p>No results for "{query}"</p>
              <p className="text-sm mt-1">Try different keywords</p>
            </div>
          )}

          {/* Recent Searches */}
          {query.length < 2 && recentSearches.length > 0 && (
            <div className="p-2">
              <p className="text-xs text-gray-500 px-2 mb-2">Recent Searches</p>
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(search)
                    inputRef.current?.focus()
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg text-left
                    ${selectedIndex === idx ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <span className="text-gray-400">🕐</span>
                  <span className="text-gray-700">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Empty State */}
          {query.length < 2 && recentSearches.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              Search for groups, businesses, events, and more
            </div>
          )}
        </div>
      )}
    </div>
  )
}
