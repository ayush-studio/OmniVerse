import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  X,
  Sparkles,
  Sliders,
  Zap,
  Clock,
  Heart,
  Users,
  Compass,
  Star,
  Play,
  RotateCcw,
  ArrowRight,
  Flame,
  Check,
  Film,
  Tv,
  Gamepad2,
  BookOpen,
  BookMarked,
  Music,
} from 'lucide-react'
import { mediaApi } from '@/services/api'
import { useAuthStore } from '@/store'
import { usePlayerStore } from '@/store/playerStore'
import { Button, Badge } from '@/components/ui'
import { haptics } from '@/utils/audioHaptics'
import { typeLabel, cn } from '@/utils/cn'

const TIME_OPTIONS = [
  { id: 'ANY', label: 'Any Duration', desc: 'No time limits', icon: Clock },
  { id: 'QUICK', label: 'Quick Bite', desc: '15-45m · Music, Manga', icon: Zap },
  { id: 'FEATURE', label: 'Feature Length', desc: '1.5-3h · Movies, Episodes', icon: Film },
  { id: 'DEEP', label: 'Deep Immersion', desc: '10+ hrs · AAA Games, Books', icon: Gamepad2 },
]

const VIBE_OPTIONS = [
  {
    id: 'ADRENALINE',
    label: 'High-Octane Adrenaline',
    emoji: '⚡',
    gradient: 'from-amber-500/20 via-rose-500/20 to-red-600/30',
    border: 'border-rose-500/40',
    accentColor: 'text-rose-400',
    tagline: 'Razor-sharp tension & non-stop energy',
  },
  {
    id: 'MELANCHOLY',
    label: 'Late Night Rain & Melancholy',
    emoji: '🌧️',
    gradient: 'from-cyan-500/20 via-blue-500/20 to-indigo-600/30',
    border: 'border-cyan-500/40',
    accentColor: 'text-cyan-400',
    tagline: 'Cyberpunk noir, lo-fi introspection',
  },
  {
    id: 'MINDBENDING',
    label: 'Mind-Bending Riddles',
    emoji: '🧠',
    gradient: 'from-purple-500/20 via-fuchsia-500/20 to-indigo-600/30',
    border: 'border-purple-500/40',
    accentColor: 'text-purple-400',
    tagline: 'Cerebral puzzles, plot twists & philosophy',
  },
  {
    id: 'COZY',
    label: 'Cozy Low-Stakes Comfort',
    emoji: '☕',
    gradient: 'from-amber-500/20 via-emerald-500/20 to-teal-600/30',
    border: 'border-amber-400/40',
    accentColor: 'text-amber-400',
    tagline: 'Warm, low-friction, heartwarming ease',
  },
  {
    id: 'COSMIC',
    label: 'Cosmic Wonder & Scale',
    emoji: '🌌',
    gradient: 'from-indigo-500/20 via-sky-500/20 to-violet-600/30',
    border: 'border-indigo-400/40',
    accentColor: 'text-indigo-400',
    tagline: 'Interstellar odysseys & vast horizons',
  },
  {
    id: 'DARK',
    label: 'Dark, Gritty & Visceral',
    emoji: '🩸',
    gradient: 'from-red-600/20 via-zinc-800/30 to-black/40',
    border: 'border-red-600/40',
    accentColor: 'text-red-400',
    tagline: 'Uncompromising stakes, horror & visceral noir',
  },
]

const CONTEXT_OPTIONS = [
  { id: 'SOLO', label: 'Solo Session', desc: 'Personal deep focus' },
  { id: 'DATE_NIGHT', label: 'Duo / Date Night', desc: 'Engaging & conversational' },
  { id: 'PARTY', label: 'Group / Party', desc: 'Crowd-pleasing & dynamic' },
  { id: 'CHILL', label: 'Background / Chill', desc: 'Atmospheric companion' },
]

const TYPE_ICONS = {
  MOVIE: Film,
  SERIES: Tv,
  GAME: Gamepad2,
  BOOK: BookOpen,
  MANGA: BookMarked,
  MUSIC_ALBUM: Music,
}

export default function VibeMixerModal({ isOpen, onClose }) {
  const user = useAuthStore((s) => s.user)
  const setTrack = usePlayerStore((s) => s.setTrack)

  const [time, setTime] = useState('FEATURE')
  const [vibe, setVibe] = useState('ADRENALINE')
  const [context, setContext] = useState('SOLO')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [hasSynthesized, setHasSynthesized] = useState(false)
  const [savedWishlist, setSavedWishlist] = useState({})

  useEffect(() => {
    if (!isOpen) {
      setResults(null)
      setHasSynthesized(false)
    }
  }, [isOpen])

  async function handleSynthesize() {
    haptics.playPop()
    setLoading(true)
    setHasSynthesized(true)
    try {
      const res = await mediaApi.vibeMixer({
        timeCommitment: time,
        vibe,
        context,
        limit: 3,
      })
      // Small intentional suspense delay for the slot roulette feel
      setTimeout(() => {
        setResults(res.data)
        setLoading(false)
        haptics.playSuccess()
      }, 600)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  async function handleQuickSave(item) {
    if (!user) return
    haptics.playFavorite()
    setSavedWishlist((prev) => ({ ...prev, [item.id]: true }))
    try {
      await mediaApi.interact(item.id, { wishlistStatus: 'PLAN_TO_WATCH' })
    } catch {}
  }

  const activeVibeObj = VIBE_OPTIONS.find((v) => v.id === vibe) || VIBE_OPTIONS[0]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-[#090d16]/95 p-6 sm:p-8 shadow-2xl shadow-teal-500/10 backdrop-blur-2xl overflow-hidden my-auto z-10"
          >
            {/* Ambient Background Aura */}
            <div
              className={cn(
                'absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-40 transition-all duration-700 bg-gradient-to-br',
                activeVibeObj.gradient
              )}
            />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-center justify-between pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-teal-500/20 to-cyan-500/20 border border-teal-500/30 text-teal-400 shadow-lg shadow-teal-500/20">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                      Omniverse Vibe Mixer
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      Decision Engine
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Tune duration, emotional wavelength & context to cut choice paralysis.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="relative py-6 space-y-6">
              {!results ? (
                <>
                  {/* Step 1: Duration Selector */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-teal-400" />
                      <span>1. How Much Time Do You Have?</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {TIME_OPTIONS.map((opt) => {
                        const Icon = opt.icon
                        const isSelected = time === opt.id
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              haptics.playClick()
                              setTime(opt.id)
                            }}
                            className={cn(
                              'p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden',
                              isSelected
                                ? 'bg-teal-500/15 border-teal-400 text-white shadow-[0_0_20px_rgba(20,184,166,0.2)]'
                                : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.05] hover:border-white/20'
                            )}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <Icon
                                className={cn(
                                  'w-4 h-4',
                                  isSelected ? 'text-teal-400' : 'text-slate-400'
                                )}
                              />
                              {isSelected && (
                                <motion.div
                                  layoutId="time-check"
                                  className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_#14b8a6]"
                                />
                              )}
                            </div>
                            <div className="font-semibold text-xs text-white">{opt.label}</div>
                            <div className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">
                              {opt.desc}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Step 2: Emotional Vibe Resonance */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                      <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                      <span>2. Choose Your Emotional Frequency</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {VIBE_OPTIONS.map((opt) => {
                        const isSelected = vibe === opt.id
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              haptics.playClick()
                              setVibe(opt.id)
                            }}
                            className={cn(
                              'p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group',
                              isSelected
                                ? `bg-gradient-to-br ${opt.gradient} ${opt.border} text-white shadow-lg`
                                : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.05] hover:border-white/20'
                            )}
                          >
                            <div className="flex items-center gap-2.5 mb-1">
                              <span className="text-xl select-none group-hover:scale-110 transition-transform">
                                {opt.emoji}
                              </span>
                              <span className="font-semibold text-xs text-white">
                                {opt.label}
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                              {opt.tagline}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Step 3: Setting / Social Context */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      <span>3. Session Setting</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {CONTEXT_OPTIONS.map((opt) => {
                        const isSelected = context === opt.id
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              haptics.playClick()
                              setContext(opt.id)
                            }}
                            className={cn(
                              'p-3 rounded-2xl border text-left transition-all',
                              isSelected
                                ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                                : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.05] hover:border-white/20'
                            )}
                          >
                            <div className="font-semibold text-xs text-white">{opt.label}</div>
                            <div className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">
                              {opt.desc}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </>
              ) : (
                /* Results Stage: Synthesized Curated Matches */
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{activeVibeObj.emoji}</div>
                      <div>
                        <div className="font-bold text-sm text-teal-300 flex items-center gap-2">
                          <span>Synthesized 3 High-Resonance Picks</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-200">
                            96%+ Alignment
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          Tuned for {activeVibeObj.label} · {time} duration · {context}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setResults(null)}
                      className="gap-1.5 text-xs border-teal-500/30 text-teal-300"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Adjust Mix</span>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {results.picks.map((pick, idx) => {
                      const item = pick.item
                      const Icon = TYPE_ICONS[item.type] || Film
                      const isSaved = savedWishlist[item.id]

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.12 }}
                          className="group relative rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden flex flex-col justify-between hover:border-teal-400/50 hover:bg-white/[0.06] transition-all shadow-lg"
                        >
                          {/* Image Banner */}
                          <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                            <img
                              src={item.bannerImageUrl || item.coverImageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-transparent to-black/40" />

                            {/* Top Badges */}
                            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-md text-white border border-white/10 flex items-center gap-1">
                                <Icon className="w-3 h-3 text-teal-400" />
                                <span>{typeLabel(item.type)}</span>
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/90 text-black">
                                #{idx + 1} Match
                              </span>
                            </div>

                            {/* Confidence Score Pill */}
                            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/90 text-black flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              <span>{pick.matchConfidence}%</span>
                            </div>

                            {/* Floating Rating */}
                            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 text-xs font-bold text-amber-300">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>{item.averageRating.toFixed(1)}</span>
                              <span className="text-slate-400 text-[10px]">
                                ({item.releaseYear})
                              </span>
                            </div>
                          </div>

                          {/* Body Content */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div>
                              <h3 className="font-display font-bold text-base text-white group-hover:text-teal-300 transition line-clamp-1">
                                {item.title}
                              </h3>
                              <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 mt-1 leading-relaxed">
                                {item.summary}
                              </p>
                            </div>

                            {/* Resonance Insight Quote */}
                            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-[11px] text-teal-200/90 italic leading-snug">
                              &ldquo;{pick.vibeReason}&rdquo;
                            </div>

                            {/* Actions */}
                            <div className="pt-2 flex items-center gap-2 border-t border-white/10">
                              <Link to={`/media/${item.id}`} onClick={onClose} className="flex-1">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="w-full text-xs gap-1.5 shadow-md shadow-teal-500/20"
                                >
                                  <span>Explore</span>
                                  <ArrowRight className="w-3 h-3" />
                                </Button>
                              </Link>

                              {item.type === 'MUSIC_ALBUM' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    haptics.playClick()
                                    setTrack(item)
                                  }}
                                  className="p-2 rounded-xl bg-white/10 text-slate-200 hover:text-white hover:bg-white/20 transition"
                                  title="Play Preview"
                                >
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                </button>
                              )}

                              {user && (
                                <button
                                  type="button"
                                  onClick={() => handleQuickSave(item)}
                                  className={cn(
                                    'p-2 rounded-xl border transition',
                                    isSaved
                                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                                      : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/15'
                                  )}
                                  title="Add to Watchlist"
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
                  </div>
                </div>
              )}
            </div>

            {/* Footer Controls */}
            <div className="relative pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <span>Instant deterministic matching across 500+ curated records</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400">
                  Cancel
                </Button>

                {!results ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSynthesize}
                    disabled={loading}
                    className="w-full sm:w-auto gap-2 px-6 shadow-lg shadow-teal-500/25 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-black font-bold"
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        >
                          <Sparkles className="w-4 h-4" />
                        </motion.div>
                        <span>Synthesizing Mix...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-current" />
                        <span>Synthesize Matches</span>
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSynthesize}
                    disabled={loading}
                    className="w-full sm:w-auto gap-2 px-6 shadow-lg shadow-teal-500/25 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-black font-bold"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Re-Roll Mix</span>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
