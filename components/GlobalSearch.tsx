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
  onClose?: () => void
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  group: { bg: '#dbeafe', text: '#1d4ed8' },
  business: { bg: '#dcfce7', text: '#15803d' },
  location: { bg: '#f3e8ff', text: '#7c3aed' },
  category: { bg: '#ffedd5', text: '#c2410c' },
  news: { bg: '#f3f4f6', text: '#374151' },
  event: { bg: '#fce7f3', text: '#be185d' },
  charity: { bg: '#fee2e2', text: '#dc2626' },
  kallah: { bg: '#ffe4e6', text: '#be123c' },
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
  onClose
}: GlobalSearchProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [suggestions, setSuggestions] = useState<{ text: string; type: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Автофокус
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

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
    const totalItems = results.length
    
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
        onClose?.()
        break
    }
  }

  // Клик по результату
  const handleResultClick = (result: SearchResult) => {
    saveRecentSearch(query)
    onClose?.()
    
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
      onClose?.()
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

  const getTypeColor = (type: string) => TYPE_COLORS[type] || { bg: '#f3f4f6', text: '#374151' }

  return (
    <div ref={dropdownRef}>
      {/* Input */}
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute',
          left: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '18px',
          opacity: 0.5
        }}>🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '14px 44px',
            fontSize: '16px',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              inputRef.current?.focus()
            }}
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#9ca3af',
            }}
          >
            {isLoading ? '⏳' : '✕'}
          </button>
        )}
      </div>

      {/* Results Container */}
      <div style={{ marginTop: '12px', maxHeight: '400px', overflowY: 'auto' }}>
        
        {/* Suggestions */}
        {suggestions.length > 0 && query.length >= 2 && (
          <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: 500 }}>
              Suggestions
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuery(s.text)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '13px',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    color: '#374151',
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#f3f4f6'}
                >
                  {s.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div>
            {results.map((result, idx) => {
              const colors = getTypeColor(result.type)
              return (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: selectedIndex === idx ? '#eff6ff' : 'transparent',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                  onMouseOut={(e) => e.currentTarget.style.background = selectedIndex === idx ? '#eff6ff' : 'transparent'}
                >
                  {/* Icon */}
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    background: colors.bg,
                    flexShrink: 0,
                  }}>
                    {result.icon || '📌'}
                  </div>
                  
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ 
                      margin: 0, 
                      fontWeight: 500, 
                      color: '#111827',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {result.title}
                    </p>
                    {result.subtitle && (
                      <p style={{ 
                        margin: '2px 0 0', 
                        fontSize: '13px', 
                        color: '#6b7280',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {result.subtitle}
                      </p>
                    )}
                  </div>
                  
                  {/* Type Badge */}
                  <span style={{
                    padding: '4px 10px',
                    fontSize: '12px',
                    fontWeight: 500,
                    borderRadius: '20px',
                    background: colors.bg,
                    color: colors.text,
                    flexShrink: 0,
                  }}>
                    {TYPE_LABELS[result.type] || result.type}
                  </span>
                </button>
              )
            })}
            
            {/* View All */}
            <button
              onClick={goToSearchPage}
              style={{
                width: '100%',
                padding: '14px',
                marginTop: '8px',
                background: '#eff6ff',
                border: 'none',
                borderRadius: '10px',
                color: '#2563eb',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#dbeafe'}
              onMouseOut={(e) => e.currentTarget.style.background = '#eff6ff'}
            >
              View all results for "{query}" →
            </button>
          </div>
        )}

        {/* No Results */}
        {query.length >= 2 && !isLoading && results.length === 0 && (
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <p style={{ fontSize: '40px', marginBottom: '8px' }}>🔍</p>
            <p style={{ color: '#6b7280', margin: 0 }}>No results for "{query}"</p>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>Try different keywords</p>
          </div>
        )}

        {/* Recent Searches */}
        {query.length < 2 && recentSearches.length > 0 && (
          <div>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: 500 }}>
              Recent Searches
            </p>
            {recentSearches.map((search, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(search)
                  inputRef.current?.focus()
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ color: '#9ca3af' }}>🕐</span>
                <span style={{ color: '#374151' }}>{search}</span>
              </button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {query.length < 2 && recentSearches.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
            Search for groups, businesses, events, and more
          </div>
        )}
      </div>
    </div>
  )
}
