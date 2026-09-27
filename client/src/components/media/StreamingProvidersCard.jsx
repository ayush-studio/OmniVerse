import { motion } from 'framer-motion'
import { ExternalLink, Tv, Gamepad2, Headphones, BookOpen, Sparkles } from 'lucide-react'
import { cn } from '@/utils/cn'

export default function StreamingProvidersCard({ providers = [], type = 'MOVIE', title }) {
  if (!providers || providers.length === 0) return null

  const typeConfig = {
    MOVIE: {
      heading: 'Where to Watch',
      subheading: 'Streaming platforms, rental services & digital releases',
      icon: Tv,
      color: 'text-amber-400',
    },
    SERIES: {
      heading: 'Where to Watch',
      subheading: 'Official broadcast channels, streaming & simulcasts',
      icon: Tv,
      color: 'text-amber-400',
    },
    GAME: {
      heading: 'Where to Play & Purchase',
      subheading: 'Official digital storefronts, consoles & PC launchers',
      icon: Gamepad2,
      color: 'text-indigo-400',
    },
    MUSIC_ALBUM: {
      heading: 'Where to Listen',
      subheading: 'Stream on high-fidelity audio platforms & official channels',
      icon: Headphones,
      color: 'text-rose-400',
    },
    BOOK: {
      heading: 'Where to Read',
      subheading: 'Borrow from open digital libraries or purchase editions',
      icon: BookOpen,
      color: 'text-emerald-400',
    },
    MANGA: {
      heading: 'Where to Read',
      subheading: 'Official digital readers, chapters & serialized volumes',
      icon: BookOpen,
      color: 'text-orange-400',
    },
  }

  const config = typeConfig[type] || typeConfig.MOVIE
  const IconComponent = config.icon

  return (
    <div className="glass rounded-3xl p-6 border border-white/10 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-xl bg-white/5 border border-white/10', config.color)}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              {config.heading}
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 font-semibold font-sans">
                {providers.length} Options
              </span>
            </h3>
            <p className="text-xs text-[var(--text-muted)]">{config.subheading}</p>
          </div>
        </div>
      </div>

      {/* Provider Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {providers.map((p, idx) => {
          return (
            <motion.a
              key={p.id || p.name + idx}
              href={p.url}
              target="_blank"
              rel="noreferrer"
              whileHover={{ y: -2 }}
              className="group relative flex flex-col justify-between p-3.5 rounded-2xl bg-slate-900/50 hover:bg-slate-800/80 border border-white/5 hover:border-white/20 transition shadow-sm overflow-hidden"
            >
              {/* Subtle top accent line */}
              {p.color && (
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 opacity-60 group-hover:opacity-100 transition"
                  style={{ backgroundColor: p.color }}
                />
              )}

              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  {p.logoUrl ? (
                    <img
                      src={p.logoUrl}
                      alt={p.name}
                      className="w-7 h-7 rounded-lg object-contain bg-white/5"
                    />
                  ) : (
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-inner shrink-0"
                      style={{ backgroundColor: p.color || '#334155' }}
                    >
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium text-xs sm:text-sm text-white truncate group-hover:text-teal-300 transition">
                    {p.name}
                  </span>
                </div>

                <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-white transition shrink-0 mt-0.5" />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-[var(--text-muted)] group-hover:text-white/80 transition">
                  {p.badge || (p.type === 'stream' ? 'Stream' : p.type === 'store' ? 'Store' : 'Available')}
                </span>
                <span className="text-[11px] text-teal-400 opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5 font-medium">
                  Open
                </span>
              </div>
            </motion.a>
          )
        })}
      </div>
    </div>
  )
}
