import { useEffect, useState } from 'react'
import { mediaApi, authApi, listApi } from '@/services/api'
import { useAuthStore } from '@/store'
import { MediaGrid } from '@/components/media/MediaCard'
import { Button, Input, Label, Textarea } from '@/components/ui'
import EmptyState from '@/components/ui/EmptyState'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'favorites', label: 'Favorites' },
  { key: 'PLAN_TO_WATCH', label: 'Plan to watch' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'ON_HOLD', label: 'On hold' },
  { key: 'DROPPED', label: 'Dropped' },
]

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const [tab, setTab] = useState('library')
  const [items, setItems] = useState([])
  const [lists, setLists] = useState([])
  const [activeList, setActiveList] = useState(null)
  const [listItems, setListItems] = useState([])
  const [newListName, setNewListName] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    displayName: user?.displayName || '',
    favoriteQuote: user?.favoriteQuote || '',
    avatarUrl: user?.avatarUrl || '',
  })

  useEffect(() => {
    if (!user) return
    setLoading(true)
    mediaApi
      .library(filter)
      .then((r) => setItems(r.data.items || []))
      .finally(() => setLoading(false))
  }, [user, filter])

  useEffect(() => {
    if (!user || tab !== 'lists') return
    listApi.list().then((r) => setLists(r.data.lists || []))
  }, [user, tab])

  if (!user) {
    return <div className="p-10 text-center text-[var(--text-muted)]">Sign in to view your profile.</div>
  }

  async function saveProfile(e) {
    e.preventDefault()
    const { data } = await authApi.updateProfile(form)
    setUser(data.user)
  }

  function handleLibraryUpdate(updated) {
    setItems((prev) => {
      const matches =
        filter === 'all'
          ? true
          : filter === 'favorites'
            ? updated.interaction?.isFavorite
            : updated.interaction?.wishlistStatus === filter

      if (!matches) return prev.filter((i) => i.id !== updated.id)
      const exists = prev.some((i) => i.id === updated.id)
      if (!exists) return [updated, ...prev]
      return prev.map((i) => (i.id === updated.id ? updated : i))
    })
  }

  async function createList(e) {
    e.preventDefault()
    if (!newListName.trim()) return
    await listApi.create({ name: newListName.trim() })
    setNewListName('')
    const r = await listApi.list()
    setLists(r.data.lists || [])
  }

  async function openList(id) {
    setActiveList(id)
    const r = await listApi.get(id)
    setListItems(r.data.list?.items || [])
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="glass rounded-3xl p-6 flex flex-col sm:flex-row gap-5 items-start mb-8">
        <img
          src={user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
          alt=""
          className="w-24 h-24 rounded-2xl bg-slate-800"
        />
        <div>
          <h1 className="font-display text-3xl font-bold">{user.displayName}</h1>
          <p className="text-[var(--text-muted)] text-sm">{user.email}</p>
          {user.favoriteQuote && (
            <p className="mt-2 italic text-[var(--text-muted)]">“{user.favoriteQuote}”</p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            {(user.tasteProfile?.formats || []).map((f) => (
              <span key={f} className="text-xs px-2 py-1 rounded-lg bg-teal-500/10 text-teal-300">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {['library', 'lists', 'settings'].map((t) => (
          <Button key={t} variant={tab === t ? 'primary' : 'ghost'} size="sm" onClick={() => setTab(t)}>
            {t}
          </Button>
        ))}
      </div>

      {tab === 'library' && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {FILTERS.map((f) => (
              <Button
                key={f.key}
                size="sm"
                variant={filter === f.key ? 'secondary' : 'ghost'}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </Button>
            ))}
          </div>
          {!loading && items.length === 0 ? (
            <EmptyState
              title="Your library is empty"
              description="Open any title and tap Favorite or a status like Plan to watch / Completed — it will land here."
              actionLabel="Browse movies"
              actionTo="/browse/MOVIE"
            />
          ) : (
            <MediaGrid items={items} loading={loading} onUpdate={handleLibraryUpdate} />
          )}
        </>
      )}

      {tab === 'lists' && (
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <div className="space-y-4">
            <form onSubmit={createList} className="glass rounded-2xl p-4 space-y-2">
              <Label>New custom list</Label>
              <Input
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Co-op night, Exam week…"
              />
              <Button type="submit" size="sm" className="w-full">
                Create list
              </Button>
            </form>
            <div className="space-y-2">
              {lists.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => openList(l.id)}
                  className={`w-full text-left glass rounded-xl p-3 hover:border-teal-400/30 border border-transparent ${
                    activeList === l.id ? 'border-teal-400/40 bg-teal-500/10' : ''
                  }`}
                >
                  <p className="font-medium text-sm">{l.name}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">{l.itemCount} titles</p>
                </button>
              ))}
              {!lists.length && (
                <p className="text-sm text-[var(--text-muted)] px-1">
                  No custom lists yet. Create one, then add titles from any media page.
                </p>
              )}
            </div>
          </div>
          <div>
            {activeList ? (
              listItems.length ? (
                <MediaGrid
                  items={listItems}
                  onUpdate={(u) => setListItems((prev) => prev.map((i) => (i.id === u.id ? u : i)))}
                />
              ) : (
                <EmptyState
                  title="This list is empty"
                  description="Open a movie or game detail page and use “Add to list”."
                  actionLabel="Browse games"
                  actionTo="/browse/GAME"
                />
              )
            ) : (
              <EmptyState
                title="Select a list"
                description="Choose a list on the left, or create one for themed collections."
              />
            )}
            {activeList && (
              <Button
                variant="danger"
                size="sm"
                className="mt-4"
                onClick={async () => {
                  await listApi.remove(activeList)
                  setActiveList(null)
                  setListItems([])
                  const r = await listApi.list()
                  setLists(r.data.lists || [])
                }}
              >
                Delete list
              </Button>
            )}
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <form onSubmit={saveProfile} className="glass rounded-2xl p-6 max-w-lg space-y-4">
          <div>
            <Label>Display name</Label>
            <Input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
          </div>
          <div>
            <Label>Avatar URL</Label>
            <Input value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} />
          </div>
          <div>
            <Label>Favorite quote</Label>
            <Textarea
              value={form.favoriteQuote}
              onChange={(e) => setForm({ ...form, favoriteQuote: e.target.value })}
            />
          </div>
          <Button type="submit">Save profile</Button>
        </form>
      )}
    </div>
  )
}
