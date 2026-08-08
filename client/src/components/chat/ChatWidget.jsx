import { useEffect, useRef, useState } from 'react'
import { X, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocket } from '@/context/SocketContext'
import { useAuthStore, useUiStore } from '@/store'
import { chatApi } from '@/services/api'
import { Button, Input } from '@/components/ui'

export default function ChatWidget() {
  const { chatOpen, setChatOpen } = useUiStore()
  const user = useAuthStore((s) => s.user)
  const { socket, connected } = useSocket()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(null)
  const bottomRef = useRef(null)
  const roomId = `support:${user?.id}`

  useEffect(() => {
    if (!chatOpen || !user) return
    chatApi.history().then((r) => setMessages(r.data.messages || []))
  }, [chatOpen, user])

  useEffect(() => {
    if (!socket) return
    const onMsg = (msg) => {
      if (msg.roomId === roomId) {
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
      }
    }
    const onTyping = (payload) => {
      if (payload.roomId === roomId && payload.userId !== user.id) {
        setTyping(payload.displayName)
        setTimeout(() => setTyping(null), 2000)
      }
    }
    socket.on('support_message', onMsg)
    socket.on('typing', onTyping)
    return () => {
      socket.off('support_message', onMsg)
      socket.off('typing', onTyping)
    }
  }, [socket, roomId, user?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chatOpen])

  function send() {
    const message = text.trim()
    if (!message || !socket) return
    setText('')
    socket.emit('support_message', { message }, () => {})
  }

  return (
    <AnimatePresence>
      {chatOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          className="fixed bottom-4 right-4 z-50 w-[min(100vw-2rem,380px)] h-[480px] glass rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-teal-500/20"
        >
          <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between bg-teal-500/10">
            <div>
              <p className="font-display font-semibold text-sm">Live Support</p>
              <p className="text-[11px] text-[var(--text-muted)]">
                {connected ? 'Connected' : 'Connecting…'}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setChatOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
            {messages.map((m) => {
              const mine = m.senderId === user.id
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      mine ? 'bg-teal-500 text-slate-950' : 'bg-white/10'
                    }`}
                  >
                    {!mine && (
                      <p className="text-[10px] opacity-70 mb-0.5">{m.sender?.displayName || 'Support'}</p>
                    )}
                    {m.message}
                  </div>
                </div>
              )
            })}
            {typing && <p className="text-xs text-[var(--text-muted)]">{typing} is typing…</p>}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-[var(--border)] flex gap-2">
            <Input
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                socket?.emit('typing', {})
              }}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask support…"
            />
            <Button onClick={send} disabled={!text.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
