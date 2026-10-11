import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  Send,
  MessageCircle,
  Bot,
  Sparkles,
  Sliders,
  Film,
  Compass,
  ListPlus,
  Key,
  HelpCircle,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Search,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocket } from '@/context/SocketContext'
import { useAuthStore, useUiStore } from '@/store'
import { chatApi } from '@/services/api'
import { Button, Input } from '@/components/ui'
import FloatingWidget from '@/components/ui/FloatingWidget'
import { haptics } from '@/utils/audioHaptics'

const QUICK_TOPICS = [
  {
    id: 'add_media',
    label: '🎬 How do I add media to the catalog?',
    keywords: [
      'add media',
      'add movie',
      'add game',
      'add song',
      'add album',
      'add book',
      'add manga',
      'add series',
      'add title',
      'how to add',
      'how do i add',
      'submit media',
      'submit title',
      'submit movie',
      'contribute',
      'upload media',
      'upload movie',
      'upload game',
      'add to catalog',
      'insert title',
      'form to add',
    ],
    title: 'Adding Media to OmniVerse (100% Free)',
    reply: `You can submit any title into OmniVerse completely free without any hosting charges:\n\n1. **Select Medium**: Choose from 🎬 Movie, 🎮 Game, 📺 Series/Anime, 📚 Book, 📖 Manga, or 🎵 Music Album.\n2. **Provide Metadata**: Title, Release Year, Language, Maturity Rating, and Genre Tags.\n3. **Cover Artwork URL**: Paste any public image link (from Wikipedia, Steam, OpenLibrary, or Apple Music) — zero S3 storage costs!\n4. **Instant Inclusion**: Your title immediately goes live across global search (Ctrl+K), community debate forums, and custom lists!`,
    action: { type: 'search', label: '🔍 Search Existing Catalog First' },
    suggestions: [
      '🎛️ How does the Vibe Mixer work?',
      '📜 How do I curate Custom Lists?',
      '🌌 What is the Transmedia Galaxy?',
    ],
  },
  {
    id: 'vibe_mixer',
    label: '🎛️ How does the Vibe Mixer work?',
    keywords: [
      'vibe mixer',
      'vibe',
      'decision engine',
      'paralysis',
      'synthesize',
      'what to watch',
      'what to play',
      'mood filter',
      'roulette',
      'vibe match',
    ],
    title: 'OmniVerse Vibe Mixer Decision Engine',
    reply: `The Vibe Mixer solves entertainment choice paralysis in 3 steps:\n\n• **Step 1 (Time Budget)**: Choose *Quick Bite* (15–45m), *Feature Length* (1.5–3h), or *Deep Immersion* (10+ hrs).\n• **Step 2 (Emotional Frequency)**: Pick from 6 moods (*Adrenaline*, *Rainy Melancholy*, *Mind-Bending Riddles*, *Cozy Comfort*, *Cosmic Wonder*, *Dark & Visceral*).\n• **Step 3 (Session Context)**: Solo session, Duo/Date night, or Party.\n\nHit **Synthesize Matches** to run the roulette engine and get 3 curated picks with 95%+ confidence scores and instant trailer/audio previews!`,
    action: { type: 'vibe_mixer', label: '🎛️ Launch Vibe Mixer Now' },
    suggestions: [
      '🌌 What is the Transmedia Galaxy?',
      '🎬 How do I add media to the catalog?',
      '📜 How do I curate Custom Lists?',
    ],
  },
  {
    id: 'transmedia',
    label: '🌌 What is the Transmedia Galaxy?',
    keywords: [
      'transmedia',
      'galaxy',
      'cross-medium',
      'cross medium',
      'affinity',
      'thematic echo',
      'echoes',
      'thematic bridge',
      'affinity score',
    ],
    title: 'Omniverse Transmedia Galaxy',
    reply: `OmniVerse unifies 6 entertainment mediums under one roof. The Transmedia Galaxy builds thematic bridges between them:\n\n• If you love a movie like *Inception* or *Blade Runner 2049*, the Galaxy finds connected works in **Games** (*Cyberpunk 2077*), **Anime/Series** (*Dark*), **Manga** (*Monster*), **Books** (*Dune*), and **Music Albums** (*Synthwave*).\n• Every connection displays a calculated **Thematic Affinity Score** (e.g. 97%) and shared genre tags.`,
    action: { type: 'navigate', path: '/media/1', label: '🌌 View Inception Transmedia Galaxy' },
    suggestions: [
      '🎛️ How does the Vibe Mixer work?',
      '📜 How do I curate Custom Lists?',
    ],
  },
  {
    id: 'custom_lists',
    label: '📜 How do I curate Custom Lists?',
    keywords: [
      'custom list',
      'custom lists',
      'curate list',
      'curate custom',
      'create list',
      'make a list',
      'my lists',
      'watchlist',
      'favorites list',
      'how do i curate',
      'track library',
      'personal collection',
      'playlist',
    ],
    title: 'Custom Lists & Tracking',
    reply: `You can curate personal collections and track your entertainment journey:\n\n1. **Library Statuses**: Open any title and tap *Favorites*, *Plan to watch*, *Completed*, *On hold*, or *Dropped*.\n2. **Custom Lists**: Head to **Profile → Lists**, enter a list name (e.g. *"GOAT Games & Movies"*), and click Create.\n3. **Add Items**: On any media detail page, choose your list in the right sidebar to add it instantly!`,
    action: { type: 'navigate', path: '/profile', label: '📜 Go to My Lists (Profile)' },
    suggestions: [
      '🎬 How do I add media to the catalog?',
      '🎛️ How does the Vibe Mixer work?',
    ],
  },
  {
    id: 'demo_accounts',
    label: '🔑 What demo accounts are available?',
    keywords: [
      'demo account',
      'demo accounts',
      'login credential',
      'credentials',
      'chuckle chieftain',
      'chuckle credential',
      'admin password',
      'demo password',
      'demo login',
      'test account',
      'test user',
    ],
    title: 'Demo Accounts & Credentials',
    reply: `OmniVerse includes pre-seeded demonstration accounts:\n\n• 👑 **Chuckle Chieftain** (\`chuckle@omniverse.app\` / \`chuckle123\`) — Curated profile with GOAT custom lists, active debate threads, and full library.\n• 👤 **Demo Explorer** (\`demo@omniverse.app\` / \`user123\`) — Standard user profile with taste tags.\n• 🛡️ **Omni Admin** — Private administrative credentials reserved for site owners only.`,
    action: { type: 'navigate', path: '/login', label: '🔑 Go to Login Page' },
    suggestions: [
      '📜 How do I curate Custom Lists?',
      '🎛️ How does the Vibe Mixer work?',
    ],
  },
  {
    id: 'search_nav',
    label: '🔍 How do I search & filter?',
    keywords: [
      'how to search',
      'global search',
      'ctrl+k',
      'search shortcut',
      'find title',
      'search catalog',
      'filters',
    ],
    title: 'Global Search & Discovery',
    reply: `You can search across 500+ titles and 6 mediums instantly:\n\n• Press **Ctrl+K** (or tap the Search bar in the top navigation) to launch the Spotlight Search modal.\n• Filter by medium (*Movies, Games, Series, Books, Manga, Music*), maturity ratings, or release years.\n• Direct results take you straight to detail view with trailers and audio snippets.`,
    action: { type: 'search', label: '🔍 Open Global Search (Ctrl+K)' },
    suggestions: [
      '🎛️ How does the Vibe Mixer work?',
      '🎬 How do I add media to the catalog?',
    ],
  },
]

const WELCOME_MESSAGE = {
  id: 'welcome-msg',
  senderId: 'bot',
  sender: { displayName: 'OmniBot Concierge', role: 'BOT' },
  message: `👋 Hi there! Welcome to the OmniVerse Support Concierge.\n\nI am here to help you get the most out of OmniVerse. Here is what I can assist you with:\n\n• 🎬 **Adding Media**: How to submit titles to the catalog (100% free)\n• 🎛️ **Vibe Mixer**: How to use the mood & time decision engine\n• 🌌 **Transmedia Galaxy**: Discover thematic bridges across movies, games, books & music\n• 📜 **Custom Lists**: Curate personal lists, favorites & track your journey\n• 🔑 **Demo Accounts**: Testing with Chuckle Chieftain or Explorer profiles\n• 🔍 **Search & Discover**: Find titles with Ctrl+K shortcuts\n\nTap any suggested topic or type your inquiry below! *(Note: For general trivia or outside queries, I will let you know I cannot assist, but hope you enjoy your time here!)*`,
  suggestions: [
    '🎬 How do I add media to the catalog?',
    '🎛️ How does the Vibe Mixer work?',
    '🌌 What is the Transmedia Galaxy?',
    '📜 How do I curate Custom Lists?',
    '🔑 What demo accounts are available?',
  ],
  createdAt: new Date().toISOString(),
}

export default function ChatWidget() {
  const { chatOpen, setChatOpen, setVibeMixerOpen, setSearchOpen } = useUiStore()
  const user = useAuthStore((s) => s.user)
  const { socket, connected } = useSocket()
  const navigate = useNavigate()

  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [text, setText] = useState('')
  const [botTyping, setBotTyping] = useState(false)
  const [typing, setTyping] = useState(null)
  const [feedbackGiven, setFeedbackGiven] = useState({})
  const bottomRef = useRef(null)
  const roomId = user ? `support:${user.id}` : 'support:guest'

  useEffect(() => {
    if (!chatOpen || !user) return
    chatApi
      .history()
      .then((r) => {
        const history = r.data.messages || []
        setMessages([WELCOME_MESSAGE, ...history])
      })
      .catch(() => {})
  }, [chatOpen, user])

  useEffect(() => {
    if (!socket || !user) return
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
  }, [socket, roomId, user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chatOpen, botTyping])

  function handleResetChat() {
    haptics.playClick()
    setMessages([
      {
        ...WELCOME_MESSAGE,
        id: `welcome-${Date.now()}`,
        createdAt: new Date().toISOString(),
      },
    ])
    setFeedbackGiven({})
  }

  function handleActionClick(action) {
    if (!action) return
    haptics.playPop()
    if (action.type === 'vibe_mixer') {
      setVibeMixerOpen(true)
      setChatOpen(false)
    } else if (action.type === 'search') {
      setSearchOpen(true)
      setChatOpen(false)
    } else if (action.type === 'navigate') {
      navigate(action.path)
      setChatOpen(false)
    }
  }

  function handleFeedback(msgId, isUp) {
    haptics.playClick()
    setFeedbackGiven((prev) => ({ ...prev, [msgId]: isUp ? 'up' : 'down' }))
  }

  function findResponse(input) {
    const query = input.toLowerCase().trim()

    // 1. Generic Greeting Match
    const isGreeting = /^(hi|hello|hey|hola|sup|good\s*(morning|afternoon|evening)|howdy|greetings|yo)(\b|[!?.,\s]|$)/i.test(
      query
    )
    if (isGreeting) {
      return {
        reply: `👋 Hi there! Welcome to the OmniVerse Support Concierge.\n\nI can assist you with features across our entertainment hub:\n\n• 🎬 **Adding Media**: How to submit titles to the catalog (100% free)\n• 🎛️ **Vibe Mixer**: How to use the mood & time decision engine\n• 🌌 **Transmedia Galaxy**: Discover thematic bridges across movies, games, books & music\n• 📜 **Custom Lists**: Curate personal lists, favorites & track your journey\n• 🔑 **Demo Accounts**: Testing with Chuckle Chieftain or Explorer profiles\n• 🔍 **Search & Discover**: Find titles with Ctrl+K shortcuts\n\nTap any suggested topic or type your question! *(Note: For general trivia or outside queries, I will let you know I cannot assist, but hope you enjoy your time here!)*`,
        action: null,
        suggestions: [
          '🎬 How do I add media to the catalog?',
          '🎛️ How does the Vibe Mixer work?',
          '📜 How do I curate Custom Lists?',
          '🔑 What demo accounts are available?',
        ],
      }
    }

    // 2. Specific Topic Intent Matching (Multi-word or targeted phrase matching)
    for (const item of QUICK_TOPICS) {
      if (item.keywords.some((kw) => query.includes(kw))) {
        return {
          reply: item.reply,
          action: item.action,
          suggestions: item.suggestions,
        }
      }
    }

    // 3. Generic polite fallback for questions outside supported platform features
    return {
      reply: `I'm sorry, we can't help you with that request! As an automated platform concierge, I can only assist with OmniVerse platform guides, media catalog features, and navigation. Sorry about that, and hope you enjoy your time in this application! ✨\n\nHere are some of the OmniVerse topics you can ask me about:`,
      action: null,
      suggestions: [
        '🎬 How do I add media to the catalog?',
        '🎛️ How does the Vibe Mixer work?',
        '🌌 What is the Transmedia Galaxy?',
        '📜 How do I curate Custom Lists?',
      ],
    }
  }

  function handleSend(userMessageText) {
    const message = (userMessageText || text).trim()
    if (!message) return
    setText('')
    haptics.playClick()

    const userMsgObj = {
      id: `user-${Date.now()}`,
      senderId: user?.id || 'guest',
      sender: { displayName: user?.displayName || 'You (Visitor)', role: user?.role || 'USER' },
      message,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsgObj])

    // If connected to socket, also transmit to live staff in admin panel
    if (socket && user) {
      socket.emit('support_message', { message }, () => {})
    }

    // Simulate intelligent bot thinking and reply
    setBotTyping(true)
    setTimeout(() => {
      const botResponse = findResponse(message)
      setBotTyping(false)
      haptics.playPop()

      const botMsgObj = {
        id: `bot-${Date.now()}`,
        senderId: 'bot',
        sender: { displayName: 'OmniBot Concierge', role: 'BOT' },
        message: botResponse.reply,
        action: botResponse.action,
        suggestions: botResponse.suggestions,
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, botMsgObj])
    }, 450)
  }

  return (
    <>
      {/* Floating Launcher Icon (Visible to all users and guests) */}
      {!chatOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <FloatingWidget isOpen={false} amplitude={4} duration={3.5}>
            <button
              onClick={() => {
                haptics.playPop()
                setChatOpen(true)
              }}
              className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-white dark:bg-slate-950/95 hover:bg-teal-50/80 dark:hover:bg-teal-950/40 border border-teal-500/40 text-teal-600 dark:text-teal-300 shadow-[0_8px_30px_rgba(20,184,166,0.25)] hover:shadow-[0_12px_40px_rgba(20,184,166,0.4)] transition-all duration-300 backdrop-blur-md cursor-pointer"
              aria-label="Open Interactive Support"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-400" />
              </span>
              <MessageCircle className="w-4 h-4 text-teal-600 dark:text-teal-300 transition-transform group-hover:scale-110" />
              <span className="text-xs font-semibold tracking-wide text-slate-900 dark:text-white">
                Live Support & Bot
              </span>
            </button>
          </FloatingWidget>
        </div>
      )}

      {/* Expanded Interactive Chat Center */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="fixed bottom-6 right-6 z-50 w-[min(100vw-2rem,430px)] h-[570px] bg-white/95 dark:bg-[#0a101e]/95 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden border border-teal-500/30 backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-teal-500/15 via-cyan-500/10 to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display font-bold text-sm text-slate-900 dark:text-white">
                      OmniVerse Concierge
                    </p>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      Interactive
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-[var(--text-muted)] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    <span>Instant Answers · Navigation Concierge</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Reset Conversation"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  aria-label="Reset Conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setChatOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  aria-label="Close Chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Topic Chips (Pinned under header) */}
            <div className="px-3 py-2 bg-slate-100/80 dark:bg-black/25 border-b border-slate-200 dark:border-white/5 overflow-x-auto scrollbar-thin flex gap-1.5">
              {QUICK_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => handleSend(topic.label)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap shrink-0 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-teal-400/50 hover:bg-teal-500/10 text-slate-700 dark:text-slate-300 hover:text-teal-300 transition cursor-pointer shadow-xs"
                >
                  {topic.label}
                </button>
              ))}
            </div>

            {/* Messages Scroll View */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 scrollbar-thin">
              {messages.map((m) => {
                const isUser = m.senderId === user?.id || m.senderId === 'guest'
                const isBot = m.senderId === 'bot' || m.sender?.role === 'BOT'
                const isStaff = !isUser && !isBot
                const currentFeedback = feedbackGiven[m.id]

                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    {/* Sender Identity Tag */}
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      {isBot && (
                        <span className="text-[10px] font-bold text-teal-400 flex items-center gap-1">
                          <Bot className="w-3 h-3" />
                          <span>OmniBot Concierge</span>
                        </span>
                      )}
                      {isStaff && (
                        <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                          <span>🛡️ Official Support Agent</span>
                        </span>
                      )}
                      {isUser && (
                        <span className="text-[10px] text-slate-400">
                          {user?.displayName || 'You'}
                        </span>
                      )}
                    </div>

                    {/* Bubble Content */}
                    <div
                      className={`max-w-[90%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-semibold shadow-md shadow-teal-500/20'
                          : isBot
                            ? 'bg-slate-100 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 border border-teal-500/30 shadow-md'
                            : 'bg-amber-500/15 text-slate-900 dark:text-amber-100 border border-amber-500/40 shadow-md'
                      }`}
                    >
                      {m.message}

                      {/* Interactive In-Chat Action Trigger */}
                      {isBot && m.action && (
                        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-white/10">
                          <button
                            type="button"
                            onClick={() => handleActionClick(m.action)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-teal-500 text-slate-950 hover:bg-teal-400 transition cursor-pointer shadow-sm shadow-teal-500/30"
                          >
                            <span>{m.action.label}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Follow-up Interactive Suggestion Chips */}
                      {isBot && m.suggestions && m.suggestions.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-white/10 space-y-1.5">
                          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            Suggested follow-ups:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {m.suggestions.map((sug, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSend(sug)}
                                className="text-left px-2 py-1 rounded-lg text-[10.5px] font-medium bg-white/70 dark:bg-white/10 hover:bg-teal-500/20 hover:text-teal-300 border border-slate-200 dark:border-white/10 hover:border-teal-400/40 transition cursor-pointer"
                              >
                                {sug}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Helpful Feedback Micro-Buttons */}
                      {isBot && (
                        <div className="mt-2.5 pt-1.5 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                          <span>Was this helpful?</span>
                          {currentFeedback ? (
                            <span className="text-teal-400 font-semibold flex items-center gap-1">
                              ✓ Thanks for feedback!
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleFeedback(m.id, true)}
                                className="p-1 rounded hover:bg-teal-500/20 hover:text-teal-300 transition cursor-pointer"
                                title="Yes, helpful"
                              >
                                <ThumbsUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFeedback(m.id, false)}
                                className="p-1 rounded hover:bg-rose-500/20 hover:text-rose-400 transition cursor-pointer"
                                title="No, not helpful"
                              >
                                <ThumbsDown className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}

              {/* Bot typing simulation indicator */}
              {botTyping && (
                <div className="flex items-center gap-2 text-xs text-teal-400 italic py-1 px-2">
                  <Bot className="w-3.5 h-3.5 animate-bounce" />
                  <span>OmniBot is typing answer…</span>
                </div>
              )}

              {typing && !botTyping && (
                <p className="text-xs text-slate-500 dark:text-[var(--text-muted)] italic px-2">
                  {typing} is typing…
                </p>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-200 dark:border-white/10 flex gap-2 bg-slate-50 dark:bg-black/40">
              <Input
                value={text}
                onChange={(e) => {
                  setText(e.target.value)
                  if (socket && user) socket.emit('typing', {})
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about adding media, lists, vibes…"
                className="text-xs h-10 rounded-xl"
              />
              <Button
                size="sm"
                onClick={() => handleSend()}
                disabled={!text.trim()}
                aria-label="Send message"
                className="h-10 px-3.5 rounded-xl cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

