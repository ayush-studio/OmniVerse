import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { mediaApi } from '@/services/api'
import { MediaGrid } from '@/components/media/MediaCard'
import { typeLabel, cn } from '@/utils/cn'
import { Input, Button, Select } from '@/components/ui'
import EmptyState from '@/components/ui/EmptyState'

const SORT_OPTIONS = [
  { value: 'rating', label: 'Top rated' },
  { value: 'year', label: 'Newest' },
  { value: 'title', label: 'Title' },
  { value: 'rank', label: 'Rank / Gross' },
]

export default function BrowsePage() {
  const { type } = useParams()
  const [params, setParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [genres, setGenres] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(params.get('q') || '')
  const [genre, setGenre] = useState(params.get('genre') || '')
  const [sort, setSort] = useState('rating')
  const page = Number(params.get('page') || 1)

  useEffect(() => {
    setGenre(params.get('genre') || '')
    setSearch(params.get('q') || '')
  }, [type])

  useEffect(() => {
    mediaApi.genres(type?.toUpperCase()).then((r) => setGenres((r.data.genres || []).slice(0, 18)))
  }, [type])

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      try {
        const { data } = await mediaApi.list({
          type: type?.toUpperCase(),
          search: search || undefined,
          genre: genre || undefined,
          sort,
          page,
          limit: 24,
        })
        if (!alive) return
        setItems(data.items)
        setPagination(data.pagination)
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [type, search, genre, sort, page])

  function goToPage(nextPage) {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(nextPage))
      if (genre) next.set('genre', genre)
      else next.delete('genre')
      if (search) next.set('q', search)
      return next
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function setGenreFilter(value) {
    const nextVal = genre === value ? '' : value
    setGenre(nextVal)
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', '1')
      if (nextVal) next.set('genre', nextVal)
      else next.delete('genre')
      return next
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold">{typeLabel(type?.toUpperCase())}</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Filter by genre, sort, then add titles to your library from any card
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            className="w-56"
            placeholder="Search titles…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setParams((prev) => {
                const next = new URLSearchParams(prev)
                next.set('page', '1')
                if (e.target.value) next.set('q', e.target.value)
                else next.delete('q')
                return next
              })
            }}
          />
          <Select
            className="w-44"
            value={sort}
            options={SORT_OPTIONS}
            onChange={(value) => {
              setSort(value)
              goToPage(1)
            }}
          />
        </div>
      </div>

      {genres.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            type="button"
            onClick={() => setGenreFilter('')}
            className={cn(
              'rounded-full px-3 py-1 text-xs border transition',
              !genre
                ? 'border-teal-400/50 bg-teal-500/15 text-teal-300'
                : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
            )}
          >
            All genres
          </button>
          {genres.map((g) => (
            <button
              key={g.name}
              type="button"
              onClick={() => setGenreFilter(g.name)}
              className={cn(
                'rounded-full px-3 py-1 text-xs border transition',
                genre === g.name
                  ? 'border-teal-400/50 bg-teal-500/15 text-teal-300'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
              )}
            >
              {g.name}
              <span className="ml-1 opacity-60">{g.count}</span>
            </button>
          ))}
        </div>
      )}

      {!loading && items.length === 0 ? (
        <EmptyState
          title="No titles match"
          description="Try clearing genre filters or searching a different keyword."
          actionLabel="Clear filters"
          onAction={() => {
            setGenre('')
            setSearch('')
            setParams({})
          }}
        />
      ) : (
        <MediaGrid
          items={items}
          loading={loading}
          onUpdate={(updated) => setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))}
        />
      )}

      <div className="flex justify-center gap-3 mt-10">
        <Button
          variant="secondary"
          disabled={pagination.page <= 1 || loading}
          onClick={() => goToPage(pagination.page - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-[var(--text-muted)] self-center">
          Page {pagination.page} / {pagination.pages || 1}
        </span>
        <Button
          variant="primary"
          disabled={pagination.page >= pagination.pages || loading}
          onClick={() => goToPage(pagination.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
