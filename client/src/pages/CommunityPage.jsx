import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Flame,
  Zap,
  Trophy,
  MessageSquare,
  HelpCircle,
  Plus,
  Search,
  Filter,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react'
import { Button, Input, Skeleton } from '@/components/ui'
import EmptyState from '@/components/ui/EmptyState'
import RedditPostCard from '@/components/forum/RedditPostCard'
import CommunitySidebar from '@/components/forum/CommunitySidebar'
import CreatePostModal from '@/components/forum/CreatePostModal'
import CommunityDebatePoll from '@/components/forum/CommunityDebatePoll'
import { COMMUNITY_CHANNELS, POST_TYPES } from '@/utils/cn'
import { forumApi } from '@/services/api'
import { useAuthStore } from '@/store'

export default function CommunityPage() {
  const user = useAuthStore((s) => s.user)
  const [searchParams, setSearchParams] = useSearchParams()

  const activeChannel = searchParams.get('channel') || 'ALL'
  const activeSort = searchParams.get('sort') || 'hot'
  const activeType = searchParams.get('type') || 'ALL'
  const activeTag = searchParams.get('tag') || ''
  const searchQuery = searchParams.get('q') || ''

  const [posts, setPosts] = useState([])
  const [trending, setTrending] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(searchQuery)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  const loadPosts = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        category: activeChannel === 'ALL' ? undefined : activeChannel,
        sort: activeSort,
        postType: activeType === 'ALL' ? undefined : activeType,
        search: searchQuery || undefined,
        tag: activeTag || undefined,
        page,
        limit: 15,
      }
      const { data } = await forumApi.listAllPosts(params)
      setPosts(data.posts || [])
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [activeChannel, activeSort, activeType, searchQuery, activeTag, page])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  useEffect(() => {
    forumApi
      .getTrending()
      .then((res) => {
        setTrending(res.data.trending || [])
        setStats(res.data.stats || null)
      })
      .catch((e) => console.error(e))
  }, [])

  function updateFilter(updates) {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([k, v]) => {
      if (!v || v === 'ALL') {
        next.delete(k)
      } else {
        next.set(k, v)
      }
    })
    setPage(1)
    setSearchParams(next)
  }

  function handleSearchSubmit(e) {
    e.preventDefault()
    updateFilter({ q: searchInput.trim() })
  }

  const sortTabs = [
    { key: 'hot', label: 'Hot', icon: Flame },
    { key: 'new', label: 'New', icon: Zap },
    { key: 'top', label: 'Top', icon: Trophy },
    { key: 'comments', label: 'Most Discussed', icon: MessageSquare },
    { key: 'unanswered', label: 'Unanswered', icon: HelpCircle },
  ]

  const currentChannelInfo =
    COMMUNITY_CHANNELS.find((c) => c.key === activeChannel) || COMMUNITY_CHANNELS[0]

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 py-6 sm:py-8 mobile-safe-bottom">
      {/* Community Banner */}
      <section className="relative overflow-hidden rounded-3xl glass p-6 sm:p-8 mb-6 border border-[var(--border)] glow-border">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-gradient-to-br from-teal-500/20 to-cyan-500/0 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Community & Debates</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)]">
              {currentChannelInfo.label}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[var(--text-muted)] max-w-2xl">
              {currentChannelInfo.desc}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              onClick={() => setModalOpen(true)}
              className="gap-2 shadow-lg shadow-teal-500/25 px-5 h-11"
            >
              <Plus className="w-4 h-4" /> Ask or Discuss
            </Button>
          </div>
        </div>

        {/* Channel Horizontal Navigation Bar */}
        <div className="mt-6 pt-5 border-t border-[var(--border)] flex gap-2 overflow-x-auto scrollbar-thin pb-1">
          {COMMUNITY_CHANNELS.map((ch) => {
            const isSelected = activeChannel === ch.key
            return (
              <button
                key={ch.key}
                type="button"
                onClick={() => updateFilter({ channel: ch.key })}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                    : 'bg-black/10 dark:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/10'
                }`}
              >
                <span>{ch.sub}</span>
                <span className="hidden sm:inline font-normal opacity-80">· {ch.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Main Two-Column Layout (Feed on Left, Reddit Sidebar on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Feed Column */}
        <div className="lg:col-span-8 space-y-4">
          {/* Interactive Community Live Debate Poll */}
          <CommunityDebatePoll />

          {/* Controls Bar: Sort Tabs + Type Filter + Discussion Search */}
          <div className="glass-card rounded-2xl p-3 sm:p-4 border border-[var(--border)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Sort Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin pb-1 sm:pb-0">
              {sortTabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeSort === tab.key
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => updateFilter({ sort: tab.key })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      isActive
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                        : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Type Filter Select & Search */}
            <div className="flex items-center gap-2">
              <select
                value={activeType}
                onChange={(e) => updateFilter({ type: e.target.value })}
                className="h-9 rounded-xl border border-[var(--border)] bg-black/10 dark:bg-white/5 px-2.5 text-xs text-[var(--text)] outline-none focus:border-teal-400"
              >
                <option value="ALL" className="bg-slate-900 text-white">All Post Types</option>
                {POST_TYPES.map((pt) => (
                  <option key={pt.key} value={pt.key} className="bg-slate-900 text-white">
                    {pt.flair}
                  </option>
                ))}
              </select>

              <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-44">
                <input
                  type="text"
                  placeholder="Search debates…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full h-9 rounded-xl border border-[var(--border)] bg-black/10 dark:bg-white/5 pl-8 pr-2 text-xs text-[var(--text)] outline-none focus:border-teal-400"
                />
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              </form>
            </div>
          </div>

          {/* Active Tag Filter Banner */}
          {activeTag && (
            <div className="flex items-center justify-between p-2.5 px-4 rounded-xl bg-teal-500/10 border border-teal-500/30 text-xs">
              <span className="text-teal-300">
                Filtered by tag: <strong>#{activeTag}</strong>
              </span>
              <button
                type="button"
                onClick={() => updateFilter({ tag: '' })}
                className="text-xs text-[var(--text-muted)] hover:text-rose-400 font-medium"
              >
                Clear tag filter
              </button>
            </div>
          )}

          {/* Discussions Feed List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="p-4 rounded-2xl glass border border-[var(--border)] space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <EmptyState
              title="No discussions found"
              description={
                searchQuery || activeTag
                  ? 'No posts matched your current search filters. Try broadening your query.'
                  : 'Be the pioneer! Start the very first debate or ask a question in this channel.'
              }
              actionLabel="Start a Discussion"
              onAction={() => setModalOpen(true)}
            />
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <RedditPostCard
                  key={post.id}
                  post={post}
                  onVoteChange={(id, updated) => {
                    setPosts((prev) =>
                      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
                    )
                  }}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1))
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                Previous
              </Button>
              <span className="text-xs text-[var(--text-muted)]">
                Page {pagination.page} of {pagination.pages} ({pagination.total} discussions)
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= pagination.pages}
                onClick={() => {
                  setPage((p) => p + 1)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Right Sticky Sidebar (Desktop & Tablet) */}
        <div className="lg:col-span-4 desktop-sticky-sidebar">
          <CommunitySidebar
            activeChannel={activeChannel}
            onSelectChannel={(ch) => updateFilter({ channel: ch })}
            onOpenCreateModal={() => setModalOpen(true)}
            trending={trending}
            stats={stats}
          />
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialCategory={activeChannel}
        onCreated={(newPost) => {
          setPosts((prev) => [newPost, ...prev])
        }}
      />
    </div>
  )
}
