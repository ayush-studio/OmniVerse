import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { ArrowBigUp, ArrowBigDown, MessageSquare } from 'lucide-react'
import { forumApi } from '@/services/api'
import { useAuthStore } from '@/store'
import { Button, Textarea } from '@/components/ui'
import { cn } from '@/utils/cn'

export function PostCard({ post, onOpen }) {
  const user = useAuthStore((s) => s.user)
  const [votes, setVotes] = useState({
    up: post.upvotesCount,
    down: post.downvotesCount,
    mine: post.userVote || 0,
  })

  async function vote(value) {
    if (!user) return
    const next = votes.mine === value ? 0 : value
    const { data } = await forumApi.votePost(post.id, next)
    setVotes({
      up: data.post.upvotesCount,
      down: data.post.downvotesCount,
      mine: data.post.userVote,
    })
  }

  return (
    <article className="glass rounded-2xl p-4 flex gap-3 glow-border">
      <div className="flex flex-col items-center gap-1 text-[var(--text-muted)]">
        <button onClick={() => vote(1)} className={cn(votes.mine === 1 && 'text-teal-400')}>
          <ArrowBigUp className="w-6 h-6" />
        </button>
        <span className="text-sm font-semibold text-[var(--text)]">{votes.up - votes.down}</span>
        <button onClick={() => vote(-1)} className={cn(votes.mine === -1 && 'text-rose-400')}>
          <ArrowBigDown className="w-6 h-6" />
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <button onClick={() => onOpen?.(post)} className="text-left w-full">
          <h3 className="font-display font-semibold hover:text-teal-300 transition">{post.title}</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            by {post.author?.displayName} · {new Date(post.createdAt).toLocaleDateString()} ·{' '}
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> {post.commentCount || 0}
            </span>
          </p>
          <div className="prose prose-invert prose-sm max-w-none mt-2 text-[var(--text-muted)] line-clamp-3">
            <ReactMarkdown>{post.body}</ReactMarkdown>
          </div>
        </button>
      </div>
    </article>
  )
}

export function CommentTree({ comments, onReply, depth = 0 }) {
  if (!comments?.length) return null
  return (
    <div className={cn('space-y-3', depth > 0 && 'ml-4 pl-3 border-l border-[var(--border)]')}>
      {comments.map((c) => (
        <CommentNode key={c.id} comment={c} onReply={onReply} depth={depth} />
      ))}
    </div>
  )
}

function CommentNode({ comment, onReply, depth }) {
  const user = useAuthStore((s) => s.user)
  const [votes, setVotes] = useState(comment.upvotes || 0)
  const [mine, setMine] = useState(comment.userVote || 0)
  const [replying, setReplying] = useState(false)
  const [text, setText] = useState('')

  async function vote(value) {
    if (!user) return
    const next = mine === value ? 0 : value
    const { data } = await forumApi.voteComment(comment.id, next)
    setVotes(data.comment.upvotes)
    setMine(data.comment.userVote)
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex flex-col items-center text-[var(--text-muted)] pt-1">
          <button onClick={() => vote(1)} className={cn('text-xs', mine === 1 && 'text-teal-400')}>
            ▲
          </button>
          <span className="text-[11px]">{votes}</span>
        </div>
        <div className="flex-1">
          <p className="text-xs text-[var(--text-muted)]">
            {comment.author?.displayName} · {new Date(comment.createdAt).toLocaleString()}
          </p>
          <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
          {user && depth < 6 && (
            <button
              className="text-xs text-teal-400 mt-1"
              onClick={() => setReplying((v) => !v)}
            >
              Reply
            </button>
          )}
          {replying && (
            <div className="mt-2 space-y-2">
              <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} />
              <Button
                size="sm"
                onClick={async () => {
                  await onReply?.(comment.id, text)
                  setText('')
                  setReplying(false)
                }}
              >
                Post reply
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="mt-3">
        <CommentTree comments={comment.replies} onReply={onReply} depth={depth + 1} />
      </div>
    </div>
  )
}
