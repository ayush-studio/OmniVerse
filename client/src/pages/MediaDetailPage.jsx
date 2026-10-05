import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Star, Heart, BookmarkPlus, ListPlus, Play, Film, Sparkles } from 'lucide-react'
import { mediaApi, forumApi, listApi } from '@/services/api'
import { useAuthStore, useRecentStore } from '@/store'
import { usePlayerStore } from '@/store/playerStore'
import { Badge, Button, Textarea, Input, Skeleton, Select } from '@/components/ui'
import RedditPostCard from '@/components/forum/RedditPostCard'
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
              {(item.type === 'MOVIE' || item.type === 'SERIES' || item.type === 'GAME') ? (
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
              ) : item.type === 'MUSIC_ALBUM' ? (
                <Button
                  size="sm"
                  onClick={() => {
                    const audioUrl =
                      enrichment?.audioPreview ||
                      enrichment?.previewUrl ||
                      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/1b/49/7f/1b497f6c-84cb-6020-f5a4-927914a8497d/mzaf_10793544320498779691.plus.aac.p.m4a'
                    usePlayerStore.getState().playAudio({
                      trackName: item.title,
                      artistName: item.language || 'Featured Album',
                      audioUrl,
                      coverUrl: item.coverImageUrl,
                      mediaId: item.id,
                    })
                  }}
                  className="gap-2 shadow-lg bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold border-0"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Listen Preview</span>
                </Button>
              ) : null}
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
              <div>
                <h2 className="font-display text-xl font-bold flex items-center gap-2">
                  <span>Community Debates & Discussions</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30 font-semibold">
                    {posts.length} {posts.length === 1 ? 'Topic' : 'Topics'}
                  </span>
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Theories, hot takes, spoilers, and reviews for {item.title}
                </p>
              </div>

              <div className="flex gap-1.5 p-1 rounded-xl glass border border-[var(--border)]">
                {['hot', 'top', 'new', 'comments'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      haptics.playClick()
                      setSort(s)
                    }}
                    className={cn(
                      'px-3 py-1 rounded-lg text-xs font-semibold capitalize transition',
                      sort === s
                        ? 'bg-teal-500 text-slate-950 font-bold shadow-xs'
                        : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {user ? (
              <form onSubmit={createPost} className="glass rounded-2xl p-5 space-y-4 border border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                    Start a New Debate or Discussion
                  </span>
                  <div className="flex items-center gap-1.5">
                    {['DISCUSSION', 'HOT_TAKE', 'THEORY', 'REVIEW'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setPostForm({ ...postForm, postType: t })}
                        className={cn(
                          'px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition border',
                          (postForm.postType || 'DISCUSSION') === t
                            ? 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/40 shadow-xs'
                            : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
                        )}
                      >
                        {t.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  placeholder="Debate topic or title (e.g. 'Is the climax better than the original?')"
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="Share your perspective, arguments, or critique (Markdown supported; use >!spoiler!< for hidden spoilers)…"
                  value={postForm.body}
                  onChange={(e) => setPostForm({ ...postForm, body: e.target.value })}
                  required
                />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" className="px-5 font-semibold">
                    Publish Debate
                  </Button>
                </div>
              </form>
            ) : (
              <div className="glass rounded-2xl p-5 text-center border border-[var(--border)]">
                <p className="text-xs text-[var(--text-muted)] mb-2">Sign in to publish debate topics, vote on theories, and leave replies.</p>
                <Link to="/login">
                  <Button size="sm" className="text-xs">Sign In / Demo Login</Button>
                </Link>
              </div>
            )}

            <div className="space-y-3">
              {posts.map((p) => (
                <RedditPostCard
                  key={p.id}
                  post={p}
                  onVoteChange={(postId, updated) => {
                    setPosts((prev) => prev.map((x) => (x.id === postId ? { ...x, ...updated } : x)))
                  }}
                />
              ))}
              {!posts.length && (
                <div className="glass rounded-2xl p-10 text-center border border-[var(--border)]">
                  <p className="font-display font-semibold text-base mb-1">No community debates yet</p>
                  <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                    Be the first to spark a discussion, post a review, or share a hot take about {item.title}!
                  </p>
                </div>
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
