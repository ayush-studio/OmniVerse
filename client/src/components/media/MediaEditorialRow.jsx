import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, BookmarkPlus, Star, Check, Pause, X, Sparkles, Play, ArrowRight, MessageSquare } from 'lucide-react'
import { mediaApi } from '@/services/api'
import { useAuthStore } from '@/store'
import { Badge, Button } from '@/components/ui'
import { typeLabel, cn } from '@/utils/cn'
import { haptics } from '@/utils/audioHaptics'
import TrailerModal from '@/components/media/TrailerModal'

const STATUS_ACTIONS = [
  { value: 'PLAN_TO_WATCH', label: 'Plan to watch', icon: BookmarkPlus },
  { value: 'COMPLETED', label: 'Completed', icon: Check },
  { value: 'ON_HOLD', label: 'On hold', icon: Pause },
  { value: 'DROPPED', label: 'Dropped', icon: X },
]

export function MediaEditorialRowItem({ item, onUpdate }) {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [trailerOpen, setTrailerOpen] = useState(false)
  const [trailerData, setTrailerData] = useState(null)
  const interaction = item.interaction || {}
  const isMasterpiece = (item.averageRating || 0) >= 8.5

  const genres = (
    Array.isArray(item.genreTags)
      ? item.genreTags
      : typeof item.genreTags === 'string'
      ? JSON.parse(item.genreTags || '[]')
      : []
  ).slice(0, 4)

  const matchPercentage = Math.min(99, Math.max(88, Math.round((item.averageRating || 8) * 10 + 3)))

  async function handlePlayTrailer(e) {
    e.preventDefault()
    e.stopPropagation()
    haptics.playClick()
    try {
      const res = await mediaApi.enrichment(item.id)
      setTrailerData(res.data?.trailer || res.data?.enrichment?.trailer || null)
    } catch {
      setTrailerData(null)
    }
    setTrailerOpen(true)
  }

  async function interact(payload) {
    if (!user) {
      navigate('/login')
      return
    }
    if (busy) return
    setBusy(true)
    try {
      if (payload.isFavorite) {
        haptics.playFavorite()
      } else {
        haptics.playClick()
      }
      const { data } = await mediaApi.interact(item.id, payload)
      onUpdate?.(data.item)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <article className="group relative rounded-2xl p-4 glass border border-white/10 hover:border-teal-500/40 transition-all duration-300 flex flex-col md:flex-row gap-5 items-stretch md:items-center">
        {/* Left: Poster Image with Play Overlay */}
        <div className="relative w-full md:w-36 h-48 md:h-52 shrink-0 rounded-xl overflow-hidden bg-slate-800/60 shadow-lg">
          <img
            src={item.coverImageUrl}
            alt={item.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = `https://placehold.co/300x450/0f172a/14b8a6?text=${encodeURIComponent(item.title.slice(0, 16))}`
            }}
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />

          {/* Centered Trailer Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              onClick={handlePlayTrailer}
              className="w-10 h-10 rounded-full bg-teal-500/90 hover:bg-teal-400 text-slate-950 shadow-xl flex items-center justify-center transform scale-90 group-hover:scale-100 transition duration-200 hover:scale-110 active:scale-95 backdrop-blur-md"
              title="Watch Trailer"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </button>
          </div>

          {/* Masterpiece ribbon */}
          {isMasterpiece && (
            <div className="absolute top-2 left-2">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-amber-500/30 text-amber-300 border border-amber-400/40 backdrop-blur-md">
                <Sparkles className="w-2.5 h-2.5" /> 8.5+
              </span>
            </div>
          )}
        </div>

        {/* Center: Rich Editorial Content & Metadata */}
        <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <Badge className="text-[10px] py-0.5 px-2 bg-white/10">{typeLabel(item.type)}</Badge>
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-md border border-white/5">
                <Star className="w-3 h-3 fill-amber-300" /> {item.averageRating?.toFixed?.(1) ?? item.averageRating}
              </span>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                {matchPercentage}% Taste Match
              </span>
              <span className="text-xs text-[var(--text-muted)] font-mono">{item.releaseYear}</span>
              {item.discussionCount > 0 && (
                <Link
                  to={`/media/${item.id}?tab=discussion`}
                  className="text-xs font-semibold text-rose-300 flex items-center gap-1 bg-rose-500/15 hover:bg-rose-500/25 px-2 py-0.5 rounded-md border border-rose-500/30 transition"
                  title="View community debates"
                >
                  <MessageSquare className="w-3 h-3 text-rose-400" />
                  <span>{item.discussionCount} {item.discussionCount === 1 ? 'Debate' : 'Debates'}</span>
                </Link>
              )}
            </div>

            <Link to={`/media/${item.id}`} className="group/link inline-block">
              <h3 className="font-display text-xl font-bold text-white group-hover/link:text-teal-300 transition-colors">
                {item.title}
              </h3>
            </Link>

            {genres.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {genres.map((g) => (
                  <span
                    key={g}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-white/80 border border-white/10 font-medium"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            <p className="mt-2.5 text-xs sm:text-sm text-[var(--text-muted)] line-clamp-3 leading-relaxed">
              {item.summary || 'No synopsis recorded. Open title overview for cast, community debates, and details.'}
            </p>
          </div>

          {interaction.wishlistStatus && interaction.wishlistStatus !== 'NONE' && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[11px] font-semibold text-teal-300 bg-teal-500/15 border border-teal-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Status: {interaction.wishlistStatus.replaceAll('_', ' ')}
              </span>
            </div>
          )}
        </div>

        {/* Right: Action Panel */}
        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-white/10 md:pl-5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={cn(
                'w-10 h-10 rounded-xl glass flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md border border-white/10',
                interaction.isFavorite ? 'text-rose-400 bg-rose-500/20 border-rose-500/40' : 'text-white/70 hover:text-rose-400'
              )}
              onClick={() => interact({ isFavorite: !interaction.isFavorite })}
              title="Favorite"
            >
              <Heart className={cn('w-4 h-4', interaction.isFavorite && 'fill-current')} />
            </button>

            <div className="relative">
              <button
                type="button"
                className={cn(
                  'h-10 px-3 rounded-xl glass flex items-center gap-1.5 text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-md border border-white/10',
                  interaction.wishlistStatus && interaction.wishlistStatus !== 'NONE'
                    ? 'text-teal-300 bg-teal-500/20 border-teal-500/40'
                    : 'text-white/80 hover:text-teal-300'
                )}
                onClick={() => {
                  haptics.playClick()
                  setMenuOpen((v) => !v)
                }}
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>
                  {interaction.wishlistStatus && interaction.wishlistStatus !== 'NONE'
                    ? interaction.wishlistStatus.replaceAll('_', ' ')
                    : 'Track'}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 bottom-full mb-2 md:bottom-auto md:top-full md:mt-2 glass rounded-xl p-1 min-w-[160px] shadow-2xl border border-teal-500/30 z-50 bg-[#0b101b]/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  {STATUS_ACTIONS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left transition hover:bg-white/10',
                        interaction.wishlistStatus === s.value && 'text-teal-300 bg-teal-500/20 font-medium'
                      )}
                      onClick={() => {
                        interact({
                          wishlistStatus: interaction.wishlistStatus === s.value ? 'NONE' : s.value,
                        })
                        setMenuOpen(false)
                      }}
                    >
                      <s.icon className="w-3.5 h-3.5" />
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Link to={`/media/${item.id}`} className="w-full md:w-auto">
            <Button variant="secondary" size="sm" className="w-full md:w-auto gap-1 text-xs">
              <span>Overview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </article>

      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        trailer={trailerData}
        title={item.title}
        type={item.type}
      />
    </>
  )
}

export default function MediaEditorialRow({ items = [], onUpdate, loading }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 skeleton rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <MediaEditorialRowItem
          key={item.id}
          item={item}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  )
}
