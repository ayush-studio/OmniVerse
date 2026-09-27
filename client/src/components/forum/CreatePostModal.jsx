import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageSquare, HelpCircle, Flame, Sparkles, Tag, Search, Check, AlertCircle } from 'lucide-react'
import { Button, Input, Textarea, Label } from '@/components/ui'
import { COMMUNITY_CHANNELS, POST_TYPES } from '@/utils/cn'
import { forumApi, mediaApi } from '@/services/api'
import { useAuthStore } from '@/store'
import ReactMarkdown from 'react-markdown'

export default function CreatePostModal({ isOpen, onClose, onCreated, initialCategory = 'GENERAL' }) {
  const user = useAuthStore((s) => s.user)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState(initialCategory === 'ALL' ? 'GENERAL' : initialCategory)
  const [postType, setPostType] = useState('DISCUSSION')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState([])
  const [mediaSearch, setMediaSearch] = useState('')
  const [mediaResults, setMediaResults] = useState([])
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialCategory && initialCategory !== 'ALL') {
      setCategory(initialCategory)
    }
  }, [initialCategory])

  useEffect(() => {
    if (!mediaSearch.trim()) {
      setMediaResults([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await mediaApi.search(mediaSearch.trim())
        setMediaResults(data.items?.slice(0, 5) || [])
      } catch (err) {
        console.error(err)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [mediaSearch])

  function addTag(tagToAdd) {
    const clean = tagToAdd.trim().replace(/^#/, '')
    if (clean && !tags.includes(clean) && tags.length < 5) {
      setTags([...tags, clean])
      setTagInput('')
    }
  }

  function removeTag(tagToRemove) {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Please provide a descriptive title.')
      return
    }
    if (!body.trim()) {
      setError('Please write some content or your question.')
      return
    }
    if (!user) {
      setError('You must be signed in to create a discussion or ask a question.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const payload = {
        title: title.trim(),
        body: body.trim(),
        category,
        postType,
        tags,
        mediaId: selectedMedia?.id || null,
      }
      const { data } = await forumApi.createGeneralPost(payload)
      onCreated?.(data.post)
      onClose()
      // reset
      setTitle('')
      setBody('')
      setTags([])
      setSelectedMedia(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit post. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="relative w-full max-w-2xl my-auto glass-card rounded-2xl p-5 sm:p-6 shadow-2xl border border-[var(--border)] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-[var(--text)]">Create Discussion / Ask Question</h2>
                <p className="text-xs text-[var(--text-muted)]">Share theories, debates, questions on games, movies, songs, sports & more</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Category Channel & Post Type Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Community Channel</Label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 rounded-xl border border-[var(--border)] bg-black/10 dark:bg-white/5 px-3 text-xs sm:text-sm text-[var(--text)] outline-none focus:border-teal-400"
                >
                  {COMMUNITY_CHANNELS.filter((c) => c.key !== 'ALL').map((c) => (
                    <option key={c.key} value={c.key} className="bg-slate-900 text-white">
                      {c.sub} · {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Post Flair / Type</Label>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {POST_TYPES.map((pt) => {
                    const isSelected = postType === pt.key
                    return (
                      <button
                        type="button"
                        key={pt.key}
                        onClick={() => setPostType(pt.key)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                          isSelected
                            ? pt.badgeClass + ' ring-1 ring-teal-400'
                            : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5'
                        }`}
                      >
                        {pt.flair}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Title Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="mb-0">Title</Label>
                <span className="text-[11px] text-[var(--text-muted)]">{title.length}/180</span>
              </div>
              <Input
                placeholder="What do you want to ask or debate? Keep it interesting..."
                maxLength={180}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Optional Media Link */}
            <div>
              <Label>Optional: Link a Game, Movie, Album, or Series</Label>
              {selectedMedia ? (
                <div className="flex items-center justify-between p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-xs">
                  <div className="flex items-center gap-2">
                    <img src={selectedMedia.coverImageUrl} alt="" className="w-8 h-10 object-cover rounded" />
                    <div>
                      <span className="font-semibold text-teal-300">{selectedMedia.title}</span>
                      <span className="text-[var(--text-muted)] ml-2">({selectedMedia.type})</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedMedia(null)}
                    className="text-[var(--text-muted)] hover:text-rose-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    placeholder="Search catalog to attach (e.g. Elden Ring, Dune, Breaking Bad)..."
                    value={mediaSearch}
                    onChange={(e) => setMediaSearch(e.target.value)}
                    className="text-xs"
                  />
                  {mediaResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-30 mt-1 glass rounded-xl border border-[var(--border)] shadow-xl overflow-hidden">
                      {mediaResults.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedMedia(item)
                            setMediaSearch('')
                            setMediaResults([])
                          }}
                          className="w-full p-2 flex items-center gap-2 text-left text-xs hover:bg-teal-500/15 transition border-b border-[var(--border)] last:border-none"
                        >
                          <img src={item.coverImageUrl} alt="" className="w-6 h-8 object-cover rounded" />
                          <span className="font-medium text-[var(--text)]">{item.title}</span>
                          <span className="text-[var(--text-muted)] text-[11px] ml-auto">{item.type}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Body with Markdown and Preview Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="mb-0">Content / Question Details (Markdown supported)</Label>
                <div className="flex gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewMode(false)}
                    className={`px-2.5 py-0.5 rounded-md font-medium transition ${
                      !previewMode ? 'bg-teal-500/20 text-teal-300' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(true)}
                    className={`px-2.5 py-0.5 rounded-md font-medium transition ${
                      previewMode ? 'bg-teal-500/20 text-teal-300' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    Preview
                  </button>
                </div>
              </div>

              {previewMode ? (
                <div className="min-h-[120px] max-h-[220px] overflow-y-auto p-3 rounded-xl border border-[var(--border)] bg-black/15 dark:bg-white/5 text-xs text-[var(--text)] prose prose-invert prose-xs">
                  {body.trim() ? <ReactMarkdown>{body}</ReactMarkdown> : <span className="text-[var(--text-muted)]">Nothing to preview yet.</span>}
                </div>
              ) : (
                <Textarea
                  placeholder="Elaborate on your thought, describe context, share arguments or questions..."
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                />
              )}
            </div>

            {/* Tags builder */}
            <div>
              <Label>Tags (up to 5)</Label>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-teal-500/15 text-teal-300 border border-teal-500/30"
                  >
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag (e.g. PremierLeague, EldenRing, PlotTwist)..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag(tagInput)
                    }
                  }}
                  className="text-xs h-9"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addTag(tagInput)}
                  disabled={!tagInput.trim() || tags.length >= 5}
                >
                  <Tag className="w-3.5 h-3.5" /> Add
                </Button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
              <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !title.trim() || !body.trim()}>
                {submitting ? 'Posting…' : 'Publish Discussion'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
