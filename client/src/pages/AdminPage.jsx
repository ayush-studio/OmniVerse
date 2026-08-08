import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { adminApi, chatApi } from '@/services/api'
import { useAuthStore } from '@/store'
import { useSocket } from '@/context/SocketContext'
import { Button, Input, Label, Textarea, Select } from '@/components/ui'

export default function AdminPage() {
  const user = useAuthStore((s) => s.user)
  const { socket } = useSocket()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [rooms, setRooms] = useState([])
  const [activeRoom, setActiveRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [reply, setReply] = useState('')
  const [mediaForm, setMediaForm] = useState({
    title: '',
    type: 'MOVIE',
    summary: '',
    releaseYear: new Date().getFullYear(),
    language: 'English',
    genreTags: '',
    averageRating: 8,
  })
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    if (user?.role !== 'ADMIN') return
    adminApi.stats().then((r) => setStats(r.data.stats))
    adminApi.users().then((r) => setUsers(r.data.users))
    chatApi.rooms().then((r) => setRooms(r.data.rooms || []))
  }, [user])

  useEffect(() => {
    if (!socket || user?.role !== 'ADMIN') return
    const onNotif = () => chatApi.rooms().then((r) => setRooms(r.data.rooms || []))
    const onMsg = (msg) => {
      if (activeRoom && msg.roomId === activeRoom) {
        setMessages((prev) => [...prev, msg])
      }
      onNotif()
    }
    socket.on('support_notification', onNotif)
    socket.on('support_message', onMsg)
    return () => {
      socket.off('support_notification', onNotif)
      socket.off('support_message', onMsg)
    }
  }, [socket, user, activeRoom])

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'ADMIN') {
    return <div className="p-10 text-center">Admin access required.</div>
  }

  async function openRoom(roomId) {
    setActiveRoom(roomId)
    socket?.emit('join_room', roomId)
    const { data } = await chatApi.history(roomId)
    setMessages(data.messages || [])
    await chatApi.markRead(roomId)
  }

  function sendReply() {
    if (!reply.trim() || !activeRoom || !socket) return
    socket.emit('support_message', { message: reply, roomId: activeRoom }, () => {})
    setReply('')
  }

  async function createMedia(e) {
    e.preventDefault()
    await adminApi.createMedia({
      ...mediaForm,
      releaseYear: Number(mediaForm.releaseYear),
      averageRating: Number(mediaForm.averageRating),
      genreTags: mediaForm.genreTags
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    })
    setMediaForm({
      title: '',
      type: 'MOVIE',
      summary: '',
      releaseYear: new Date().getFullYear(),
      language: 'English',
      genreTags: '',
      averageRating: 8,
    })
    const s = await adminApi.stats()
    setStats(s.data.stats)
    alert('Media created')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold mb-6">Admin dashboard</h1>
      <div className="flex flex-wrap gap-2 mb-6">
        {['overview', 'media', 'users', 'support'].map((t) => (
          <Button key={t} size="sm" variant={tab === t ? 'primary' : 'ghost'} onClick={() => setTab(t)}>
            {t}
          </Button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ['Users', stats.users],
            ['Media', stats.media],
            ['Forum posts', stats.posts],
            ['Chat messages', stats.messages],
          ].map(([label, value]) => (
            <div key={label} className="glass rounded-2xl p-5">
              <p className="text-sm text-[var(--text-muted)]">{label}</p>
              <p className="font-display text-3xl font-bold mt-1">{value}</p>
            </div>
          ))}
          <div className="glass rounded-2xl p-5 sm:col-span-2 lg:col-span-4">
            <p className="text-sm text-[var(--text-muted)] mb-3">By type</p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(stats.byType || {}).map(([k, v]) => (
                <span key={k} className="px-3 py-1 rounded-lg bg-white/5 text-sm">
                  {k}: {v}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'media' && (
        <form onSubmit={createMedia} className="glass rounded-2xl p-6 max-w-xl space-y-3">
          <h2 className="font-display text-xl font-bold">Add media entity</h2>
          <div>
            <Label>Title</Label>
            <Input
              value={mediaForm.title}
              onChange={(e) => setMediaForm({ ...mediaForm, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Type</Label>
            <Select
              value={mediaForm.type}
              onChange={(type) => setMediaForm({ ...mediaForm, type })}
              options={['MOVIE', 'SERIES', 'GAME', 'BOOK', 'MANGA', 'MUSIC_ALBUM'].map((t) => ({
                value: t,
                label: t,
              }))}
            />
          </div>
          <div>
            <Label>Summary</Label>
            <Textarea
              value={mediaForm.summary}
              onChange={(e) => setMediaForm({ ...mediaForm, summary: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Year</Label>
              <Input
                type="number"
                value={mediaForm.releaseYear}
                onChange={(e) => setMediaForm({ ...mediaForm, releaseYear: e.target.value })}
              />
            </div>
            <div>
              <Label>Rating</Label>
              <Input
                type="number"
                step="0.1"
                value={mediaForm.averageRating}
                onChange={(e) => setMediaForm({ ...mediaForm, averageRating: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Genre tags (comma separated)</Label>
            <Input
              value={mediaForm.genreTags}
              onChange={(e) => setMediaForm({ ...mediaForm, genreTags: e.target.value })}
            />
          </div>
          <Button type="submit">Create</Button>
        </form>
      )}

      {tab === 'users' && (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-[var(--border)]">
                  <td className="p-3">
                    <p>{u.displayName}</p>
                    <p className="text-xs text-[var(--text-muted)]">{u.email}</p>
                  </td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3">
                    <Select
                      className="min-w-[140px]"
                      value={u.role}
                      options={[
                        { value: 'USER', label: 'USER' },
                        { value: 'ADMIN', label: 'ADMIN' },
                        { value: 'SUPPORT_AGENT', label: 'SUPPORT_AGENT' },
                      ]}
                      onChange={async (role) => {
                        await adminApi.setRole(u.id, role)
                        const r = await adminApi.users()
                        setUsers(r.data.users)
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'support' && (
        <div className="grid lg:grid-cols-[280px_1fr] gap-4 min-h-[480px]">
          <div className="glass rounded-2xl overflow-hidden">
            <div className="p-3 border-b border-[var(--border)] font-medium text-sm">Support rooms</div>
            <div className="overflow-y-auto max-h-[440px]">
              {rooms.map((r) => (
                <button
                  key={r.roomId}
                  onClick={() => openRoom(r.roomId)}
                  className={`w-full text-left p-3 border-b border-[var(--border)] hover:bg-white/5 ${
                    activeRoom === r.roomId ? 'bg-teal-500/10' : ''
                  }`}
                >
                  <p className="text-sm font-medium">{r.user?.displayName || r.roomId}</p>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-1">{r.lastMessage}</p>
                </button>
              ))}
              {!rooms.length && <p className="p-4 text-sm text-[var(--text-muted)]">No chats yet</p>}
            </div>
          </div>
          <div className="glass rounded-2xl flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender?.role !== 'USER' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[75%] rounded-2xl px-3 py-2 text-sm bg-white/10">
                    <p className="text-[10px] opacity-60">{m.sender?.displayName}</p>
                    {m.message}
                  </div>
                </div>
              ))}
            </div>
            {activeRoom && (
              <div className="p-3 border-t border-[var(--border)] flex gap-2">
                <Input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                  placeholder="Reply as support…"
                />
                <Button onClick={sendReply}>Send</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
