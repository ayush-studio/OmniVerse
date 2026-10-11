import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Zap,
  Star,
  ArrowRight,
  Play,
  Heart,
  Check,
  Compass,
  Film,
  Tv,
  Gamepad2,
  BookOpen,
  BookMarked,
  Music,
  Layers,
} from 'lucide-react'
import { mediaApi } from '@/services/api'
import { useAuthStore } from '@/store'
import { usePlayerStore } from '@/store/playerStore'
import { Button, Badge, Skeleton } from '@/components/ui'
import { haptics } from '@/utils/audioHaptics'
import { typeLabel, cn } from '@/utils/cn'

const TYPE_ICONS = {
  MOVIE: Film,
  SERIES: Tv,
  GAME: Gamepad2,
  BOOK: BookOpen,
  MANGA: BookMarked,
  MUSIC_ALBUM: Music,
}

const TYPE_ACCENTS = {
  MOVIE: { border: 'border-rose-500/40', badge: 'bg-rose-500/20 text-rose-300', glow: 'shadow-rose-500/10' },
  SERIES: { border: 'border-sky-500/40', badge: 'bg-sky-500/20 text-sky-300', glow: 'shadow-sky-500/10' },
  GAME: { border: 'border-emerald-500/40', badge: 'bg-emerald-500/20 text-emerald-300', glow: 'shadow-emerald-500/10' },
  BOOK: { border: 'border-amber-500/40', badge: 'bg-amber-500/20 text-amber-300', glow: 'shadow-amber-500/10' },
  MANGA: { border: 'border-purple-500/40', badge: 'bg-purple-500/20 text-purple-300', glow: 'shadow-purple-500/10' },
  MUSIC_ALBUM: { border: 'border-teal-500/40', badge: 'bg-teal-500/20 text-teal-300', glow: 'shadow-teal-500/10' },
}

export default function TransmediaGalaxy({ mediaId, sourceItem }) {
  const user = useAuthStore((s) => s.user)
  const setTrack = usePlayerStore((s) => s.setTrack)

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTypeFilter, setActiveTypeFilter] = useState('ALL')
  const [savedIds, setSavedIds] = useState({})

  useEffect(() => {
    let alive = true
    async function loadGalaxy() {
      if (!mediaId) return
      setLoading(true)
      try {
        const res = await mediaApi.transmedia(mediaId)
        if (!alive) return
        setData(res.data)
      } catch (err) {
        console.error('Failed to load transmedia galaxy', err)
      } finally {
        if (alive) setLoading(false)
      }
    }
    loadGalaxy()
    return () => {
      alive = false
    }
  }, [mediaId])

  async function handleQuickSave(item) {
    if (!user) return
    haptics.playFavorite()
    setSavedIds((p) => ({ ...p, [item.id]: true }))
    try {
      await mediaApi.interact(item.id, { wishlistStatus: 'PLAN_TO_WATCH' })
    } catch {}
  }

  if (loading) {
    return (
      <div className="space-y-4 pt-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-60 rounded-2xl" />
          <Skeleton className="h-60 rounded-2xl" />
          <Skeleton className="h-60 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!data || !data.universe || !data.universe.length) {
    return null
  }

  const items = activeTypeFilter === 'ALL'
    ? data.universe
    : data.universe.filter((u) => u.item.type === activeTypeFilter)

  return (
    <section className="space-y-6 pt-10 border-t border-white/10 relative">
      {/* Background radial glow */}
      <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-teal-500/10 blur-[100px] pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-teal-500/20 to-indigo-500/20 border border-teal-500/30 text-teal-300">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-xs uppercase tracking-wider text-teal-400">
              Omniverse Transmedia Galaxy
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Cross-Medium Echoes
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-2xl leading-relaxed">
            {data.thematicBridge}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => {
              haptics.playClick()
              setActiveTypeFilter('ALL')
            }}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0',
              activeTypeFilter === 'ALL'
                ? 'bg-teal-500 text-black font-bold shadow-md shadow-teal-500/25'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            )}
          >
            All Formats ({data.universe.length})
          </button>
          {data.universe.map((u) => {
            const Icon = TYPE_ICONS[u.item.type] || Film
            const isSelected = activeTypeFilter === u.item.type
            return (
              <button
                key={u.item.type}
                type="button"
                onClick={() => {
                  haptics.playClick()
                  setActiveTypeFilter(u.item.type)
                }}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0',
                  isSelected
                    ? 'bg-teal-500 text-black font-bold shadow-md shadow-teal-500/25'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{typeLabel(u.item.type)}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Galaxy Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {items.map((entry, index) => {
            const nodeItem = entry.item
            const Icon = TYPE_ICONS[nodeItem.type] || Film
            const accent = TYPE_ACCENTS[nodeItem.type] || TYPE_ACCENTS.MOVIE
            const isSaved = savedIds[nodeItem.id]

            return (
              <motion.div
                key={nodeItem.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={cn(
                  'group relative rounded-3xl border bg-white/[0.02] backdrop-blur-xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:translate-y-[-3px] shadow-xl',
                  accent.border,
                  accent.glow
                )}
              >
                {/* Media Image Showcase */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                  <img
                    src={nodeItem.bannerImageUrl || nodeItem.coverImageUrl}
                    alt={nodeItem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-black/40 to-black/20" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md flex items-center gap-1.5 border border-white/10',
                        accent.badge
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{typeLabel(nodeItem.type)}</span>
                    </span>
                  </div>

                  {/* Thematic Affinity Score */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-400 text-black flex items-center gap-1 shadow-lg shadow-teal-500/30">
                    <Zap className="w-3 h-3 fill-current" />
                    <span>{entry.affinityScore}% Affinity</span>
                  </div>

                  {/* Rating & Release Year */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs font-bold text-white">
                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 text-amber-300">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{nodeItem.averageRating.toFixed(1)}</span>
                    </div>
                    <span className="text-slate-300 text-xs">({nodeItem.releaseYear})</span>
                  </div>
                </div>

                {/* Content & Thematic Bridge */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-display font-bold text-lg text-white group-hover:text-teal-300 transition line-clamp-1">
                      {nodeItem.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1.5 leading-relaxed">
                      {nodeItem.summary}
                    </p>

                    {/* Shared Genre Tags */}
                    {entry.sharedTags && entry.sharedTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {entry.sharedTags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/5 border border-white/10 text-slate-300"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                    <Link to={`/media/${nodeItem.id}`} className="flex-1">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full text-xs gap-1.5 shadow-md shadow-teal-500/20"
                      >
                        <span>Step Into World</span>
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>

                    {nodeItem.type === 'MUSIC_ALBUM' && (
                      <button
                        type="button"
                        onClick={() => {
                          haptics.playClick()
                          setTrack(nodeItem)
                        }}
                        className="p-2.5 rounded-xl bg-white/10 text-slate-200 hover:text-white hover:bg-white/20 transition"
                        title="Listen Preview"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    )}

                    {user && (
                      <button
                        type="button"
                        onClick={() => handleQuickSave(nodeItem)}
                        className={cn(
                          'p-2.5 rounded-xl border transition',
                          isSaved
                            ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/15'
                        )}
                        title="Save to Watchlist"
                      >
                        {isSaved ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Heart className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </section>
  )
}
