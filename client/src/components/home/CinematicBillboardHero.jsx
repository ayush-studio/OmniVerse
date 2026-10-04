import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  BookmarkPlus,
  Check,
  Star,
  Sparkles,
  ArrowRight,
  Flame,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { typeLabel } from '@/utils/cn'
import { useAuthStore } from '@/store'
import { mediaApi } from '@/services/api'
import { haptics } from '@/utils/audioHaptics'
import TrailerModal from '@/components/media/TrailerModal'

export default function CinematicBillboardHero({ items = [], onUpdate }) {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [trailerOpen, setTrailerOpen] = useState(false)
  const [trailerData, setTrailerData] = useState(null)
  const [isPaused, setIsPaused] = useState(false)
  const [busy, setBusy] = useState(false)

  // Use top 5 rated/featured items for spotlight
  const spotlightItems = useMemo(() => {
    return items.slice(0, 5)
  }, [items])

  const activeItem = spotlightItems[currentIndex] || items[0]

  // Auto-advance spotlight every 7 seconds when not paused
  useEffect(() => {
    if (!spotlightItems.length || isPaused) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % spotlightItems.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [spotlightItems.length, isPaused])

  // Fetch trailer when user clicks "Watch Trailer"
  async function handleOpenTrailer() {
    if (!activeItem) return
    haptics.playClick()
    try {
      const res = await mediaApi.enrichment(activeItem.id)
      setTrailerData(res.data?.trailer || res.data?.enrichment?.trailer || null)
    } catch {
      setTrailerData(null)
    }
    setTrailerOpen(true)
  }

  // Quick Watchlist toggle from Hero
  async function handleQuickWatchlist() {
    if (!user || !activeItem || busy) {
      if (!user) navigate('/login')
      return
    }
    setBusy(true)
    const currentStatus = activeItem.interaction?.wishlistStatus
    const newStatus = currentStatus === 'PLAN_TO_WATCH' ? 'NONE' : 'PLAN_TO_WATCH'
    try {
      haptics.playPop()
      const { data } = await mediaApi.interact(activeItem.id, { wishlistStatus: newStatus })
      onUpdate?.(data.item)
    } finally {
      setBusy(false)
    }
  }

  if (!activeItem) return null

  const isSaved = activeItem.interaction?.wishlistStatus === 'PLAN_TO_WATCH'
  const genres = Array.isArray(activeItem.genreTags)
    ? activeItem.genreTags
    : typeof activeItem.genreTags === 'string'
    ? JSON.parse(activeItem.genreTags || '[]')
    : []

  // Simulated smart taste match score
  const matchPercentage = Math.min(99, Math.max(88, Math.round((activeItem.averageRating || 8) * 10 + 4)))

  return (
    <>
      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative min-h-[75vh] sm:min-h-[80vh] flex items-end overflow-hidden select-none border-b border-[var(--border)]"
      >
        {/* Cinematic Backdrop Image with Smooth Crossfade */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute inset-0 z-0"
          >
            <img
              src={activeItem.bannerImageUrl || activeItem.coverImageUrl}
              alt=""
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top opacity-50 dark:opacity-40 filter saturate-125"
            />
            {/* Multi-layer atmospheric vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-[var(--bg)]/75 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Hero Content Area */}
        <div className="relative z-10 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 pt-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            
            {/* Left Column: Metadata, Title, Overview, and CTAs */}
            <div className="lg:col-span-8 space-y-4 max-w-2xl">
              
              {/* Badges row */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeItem.id + '-meta'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2.5 flex-wrap"
                >
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-500/30 dark:border-teal-500/40 backdrop-blur-md">
                    {typeLabel(activeItem.type)}
                  </span>

                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 dark:border-amber-500/40 flex items-center gap-1 backdrop-blur-md">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 dark:fill-amber-300 dark:text-amber-300" />
                    {Number(activeItem.averageRating || 0).toFixed(1)}
                  </span>

                  {user && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      {matchPercentage}% Match with your taste
                    </span>
                  )}

                  <span className="text-xs text-slate-600 dark:text-[var(--text-muted)] font-medium">
                    {activeItem.releaseYear} · {activeItem.maturityRating || 'PG-13'}
                  </span>
                </motion.div>
              </AnimatePresence>

              {/* Title Header */}
              <AnimatePresence mode="wait">
                <motion.h1
                  key={activeItem.id + '-title'}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="font-display text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-[var(--text)] leading-[1.1]"
                >
                  {activeItem.title}
                </motion.h1>
              </AnimatePresence>

              {/* Synopsis snippet */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeItem.id + '-summary'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                  className="text-sm sm:text-base text-slate-600 dark:text-[var(--text-muted)] line-clamp-3 leading-relaxed font-normal max-w-xl"
                >
                  {activeItem.summary}
                </motion.p>
              </AnimatePresence>

              {/* Genres chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {genres.slice(0, 4).map((genre) => (
                  <span
                    key={genre}
                    className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-[var(--text-muted)]"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3 flex-wrap">
                <Link
                  to={`/media/${activeItem.id}`}
                  className="px-6 py-3 rounded-full font-bold text-sm bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 shadow-[0_0_24px_rgba(20,184,166,0.4)] hover:shadow-[0_0_36px_rgba(20,184,166,0.6)] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
                >
                  <span>Explore Details</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={handleOpenTrailer}
                  className="px-5 py-3 rounded-full font-semibold text-sm bg-white/90 dark:bg-transparent glass border border-slate-300 dark:border-white/15 hover:border-teal-500/40 text-slate-800 dark:text-[var(--text)] hover:text-teal-700 dark:hover:text-teal-300 hover:bg-slate-100 dark:hover:bg-white/10 shadow-xs transition-all duration-200 flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current text-teal-500 dark:text-teal-400" />
                  <span>Watch Trailer</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickWatchlist}
                  disabled={busy}
                  className={`p-3 rounded-full border transition-all duration-200 ${
                    isSaved
                      ? 'bg-teal-500/15 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/40'
                      : 'bg-white/90 dark:bg-transparent glass border-slate-300 dark:border-white/15 text-slate-700 dark:text-[var(--text-muted)] hover:text-slate-950 dark:hover:text-[var(--text)] hover:bg-slate-100 dark:hover:bg-white/10 shadow-xs'
                  }`}
                  aria-label={isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  title={isSaved ? 'In Watchlist' : 'Add to Watchlist'}
                >
                  {isSaved ? <Check className="w-4 h-4 text-teal-600 dark:text-teal-300" /> : <BookmarkPlus className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Right Column: Spotlight Carousel Selector & Thumbnails */}
            <div className="lg:col-span-4 flex flex-col items-start lg:items-end gap-3">
              <div className="flex items-center justify-between w-full lg:w-auto gap-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-[var(--text-muted)] flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                  <span>Trending Highlights</span>
                </div>

                {/* Arrow Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentIndex((prev) => (prev - 1 + spotlightItems.length) % spotlightItems.length)}
                    className="p-1.5 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-[var(--text-muted)] hover:text-slate-950 dark:hover:text-[var(--text)] shadow-xs transition"
                    aria-label="Previous Slide"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentIndex((prev) => (prev + 1) % spotlightItems.length)}
                    className="p-1.5 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-[var(--text-muted)] hover:text-slate-950 dark:hover:text-[var(--text)] shadow-xs transition"
                    aria-label="Next Slide"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Thumbnails row */}
              <div className="grid grid-cols-5 gap-2 w-full">
                {spotlightItems.map((item, idx) => {
                  const isActive = idx === currentIndex
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        haptics.playClick()
                        setCurrentIndex(idx)
                      }}
                      className={`group relative aspect-[2/3] rounded-xl overflow-hidden border transition-all duration-300 ${
                        isActive
                          ? 'border-teal-500 ring-2 ring-teal-500/40 scale-105 shadow-[0_0_20px_rgba(20,184,166,0.4)]'
                          : 'border-slate-300 dark:border-white/10 opacity-70 hover:opacity-100 hover:border-teal-500/60 shadow-xs'
                      }`}
                    >
                      <img
                        src={item.coverImageUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {isActive && (
                        <div className="absolute inset-0 bg-teal-500/10 pointer-events-none" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Auto-rotation timer progress line */}
              <div className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden mt-1">
                <motion.div
                  key={currentIndex}
                  initial={{ width: '0%' }}
                  animate={{ width: isPaused ? '0%' : '100%' }}
                  transition={{ duration: 7, ease: 'linear' }}
                  className="h-full bg-gradient-to-r from-teal-400 to-cyan-400"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Embedded Trailer Modal */}
      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        trailer={trailerData}
        title={activeItem.title}
        type={activeItem.type}
      />
    </>
  )
}
