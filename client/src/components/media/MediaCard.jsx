import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, BookmarkPlus, Star, Check, Pause, X, Sparkles } from 'lucide-react'
import { mediaApi } from '@/services/api'
import { useAuthStore } from '@/store'
import { Badge } from '@/components/ui'
import { typeLabel, cn } from '@/utils/cn'
import { haptics } from '@/utils/audioHaptics'
import TiltCard from './TiltCard'
import EmptyState from '@/components/ui/EmptyState'

const STATUS_ACTIONS = [
  { value: 'PLAN_TO_WATCH', label: 'Plan to watch', icon: BookmarkPlus },
  { value: 'COMPLETED', label: 'Completed', icon: Check },
  { value: 'ON_HOLD', label: 'On hold', icon: Pause },
  { value: 'DROPPED', label: 'Dropped', icon: X },
]

export default function MediaCard({ item, onUpdate }) {
  const user = useAuthStore((s) => s.user)
  const [busy, setBusy] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const interaction = item.interaction || {}
  const isMasterpiece = (item.averageRating || 0) >= 8.5

  async function interact(payload) {
    if (!user || busy) return
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
    <TiltCard
      isMasterpiece={isMasterpiece}
      className="rounded-2xl transition-all"
    >
      <article
        className="group relative rounded-2xl overflow-hidden glass glow-border transition-shadow h-full flex flex-col"
        onMouseLeave={() => setMenuOpen(false)}
      >
        <Link to={`/media/${item.id}`} className="block flex-1">
          <div className="aspect-[2/3] relative overflow-hidden bg-slate-800/40">
            <img
              src={item.coverImageUrl}
              alt={item.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = `https://placehold.co/400x600/0f172a/14b8a6?text=${encodeURIComponent(item.title.slice(0, 18))}`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90 transition-opacity group-hover:opacity-95" />
            
            {/* Top-right Masterpiece tag if applicable */}
            {isMasterpiece && (
              <div className="absolute top-2 left-2 z-10">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30 backdrop-blur-md shadow-sm">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                  Masterpiece
                </span>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <Badge className="text-[10px] py-0.5 px-2 bg-white/10 backdrop-blur-md">{typeLabel(item.type)}</Badge>
                <span className="text-xs font-semibold text-amber-300 flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                  <Star className="w-3 h-3 fill-amber-300" /> {item.averageRating?.toFixed?.(1) ?? item.averageRating}
                </span>
              </div>
              <h3 className="font-display font-semibold text-sm leading-snug line-clamp-2 text-white group-hover:text-teal-300 transition-colors">
                {item.title}
              </h3>
              <p className="text-[11px] text-white/60 mt-0.5 font-medium">{item.releaseYear}</p>
              {interaction.wishlistStatus && interaction.wishlistStatus !== 'NONE' && (
                <p className="text-[10px] text-teal-300 mt-1 font-semibold uppercase tracking-wider">
                  {interaction.wishlistStatus.replaceAll('_', ' ')}
                </p>
              )}
            </div>
          </div>
        </Link>

        {user && (
          <div
            className={cn(
              'absolute top-2 right-2 z-30 flex flex-col items-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200',
              (busy || menuOpen) && 'opacity-100',
              busy && 'pointer-events-none'
            )}
          >
            <button
              type="button"
              className={cn(
                'w-8 h-8 rounded-xl glass flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg backdrop-blur-md',
                interaction.isFavorite ? 'text-rose-400 bg-rose-500/20 border-rose-500/30' : 'hover:text-rose-400'
              )}
              onClick={(e) => {
                e.preventDefault()
                interact({ isFavorite: !interaction.isFavorite })
              }}
              title="Favorite"
            >
              <Heart className={cn('w-4 h-4 transition-transform', interaction.isFavorite && 'fill-current scale-110')} />
            </button>
            <button
              type="button"
              className={cn(
                'w-8 h-8 rounded-xl glass flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg backdrop-blur-md',
                interaction.wishlistStatus && interaction.wishlistStatus !== 'NONE' ? 'text-teal-300 bg-teal-500/20 border-teal-500/30' : 'hover:text-teal-300'
              )}
              onClick={(e) => {
                e.preventDefault()
                haptics.playClick()
                setMenuOpen((v) => !v)
              }}
              title="Add to library list"
            >
              <BookmarkPlus className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="glass rounded-xl p-1 min-w-[150px] shadow-2xl border border-teal-500/30 z-40 bg-[#0f172a]/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                {STATUS_ACTIONS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    className={cn(
                      'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition hover:bg-white/10',
                      interaction.wishlistStatus === s.value && 'text-teal-300 bg-teal-500/20 font-medium'
                    )}
                    onClick={(e) => {
                      e.preventDefault()
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
        )}
      </article>
    </TiltCard>
  )
}

export function MediaGrid({ items, onUpdate, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] skeleton rounded-2xl" />
        ))}
      </div>
    )
  }

  if (!items?.length) {
    return (
      <EmptyState
        title="No titles found"
        description="Tip: open a title and set Favorite / Plan to watch / Completed to fill your library."
        actionLabel="Browse movies"
        actionTo="/browse/MOVIE"
      />
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {items.map((item) => (
        <MediaCard
          key={item.id}
          item={item}
          onUpdate={(updated) => onUpdate?.(updated)}
        />
      ))}
    </div>
  )
}
