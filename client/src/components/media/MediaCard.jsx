import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, BookmarkPlus, Star, Check, Pause, X } from 'lucide-react'
import { mediaApi } from '@/services/api'
import { useAuthStore } from '@/store'
import { Badge } from '@/components/ui'
import { typeLabel, cn } from '@/utils/cn'

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

  async function interact(payload) {
    if (!user || busy) return
    setBusy(true)
    try {
      const { data } = await mediaApi.interact(item.id, payload)
      onUpdate?.(data.item)
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      className="group relative rounded-2xl overflow-hidden glass glow-border transition-shadow"
      onMouseLeave={() => setMenuOpen(false)}
    >
      <Link to={`/media/${item.id}`} className="block">
        <div className="aspect-[2/3] relative overflow-hidden bg-slate-800/40">
          <img
            src={item.coverImageUrl}
            alt={item.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = `https://placehold.co/400x600/0f172a/14b8a6?text=${encodeURIComponent(item.title.slice(0, 18))}`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Badge>{typeLabel(item.type)}</Badge>
              <span className="text-xs text-amber-300 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-300" /> {item.averageRating?.toFixed?.(1) ?? item.averageRating}
              </span>
            </div>
            <h3 className="font-display font-semibold text-sm leading-snug line-clamp-2 text-white">
              {item.title}
            </h3>
            <p className="text-[11px] text-white/60 mt-0.5">{item.releaseYear}</p>
            {interaction.wishlistStatus && interaction.wishlistStatus !== 'NONE' && (
              <p className="text-[10px] text-teal-300 mt-1 uppercase tracking-wide">
                {interaction.wishlistStatus.replaceAll('_', ' ')}
              </p>
            )}
          </div>
        </div>
      </Link>

      {user && (
        <div
          className={cn(
            'absolute top-2 right-2 flex flex-col items-end gap-1 opacity-0 group-hover:opacity-100 transition',
            (busy || menuOpen) && 'opacity-100',
            busy && 'pointer-events-none'
          )}
        >
          <button
            type="button"
            className={cn(
              'w-8 h-8 rounded-lg glass flex items-center justify-center',
              interaction.isFavorite && 'text-rose-400'
            )}
            onClick={(e) => {
              e.preventDefault()
              interact({ isFavorite: !interaction.isFavorite })
            }}
            title="Favorite"
          >
            <Heart className={cn('w-4 h-4', interaction.isFavorite && 'fill-current')} />
          </button>
          <button
            type="button"
            className={cn(
              'w-8 h-8 rounded-lg glass flex items-center justify-center',
              interaction.wishlistStatus && interaction.wishlistStatus !== 'NONE' && 'text-teal-300'
            )}
            onClick={(e) => {
              e.preventDefault()
              setMenuOpen((v) => !v)
            }}
            title="Add to library list"
          >
            <BookmarkPlus className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="glass rounded-xl p-1 min-w-[150px] shadow-xl border border-teal-500/20 z-10">
              {STATUS_ACTIONS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  className={cn(
                    'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left hover:bg-white/10',
                    interaction.wishlistStatus === s.value && 'text-teal-300 bg-teal-500/10'
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
    </motion.article>
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
