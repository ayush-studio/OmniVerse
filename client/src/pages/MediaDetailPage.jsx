import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Star, Heart, BookmarkPlus, ListPlus, Play, Film, Sparkles } from 'lucide-react'
import { mediaApi, forumApi, listApi } from '@/services/api'
import { useAuthStore, useRecentStore } from '@/store'
import { usePlayerStore } from '@/store/playerStore'
import { Badge, Button, Textarea, Input, Skeleton, Select } from '@/components/ui'
import { PostCard } from '@/components/forum/Forum'
import TrailerModal from '@/components/media/TrailerModal'
import StreamingProvidersCard from '@/components/media/StreamingProvidersCard'
import AudioPreviewPlayer from '@/components/media/AudioPreviewPlayer'
import AmbientBackdrop from '@/components/media/AmbientBackdrop'
import { typeLabel, WISHLIST_OPTIONS, cn } from '@/utils/cn'
import { haptics } from '@/utils/audioHaptics'

export default function MediaDetailPage() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const addRecent = useRecentStore((s) => s.addRecent)
  const [item, setItem] = useState(null)
  const [tab, setTab] = useState(searchParams.get('tab') || 'overview')
  const [posts, setPosts] = useState([])
  const [sort, setSort] = useState('hot')
  const [postForm, setPostForm] = useState({ title: '', body: '' })
  const [rating, setRating] = useState(8)
  const [hoverRating, setHoverRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [lists, setLists] = useState([])
  const [selectedList, setSelectedList] = useState('')
  const [listMsg, setListMsg] = useState('')
  const [enrichment, setEnrichment] = useState(null)
  const [trailerOpen, setTrailerOpen] = useState(false)

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      try {
        const { data } = await mediaApi.get(id)
        if (!alive) return
        setItem(data.item)
        addRecent(data.item)
        if (data.item.interaction?.userRating) setRating(data.item.interaction.userRating)

        // Fetch enrichment in background without blocking initial render
        mediaApi.getEnrichment(id)
          .then((res) => {
            if (alive) setEnrichment(res.data.enrichment)
          })
          .catch(() => {
            // graceful fallback
          })
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [id, addRecent])

  useEffect(() => {
    if (!user) return
    listApi.list().then((r) => {
      const ls = r.data.lists || []
      setLists(ls)
      if (ls[0]) setSelectedList(ls[0].id)
    })
  }, [user])

  useEffect(() => {
    if (tab !== 'discussion' || !id) return
    forumApi.listPosts(id, { sort }).then((r) => setPosts(r.data.posts || []))
  }, [tab, id, sort])

  async function interact(payload) {
    if (!user) return
    if (payload.isFavorite) {
      haptics.playFavorite()
    } else if (payload.userRating) {
      haptics.playPop()
    } else {
      haptics.playClick()
    }
    const { data } = await mediaApi.interact(id, payload)
    setItem(data.item)
  }

  async function createPost(e) {
    e.preventDefault()
    if (!user) return
    const { data } = await forumApi.createPost(id, postForm)
    setPosts((p) => [data.post, ...p])
    setPostForm({ title: '', body: '' })
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-8 w-1/2" />
      </div>
    )
  }

  if (!item) {
    return <div className="p-10 text-center">Media not found</div>
  }

  const interaction = item.interaction || {}

  return (
    <div className="relative">
      <section className="relative min-h-[46vh] flex items-end overflow-hidden">
        <AmbientBackdrop imageUrl={item.coverImageUrl} />
        <img
          src={item.bannerImageUrl}
          alt=""
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/75 to-black/40" />
        <div className="relative z-10 mx-auto max-w-7xl w-full px-4 pb-8 flex flex-col sm:flex-row gap-6 sm:items-end">
          <img
            src={item.coverImageUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="w-36 sm:w-48 rounded-2xl shadow-2xl hidden sm:block border border-white/10 shrink-0"
          />
          <div className="flex-1 pb-1">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <Badge>{typeLabel(item.type)}</Badge>
              {(item.type === 'MOVIE' || item.type === 'SERIES' || item.type === 'GAME') && (
                <Button
                  size="sm"
                  onClick={() => {
                    if (enrichment?.trailer?.youtubeKey) {
                      usePlayerStore.getState().playTrailer({
                        title: item.title,
                        youtubeKey: enrichment.trailer.youtubeKey,
                        watchUrl: enrichment.trailer.watchUrl,
                        mediaId: item.id,
                        coverUrl: item.coverImageUrl,
                      })
                    } else {
                      setTrailerOpen(true)
                    }
                  }}
                  className="gap-2 shadow-lg bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold border-0"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{item.type === 'GAME' ? 'Gameplay Trailer' : 'Watch Trailer'}</span>
                </Button>
              )}
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold">{item.title}</h1>
            <p className="text-[var(--text-muted)] mt-2 flex flex-wrap gap-3 text-sm">
              <span>{item.releaseYear}</span>
              <span>{item.language}</span>
              <span className="text-amber-300 inline-flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-300" /> {item.averageRating} ({item.ratingCount} ratings)
              </span>
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {(item.genreTags || []).map((g) => (
                <span key={g} className="text-xs px-2 py-1 rounded-lg bg-white/5 border border-[var(--border)]">
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex gap-2 mb-6 border-b border-[var(--border)]">
          {['overview', 'discussion'].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t)
                setSearchParams({ tab: t })
              }}
              className={cn(
                'px-4 py-2 text-sm capitalize border-b-2 -mb-px transition flex items-center gap-1.5',
                tab === t ? 'border-teal-400 text-teal-300' : 'border-transparent text-[var(--text-muted)]'
              )}
            >
              <span>{t}</span>
              {t === 'discussion' && item.discussionCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {item.discussionCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid lg:grid-cols-[1fr_300px] gap-8">
            <div className="space-y-6">
              <div className="glass rounded-3xl p-6 border border-white/10">
                <h2 className="font-display text-xl font-bold mb-2">Synopsis</h2>
                <p className="text-[var(--text-muted)] leading-relaxed">{item.summary}</p>
                {item.metadata && Object.keys(item.metadata).length > 0 && (
                  <div className="mt-6 grid sm:grid-cols-2 gap-3">
                    {Object.entries(item.metadata).map(([k, v]) => (
                      <div key={k} className="bg-slate-900/40 rounded-xl p-3 border border-white/5">
                        <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">{k}</p>
                        <p className="text-sm mt-1">{Array.isArray(v) ? v.join(', ') : String(v)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Interactive Audio Player for Music Albums */}
              {enrichment?.audioPreview && (
                <AudioPreviewPlayer
                  audioData={enrichment.audioPreview}
                  albumTitle={item.title}
                />
              )}

              {/* Streaming & Storefront Availability */}
              <StreamingProvidersCard
                providers={enrichment?.providers}
                type={item.type}
                title={item.title}
              />
            </div>

            <aside className="glass rounded-2xl p-4 h-fit space-y-4">
              {user ? (
                <>
                  {/* Interactive 10-Star Rating Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Your Rating</p>
                      <span className="font-display font-bold text-amber-300 text-sm">
                        {(hoverRating || rating) ? `${hoverRating || rating} / 10` : 'Not Rated'}
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-1 p-2 rounded-xl bg-white/5 border border-white/10 justify-between"
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((starVal) => {
                        const activeScore = hoverRating || rating || 0
                        const isFilled = starVal <= activeScore
                        return (
                          <button
                            key={starVal}
                            type="button"
                            onMouseEnter={() => setHoverRating(starVal)}
                            onClick={() => {
                              setRating(starVal)
                              interact({ userRating: starVal })
                            }}
                            className="p-1 rounded transition transform hover:scale-125 focus:outline-none"
                            title={`Rate ${starVal}/10`}
                          >
                            <Star
                              className={cn(
                                'w-4 h-4 transition-colors',
                                isFilled
                                  ? 'text-amber-300 fill-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.5)]'
                                  : 'text-white/20 hover:text-amber-200'
                              )}
                            />
                          </button>
                        )
                      })}
                    </div>
                    {interaction.userRating && (
                      <div className="flex justify-between items-center mt-2 text-xs text-teal-300">
                        <span className="flex items-center gap-1 font-medium">✓ Saved in your library</span>
                        <button
                          type="button"
                          onClick={() => {
                            setRating(0)
                            interact({ userRating: null })
                          }}
                          className="text-[11px] text-[var(--text-muted)] hover:text-rose-400 transition"
                        >
                          Clear rating
                        </button>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => interact({ isFavorite: !interaction.isFavorite })}
                  >
                    <Heart className={cn('w-4 h-4', interaction.isFavorite && 'fill-rose-400 text-rose-400')} />
                    {interaction.isFavorite ? 'Favorited' : 'Add to Favorites'}
                  </Button>
                  <div>
                    <p className="text-sm text-[var(--text-muted)] mb-2 flex items-center gap-1">
                      <BookmarkPlus className="w-4 h-4" /> Add to your library
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {WISHLIST_OPTIONS.filter((o) => o.value !== 'NONE').map((o) => (
                        <Button
                          key={o.value}
                          size="sm"
                          variant={interaction.wishlistStatus === o.value ? 'primary' : 'outline'}
                          className="w-full justify-start"
                          onClick={() =>
                            interact({
                              wishlistStatus:
                                interaction.wishlistStatus === o.value ? 'NONE' : o.value,
                            })
                          }
                        >
                          {o.label}
                        </Button>
                      ))}
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] mt-2">
                      These show up under Profile → Library filters (Plan to watch, Completed, etc.).
                    </p>
                  </div>
                  <div className="border-t border-[var(--border)] pt-4 space-y-2">
                    <p className="text-sm text-[var(--text-muted)] flex items-center gap-1">
                      <ListPlus className="w-4 h-4" /> Custom list
                    </p>
                    {lists.length ? (
                      <>
                        <Select
                          value={selectedList}
                          onChange={setSelectedList}
                          options={lists.map((l) => ({ value: l.id, label: l.name }))}
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-full"
                          onClick={async () => {
                            if (!selectedList) return
                            await listApi.addItem(selectedList, item.id)
                            setListMsg('Added to list')
                            setTimeout(() => setListMsg(''), 2000)
                          }}
                        >
                          Add to list
                        </Button>
                        {listMsg && <p className="text-xs text-teal-300">{listMsg}</p>}
                      </>
                    ) : (
                      <p className="text-xs text-[var(--text-muted)]">
                        Create a custom list in{' '}
                        <Link to="/profile" className="text-teal-400">
                          Profile
                        </Link>{' '}
                        first.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-1 space-y-3 text-center">
                  <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-medium leading-relaxed">
                    Sign in to track progress, rate titles (1–10), and save to your custom lists.
                  </div>
                  <Link to="/login" className="block">
                    <Button className="w-full text-xs font-semibold">Sign In / Quick Demo</Button>
                  </Link>
                </div>
              )}
            </aside>
          </div>
        )}

        {tab === 'discussion' && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <h2 className="font-display text-xl font-bold">Community forum</h2>
              <div className="flex gap-2">
                {['hot', 'top', 'new', 'controversial'].map((s) => (
                  <Button key={s} size="sm" variant={sort === s ? 'primary' : 'ghost'} onClick={() => setSort(s)}>
                    {s}
                  </Button>
                ))}
              </div>
            </div>

            {user && (
              <form onSubmit={createPost} className="glass rounded-2xl p-4 space-y-3">
                <Input
                  placeholder="Post title"
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="Write in markdown…"
                  value={postForm.body}
                  onChange={(e) => setPostForm({ ...postForm, body: e.target.value })}
                  required
                />
                <Button type="submit">Create post</Button>
              </form>
            )}

            <div className="space-y-3">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} onOpen={(post) => (window.location.href = `/forum/${post.id}`)} />
              ))}
              {!posts.length && (
                <p className="text-center text-[var(--text-muted)] py-8">No posts yet — start the thread.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Trailer & Video Preview Modal */}
      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        trailer={enrichment?.trailer}
        title={item.title}
        type={item.type}
      />
    </div>
  )
}
