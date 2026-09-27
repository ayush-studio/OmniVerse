import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Heart,
  BookmarkPlus,
  X,
  RotateCcw,
  Star,
  Sparkles,
  Info,
  Flame,
  ArrowRight,
  Compass,
  Check,
  Zap,
} from 'lucide-react'
import { mediaApi } from '@/services/api'
import { useAuthStore } from '@/store'
import { Badge, Button } from '@/components/ui'
import { typeLabel, MEDIA_TYPES, cn } from '@/utils/cn'
import { haptics } from '@/utils/audioHaptics'
import AmbientBackdrop from '@/components/media/AmbientBackdrop'

export default function DiscoverPage() {
  const user = useAuthStore((s) => s.user)
  const [items, setItems] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('ALL')
  const [flipped, setFlipped] = useState(false)
  const [rateModalOpen, setRateModalOpen] = useState(false)
  const [history, setHistory] = useState([]) // For undo

  // Load candidate items for the deck
  useEffect(() => {
    let alive = true
    async function loadCandidates() {
      setLoading(true)
      try {
        const params = { limit: 40, sort: 'rating' }
        if (selectedType !== 'ALL') params.type = selectedType
        const { data } = await mediaApi.list(params)
        if (!alive) return
        setItems(data.items || [])
        setCurrentIndex(0)
        setFlipped(false)
      } finally {
        if (alive) setLoading(false)
      }
    }
    loadCandidates()
    return () => {
      alive = false
    }
  }, [selectedType])

  const currentItem = items[currentIndex]
  const nextItem = items[currentIndex + 1]

  async function handleSwipe(direction) {
    if (!currentItem) return

    const item = currentItem
    setHistory((prev) => [{ index: currentIndex, item, direction }, ...prev])
    setFlipped(false)

    if (direction === 'right') {
      haptics.playFavorite()
      if (user) {
        mediaApi.interact(item.id, { wishlistStatus: 'PLAN_TO_WATCH' }).catch(() => {})
      }
    } else {
      haptics.playPop()
    }

    setCurrentIndex((prev) => prev + 1)
  }

  function handleUndo() {
    if (!history.length || currentIndex === 0) return
    haptics.playClick()
    const last = history[0]
    setHistory((prev) => prev.slice(1))
    setCurrentIndex(last.index)
    setFlipped(false)
  }

  async function handleRate(score) {
    if (!currentItem || !user) return
    haptics.playSuccess()
    try {
      await mediaApi.interact(currentItem.id, { userRating: score })
    } catch {}
    setRateModalOpen(false)
    handleSwipe('right')
  }

  // Keyboard navigation
  useEffect(() => {
    function onKeyDown(e) {
      if (rateModalOpen) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleSwipe('right')
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handleSwipe('left')
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setRateModalOpen(true)
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        setFlipped((f) => !f)
        haptics.playClick()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [currentIndex, currentItem, rateModalOpen])

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-between p-3 sm:p-6 overflow-hidden">
      {/* Ambient background matching current card */}
      {currentItem && (
        <AmbientBackdrop imageUrl={currentItem.coverImageUrl} />
      )}

      {/* Top Header & Filter Controls */}
      <div className="w-full max-w-md flex flex-col items-center gap-3 z-20">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" />
          <span>OmniSwipe Discovery Deck</span>
        </div>

        {/* Medium Type Filter Tabs */}
        <div className="flex gap-1.5 overflow-x-auto w-full max-w-md p-1 rounded-2xl glass border border-white/10 scrollbar-none justify-start sm:justify-center">
          <button
            type="button"
            onClick={() => setSelectedType('ALL')}
            className={cn(
              'px-3 py-1 rounded-xl text-xs font-semibold transition shrink-0',
              selectedType === 'ALL'
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            )}
          >
            All
          </button>
          {MEDIA_TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setSelectedType(t.key)}
              className={cn(
                'px-3 py-1 rounded-xl text-xs font-semibold transition shrink-0',
                selectedType === t.key
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Deck */}
      <div className="relative w-full max-w-sm h-[520px] sm:h-[560px] flex items-center justify-center my-4 z-20">
        {loading ? (
          <div className="w-full h-full rounded-3xl skeleton" />
        ) : currentIndex >= items.length ? (
          /* Finished State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full rounded-3xl glass border border-teal-500/30 p-8 flex flex-col items-center justify-center text-center shadow-2xl bg-[#0b1220]/90"
          >
            <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold font-display text-white">Multiverse Scanned!</h3>
            <p className="text-sm text-slate-400 mt-2 mb-6">
              You've evaluated all active candidates in this category.
            </p>
            <div className="flex flex-col gap-2.5 w-full">
              <Button
                onClick={() => {
                  setCurrentIndex(0)
                  setHistory([])
                  haptics.playClick()
                }}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Start Over
              </Button>
              <Link to="/browse/ALL">
                <Button variant="secondary" className="w-full">
                  Browse Catalog
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Card Stack */
          <div className="relative w-full h-full">
            {/* Background card for depth */}
            {nextItem && (
              <div
                className="absolute inset-0 rounded-3xl overflow-hidden glass border border-white/10 bg-slate-900 pointer-events-none transition-transform duration-300 shadow-xl"
                style={{
                  transform: 'scale(0.94) translateY(18px)',
                  opacity: 0.6,
                }}
              >
                <img
                  src={nextItem.coverImageUrl}
                  alt=""
                  className="w-full h-full object-cover filter blur-[2px] opacity-40"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Active Top Card */}
            <SwipeCard
              key={currentItem.id}
              item={currentItem}
              flipped={flipped}
              onFlip={() => {
                setFlipped((f) => !f)
                haptics.playClick()
              }}
              onSwipe={handleSwipe}
            />
          </div>
        )}
      </div>

      {/* Bottom Action Controls */}
      <div className="w-full max-w-sm flex items-center justify-between px-2 pb-2 z-20">
        {/* Undo button */}
        <button
          type="button"
          disabled={!history.length}
          onClick={handleUndo}
          className={cn(
            'w-12 h-12 rounded-2xl glass border border-white/15 flex items-center justify-center transition shadow-lg',
            history.length
              ? 'text-amber-300 hover:bg-white/10 active:scale-95'
              : 'text-slate-600 opacity-40 cursor-not-allowed'
          )}
          title="Undo last swipe"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Pass / Skip Button */}
        <button
          type="button"
          disabled={!currentItem}
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 rounded-3xl glass border border-rose-500/40 text-rose-400 hover:bg-rose-500/20 active:scale-90 flex items-center justify-center transition shadow-xl shadow-rose-950/40"
          title="Pass (Left Arrow)"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Flip / Info Button */}
        <button
          type="button"
          disabled={!currentItem}
          onClick={() => {
            setFlipped((f) => !f)
            haptics.playClick()
          }}
          className={cn(
            'w-12 h-12 rounded-2xl glass border flex items-center justify-center transition shadow-lg active:scale-95',
            flipped
              ? 'border-teal-400 text-teal-300 bg-teal-500/20'
              : 'border-white/15 text-slate-300 hover:bg-white/10'
          )}
          title="Flip Card / Synopsis (Spacebar)"
        >
          <Info className="w-5 h-5" />
        </button>

        {/* Star / Quick-Rate Button */}
        <button
          type="button"
          disabled={!currentItem}
          onClick={() => {
            setRateModalOpen(true)
            haptics.playClick()
          }}
          className="w-12 h-12 rounded-2xl glass border border-amber-400/30 text-amber-300 hover:bg-amber-400/10 active:scale-95 flex items-center justify-center transition shadow-lg"
          title="Quick Rate (Up Arrow)"
        >
          <Star className="w-5 h-5 fill-amber-300" />
        </button>

        {/* Want to Watch / Save Button */}
        <button
          type="button"
          disabled={!currentItem}
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 rounded-3xl glass border border-teal-400/50 text-teal-300 hover:bg-teal-500/20 active:scale-90 flex items-center justify-center transition shadow-xl shadow-teal-950/40"
          title="Save to Watchlist (Right Arrow)"
        >
          <Heart className="w-8 h-8 fill-current" />
        </button>
      </div>

      {/* Keyboard Shortcut Hints Footer */}
      <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-400 mt-2 z-20">
        <span><kbd className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-slate-300">←</kbd> Pass</span>
        <span><kbd className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-slate-300">→</kbd> Save</span>
        <span><kbd className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-slate-300">↑</kbd> Rate</span>
        <span><kbd className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-slate-300">Space</kbd> Flip Details</span>
      </div>

      {/* Quick Rate Modal */}
      {rateModalOpen && currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl glass border border-amber-400/30 p-6 bg-[#0b1220]/95 shadow-2xl text-center">
            <h4 className="font-display font-bold text-lg text-white">Rate "{currentItem.title}"</h4>
            <p className="text-xs text-slate-400 mt-1">Select your rating to rate and queue this title</p>
            <div className="grid grid-cols-5 gap-2 my-5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleRate(num)}
                  className="py-2 rounded-xl text-sm font-bold glass border border-amber-400/20 hover:bg-amber-400/20 text-amber-300 hover:scale-105 active:scale-95 transition"
                >
                  {num}★
                </button>
              ))}
            </div>
            <Button variant="ghost" onClick={() => setRateModalOpen(false)} className="w-full">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function SwipeCard({ item, flipped, onFlip, onSwipe }) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-250, 250], [-18, 18])
  const opacityRight = useTransform(x, [50, 150], [0, 1])
  const opacityLeft = useTransform(x, [-50, -150], [0, 1])

  function handleDragEnd(_event, info) {
    if (info.offset.x > 110) {
      onSwipe('right')
    } else if (info.offset.x < -110) {
      onSwipe('left')
    }
  }

  return (
    <motion.div
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
      className="absolute inset-0 rounded-3xl overflow-hidden glass border border-white/20 shadow-2xl cursor-grab bg-slate-900 select-none"
    >
      {!flipped ? (
        /* Front Cover Face */
        <div className="relative w-full h-full flex flex-col justify-end">
          <img
            src={item.coverImageUrl}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = `https://placehold.co/400x600/0f172a/14b8a6?text=${encodeURIComponent(item.title.slice(0, 15))}`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

          {/* Swipe Stamped Indicators */}
          <motion.div
            style={{ opacity: opacityRight }}
            className="absolute top-8 left-8 border-4 border-teal-400 text-teal-400 font-extrabold text-2xl px-4 py-1.5 rounded-2xl rotate-[-15deg] uppercase tracking-wider bg-teal-950/60 backdrop-blur-md shadow-2xl pointer-events-none"
          >
            SAVE ✓
          </motion.div>
          <motion.div
            style={{ opacity: opacityLeft }}
            className="absolute top-8 right-8 border-4 border-rose-500 text-rose-500 font-extrabold text-2xl px-4 py-1.5 rounded-2xl rotate-[15deg] uppercase tracking-wider bg-rose-950/60 backdrop-blur-md shadow-2xl pointer-events-none"
          >
            PASS ✕
          </motion.div>

          {/* Card Info Overlay */}
          <div className="relative z-10 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/10 backdrop-blur-md">{typeLabel(item.type)}</Badge>
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-md">
                <Star className="w-3.5 h-3.5 fill-amber-300" /> {item.averageRating}
              </span>
              <span className="text-xs text-white/70 font-medium">{item.releaseYear}</span>
            </div>

            <h2 className="font-display font-bold text-2xl text-white leading-tight">
              {item.title}
            </h2>

            <p className="text-xs text-slate-300 line-clamp-2 mt-2 leading-relaxed">
              {item.summary || 'Tap info or spacebar to view synopsis, genre breakdown, and full details.'}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-teal-300">
              <span onClick={(e) => { e.stopPropagation(); onFlip(); }} className="hover:underline flex items-center gap-1">
                <Info className="w-3 h-3" /> Tap to view synopsis
              </span>
              <Link
                to={`/media/${item.id}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:underline flex items-center gap-1 text-white/80"
              >
                Full page <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Back Face Details */
        <div
          onClick={onFlip}
          className="relative w-full h-full p-6 flex flex-col justify-between bg-slate-950/95 cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="font-display font-bold text-xl text-white">{item.title}</h3>
              <Badge>{typeLabel(item.type)}</Badge>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-teal-400 font-semibold mb-1">
                  Synopsis
                </p>
                <p className="text-sm text-slate-300 leading-relaxed max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                  {item.summary || 'No synopsis provided for this title.'}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-teal-400 font-semibold mb-1">
                  Genres
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(item.genreTags || []).map((g) => (
                    <span key={g} className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pt-3 border-t border-white/10 text-xs text-slate-400">
            Tap anywhere to flip back to cover
          </div>
        </div>
      )}
    </motion.div>
  )
}
