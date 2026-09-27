import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Download, Film, Gamepad2, Tv, Music, Search, Check, RefreshCw, Share2 } from 'lucide-react'
import { useAuthStore } from '@/store'
import { mediaApi } from '@/services/api'
import { Button, Input, Badge } from '@/components/ui'
import { haptics } from '@/utils/audioHaptics'
import { typeLabel } from '@/utils/cn'

const THEMES = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    bg: '#070b14',
    primary: '#14b8a6',
    secondary: '#f43f5e',
    accent: '#38bdf8',
    gradient: 'from-cyan-500 via-teal-400 to-rose-500',
  },
  {
    id: 'gold',
    name: 'Obsidian & Gold',
    bg: '#0a0a0c',
    primary: '#fbbf24',
    secondary: '#d97706',
    accent: '#fef08a',
    gradient: 'from-amber-400 via-yellow-500 to-amber-700',
  },
  {
    id: 'aurora',
    name: 'Electric Aurora',
    bg: '#0b1320',
    primary: '#a855f7',
    secondary: '#06b6d4',
    accent: '#3b82f6',
    gradient: 'from-purple-500 via-indigo-400 to-cyan-400',
  },
]

export default function TasteCapsuleModal({ isOpen, onClose }) {
  const user = useAuthStore((s) => s.user)
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0])
  const [slots, setSlots] = useState({
    movie: null,
    game: null,
    series: null,
    musicOrBook: null,
  })
  const [activePickerSlot, setActivePickerSlot] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Preload top favorites or recommended items for default slots
  useEffect(() => {
    let alive = true
    async function loadDefaults() {
      try {
        const { data } = await mediaApi.list({ sort: 'rating', limit: 30 })
        if (!alive || !data.items) return
        const movies = data.items.filter((i) => i.type === 'MOVIE')
        const games = data.items.filter((i) => i.type === 'GAME')
        const series = data.items.filter((i) => i.type === 'SERIES' || i.type === 'MANGA')
        const others = data.items.filter((i) => i.type === 'MUSIC_ALBUM' || i.type === 'BOOK')

        setSlots({
          movie: movies[0] || null,
          game: games[0] || null,
          series: series[0] || null,
          musicOrBook: others[0] || movies[1] || null,
        })
      } catch {}
    }
    if (isOpen) {
      loadDefaults()
    }
    return () => {
      alive = false
    }
  }, [isOpen])

  // Search when picker is active
  useEffect(() => {
    if (!activePickerSlot || searchQuery.trim().length < 2) {
      setSearchResults([])
      return
    }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const { data } = await mediaApi.search(searchQuery.trim())
        const flattened = []
        if (data.groups) {
          Object.values(data.groups).forEach((arr) => flattened.push(...arr))
        }
        setSearchResults(flattened.slice(0, 10))
      } finally {
        setSearching(false)
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [searchQuery, activePickerSlot])

  if (!isOpen) return null

  function selectItemForSlot(item) {
    if (!activePickerSlot) return
    haptics.playClick()
    setSlots((prev) => ({ ...prev, [activePickerSlot]: item }))
    setActivePickerSlot(null)
    setSearchQuery('')
    setSearchResults([])
  }

  // Client-Side Canvas Rendering & Export (100% Free, Zero Server Overhead)
  async function exportCanvas(aspectRatio = 'story') {
    setExporting(true)
    haptics.playSuccess()

    try {
      const width = aspectRatio === 'story' ? 1080 : 1200
      const height = aspectRatio === 'story' ? 1920 : 1200

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')

      // Draw background
      ctx.fillStyle = selectedTheme.bg
      ctx.fillRect(0, 0, width, height)

      // Ambient radial gradient glow
      const grad = ctx.createRadialGradient(width / 2, height * 0.35, 100, width / 2, height * 0.35, width * 0.8)
      grad.addColorStop(0, `${selectedTheme.primary}40`)
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)

      // Brand Title & Header
      ctx.fillStyle = selectedTheme.primary
      ctx.font = 'bold 38px "Outfit", sans-serif'
      ctx.letterSpacing = '6px'
      ctx.fillText('OMNIVERSE · TASTE CAPSULE', 90, 130)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 64px "Syne", sans-serif'
      ctx.letterSpacing = '0px'
      const name = user?.displayName || 'Multiverse Explorer'
      ctx.fillText(`${name}'s Four Pillars`, 90, 210)

      ctx.fillStyle = '#94a3b8'
      ctx.font = '30px "Outfit", sans-serif'
      ctx.fillText('The definitive media that shaped my entertainment taste', 90, 260)

      // 4 Media Cards (2x2 Grid)
      const slotList = [
        { label: 'FAVORITE MOVIE', item: slots.movie, icon: '🎬' },
        { label: 'FAVORITE GAME', item: slots.game, icon: '🎮' },
        { label: 'FAVORITE SERIES', item: slots.series, icon: '📺' },
        { label: 'FAVORITE ALBUM / BOOK', item: slots.musicOrBook, icon: '🎵' },
      ]

      const startY = 330
      const cardWidth = 425
      const cardHeight = 620
      const gapX = 50
      const gapY = 50

      for (let i = 0; i < 4; i++) {
        const col = i % 2
        const row = Math.floor(i / 2)
        const x = 90 + col * (cardWidth + gapX)
        const y = startY + row * (cardHeight + gapY)
        const currentSlot = slotList[i]

        // Card container border & background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
        ctx.fillRect(x, y, cardWidth, cardHeight)
        ctx.strokeStyle = `${selectedTheme.primary}60`
        ctx.lineWidth = 3
        ctx.strokeRect(x, y, cardWidth, cardHeight)

        // Category Tag
        ctx.fillStyle = selectedTheme.primary
        ctx.font = 'bold 22px "Outfit", sans-serif'
        ctx.letterSpacing = '2px'
        ctx.fillText(`${currentSlot.icon} ${currentSlot.label}`, x + 25, y + 50)

        if (currentSlot.item) {
          // Poster Placeholder or Title box
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
          ctx.fillRect(x + 20, y + 80, cardWidth - 40, cardHeight - 200)

          // Try drawing image if possible
          try {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.referrerPolicy = 'no-referrer'
            await new Promise((res, rej) => {
              img.onload = res
              img.onerror = res // continue without image on CORS block
              img.src = currentSlot.item.coverImageUrl
            })
            if (img.complete && img.naturalWidth) {
              ctx.drawImage(img, x + 20, y + 80, cardWidth - 40, cardHeight - 200)
            }
          } catch {}

          // Title
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 30px "Syne", sans-serif'
          ctx.letterSpacing = '0px'
          const title = currentSlot.item.title || 'Untitled'
          ctx.fillText(title.length > 22 ? `${title.slice(0, 20)}…` : title, x + 25, y + cardHeight - 80)

          // Subtext
          ctx.fillStyle = selectedTheme.accent
          ctx.font = '24px "Outfit", sans-serif'
          ctx.fillText(`★ ${currentSlot.item.averageRating || '9.5'} · ${currentSlot.item.releaseYear || '2024'}`, x + 25, y + cardHeight - 40)
        } else {
          ctx.fillStyle = '#64748b'
          ctx.font = '28px "Outfit", sans-serif'
          ctx.fillText('Tap to choose title', x + 50, y + cardHeight / 2)
        }
      }

      // Footer Watermark & Branding
      ctx.fillStyle = '#64748b'
      ctx.font = '26px "Outfit", sans-serif'
      ctx.letterSpacing = '1px'
      ctx.fillText('Created with OmniVerse · Track, Rate, Discuss', 90, height - 80)

      ctx.fillStyle = selectedTheme.primary
      ctx.font = 'bold 30px "Outfit", sans-serif'
      ctx.fillText('omniverse.app', width - 300, height - 80)

      // Trigger automatic PNG download
      const dataUrl = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `omniverse-taste-capsule-${aspectRatio}.png`
      a.click()
    } finally {
      setExporting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 w-full max-w-4xl rounded-3xl overflow-hidden glass border border-teal-500/30 bg-[#0b1220]/95 shadow-2xl flex flex-col my-auto max-h-[92vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">
                  Taste Capsule Generator
                </h3>
                <p className="text-xs text-slate-400">
                  Curate your 4 pillars of entertainment & export a high-res story card
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 scrollbar-thin">
            {/* Theme Selector */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Visual Aesthetic
              </span>
              <div className="flex gap-2">
                {THEMES.map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => {
                      setSelectedTheme(th)
                      haptics.playClick()
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      selectedTheme.id === th.id
                        ? 'border-teal-400 bg-teal-500/20 text-teal-300 shadow-md'
                        : 'border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {th.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Pillars Interactive Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <SlotCard
                label="Favorite Movie"
                icon={<Film className="w-4 h-4 text-teal-400" />}
                item={slots.movie}
                onSelectSlot={() => {
                  setActivePickerSlot('movie')
                  haptics.playClick()
                }}
              />
              <SlotCard
                label="Favorite Game"
                icon={<Gamepad2 className="w-4 h-4 text-rose-400" />}
                item={slots.game}
                onSelectSlot={() => {
                  setActivePickerSlot('game')
                  haptics.playClick()
                }}
              />
              <SlotCard
                label="Favorite Series"
                icon={<Tv className="w-4 h-4 text-amber-400" />}
                item={slots.series}
                onSelectSlot={() => {
                  setActivePickerSlot('series')
                  haptics.playClick()
                }}
              />
              <SlotCard
                label="Favorite Album / Book"
                icon={<Music className="w-4 h-4 text-cyan-400" />}
                item={slots.musicOrBook}
                onSelectSlot={() => {
                  setActivePickerSlot('musicOrBook')
                  haptics.playClick()
                }}
              />
            </div>

            {/* Search Picker Drawer if selecting a slot */}
            {activePickerSlot && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-2xl glass border border-teal-500/30 bg-black/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-300 uppercase tracking-wide flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5" /> Search candidate for {activePickerSlot}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePickerSlot(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Close search
                  </button>
                </div>

                <Input
                  autoFocus
                  placeholder="Type title to search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 text-sm bg-white/5 border-white/10"
                />

                <div className="max-h-48 overflow-y-auto space-y-1.5 scrollbar-thin">
                  {searching && <p className="text-xs text-slate-400 p-2">Searching catalog...</p>}
                  {searchResults.map((it) => (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => selectItemForSlot(it)}
                      className="w-full flex items-center gap-3 p-2 rounded-xl text-left hover:bg-teal-500/15 transition border border-transparent hover:border-teal-500/30"
                    >
                      <img src={it.coverImageUrl} alt="" className="w-8 h-10 rounded object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate">{it.title}</p>
                        <p className="text-[10px] text-slate-400">{typeLabel(it.type)} · {it.releaseYear}</p>
                      </div>
                      <Badge className="text-[10px]">★ {it.averageRating}</Badge>
                    </button>
                  ))}
                  {!searching && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                    <p className="text-xs text-slate-400 p-2">No matching titles found.</p>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 bg-black/40">
            <span className="text-xs text-slate-400">
              Generated directly in your browser with zero server latency.
            </span>

            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={exporting}
                onClick={() => exportCanvas('square')}
                className="gap-2 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Post (1:1)</span>
              </Button>

              <Button
                disabled={exporting}
                onClick={() => exportCanvas('story')}
                className="gap-2 text-xs bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{exporting ? 'Rendering Image...' : 'Export Story (9:16)'}</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

function SlotCard({ label, icon, item, onSelectSlot }) {
  return (
    <div
      onClick={onSelectSlot}
      className="group relative aspect-[2/3] rounded-2xl overflow-hidden glass border border-white/10 hover:border-teal-400/50 cursor-pointer transition-all duration-200 shadow-lg flex flex-col justify-between p-3 select-none"
    >
      {item ? (
        <>
          <img
            src={item.coverImageUrl}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
          <div className="relative z-10 flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-md flex items-center gap-1">
              {icon}
            </span>
            <span className="text-[10px] text-teal-300 opacity-0 group-hover:opacity-100 transition">
              Change
            </span>
          </div>

          <div className="relative z-10">
            <p className="text-[10px] uppercase tracking-wider text-teal-300 font-semibold mb-0.5">
              {label}
            </p>
            <h4 className="font-display font-bold text-xs text-white line-clamp-2 leading-snug">
              {item.title}
            </h4>
            <p className="text-[10px] text-amber-300 mt-1">★ {item.averageRating}</p>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-3">
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2 text-slate-400 group-hover:text-teal-300 group-hover:border-teal-400/40 transition">
            {icon}
          </div>
          <p className="text-xs font-semibold text-white">{label}</p>
          <p className="text-[10px] text-slate-400 mt-1">+ Click to pick</p>
        </div>
      )}
    </div>
  )
}
