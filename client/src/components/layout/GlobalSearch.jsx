import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, X, Clock } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { mediaApi } from '@/services/api'
import { useUiStore, useRecentStore } from '@/store'
import { Input, Badge } from '@/components/ui'
import { typeLabel, MEDIA_TYPES, cn } from '@/utils/cn'

export default function GlobalSearch() {
  const { searchOpen, setSearchOpen } = useUiStore()
  const recent = useRecentStore((s) => s.recent)
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [groups, setGroups] = useState({})
  const [total, setTotal] = useState(0)
  const [typeFilter, setTypeFilter] = useState('ALL')

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSearchOpen])

  useEffect(() => {
    if (!searchOpen) return
    const term = q.trim()
    if (term.length < 2) {
      setGroups({})
      setTotal(0)
      return
    }
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const { data } = await mediaApi.search(term)
        setGroups(data.groups || {})
        setTotal(data.total || 0)
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => clearTimeout(t)
  }, [q, searchOpen])

  const visibleTypes = useMemo(() => {
    const keys = Object.keys(groups)
    if (typeFilter === 'ALL') return keys
    return keys.filter((k) => k === typeFilter)
  }, [groups, typeFilter])

  function go(item) {
    setSearchOpen(false)
    setQ('')
    navigate(`/media/${item.id}`)
  }

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 p-4 pt-[10vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSearchOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-[var(--border)] bg-[#0b1220] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
              <Search className="h-5 w-5 text-teal-400" />
              <Input
                autoFocus
                className="border-0 bg-transparent focus:ring-0 h-10 px-0"
                placeholder="Search movies, games, manga, music…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <kbd className="hidden sm:inline text-[10px] text-[var(--text-muted)] border border-[var(--border)] rounded px-1.5 py-0.5">
                Esc
              </kbd>
              <button type="button" onClick={() => setSearchOpen(false)} className="text-[var(--text-muted)]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-thin">
              <FilterChip active={typeFilter === 'ALL'} onClick={() => setTypeFilter('ALL')}>
                All
              </FilterChip>
              {MEDIA_TYPES.map((t) => (
                <FilterChip
                  key={t.key}
                  active={typeFilter === t.key}
                  onClick={() => setTypeFilter(t.key)}
                >
                  {t.label}
                </FilterChip>
              ))}
            </div>

            <div className="max-h-[55vh] overflow-y-auto px-2 pb-4 scrollbar-thin">
              {q.trim().length < 2 && (
                <div className="px-3 py-2">
                  <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-[var(--text-muted)]">
                    <Clock className="h-3.5 w-3.5" /> Continue exploring
                  </p>
                  {recent.length ? (
                    <div className="space-y-1">
                      {recent.slice(0, 8).map((item) => (
                        <ResultRow key={item.id} item={item} onClick={() => go(item)} />
                      ))}
                    </div>
                  ) : (
                    <p className="px-2 py-6 text-sm text-[var(--text-muted)]">
                      Start typing to search the OmniVerse catalog.
                    </p>
                  )}
                </div>
              )}

              {q.trim().length >= 2 && loading && (
                <p className="px-4 py-8 text-sm text-[var(--text-muted)]">Searching…</p>
              )}

              {q.trim().length >= 2 && !loading && total === 0 && (
                <p className="px-4 py-8 text-sm text-[var(--text-muted)]">No matches for “{q}”.</p>
              )}

              {q.trim().length >= 2 &&
                !loading &&
                visibleTypes.map((type) => (
                  <div key={type} className="mb-3 px-2">
                    <div className="mb-1 flex items-center justify-between px-2">
                      <p className="text-xs font-medium text-teal-300">{typeLabel(type)}</p>
                      <Link
                        to={`/browse/${type}?q=${encodeURIComponent(q)}`}
                        onClick={() => setSearchOpen(false)}
                        className="text-[11px] text-[var(--text-muted)] hover:text-teal-300"
                      >
                        View all
                      </Link>
                    </div>
                    <div className="space-y-1">
                      {(groups[type] || []).map((item) => (
                        <ResultRow key={item.id} item={item} onClick={() => go(item)} />
                      ))}
                    </div>
                  </div>
                ))}
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
        'shrink-0 rounded-full px-3 py-1 text-xs border transition',
        active
          ? 'border-teal-400/50 bg-teal-500/15 text-teal-300'
          : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
      )}
    >
      {children}
    </button>
  )
}

function ResultRow({ item, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-white/5"
    >
      <img
        src={item.coverImageUrl}
        alt=""
        className="h-12 w-9 rounded-md object-cover bg-slate-800"
        referrerPolicy="no-referrer"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.title}</p>
        <p className="text-[11px] text-[var(--text-muted)]">
          {typeLabel(item.type)} · {item.releaseYear}
        </p>
      </div>
      <Badge className="shrink-0">{item.averageRating}</Badge>
    </button>
  )
}
