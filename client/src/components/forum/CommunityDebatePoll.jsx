import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Swords, Trophy, Check, ArrowRight, Sparkles, MessageSquare } from 'lucide-react'
import { haptics } from '@/utils/audioHaptics'
import { Button } from '@/components/ui'

const MATCHUPS = [
  {
    id: 'clash-1',
    category: 'GAMES',
    tagline: 'Soulslike Phenomenon of 2024',
    titleA: 'Elden Ring: Shadow of the Erdtree',
    coverA: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    titleB: 'Black Myth: Wukong',
    coverB: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    initialVotesA: 1420,
    initialVotesB: 1285,
    discussionTopic: 'Which delivered the superior combat depth and boss design?',
  },
  {
    id: 'clash-2',
    category: 'MOVIES',
    tagline: 'Modern Cinematic Epic of the Decade',
    titleA: 'Dune: Part Two',
    coverA: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    titleB: 'Oppenheimer',
    coverB: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80',
    initialVotesA: 1890,
    initialVotesB: 1740,
    discussionTopic: 'Audiovisual worldbuilding versus psychological intensity?',
  },
  {
    id: 'clash-3',
    category: 'ANIME',
    tagline: 'Peak Historical & Dark Fantasy',
    titleA: 'Attack on Titan',
    coverA: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    titleB: 'Vinland Saga',
    coverB: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
    initialVotesA: 2130,
    initialVotesB: 1640,
    discussionTopic: 'Eren Yeager versus Thorfinn: The ultimate character journey.',
  },
]

export default function CommunityDebatePoll() {
  const [activeMatchupIdx, setActiveMatchupIdx] = useState(0)
  const [userVotes, setUserVotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('omniverse_debate_votes') || '{}')
    } catch {
      return {}
    }
  })

  const currentMatch = MATCHUPS[activeMatchupIdx]
  const userVote = userVotes[currentMatch.id]

  const votesA = currentMatch.initialVotesA + (userVote === 'A' ? 1 : 0)
  const votesB = currentMatch.initialVotesB + (userVote === 'B' ? 1 : 0)
  const totalVotes = votesA + votesB
  const pctA = Math.round((votesA / totalVotes) * 100)
  const pctB = 100 - pctA

  function handleVote(choice) {
    if (userVote) return
    haptics.playFavorite()
    const nextVotes = { ...userVotes, [currentMatch.id]: choice }
    setUserVotes(nextVotes)
    localStorage.setItem('omniverse_debate_votes', JSON.stringify(nextVotes))
  }

  return (
    <div className="relative overflow-hidden rounded-3xl glass border border-teal-500/30 p-5 sm:p-6 mb-6 shadow-2xl bg-gradient-to-br from-[#070b14] via-[#0d1527] to-[#080d19]">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400">
            <Swords className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Community Head-to-Head Clash</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-white/10 text-white/80 px-2 py-0.5 rounded-full">
                <Flame className="w-3 h-3 text-amber-400" /> Live Debate
              </span>
            </div>
            <h2 className="font-display font-bold text-lg text-white mt-0.5">{currentMatch.tagline}</h2>
          </div>
        </div>

        {/* Matchup Tabs */}
        <div className="flex items-center gap-1.5 self-stretch sm:self-auto overflow-x-auto pb-1 sm:pb-0">
          {MATCHUPS.map((m, idx) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setActiveMatchupIdx(idx)
                haptics.playClick()
              }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeMatchupIdx === idx
                  ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                  : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Match {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Clash Arena */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        {/* VS Badge in the center */}
        <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none z-10">
          <div className="w-12 h-12 rounded-full glass border border-amber-400/40 bg-[#090d16] text-amber-300 font-extrabold flex items-center justify-center shadow-xl text-sm italic tracking-widest">
            VS
          </div>
        </div>

        {/* Side A */}
        <div
          className={`relative rounded-2xl p-4 glass border transition-all duration-300 flex flex-col justify-between ${
            userVote === 'A'
              ? 'border-teal-400 bg-teal-500/10 shadow-lg shadow-teal-500/10'
              : 'border-white/10 hover:border-teal-500/30'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-teal-300 uppercase tracking-wider">Contender 01</span>
              {userVote === 'A' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-300 bg-teal-500/20 px-2 py-0.5 rounded-full border border-teal-500/40">
                  <Check className="w-3 h-3" /> Your Pick
                </span>
              )}
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-3 line-clamp-1">{currentMatch.titleA}</h3>
          </div>

          <div className="space-y-3">
            {/* Visual Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-teal-300">{pctA}%</span>
                <span className="text-[var(--text-muted)]">{votesA.toLocaleString()} votes</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pctA}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-400"
                />
              </div>
            </div>

            <Button
              onClick={() => handleVote('A')}
              disabled={!!userVote}
              variant={userVote === 'A' ? 'primary' : 'outline'}
              className="w-full text-xs font-semibold py-2"
            >
              {userVote === 'A' ? 'Voted' : `Vote for ${currentMatch.titleA.split(':')[0]}`}
            </Button>
          </div>
        </div>

        {/* Side B */}
        <div
          className={`relative rounded-2xl p-4 glass border transition-all duration-300 flex flex-col justify-between ${
            userVote === 'B'
              ? 'border-rose-400 bg-rose-500/10 shadow-lg shadow-rose-500/10'
              : 'border-white/10 hover:border-rose-500/30'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider">Contender 02</span>
              {userVote === 'B' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/40">
                  <Check className="w-3 h-3" /> Your Pick
                </span>
              )}
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-3 line-clamp-1">{currentMatch.titleB}</h3>
          </div>

          <div className="space-y-3">
            {/* Visual Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-300">{pctB}%</span>
                <span className="text-[var(--text-muted)]">{votesB.toLocaleString()} votes</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pctB}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-400"
                />
              </div>
            </div>

            <Button
              onClick={() => handleVote('B')}
              disabled={!!userVote}
              variant={userVote === 'B' ? 'primary' : 'outline'}
              className="w-full text-xs font-semibold py-2"
            >
              {userVote === 'B' ? 'Voted' : `Vote for ${currentMatch.titleB.split(':')[0]}`}
            </Button>
          </div>
        </div>
      </div>

      {/* Discussion prompt footer */}
      <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
          <span>Discussion point: <strong className="text-white/90">{currentMatch.discussionTopic}</strong></span>
        </div>
        <span className="text-[11px] opacity-75">{totalVotes.toLocaleString()} community members voted</span>
      </div>
    </div>
  )
}
