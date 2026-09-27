import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { ArrowBigUp, ArrowBigDown, MessageSquare, ChevronDown, ChevronRight, CornerDownRight } from 'lucide-react'
import { forumApi } from '@/services/api'
import { useAuthStore } from '@/store'
import { Button, Textarea } from '@/components/ui'
import { cn } from '@/utils/cn'
import RedditPostCard from './RedditPostCard'

export const PostCard = RedditPostCard


export function CommentTree({ comments, onReply, opAuthorId, depth = 0 }) {
  if (!comments?.length) return null
  return (
    <div className={cn('space-y-3', depth > 0 && 'ml-2 sm:ml-4 pl-2 sm:pl-3 border-l-2 border-[var(--border)]')}>
      {comments.map((c) => (
        <CommentNode key={c.id} comment={c} onReply={onReply} opAuthorId={opAuthorId} depth={depth} />
      ))}
    </div>
  )
}

export function CommentNode({ comment, onReply, opAuthorId, depth }) {
  const user = useAuthStore((s) => s.user)
  const [votes, setVotes] = useState(comment.upvotes || 0)
  const [mine, setMine] = useState(comment.userVote || 0)
  const [replying, setReplying] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isOP = opAuthorId && comment.author?.id === opAuthorId

  async function vote(value) {
    if (!user) return
    const next = mine === value ? 0 : value
    // optimistic
    let newV = votes
    if (mine === 1) newV -= 1
    if (next === 1) newV += 1
    setVotes(Math.max(0, newV))
    setMine(next)

    try {
      const { data } = await forumApi.voteComment(comment.id, next)
      setVotes(data.comment.upvotes)
      setMine(data.comment.userVote)
    } catch {
      setVotes(comment.upvotes || 0)
      setMine(comment.userVote || 0)
    }
  }

  function timeAgo(dateString) {
    const diff = (Date.now() - new Date(dateString).getTime()) / 1000
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div className="group relative">
      <div className="flex gap-2.5 sm:gap-3">
        {/* Comment Author Avatar */}
        <img
          src={comment.author?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'}
          alt=""
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full shrink-0 mt-0.5 border border-[var(--border)]"
        />

        {/* Comment Main Bubble */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-1">
            <span className="font-bold text-[var(--text)]">{comment.author?.displayName || 'Anonymous'}</span>
            {isOP && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                OP
              </span>
            )}
            <span>•</span>
            <span>{timeAgo(comment.createdAt)}</span>

            {/* Collapse toggle */}
            {comment.replies?.length > 0 && (
              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                className="text-[10px] text-[var(--text-muted)] hover:text-teal-300 ml-auto flex items-center gap-0.5"
              >
                {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                <span>{collapsed ? `[+${comment.replies.length} replies]` : 'collapse'}</span>
              </button>
            )}
          </div>

          {!collapsed && (
            <>
              <p className="text-xs sm:text-sm text-[var(--text)] whitespace-pre-wrap leading-relaxed">
                {comment.content}
              </p>

              {/* Comment Actions: Upvote, Reply */}
              <div className="flex items-center gap-3 mt-1.5 text-xs text-[var(--text-muted)]">
                <button
                  type="button"
                  onClick={() => vote(1)}
                  className={cn(
                    'inline-flex items-center gap-1 hover:text-teal-300 transition py-0.5 px-1 rounded',
                    mine === 1 && 'text-teal-400 font-bold bg-teal-500/10'
                  )}
                >
                  <ArrowBigUp className="w-4 h-4" fill={mine === 1 ? 'currentColor' : 'none'} />
                  <span>{votes}</span>
                </button>

                {user && depth < 6 && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 hover:text-teal-300 transition"
                    onClick={() => setReplying((v) => !v)}
                  >
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>Reply</span>
                  </button>
                )}
              </div>

              {/* In-place reply composer */}
              {replying && (
                <div className="mt-2.5 space-y-2 p-3 rounded-xl bg-black/15 dark:bg-white/5 border border-[var(--border)]">
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={2}
                    placeholder={`Reply to ${comment.author?.displayName}…`}
                    className="text-xs"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setText('')
                        setReplying(false)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      disabled={submitting || !text.trim()}
                      onClick={async () => {
                        setSubmitting(true)
                        try {
                          await onReply?.(comment.id, text)
                          setText('')
                          setReplying(false)
                        } finally {
                          setSubmitting(false)
                        }
                      }}
                    >
                      {submitting ? 'Posting…' : 'Post Reply'}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {!collapsed && comment.replies?.length > 0 && (
        <div className="mt-2.5">
          <CommentTree
            comments={comment.replies}
            onReply={onReply}
            opAuthorId={opAuthorId}
            depth={depth + 1}
          />
        </div>
      )}
    </div>
  )
}
