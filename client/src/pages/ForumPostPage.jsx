import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { forumApi } from '@/services/api'
import { useAuthStore } from '@/store'
import { CommentTree } from '@/components/forum/Forum'
import { Button, Textarea, Skeleton } from '@/components/ui'
import ReactMarkdown from 'react-markdown'

export default function ForumPostPage() {
  const { postId } = useParams()
  const user = useAuthStore((s) => s.user)
  const [data, setData] = useState(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const res = await forumApi.getPost(postId)
      setData(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [postId])

  async function addComment(parentCommentId, content) {
    const text = content ?? comment
    if (!text.trim()) return
    await forumApi.comment(postId, { content: text, parentCommentId })
    setComment('')
    await load()
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-3">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!data?.post) return <div className="p-10 text-center">Post not found</div>
  const { post } = data

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to={`/media/${post.media?.id}`} className="text-sm text-teal-400">
        ← {post.media?.title}
      </Link>
      <h1 className="font-display text-3xl font-bold mt-3">{post.title}</h1>
      <p className="text-xs text-[var(--text-muted)] mt-1">
        by {post.author?.displayName} · {new Date(post.createdAt).toLocaleString()}
      </p>
      <div className="prose prose-invert max-w-none mt-6 glass rounded-2xl p-5">
        <ReactMarkdown>{post.body}</ReactMarkdown>
      </div>

      <h2 className="font-display text-xl font-bold mt-10 mb-4">Comments</h2>
      {user && (
        <div className="space-y-2 mb-6">
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment…" />
          <Button onClick={() => addComment(null, comment)}>Comment</Button>
        </div>
      )}
      <CommentTree comments={post.comments} onReply={(parentId, text) => addComment(parentId, text)} />
    </div>
  )
}
