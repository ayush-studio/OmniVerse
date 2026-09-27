import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, Bookmark, Check, ExternalLink } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { forumApi } from '@/services/api'
import { useAuthStore } from '@/store'
import { getChannelInfo, getPostTypeInfo, cn } from '@/utils/cn'

export default function RedditPostCard({ post, onVoteChange, compact = false }) {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const [votes, setVotes] = useState({
    up: post.upvotesCount || 0,
    down: post.downvotesCount || 0,
    mine: post.userVote || 0,
  })
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(() => {
    try {
      const savedPosts = JSON.parse(localStorage.getItem('omniverse_saved_posts') || '[]')
      return savedPosts.includes(post.id)
    } catch {
      return false
    }
  })

  const channel = getChannelInfo(post.category || 'GENERAL')
  const postTypeInfo = getPostTypeInfo(post.postType || 'DISCUSSION')
  const score = votes.up - votes.down

  async function handleVote(e, value) {
    e.stopPropagation()
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }

    const next = votes.mine === value ? 0 : value
    // Optimistic update
    let newUp = votes.up
    let newDown = votes.down

    if (votes.mine === 1) newUp -= 1
    if (votes.mine === -1) newDown -= 1
    if (next === 1) newUp += 1
    if (next === -1) newDown += 1

    setVotes({ up: Math.max(0, newUp), down: Math.max(0, newDown), mine: next })

    try {
      const { data } = await forumApi.votePost(post.id, next)
      if (data?.post) {
        setVotes({
          up: data.post.upvotesCount,
          down: data.post.downvotesCount,
          mine: data.post.userVote,
        })
        onVoteChange?.(post.id, data.post)
      }
    } catch (err) {
      // Revert if error
      setVotes({
        up: post.upvotesCount || 0,
        down: post.downvotesCount || 0,
        mine: post.userVote || 0,
      })
    }
  }

  function handleShare(e) {
    e.stopPropagation()
    e.preventDefault()
    const url = `${window.location.origin}/forum/${post.id}`
    navigator.clipboard?.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function toggleSave(e) {
    e.stopPropagation()
    e.preventDefault()
    try {
      const savedPosts = JSON.parse(localStorage.getItem('omniverse_saved_posts') || '[]')
      let next
      if (saved) {
        next = savedPosts.filter((id) => id !== post.id)
      } else {
        next = [...savedPosts, post.id]
      }
      localStorage.setItem('omniverse_saved_posts', JSON.stringify(next))
      setSaved(!saved)
    } catch (err) {
      console.error(err)
    }
  }

  const tags = Array.isArray(post.tags)
    ? post.tags
    : (() => {
        try {
          return JSON.parse(post.tags || '[]')
        } catch {
          return []
        }
      })()

  // Calculate relative time
  function timeAgo(dateString) {
    const diff = (Date.now() - new Date(dateString).getTime()) / 1000
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <article
      onClick={() => navigate(`/forum/${post.id}`)}
      className="group relative flex gap-3 p-3.5 sm:p-4 rounded-2xl glass-card border border-[var(--border)] cursor-pointer overflow-hidden transition-all hover:border-teal-500/40 hover:shadow-xl"
    >
      {/* Left Vote Column */}
      <div
        className="flex flex-col items-center justify-start gap-0.5 shrink-0 bg-black/10 dark:bg-white/5 px-1.5 py-2 rounded-xl h-fit border border-[var(--border)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={(e) => handleVote(e, 1)}
          aria-label="Upvote"
          className={cn(
            'vote-btn p-1 rounded-lg hover:bg-teal-500/10 text-[var(--text-muted)] transition',
            votes.mine === 1 && 'text-teal-400 bg-teal-500/15'
          )}
        >
          <ArrowBigUp className="w-5 h-5 sm:w-6 sm:h-6" fill={votes.mine === 1 ? 'currentColor' : 'none'} />
        </button>

        <span
          className={cn(
            'text-xs sm:text-sm font-bold my-0.5 tracking-tight',
            votes.mine === 1 && 'text-teal-400',
            votes.mine === -1 && 'text-rose-400',
            votes.mine === 0 && 'text-[var(--text)]'
          )}
        >
          {score}
        </span>

        <button
          type="button"
          onClick={(e) => handleVote(e, -1)}
          aria-label="Downvote"
          className={cn(
            'vote-btn p-1 rounded-lg hover:bg-rose-500/10 text-[var(--text-muted)] transition',
            votes.mine === -1 && 'text-rose-400 bg-rose-500/15'
          )}
        >
          <ArrowBigDown className="w-5 h-5 sm:w-6 sm:h-6" fill={votes.mine === -1 ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          {/* Metadata Row: Community Channel + Flair + Author + Time */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[var(--text-muted)] mb-1.5">
            <span
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/community?channel=${channel.key}`)
              }}
              className="font-bold text-teal-400 hover:text-teal-300 transition hover:underline"
            >
              {channel.sub}
            </span>

            <span>•</span>

            <span className={cn('px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold border', postTypeInfo.badgeClass)}>
              {postTypeInfo.flair}
            </span>

            <span>•</span>

            <span className="flex items-center gap-1">
              <img
                src={post.author?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'}
                alt=""
                className="w-4 h-4 rounded-full"
              />
              <span className="hover:text-[var(--text)] transition">{post.author?.displayName || 'Anonymous'}</span>
            </span>

            <span>•</span>
            <span>{timeAgo(post.createdAt)}</span>
          </div>

          {/* Post Title */}
          <h3 className="font-display text-base sm:text-lg font-bold text-[var(--text)] group-hover:text-teal-300 transition-colors line-clamp-2 leading-snug">
            {post.title}
          </h3>

          {/* Post Body Snippet */}
          {!compact && (
            <div className="mt-2 text-xs sm:text-sm text-[var(--text-muted)] line-clamp-2 prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{post.body}</ReactMarkdown>
            </div>
          )}

          {/* Linked Media Badge (if any) */}
          {post.media && (
            <div
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/media/${post.media.id}`)
              }}
              className="mt-3 inline-flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-black/15 dark:bg-white/5 border border-[var(--border)] hover:border-teal-400/40 text-xs transition"
            >
              <img src={post.media.coverImageUrl} alt="" className="w-5 h-7 object-cover rounded" />
              <span className="font-medium text-[var(--text)]">{post.media.title}</span>
              <span className="text-[10px] text-[var(--text-muted)] uppercase">({post.media.type})</span>
              <ExternalLink className="w-3 h-3 text-[var(--text-muted)] ml-1" />
            </div>
          )}

          {/* Tag Pills */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {tags.map((t) => (
                <span
                  key={t}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/community?tag=${t}`)
                  }}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/10 dark:bg-white/5 hover:bg-teal-500/15 hover:text-teal-300 border border-[var(--border)] text-[var(--text-muted)] transition"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Bar Footer */}
        <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-[var(--border)]/60 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5 font-medium hover:text-[var(--text)] transition">
            <MessageSquare className="w-4 h-4 text-teal-400" />
            <span>{post.commentCount || 0} Comments</span>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1 hover:text-[var(--text)] transition"
            title="Share post"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-teal-400" />
                <span className="text-teal-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={toggleSave}
            className={cn('flex items-center gap-1 hover:text-[var(--text)] transition', saved && 'text-teal-400')}
            title="Save post"
          >
            <Bookmark className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
            <span className="hidden sm:inline">{saved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>
    </article>
  )
}
