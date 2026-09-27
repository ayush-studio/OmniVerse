import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Play, Film } from 'lucide-react'
import { Button } from '@/components/ui'

export default function TrailerModal({ isOpen, onClose, trailer, title, type }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const isGame = type === 'GAME'
  const modalTitle = isGame ? `${title} — Gameplay Trailer` : `${title} — Official Trailer`

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10">
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
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-5xl rounded-3xl overflow-hidden glass border border-white/15 bg-slate-950/95 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 truncate">
              <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
                <Film className="w-4 h-4" />
              </span>
              <h3 className="font-display font-bold text-base sm:text-lg text-white truncate">
                {modalTitle}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {trailer?.watchUrl && (
                <a
                  href={trailer.watchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition border border-white/10"
                >
                  <span>YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Video Player */}
          <div className="relative w-full aspect-video bg-black flex items-center justify-center">
            {trailer?.youtubeKey ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${trailer.youtubeKey}?autoplay=1&rel=0&modestbranding=1`}
                title={`${title} trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <div className="text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center mx-auto">
                  <Play className="w-8 h-8 ml-1" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">Trailer Search</p>
                  <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto mt-1">
                    Watch the trailer directly on YouTube with one click.
                  </p>
                </div>
                {trailer?.watchUrl && (
                  <Button
                    onClick={() => window.open(trailer.watchUrl, '_blank')}
                    className="gap-2"
                  >
                    <span>Open on YouTube</span>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-black/40 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-[var(--text-muted)] gap-2">
            <span>Powered by YouTube Embed & Community Metadata</span>
            {trailer?.youtubeKey && (
              <a
                href={trailer.watchUrl}
                target="_blank"
                rel="noreferrer"
                className="text-teal-400 hover:underline inline-flex items-center gap-1"
              >
                Watch full screen on YouTube <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
