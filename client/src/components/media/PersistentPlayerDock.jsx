import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Maximize2, Minimize2, X, Film, Music, ExternalLink, Play, Pause } from 'lucide-react'
import { usePlayerStore } from '@/store/playerStore'
import { haptics } from '@/utils/audioHaptics'

export default function PersistentPlayerDock() {
  const { activeMedia, isOpen, isMinimized, minimize, maximize, close } = usePlayerStore()
  const [isPlayingAudio, setIsPlayingAudio] = useState(true)

  if (!isOpen || !activeMedia) return null

  // If Fullscreen / Modal mode
  if (!isMinimized) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            onClick={minimize}
          />

          {/* Modal Container */}
          <motion.div
            layoutId="player-dock-container"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-5xl rounded-3xl overflow-hidden glass border border-teal-500/30 bg-[#0b1220]/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_35px_rgba(20,184,166,0.2)] flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-4 bg-white/[0.02]">
              <div className="flex items-center gap-2.5 truncate">
                <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
                  {activeMedia.type === 'AUDIO' ? <Music className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                </span>
                <h3 className="font-display font-bold text-base sm:text-lg text-white truncate">
                  {activeMedia.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    haptics.playClick()
                    minimize()
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-teal-300 hover:text-white px-3 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 transition border border-teal-500/30"
                  title="Minimize to Picture-in-Picture"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mini Player</span>
                </button>

                {activeMedia.watchUrl && (
                  <a
                    href={activeMedia.watchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition border border-white/10"
                    title="Open on YouTube"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => {
                    haptics.playClick()
                    close()
                  }}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition"
                  title="Close player"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video or Audio Screen */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
              {activeMedia.youtubeKey ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeMedia.youtubeKey}?autoplay=1&rel=0&modestbranding=1`}
                  title={activeMedia.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : activeMedia.audioUrl ? (
                <div className="text-center p-8 space-y-4">
                  <img
                    src={activeMedia.coverUrl}
                    alt=""
                    className="w-32 h-32 rounded-2xl mx-auto shadow-2xl object-cover animate-pulse"
                  />
                  <h4 className="text-xl font-bold text-white">{activeMedia.title}</h4>
                  <p className="text-sm text-teal-400 font-medium">{activeMedia.artistName}</p>
                  <audio
                    src={activeMedia.audioUrl}
                    autoPlay
                    controls
                    className="mx-auto w-full max-w-md mt-4"
                  />
                </div>
              ) : (
                <div className="text-center p-8 space-y-3">
                  <Film className="w-12 h-12 text-teal-400 mx-auto" />
                  <p className="text-white font-medium">Trailer preview unavailable for direct embed.</p>
                  {activeMedia.watchUrl && (
                    <a
                      href={activeMedia.watchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-teal-300 underline"
                    >
                      Watch on YouTube <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-black/40 border-t border-white/5 flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Playing in OmniVerse Cinema</span>
              <span className="text-teal-400/80">Click background or 'Mini Player' to keep browsing</span>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    )
  }

  // Floating Minimized Picture-in-Picture Dock (Bottom Right)
  return (
    <motion.div
      layoutId="player-dock-container"
      drag
      dragConstraints={{ top: -400, left: -600, right: 0, bottom: 0 }}
      whileHover={{ scale: 1.02 }}
      className="fixed bottom-5 right-5 z-[80] w-[310px] sm:w-[360px] rounded-2xl overflow-hidden glass border border-teal-500/40 bg-[#0f172a]/95 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(20,184,166,0.3)] backdrop-blur-2xl cursor-grab active:cursor-grabbing flex flex-col"
    >
      {/* Mini Header Bar */}
      <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between gap-2 bg-white/[0.04]">
        <div className="flex items-center gap-2 truncate">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping shrink-0" />
          <p className="text-xs font-semibold text-white truncate max-w-[190px]">
            {activeMedia.title}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              haptics.playClick()
              maximize()
            }}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition"
            title="Maximize"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              haptics.playClick()
              close()
            }}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-rose-400 transition"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mini Video or Audio Preview */}
      <div className="relative w-full aspect-video bg-black overflow-hidden">
        {activeMedia.youtubeKey ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${activeMedia.youtubeKey}?autoplay=1&rel=0&modestbranding=1`}
            title={activeMedia.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0 pointer-events-auto"
          />
        ) : activeMedia.audioUrl ? (
          <div className="p-3 flex items-center gap-3 h-full bg-slate-900">
            <img
              src={activeMedia.coverUrl}
              alt=""
              className="w-12 h-12 rounded-lg object-cover shadow"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{activeMedia.title}</p>
              <p className="text-[11px] text-teal-400 truncate">{activeMedia.artistName}</p>
              <audio src={activeMedia.audioUrl} autoPlay controls className="w-full h-6 mt-1 scale-90 origin-left" />
            </div>
          </div>
        ) : null}
      </div>
    </motion.div>
  )
}
