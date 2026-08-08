import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { mediaApi } from '@/services/api'
import { useAuthStore, useRecentStore, useUiStore } from '@/store'
import { MediaGrid } from '@/components/media/MediaCard'
import { MEDIA_TYPES, typeLabel } from '@/utils/cn'
import { Button, Badge } from '@/components/ui'
import EmptyState from '@/components/ui/EmptyState'

export default function HomePage() {
  const user = useAuthStore((s) => s.user)
  const recent = useRecentStore((s) => s.recent)
  const setSearchOpen = useUiStore((s) => s.setSearchOpen)
  const [featured, setFeatured] = useState([])
  const [recommended, setRecommended] = useState([])
  const [continueItems, setContinueItems] = useState([])
  const [loading, setLoading] = useState(true)

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

  const hero = continueItems[0] || featured[0]

  function patchItem(updated) {
    setFeatured((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
    setRecommended((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
    setContinueItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
  }

  return (
    <div>
      <section className="relative min-h-[70vh] flex items-end overflow-hidden">
        {hero && (
          <img
            src={hero.bannerImageUrl || hero.coverImageUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0" style={{ background: 'var(--hero-overlay)' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl w-full px-4 pb-16 pt-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="font-display text-5xl sm:text-7xl font-extrabold tracking-tight">
              <span className="text-teal-400">Omni</span>Verse
            </p>
            <p className="mt-3 max-w-xl text-[var(--text-muted)] text-lg">
              {user
                ? `Welcome back, ${user.displayName}. Pick up where you left off.`
                : 'Track, rate, and discuss movies, games, manga, music, and more.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {continueItems.length > 0 ? (
                <Link to={`/media/${continueItems[0].id}`}>
                  <Button>Continue · {continueItems[0].title}</Button>
                </Link>
              ) : (
                <Button onClick={() => document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth' })}>
                  Explore picks
                </Button>
              )}
              <Button variant="secondary" onClick={() => setSearchOpen(true)}>
                Search catalog
              </Button>
              {!user && (
                <Link to="/login">
                  <Button variant="outline">Create persona</Button>
                </Link>
              )}
            </div>
            {hero && (
              <Link to={`/media/${hero.id}`} className="inline-block mt-8 group">
                <Badge>{continueItems[0] ? 'Continue watching' : 'Spotlight'}</Badge>
                <p className="font-display text-2xl mt-1 group-hover:text-teal-300 transition">{hero.title}</p>
                <p className="text-sm text-[var(--text-muted)]">{typeLabel(hero.type)}</p>
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-2">
          {MEDIA_TYPES.map((t) => (
            <Link key={t.key} to={t.path}>
              <Button variant="outline" size="sm">
                {t.label}
              </Button>
            </Link>
          ))}
        </div>
      </section>

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

      <section id="trending" className="mx-auto max-w-7xl px-4 pb-16">
        <h2 className="font-display text-2xl font-bold mb-4">Trending across OmniVerse</h2>
        <MediaGrid items={featured} loading={loading} onUpdate={patchItem} />
      </section>
    </div>
  )
}
