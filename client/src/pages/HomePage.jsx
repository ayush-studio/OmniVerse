import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { mediaApi, forumApi } from '@/services/api'
import { useAuthStore, useRecentStore, useUiStore } from '@/store'
import { MediaGrid } from '@/components/media/MediaCard'
import RedditPostCard from '@/components/forum/RedditPostCard'
import { MEDIA_TYPES, COMMUNITY_CHANNELS, typeLabel } from '@/utils/cn'
import { Button, Badge } from '@/components/ui'
import EmptyState from '@/components/ui/EmptyState'
import AmbientBackdrop from '@/components/media/AmbientBackdrop'
import VibeRadar, { VIBES } from '@/components/media/VibeRadar'
import TasteCapsuleModal from '@/components/taste/TasteCapsuleModal'
import CinematicBillboardHero from '@/components/home/CinematicBillboardHero'
import { Flame, MessageSquare, ArrowRight, Sparkles, Trophy, Plus, Share2, Sliders } from 'lucide-react'

export default function HomePage() {
  const user = useAuthStore((s) => s.user)
  const recent = useRecentStore((s) => s.recent)
  const setSearchOpen = useUiStore((s) => s.setSearchOpen)
  const setVibeMixerOpen = useUiStore((s) => s.setVibeMixerOpen)
  const [featured, setFeatured] = useState([])
  const [recommended, setRecommended] = useState([])
  const [continueItems, setContinueItems] = useState([])
  const [discussions, setDiscussions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeVibe, setActiveVibe] = useState('ALL')
  const [tasteModalOpen, setTasteModalOpen] = useState(false)

  const displayedFeatured = useMemo(() => {
    if (activeVibe === 'ALL') return featured
    const vibeObj = VIBES.find((v) => v.id === activeVibe)
    if (!vibeObj || !vibeObj.keywords.length) return featured
    const filtered = featured.filter((item) => {
      const combined = `${item.title} ${item.summary || ''} ${(item.genreTags || []).join(' ')}`.toLowerCase()
      return vibeObj.keywords.some((kw) => combined.includes(kw))
    })
    return filtered.length > 0 ? filtered : featured
  }, [featured, activeVibe])

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      try {
        const listRes = await mediaApi.list({ sort: 'rating', limit: 18 })
        if (!alive) return
        setFeatured(listRes.data.items || [])
        if (user) {
          const rec = await mediaApi.recommendations()
          if (alive) setRecommended(rec.data.items || [])
        }
        // Fetch trending discussions
        const discRes = await forumApi.listAllPosts({ sort: 'hot', limit: 4 })
        if (alive) setDiscussions(discRes.data.posts || [])
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [user])

  useEffect(() => {
    if (!recent.length) {
      setContinueItems([])
      return
    }
    mediaApi
      .byIds(recent.map((r) => r.id))
      .then((r) => setContinueItems(r.data.items || []))
      .catch(() => setContinueItems(recent))
  }, [recent])

  function patchItem(updated) {
    setFeatured((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
    setRecommended((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
    setContinueItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
  }

  return (
    <div className="mobile-safe-bottom">
      {/* Cinematic Spotlight Hero Billboard */}
      <CinematicBillboardHero
        items={continueItems.length > 0 ? [...continueItems, ...featured] : featured}
        onUpdate={patchItem}
      />

      {/* Quick Category Channels Bar */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-thin pb-2">
          <Link to="/community">
            <Button variant="primary" size="sm" className="gap-1.5 shadow-md shadow-teal-500/20 whitespace-nowrap">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>All Community Feed</span>
            </Button>
          </Link>
          <Link to="/community?channel=SPORTS">
            <Button variant="outline" size="sm" className="whitespace-nowrap gap-1.5 border-teal-500/30 text-teal-300">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>r/Sports Hub</span>
            </Button>
          </Link>
          {MEDIA_TYPES.map((t) => (
            <Link key={t.key} to={t.path}>
              <Button variant="outline" size="sm" className="whitespace-nowrap">
                {t.label}
              </Button>
            </Link>
          ))}
        </div>
      </section>

      {/* Continue Exploring Row */}
      {continueItems.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-12">
          <div className="flex items-end justify-between mb-4 gap-3">
            <h2 className="font-display text-2xl font-bold">Continue exploring</h2>
            <button
              type="button"
              className="text-xs text-[var(--text-muted)] hover:text-teal-300"
              onClick={() => useRecentStore.getState().clearRecent()}
            >
              Clear history
            </button>
          </div>
          <MediaGrid items={continueItems} onUpdate={patchItem} />
        </section>
      )}

      {/* Interactive Reddit Community Spotlight */}
      <section className="mx-auto max-w-7xl px-4 pb-14">
        <div className="glass rounded-3xl p-6 sm:p-8 border border-[var(--border)] glow-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-rose-500/10 via-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Flame className="w-4 h-4 animate-pulse" />
                <span>Reddit-Style Town Square</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text)]">
                Trending Debates & Community Questions
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                Vote, comment, and debate across Gaming, Movies, Sports, Songs & Anime.
              </p>
            </div>

            <Link to="/community">
              <Button variant="secondary" size="sm" className="gap-1.5 font-semibold shrink-0">
                <span>View All Debates</span>
                <ArrowRight className="w-4 h-4 text-teal-400" />
              </Button>
            </Link>
          </div>

          {/* Discussion Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {discussions.map((post) => (
              <RedditPostCard
                key={post.id}
                post={post}
                compact
                onVoteChange={(id, updated) => {
                  setDiscussions((prev) =>
                    prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
                  )
                }}
              />
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-teal-400" />
              <span>Over 1,400+ answers, theories, and recommendations shared this week</span>
            </span>
            <Link to="/community" className="font-semibold text-teal-400 hover:text-teal-300">
              Start your own discussion or ask a question →
            </Link>
          </div>
        </div>
      </section>

      {/* Recommended for You */}
      {user && (
        <section id="recommended" className="mx-auto max-w-7xl px-4 pb-12">
          <h2 className="font-display text-2xl font-bold mb-4">Recommended for you</h2>
          {!loading && recommended.length === 0 ? (
            <EmptyState
              title="No recommendations yet"
              description="Finish onboarding taste tags or favorite a few titles to personalize this row."
              actionLabel="Browse movies"
              actionTo="/browse/MOVIE"
            />
          ) : (
            <MediaGrid items={recommended} loading={loading && !recommended.length} onUpdate={patchItem} />
          )}
        </section>
      )}

      {/* Vibe Mixer Spotlight Card */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-teal-950/60 via-slate-900/80 to-indigo-950/60 border border-teal-500/30 overflow-hidden shadow-2xl shadow-teal-500/10">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Interactive Entertainment Decision Engine</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                Can’t decide what to watch, play, read or hear tonight?
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Spin the <span className="text-teal-300 font-semibold">Omniverse Vibe Mixer</span>. Calibrate your time budget, emotional frequency, and session vibe to synthesize 3 instant high-resonance picks across movies, series, games, books, manga, and music.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  haptics.playPop()
                  setVibeMixerOpen(true)
                }}
                className="gap-2 px-6 py-3 font-bold bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-black shadow-lg shadow-teal-500/30 cursor-pointer"
              >
                <Sliders className="w-4 h-4 fill-current" />
                <span>Launch Vibe Mixer</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Catalog */}
      <section id="trending" className="mx-auto max-w-7xl px-4 pb-16">
        <h2 className="font-display text-2xl font-bold mb-4">Trending across OmniVerse</h2>
        <VibeRadar activeVibe={activeVibe} onSelectVibe={setActiveVibe} className="mb-6" />
        <MediaGrid items={displayedFeatured} loading={loading} onUpdate={patchItem} />
      </section>

      <TasteCapsuleModal
        isOpen={tasteModalOpen}
        onClose={() => setTasteModalOpen(false)}
      />
    </div>
  )
}
