import { useEffect, useRef, useState } from 'react'
import { X, Send, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocket } from '@/context/SocketContext'
import { useAuthStore, useUiStore } from '@/store'
import { chatApi } from '@/services/api'
import { Button, Input } from '@/components/ui'
import FloatingWidget from '@/components/ui/FloatingWidget'

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

    <>
      {/* Buoyant Zero-G Floating Launcher Icon */}
      {!chatOpen && user && (
        <div className="fixed bottom-6 right-6 z-40">
          <FloatingWidget isOpen={false} amplitude={5} duration={3.5}>
            <button
              onClick={() => setChatOpen(true)}
              className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-white dark:bg-slate-950/90 hover:bg-teal-50/80 dark:hover:bg-teal-950/40 border border-teal-500/40 text-teal-600 dark:text-teal-300 shadow-[0_8px_30px_rgba(20,184,166,0.2)] hover:shadow-[0_12px_40px_rgba(20,184,166,0.35)] transition-all duration-300 backdrop-blur-md"
              aria-label="Open Live Support"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-400" />
              </span>
              <MessageCircle className="w-4 h-4 text-teal-600 dark:text-teal-300 transition-transform group-hover:scale-110" />
              <span className="text-xs font-semibold tracking-wide text-slate-900 dark:text-white">Live Support</span>
            </button>
          </FloatingWidget>
        </div>
      )}

      {/* Expanded Chat Window (locked into position with zero float) */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="fixed bottom-6 right-6 z-50 w-[min(100vw-2rem,380px)] h-[500px] bg-white/95 dark:bg-[#0a101e]/95 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden border border-teal-500/30 backdrop-blur-2xl"
          >
            <div className="px-4 py-3 border-b border-slate-200 dark:border-[var(--border)] flex items-center justify-between bg-teal-500/10">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className={connected ? 'relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-400' : 'relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400'} />
                </span>
                <div>
                  <p className="font-display font-semibold text-sm text-slate-900 dark:text-white">Live Support</p>
                  <p className="text-[11px] text-slate-500 dark:text-[var(--text-muted)]">
                    {connected ? 'Real-time WebSocket Connected' : 'Connecting…'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setChatOpen(false)} aria-label="Close Chat">
                <X className="w-4 h-4 text-slate-600 dark:text-[var(--text)]" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
              {messages.map((m) => {
                const mine = m.senderId === user?.id
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                        mine
                          ? 'bg-teal-500 text-slate-950 font-medium shadow-xs'
                          : 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-transparent'
                      }`}
                    >
                      {!mine && (
                        <p className="text-[10px] text-slate-500 dark:text-white/70 mb-0.5">{m.sender?.displayName || 'Support'}</p>
                      )}
                      {m.message}
                    </div>
                  </div>
                )
              })}
              {typing && <p className="text-xs text-slate-500 dark:text-[var(--text-muted)] italic">{typing} is typing…</p>}
              <div ref={bottomRef} />
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-[var(--border)] flex gap-2 bg-slate-50 dark:bg-black/20">
              <Input
                value={text}
                onChange={(e) => {
                  setText(e.target.value)
                  socket?.emit('typing', {})
                }}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Ask support…"
              />
              <Button onClick={send} disabled={!text.trim()} aria-label="Send message">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

