import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, BookmarkPlus, Star, Check, Pause, X, ExternalLink } from 'lucide-react'
import { mediaApi } from '@/services/api'
import { useAuthStore } from '@/store'
import { Badge } from '@/components/ui'
import { typeLabel, cn } from '@/utils/cn'
import { haptics } from '@/utils/audioHaptics'

const STATUS_ACTIONS = [
  { value: 'PLAN_TO_WATCH', label: 'Plan to watch', icon: BookmarkPlus },
  { value: 'COMPLETED', label: 'Completed', icon: Check },
  { value: 'ON_HOLD', label: 'On hold', icon: Pause },
  { value: 'DROPPED', label: 'Dropped', icon: X },
]

export default function MediaLedgerTable({ items = [], onUpdate, loading, page = 1, limit = 24 }) {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [activeMenuId, setActiveMenuId] = useState(null)
  const [busyId, setBusyId] = useState(null)

  async function interact(item, payload) {
    if (!user) {
      navigate('/login')
      return
    }
    if (busyId) return
    setBusyId(item.id)
    try {
      if (payload.isFavorite) {
        haptics.playFavorite()
      } else {
        haptics.playClick()
      }
      const { data } = await mediaApi.interact(item.id, payload)
      onUpdate?.(data.item)
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <div className="glass rounded-2xl p-4 space-y-3 border border-white/10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 skeleton rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl border border-white/10 overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-white/5 border-b border-white/10 text-[var(--text-muted)] font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-3 w-12 text-center">#</th>
              <th className="py-3 px-3 w-14">Poster</th>
              <th className="py-3 px-4">Title & Classification</th>
              <th className="py-3 px-3 hidden sm:table-cell">Year</th>
              <th className="py-3 px-3 hidden md:table-cell">Genres</th>
              <th className="py-3 px-3">Rating</th>
              <th className="py-3 px-3 text-right">Library Status</th>
              <th className="py-3 px-3 w-12 text-center">Fav</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map((item, idx) => {
              const interaction = item.interaction || {}
              const isMenuOpen = activeMenuId === item.id
              const isBusy = busyId === item.id
              const genres = (
                Array.isArray(item.genreTags)
                  ? item.genreTags
                  : typeof item.genreTags === 'string'
                  ? JSON.parse(item.genreTags || '[]')
                  : []
              ).slice(0, 2)

              const rowNum = (page - 1) * limit + idx + 1

              return (
                <tr
                  key={item.id}
                  className="hover:bg-teal-500/5 transition-colors group"
                >
                  {/* Rank Index */}
                  <td className="py-2.5 px-3 text-center text-[var(--text-muted)] font-mono text-xs">
                    {rowNum}
                  </td>

                  {/* Thumbnail */}
                  <td className="py-2.5 px-3">
                    <Link to={`/media/${item.id}`} className="block w-10 h-14 rounded-lg overflow-hidden bg-slate-800 shadow">
                      <img
                        src={item.coverImageUrl}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = `https://placehold.co/100x140/0f172a/14b8a6?text=?`
                        }}
                      />
                    </Link>
                  </td>

                  {/* Title & Type */}
                  <td className="py-2.5 px-4">
                    <div className="flex flex-col">
                      <Link
                        to={`/media/${item.id}`}
                        className="font-display font-semibold text-white group-hover:text-teal-300 transition-colors line-clamp-1"
                      >
                        {item.title}
                      </Link>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-teal-400 font-medium">
                          {typeLabel(item.type)}
                        </span>
                        <span className="sm:hidden text-[10px] text-[var(--text-muted)]">
                          · {item.releaseYear}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Year */}
                  <td className="py-2.5 px-3 hidden sm:table-cell text-[var(--text-muted)] font-mono text-xs">
                    {item.releaseYear}
                  </td>

                  {/* Genres */}
                  <td className="py-2.5 px-3 hidden md:table-cell">
                    <div className="flex items-center gap-1 flex-wrap">
                      {genres.map((g) => (
                        <span
                          key={g}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/70 border border-white/10"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                      <span className="font-semibold text-white">
                        {item.averageRating?.toFixed?.(1) ?? item.averageRating}
                      </span>
                    </div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-2.5 px-3 text-right">
                    <div className="relative inline-block text-left">
                      <button
                        type="button"
                        onClick={() => {
                          haptics.playClick()
                          setActiveMenuId(isMenuOpen ? null : item.id)
                        }}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-medium border transition',
                          interaction.wishlistStatus && interaction.wishlistStatus !== 'NONE'
                            ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                            : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                        )}
                      >
                        {interaction.wishlistStatus && interaction.wishlistStatus !== 'NONE'
                          ? interaction.wishlistStatus.replaceAll('_', ' ')
                          : '+ Track'}
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 bottom-full mb-1 sm:bottom-auto sm:top-full sm:mt-1 glass rounded-xl p-1 min-w-[150px] shadow-2xl border border-teal-500/30 z-50 bg-[#0b101b]/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                          {STATUS_ACTIONS.map((s) => (
                            <button
                              key={s.value}
                              type="button"
                              className={cn(
                                'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition hover:bg-white/10',
                                interaction.wishlistStatus === s.value && 'text-teal-300 bg-teal-500/20 font-medium'
                              )}
                              onClick={() => {
                                interact(item, {
                                  wishlistStatus: interaction.wishlistStatus === s.value ? 'NONE' : s.value,
                                })
                                setActiveMenuId(null)
                              }}
                            >
                              <s.icon className="w-3.5 h-3.5" />
                              {s.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Favorite */}
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => interact(item, { isFavorite: !interaction.isFavorite })}
                      className={cn(
                        'p-1.5 rounded-lg transition hover:scale-110 active:scale-95',
                        interaction.isFavorite ? 'text-rose-400 bg-rose-500/10' : 'text-white/40 hover:text-rose-400'
                      )}
                      title="Favorite"
                    >
                      <Heart className={cn('w-4 h-4', interaction.isFavorite && 'fill-current')} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
