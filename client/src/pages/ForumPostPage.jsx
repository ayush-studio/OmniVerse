import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Bookmark,
  Check,
  ExternalLink,
  Flame,
  Users,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { forumApi } from '@/services/api'
import { useAuthStore } from '@/store'
import { CommentTree } from '@/components/forum/Forum'
import { Button, Textarea, Skeleton } from '@/components/ui'
import { getChannelInfo, getPostTypeInfo, cn } from '@/utils/cn'

export default function ForumPostPage() {
  const { postId } = useParams()
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(true)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [votes, setVotes] = useState({ up: 0, down: 0, mine: 0 })
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await forumApi.getPost(postId)
      setData(res.data)
      if (res.data?.post) {
        setVotes({
          up: res.data.post.upvotesCount || 0,
          down: res.data.post.downvotesCount || 0,
          mine: res.data.post.userVote || 0,
        })
        try {
          const savedPosts = JSON.parse(localStorage.getItem('omniverse_saved_posts') || '[]')
          setSaved(savedPosts.includes(res.data.post.id))
        } catch {
          // ignore
        }
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [postId])

  async function handleVote(value) {
    if (!user) {
      navigate('/login')
      return
    }
    const next = votes.mine === value ? 0 : value
    let newUp = votes.up
    let newDown = votes.down
    if (votes.mine === 1) newUp -= 1
    if (votes.mine === -1) newDown -= 1
    if (next === 1) newUp += 1
    if (next === -1) newDown += 1

    setVotes({ up: Math.max(0, newUp), down: Math.max(0, newDown), mine: next })

    try {
      const { data } = await forumApi.votePost(postId, next)
      if (data?.post) {
        setVotes({
          up: data.post.upvotesCount,
          down: data.post.downvotesCount,
          mine: data.post.userVote,
        })
      }
    } catch {
      // ignore
    }
  }

  async function addComment(parentCommentId, textToSubmit) {
    const text = textToSubmit ?? commentText
    if (!text?.trim()) return
    setSubmittingComment(true)
    try {
      await forumApi.comment(postId, { content: text.trim(), parentCommentId })
      if (!parentCommentId) setCommentText('')
      await load()
    } finally {
      setSubmittingComment(false)
    }
  }

  function handleShare() {
    const url = window.location.href
    navigator.clipboard?.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function toggleSave() {
    try {
      const savedPosts = JSON.parse(localStorage.getItem('omniverse_saved_posts') || '[]')
      let next
      if (saved) {
        next = savedPosts.filter((id) => id !== postId)
      } else {
        next = [...savedPosts, postId]
      }
      localStorage.setItem('omniverse_saved_posts', JSON.stringify(next))
      setSaved(!saved)
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!data?.post) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h2 className="text-xl font-bold">Discussion not found</h2>
        <p className="text-sm text-[var(--text-muted)] mt-2">
          This post might have been removed or deleted.
        </p>
        <Link to="/community" className="inline-block mt-4">
          <Button>Back to Community Feed</Button>
        </Link>
      </div>
    )
  }

  const { post } = data
  const channel = getChannelInfo(post.category || 'GENERAL')
  const postTypeInfo = getPostTypeInfo(post.postType || 'DISCUSSION')
  const score = votes.up - votes.down

  const tags = Array.isArray(post.tags)
    ? post.tags
    : (() => {
        try {
          return JSON.parse(post.tags || '[]')
        } catch {
          return []
        }
      })()

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-4 py-6 sm:py-8 mobile-safe-bottom">
      {/* Breadcrumb Bar */}
      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-5">
        <Link
          to={`/community?channel=${channel.key}`}
          className="inline-flex items-center gap-1 hover:text-teal-300 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {channel.sub}</span>
        </Link>
        <span>/</span>
        <span className="truncate max-w-[200px] sm:max-w-md">{post.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Post and Comments Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Post Card */}
          <article className="glass-card rounded-2xl p-4 sm:p-6 border border-[var(--border)] relative overflow-hidden">
            {/* Header: Sub-Community + Flair + Author */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-[var(--border)]/60">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Link
                  to={`/community?channel=${channel.key}`}
                  className="font-bold text-teal-400 hover:text-teal-300 transition"
                >
                  {channel.sub}
                </Link>
                <span>•</span>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-md text-[11px] font-semibold border',
                    postTypeInfo.badgeClass
                  )}
                >
                  {postTypeInfo.flair}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                  <img
                    src={post.author?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'}
                    alt=""
                    className="w-4 h-4 rounded-full"
                  />
                  <strong className="text-[var(--text)] font-medium">
                    {post.author?.displayName || 'Anonymous'}
                  </strong>
                </span>
                <span>•</span>
                <span className="text-[var(--text-muted)]">
                  {new Date(post.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Post Title */}
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight leading-tight">
              {post.title}
            </h1>

            {/* Linked Media (if attached) */}
            {post.media && (
              <Link
                to={`/media/${post.media.id}`}
                className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-black/15 dark:bg-white/5 border border-[var(--border)] hover:border-teal-400/50 transition group"
              >
                <img
                  src={post.media.coverImageUrl}
                  alt=""
                  className="w-10 h-14 object-cover rounded-lg shrink-0 shadow"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-teal-400 font-semibold uppercase tracking-wider">
                    Linked Title ({post.media.type})
                  </div>
                  <div className="font-bold text-sm text-[var(--text)] group-hover:text-teal-300 transition truncate">
                    {post.media.title}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">View title details & stats →</div>
                </div>
                <ExternalLink className="w-4 h-4 text-[var(--text-muted)] mr-1" />
              </Link>
            )}

            {/* Post Markdown Body */}
            <div className="mt-5 text-sm sm:text-base leading-relaxed text-[var(--text)] prose prose-invert max-w-none">
              <ReactMarkdown>{post.body}</ReactMarkdown>
            </div>

            {/* Tags list */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-5">
                {tags.map((t) => (
                  <Link
                    key={t}
                    to={`/community?tag=${t}`}
                    className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/10 dark:bg-white/5 hover:bg-teal-500/15 hover:text-teal-300 border border-[var(--border)] text-[var(--text-muted)] transition"
                  >
                    #{t}
                  </Link>
                ))}
              </div>
            )}

            {/* Bottom Actions Row: Voting + Comments Count + Share + Save */}
            <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-muted)]">
              {/* Upvote / Downvote Counter */}
              <div className="flex items-center gap-1 bg-black/10 dark:bg-white/5 px-2 py-1 rounded-xl border border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => handleVote(1)}
                  className={cn(
                    'p-1 rounded hover:bg-teal-500/10 transition',
                    votes.mine === 1 && 'text-teal-400 bg-teal-500/15'
                  )}
                >
                  <ArrowBigUp className="w-5 h-5" fill={votes.mine === 1 ? 'currentColor' : 'none'} />
                </button>
                <span
                  className={cn(
                    'text-sm font-bold px-1.5',
                    votes.mine === 1 && 'text-teal-400',
                    votes.mine === -1 && 'text-rose-400',
                    votes.mine === 0 && 'text-[var(--text)]'
                  )}
                >
                  {score}
                </span>
                <button
                  type="button"
                  onClick={() => handleVote(-1)}
                  className={cn(
                    'p-1 rounded hover:bg-rose-500/10 transition',
                    votes.mine === -1 && 'text-rose-400 bg-rose-500/15'
                  )}
                >
                  <ArrowBigDown className="w-5 h-5" fill={votes.mine === -1 ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Share & Save */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center gap-1.5 hover:text-[var(--text)] transition p-1.5 rounded-lg hover:bg-white/5"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-teal-400" />
                      <span className="text-teal-400 font-semibold">Link Copied</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={toggleSave}
                  className={cn(
                    'flex items-center gap-1.5 hover:text-[var(--text)] transition p-1.5 rounded-lg hover:bg-white/5',
                    saved && 'text-teal-400'
                  )}
                >
                  <Bookmark className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
                  <span>{saved ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>
          </article>

          {/* Comments Section */}
          <section className="glass-card rounded-2xl p-4 sm:p-6 border border-[var(--border)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-[var(--text)] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-teal-400" />
                <span>Comments ({post.comments?.length || 0})</span>
              </h2>
            </div>

            {/* Comment Composer */}
            {user ? (
              <div className="mb-6 p-3 rounded-2xl bg-black/10 dark:bg-white/5 border border-[var(--border)] space-y-3">
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <span>Comment as</span>
                  <strong className="text-teal-300">{user.displayName}</strong>
                </div>
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="What are your thoughts or answers? Keep the conversation constructive…"
                  rows={3}
                  className="text-xs sm:text-sm"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    disabled={submittingComment || !commentText.trim()}
                    onClick={() => addComment(null, commentText)}
                    className="font-semibold"
                  >
                    {submittingComment ? 'Posting…' : 'Comment'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 rounded-xl border border-dashed border-[var(--border)] text-center text-xs text-[var(--text-muted)]">
                <span>Want to join the conversation? </span>
                <Link to="/login" className="text-teal-400 font-semibold hover:underline">
                  Sign in or create an account
                </Link>
              </div>
            )}

            {/* Comment Tree */}
            {post.comments?.length > 0 ? (
              <CommentTree
                comments={post.comments}
                onReply={(parentId, text) => addComment(parentId, text)}
                opAuthorId={post.authorId}
              />
            ) : (
              <div className="py-8 text-center text-xs text-[var(--text-muted)]">
                No comments yet. Be the first to share your thoughts!
              </div>
            )}
          </section>
        </div>

        {/* Right Info Sidebar */}
        <aside className="lg:col-span-4 desktop-sticky-sidebar space-y-4">
          <div className="glass-card rounded-2xl p-5 border border-[var(--border)]">
            <h3 className="font-display font-bold text-sm text-[var(--text)] mb-2">
              About {channel.sub}
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
              {channel.desc}
            </p>
            <div className="pt-3 border-t border-[var(--border)] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Category</span>
                <span className="font-semibold text-teal-300">{channel.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Post Type</span>
                <span className="font-semibold">{postTypeInfo.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Author</span>
                <span className="font-semibold">{post.author?.displayName}</span>
              </div>
            </div>
            <Link to={`/community?channel=${channel.key}`} className="block mt-4">
              <Button variant="secondary" size="sm" className="w-full">
                View all in {channel.sub}
              </Button>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
