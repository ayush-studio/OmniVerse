import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Disc3, Volume2, VolumeX, ExternalLink, Music2 } from 'lucide-react'
import { cn } from '@/utils/cn'

export default function AudioPreviewPlayer({ audioData, albumTitle }) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef(null)

  const tracks = audioData?.tracks || []
  const currentTrack = tracks[currentTrackIndex]

  useEffect(() => {
    // When track changes, if was playing, load and play new track
    if (audioRef.current && currentTrack?.previewUrl) {
      audioRef.current.src = currentTrack.previewUrl
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false))
      }
    }
  }, [currentTrackIndex])

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  function togglePlay(trackIndex = null) {
    if (!audioRef.current) return

    if (trackIndex !== null && trackIndex !== currentTrackIndex) {
      setCurrentTrackIndex(trackIndex)
      audioRef.current.src = tracks[trackIndex]?.previewUrl || ''
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
      return
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      if (!audioRef.current.src && currentTrack?.previewUrl) {
        audioRef.current.src = currentTrack.previewUrl
      }
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    }
  }

  function handleTimeUpdate() {
    if (!audioRef.current) return
    const cur = audioRef.current.currentTime || 0
    const dur = audioRef.current.duration || 30
    setCurrentTime(cur)
    setProgress((cur / dur) * 100)
  }

  function handleEnded() {
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex((prev) => prev + 1)
    } else {
      setIsPlaying(false)
      setProgress(0)
      setCurrentTime(0)
    }
  }

  function handleSeek(e) {
    if (!audioRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const width = rect.width
    const ratio = Math.max(0, Math.min(1, clickX / width))
    const dur = audioRef.current.duration || 30
    audioRef.current.currentTime = ratio * dur
    setProgress(ratio * 100)
  }

  function formatTime(secs) {
    const s = Math.floor(secs)
    const m = Math.floor(s / 60)
    const rem = s % 60
    return `${m}:${rem < 10 ? '0' : ''}${rem}`
  }

  if (!tracks.length) return null

  return (
    <div className="glass rounded-3xl p-5 border border-white/10 overflow-hidden relative">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        muted={isMuted}
        preload="none"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500/20 to-purple-500/20 border border-rose-500/30 text-rose-300 flex items-center justify-center">
            <Disc3 className={cn('w-5 h-5', isPlaying && 'animate-spin')} style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm sm:text-base text-white flex items-center gap-2">
              Album Preview
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider font-semibold">
                Lossless 30s Snippets
              </span>
            </h3>
            <p className="text-xs text-[var(--text-muted)] truncate max-w-sm">
              {audioData.artistName ? `${audioData.artistName} · ` : ''}{albumTitle}
            </p>
          </div>
        </div>

        {audioData.collectionViewUrl && (
          <a
            href={audioData.collectionViewUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-rose-400 hover:text-rose-300 inline-flex items-center gap-1 transition"
          >
            <span>Apple Music</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Now Playing Widget */}
      {currentTrack && (
        <div className="bg-slate-900/60 rounded-2xl p-4 mb-4 border border-white/5">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3 truncate">
              <button
                type="button"
                onClick={() => togglePlay()}
                className="w-11 h-11 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-bold flex items-center justify-center shadow-lg transition active:scale-95 shrink-0"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>
              <div className="truncate">
                <p className="text-xs text-teal-400 font-medium">Track {currentTrack.trackNumber}</p>
                <h4 className="font-display font-semibold text-sm sm:text-base text-white truncate">
                  {currentTrack.title}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsMuted((m) => !m)}
                className="p-2 rounded-lg text-white/60 hover:text-white transition hover:bg-white/5"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div
            onClick={handleSeek}
            className="h-2 w-full bg-white/10 hover:bg-white/15 rounded-full cursor-pointer overflow-hidden relative transition"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'linear', duration: 0.1 }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] mt-1.5 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>0:30 (Preview)</span>
          </div>
        </div>
      )}

      {/* Tracklist Table */}
      <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
        {tracks.map((track, idx) => {
          const isCurrent = idx === currentTrackIndex
          const isCurrentAndPlaying = isCurrent && isPlaying

          return (
            <div
              key={track.id || idx}
              onClick={() => togglePlay(idx)}
              className={cn(
                'group flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs cursor-pointer transition select-none',
                isCurrent
                  ? 'bg-teal-500/15 text-white border border-teal-500/30'
                  : 'hover:bg-white/5 text-[var(--text-muted)] hover:text-white'
              )}
            >
              <div className="flex items-center gap-3 truncate">
                <span className="w-5 text-center font-mono text-[11px] shrink-0 text-white/50 group-hover:hidden">
                  {isCurrentAndPlaying ? (
                    <span className="flex items-end justify-center gap-0.5 h-3">
                      <span className="w-0.5 bg-teal-400 h-3 animate-pulse" />
                      <span className="w-0.5 bg-teal-400 h-2 animate-pulse" style={{ animationDelay: '150ms' }} />
                      <span className="w-0.5 bg-teal-400 h-3.5 animate-pulse" style={{ animationDelay: '300ms' }} />
                    </span>
                  ) : (
                    track.trackNumber
                  )}
                </span>
                <span className="w-5 hidden group-hover:flex items-center justify-center shrink-0 text-teal-300">
                  {isCurrentAndPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                </span>
                <span className={cn('truncate font-medium', isCurrent && 'text-teal-300 font-semibold')}>
                  {track.title}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-white/40 font-mono">0:30</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
