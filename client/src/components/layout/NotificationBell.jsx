import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { notificationApi } from '@/services/api'
import { useAuthStore, useNotificationStore, useUiStore } from '@/store'
import { useSocket } from '@/context/SocketContext'
import { Button } from '@/components/ui'
import { cn } from '@/utils/cn'

export default function NotificationBell() {
  const user = useAuthStore((s) => s.user)
  const { items, unread, setNotifications, prepend, markAllReadLocal } = useNotificationStore()
  const { socket } = useSocket()
  const { setChatOpen } = useUiStore()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    notificationApi.list().then((r) => {
      setNotifications(r.data.notifications || [], r.data.unread || 0)
    })
  }, [user, setNotifications])

  useEffect(() => {
    if (!socket) return
    const onNotif = (notif) => prepend(notif)
    socket.on('notification', onNotif)
    return () => socket.off('notification', onNotif)
  }, [socket, prepend])

  if (!user) return null

  async function markAll() {
    await notificationApi.markRead({ all: true })
    markAllReadLocal()
  }

  function openItem(n) {
    setOpen(false)
    if (n.type === 'SUPPORT') {
      if (user.role === 'ADMIN' || user.role === 'SUPPORT_AGENT') navigate('/admin')
      else setChatOpen(true)
      return
    }
    if (n.link) navigate(n.link)
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)} aria-label="Notifications">
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-400 px-1 text-[10px] font-bold text-slate-950">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </Button>

      {open && (
        <>
          <button type="button" className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-label="Close" />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-[var(--border)] bg-[#0f172a] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2">
              <p className="text-sm font-medium">Notifications</p>
              {unread > 0 && (
                <button type="button" className="text-[11px] text-teal-300" onClick={markAll}>
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto scrollbar-thin">
              {items.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">You're all caught up.</p>
              )}
              {items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => openItem(n)}
                  className={cn(
                    'w-full border-b border-[var(--border)] px-3 py-3 text-left hover:bg-white/5',
                    !n.isRead && 'bg-teal-500/5'
                  )}
                >
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-[var(--text-muted)]">{n.body}</p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
