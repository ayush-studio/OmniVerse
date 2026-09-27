import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Compass } from 'lucide-react'
import { cn } from '@/utils/cn'
import { haptics } from '@/utils/audioHaptics'

export const VIBES = [
  {
    id: 'ALL',
    label: 'All Vibes',
    emoji: '✨',
    gradient: 'from-slate-700 to-slate-800',
    color: 'teal',
    keywords: [],
  },
  {
    id: 'MELANCHOLY',
    label: 'Late Night Rain & Melancholy',
    emoji: '🌧️',
    gradient: 'from-cyan-900/60 to-blue-950/80',
    color: 'cyan',
    accentBorder: 'border-cyan-500/50',
    keywords: ['cyberpunk', 'noir', 'sci-fi', 'drama', 'melancholy', 'mystery', 'lo-fi'],
  },
  {
    id: 'ADRENALINE',
    label: 'High-Octane Adrenaline',
    emoji: '⚡',
    gradient: 'from-amber-900/60 to-rose-950/80',
    color: 'rose',
    accentBorder: 'border-rose-500/50',
    keywords: ['action', 'thriller', 'racing', 'combat', 'shonen', 'adventure'],
  },
  {
    id: 'MINDBENDING',
    label: 'Mind-Bending Riddles',
    emoji: '🧠',
    gradient: 'from-purple-900/60 to-indigo-950/80',
    color: 'purple',
    accentBorder: 'border-purple-500/50',
    keywords: ['psychological', 'puzzle', 'time travel', 'mystery', 'twist', 'philosophy'],
  },
  {
    id: 'COZY',
    label: 'Cozy Low-Stakes Comfort',
    emoji: '☕',
    gradient: 'from-amber-900/40 to-emerald-950/60',
    color: 'amber',
    accentBorder: 'border-amber-400/50',
    keywords: ['slice of life', 'cozy', 'casual', 'wholesome', 'comedy', 'relaxation'],
  },
  {
    id: 'COSMIC',
    label: 'Cosmic Wonder & Vast Scale',
    emoji: '🌌',
    gradient: 'from-indigo-900/60 to-sky-950/80',
    color: 'indigo',
    accentBorder: 'border-indigo-400/50',
    keywords: ['space', 'sci-fi', 'epic', 'odyssey', 'universe', 'interstellar'],
  },
  {
    id: 'DARK',
    label: 'Dark, Gritty & Visceral',
    emoji: '🩸',
    gradient: 'from-red-950/80 to-zinc-950/90',
    color: 'red',
    accentBorder: 'border-red-600/50',
    keywords: ['horror', 'dark', 'gritty', 'survival', 'crime', 'dystopian'],
  },
]

export default function VibeRadar({ activeVibe = 'ALL', onSelectVibe, className = '' }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-teal-500/20 text-teal-400">
            <Compass className="w-4 h-4" />
          </div>
          <span className="font-display font-bold text-sm tracking-wide text-white">
            Vibe Radar · Mood Matching
          </span>
        </div>
        <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">
          Filter by emotional resonance
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-teal-500/20">
        {VIBES.map((vibe) => {
          const isActive = activeVibe === vibe.id
          return (
            <motion.button
              key={vibe.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                haptics.playClick()
                onSelectVibe?.(vibe.id)
              }}
              className={cn(
                'group relative shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-semibold transition-all duration-200 backdrop-blur-md',
                isActive
                  ? `bg-gradient-to-r ${vibe.gradient} text-white ${vibe.accentBorder || 'border-teal-400'} shadow-[0_0_20px_rgba(20,184,166,0.25)] scale-[1.02]`
                  : 'bg-white/[0.03] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08] hover:border-white/20'
              )}
            >
              <span className="text-base select-none">{vibe.emoji}</span>
              <span>{vibe.label}</span>
              {isActive && (
                <motion.span
                  layoutId="active-vibe-glow"
                  className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse ml-0.5"
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
