import { useEffect, useMemo, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, X, Clock, ArrowRight, CornerDownLeft, Sparkles, Trash2, Command } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { mediaApi } from '@/services/api'
import { useUiStore, useRecentStore } from '@/store'
import { Input, Badge } from '@/components/ui'
import { typeLabel, MEDIA_TYPES, cn } from '@/utils/cn'
import { haptics } from '@/utils/audioHaptics'

export default function GlobalSearch() {
  const { searchOpen, setSearchOpen } = useUiStore()
  const { recent, clearRecent } = useRecentStore()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [groups, setGroups] = useState({})
  const [total, setTotal] = useState(0)
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
        haptics.playClick()
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen, setSearchOpen])

  // Debounced search query
  useEffect(() => {
    if (!searchOpen) return
    const term = q.trim()
    if (term.length < 2) {
      setGroups({})
      setTotal(0)
      setSelectedIndex(0)
      return
    }
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const { data } = await mediaApi.search(term)
        setGroups(data.groups || {})
        setTotal(data.total || 0)
        setSelectedIndex(0)
      } finally {
        setLoading(false)
      }
    }, 200)
    return () => clearTimeout(t)
  }, [q, searchOpen])

  // Flattened active items for keyboard arrow navigation
  const flatItems = useMemo(() => {
    if (q.trim().length < 2) {
      return recent.slice(0, 8)
    }
    const list = []
    const typesToInspect = typeFilter === 'ALL' ? Object.keys(groups) : [typeFilter]
    for (const t of typesToInspect) {
      if (groups[t]) {
        for (const it of groups[t]) {
          list.push(it)
        }
      }
    }
    return list
  }, [q, groups, typeFilter, recent])

  function go(item) {
    if (!item?.id) return
    haptics.playSuccess()
    setSearchOpen(false)
    setQ('')
    navigate(`/media/${item.id}`)
  }

  // Handle keyboard navigation (ArrowUp, ArrowDown, Enter)
  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (flatItems.length === 0) return
      setSelectedIndex((prev) => {
        const next = (prev + 1) % flatItems.length
        haptics.playClick()
        return next
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (flatItems.length === 0) return
      setSelectedIndex((prev) => {
        const next = (prev - 1 + flatItems.length) % flatItems.length
        haptics.playClick()
        return next
      })
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (flatItems.length > 0 && flatItems[selectedIndex]) {
        go(flatItems[selectedIndex])
      }
    }
  }

  const visibleTypes = useMemo(() => {
    const keys = Object.keys(groups)
    if (typeFilter === 'ALL') return keys
    return keys.filter((k) => k === typeFilter)
  }, [groups, typeFilter])

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center bg-black/75 p-4 pt-[8vh] sm:pt-[12vh] backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSearchOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-teal-500/25 bg-[#0b1220]/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_35px_rgba(20,184,166,0.15)] backdrop-blur-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5 bg-white/[0.02]">
              <Search className="h-5 w-5 text-teal-400 shrink-0 animate-pulse" />
              <Input
                ref={inputRef}
                autoFocus
                className="border-0 bg-transparent text-base text-white placeholder-slate-400 focus:ring-0 h-10 px-0 shadow-none"
                placeholder="Search across movies, anime, games, books, music..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ('')}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 border border-white/15 rounded-lg px-2 py-1 bg-white/5 font-mono">
                ESC
              </kbd>
            </div>

            {/* Category Filter Chips */}
            <div className="flex gap-1.5 overflow-x-auto px-4 py-2.5 scrollbar-thin border-b border-white/5 bg-black/20">
              <FilterChip
                active={typeFilter === 'ALL'}
                onClick={() => {
                  setTypeFilter('ALL')
                  setSelectedIndex(0)
                  haptics.playClick()
                }}
              >
                All Mediums
              </FilterChip>
              {MEDIA_TYPES.map((t) => (
                <FilterChip
                  key={t.key}
                  active={typeFilter === t.key}
                  onClick={() => {
                    setTypeFilter(t.key)
                    setSelectedIndex(0)
                    haptics.playClick()
                  }}
                >
                  {t.label}
                </FilterChip>
              ))}
            </div>

            {/* Scrollable Results Area */}
            <div className="max-h-[50vh] overflow-y-auto p-3 scrollbar-thin space-y-2">
              {q.trim().length < 2 && (
                <div className="px-2 py-1">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <Clock className="h-3.5 w-3.5 text-teal-400" /> Recent History
                    </p>
                    {recent.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          clearRecent()
                          haptics.playClick()
                        }}
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition"
                      >
                        <Trash2 className="h-3 w-3" /> Clear
                      </button>
                    )}
                  </div>
                  {recent.length ? (
                    <div className="space-y-1">
                      {recent.slice(0, 8).map((item, idx) => (
                        <ResultRow
                          key={item.id}
                          item={item}
                          isSelected={idx === selectedIndex}
                          onClick={() => go(item)}
                          onHover={() => setSelectedIndex(idx)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 px-4 text-slate-400">
                      <Command className="w-8 h-8 mx-auto text-teal-400/50 mb-2" />
                      <p className="text-sm font-medium text-slate-300">Quickly jump anywhere</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Type a title, actor, author, or franchise name to explore.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {q.trim().length >= 2 && loading && (
                <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
                  <div className="w-5 h-5 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
                  <span className="text-sm font-medium">Scanning multiverse...</span>
                </div>
              )}

              {q.trim().length >= 2 && !loading && total === 0 && (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-sm font-medium text-slate-300">No results found for "{q}"</p>
                  <p className="text-xs text-slate-500 mt-1">Try searching by genre, title, or another keyword.</p>
                </div>
              )}

              {q.trim().length >= 2 &&
                !loading &&
                visibleTypes.map((type) => {
                  const typeList = groups[type] || []
                  if (!typeList.length) return null
                  return (
                    <div key={type} className="mb-3">
                      <div className="mb-1 flex items-center justify-between px-2">
                        <span className="text-xs font-semibold text-teal-400 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3" />
                          {typeLabel(type)} ({typeList.length})
                        </span>
                        <Link
                          to={`/browse/${type}?q=${encodeURIComponent(q)}`}
                          onClick={() => setSearchOpen(false)}
                          className="text-[11px] text-slate-400 hover:text-teal-300 flex items-center gap-1"
                        >
                          View all <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                      <div className="space-y-1">
                        {typeList.map((item) => {
                          const itemIndex = flatItems.findIndex((it) => it.id === item.id)
                          const isSelected = itemIndex === selectedIndex
                          return (
                            <ResultRow
                              key={item.id}
                              item={item}
                              isSelected={isSelected}
                              onClick={() => go(item)}
                              onHover={() => setSelectedIndex(itemIndex)}
                            />
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
            </div>

            {/* Command Palette Keyboard Hints Footer */}
            <div className="border-t border-white/10 px-4 py-2.5 bg-black/40 flex items-center justify-between text-[11px] text-slate-400 select-none">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-300">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-300">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-300">ESC</kbd>
                  Close
                </span>
              </div>
              <span className="text-teal-400/80 font-medium">OmniVerse Spotlight</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function FilterChip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-all duration-150',
        active
          ? 'border-teal-400 bg-teal-500/20 text-teal-300 shadow-[0_0_12px_rgba(20,184,166,0.3)]'
          : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
      )}
    >
      {children}
    </button>
  )
}

function ResultRow({ item, isSelected, onClick, onHover }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-all duration-150 group',
        isSelected
          ? 'bg-teal-500/15 border border-teal-500/40 shadow-[0_0_15px_rgba(20,184,166,0.15)] text-white'
          : 'hover:bg-white/5 text-slate-300 border border-transparent'
      )}
    >
      <img
        src={item.coverImageUrl}
        alt=""
        className="h-12 w-9 rounded-lg object-cover bg-slate-800 shrink-0 shadow"
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.currentTarget.onerror = null
          e.currentTarget.src = `https://placehold.co/100x150/0f172a/14b8a6?text=${encodeURIComponent(item.title.slice(0, 10))}`
        }}
      />
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm font-semibold transition', isSelected ? 'text-teal-300' : 'text-slate-100')}>
          {item.title}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {typeLabel(item.type)} · {item.releaseYear || 'N/A'}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Badge className={cn('text-xs font-semibold py-0.5 px-2', isSelected ? 'bg-teal-500/30 text-teal-200' : '')}>
          ★ {item.averageRating?.toFixed?.(1) ?? item.averageRating}
        </Badge>
        {isSelected && (
          <CornerDownLeft className="w-3.5 h-3.5 text-teal-400 animate-in fade-in zoom-in" />
        )}
      </div>
    </button>
  )
}
