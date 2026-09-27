import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Moon,
  Sun,
  MessageCircle,
  LogOut,
  Shield,
  User,
  Search,
  Menu,
  X,
  Flame,
  Home,
  Compass,
  MessageSquare,
  Sparkles,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react'
import { useAuthStore, useUiStore } from '@/store'
import { authApi } from '@/services/api'
import { Button } from '@/components/ui'
import { MEDIA_TYPES, COMMUNITY_CHANNELS } from '@/utils/cn'
import { haptics } from '@/utils/audioHaptics'
import ChatWidget from '@/components/chat/ChatWidget'
import GlobalSearch from '@/components/layout/GlobalSearch'
import NotificationBell from '@/components/layout/NotificationBell'
import PersistentPlayerDock from '@/components/media/PersistentPlayerDock'

export default function AppLayout() {
  const { user, token, setUser, logout } = useAuthStore()
  const { theme, toggleTheme, toggleChat, setSearchOpen } = useUiStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(haptics.enabled)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    // Close mobile menu on route change
    setMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!token) return
    authApi
      .me()
      .then((r) => setUser(r.data.user))
      .catch(() => {
        logout()
        navigate('/login')
      })
  }, [token, setUser, logout, navigate])

  const tasteTabs =
    user?.tasteProfile?.formats?.length > 0
      ? user.tasteProfile.formats
      : MEDIA_TYPES.map((t) => t.label)

  return (
    <div className="min-h-svh flex flex-col bg-[var(--bg)] text-[var(--text)] transition-colors duration-200">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 glass border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 h-16 flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="font-display text-xl sm:text-2xl font-extrabold tracking-tight shrink-0 flex items-center gap-1.5">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-teal-400 to-cyan-400 text-slate-950 flex items-center justify-center font-bold text-sm shadow-md shadow-teal-500/20">
                Ω
              </span>
              <span><span className="text-teal-400">Omni</span>Verse</span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              <NavLink
                to="/community"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5'
                  }`
                }
              >
                <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>Community</span>
                <span className="px-1.5 py-0.2 text-[10px] rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                  Reddit Hub
                </span>
              </NavLink>

              <NavLink
                to="/discover"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5'
                  }`
                }
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>OmniSwipe</span>
                <span className="px-1.5 py-0.2 text-[10px] rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  New
                </span>
              </NavLink>

              <div className="h-4 w-px bg-[var(--border)] mx-1" />

              {MEDIA_TYPES.map((t) => (
                <NavLink
                  key={t.key}
                  to={t.path}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg text-sm transition ${
                      isActive
                        ? 'bg-teal-500/15 text-teal-300 font-medium'
                        : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5'
                    }`
                  }
                >
                  {t.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Desktop & Mobile Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="gap-1.5 px-2.5 sm:px-3"
            >
              <Search className="w-4 h-4 text-teal-400" />
              <span className="hidden md:inline text-[var(--text-muted)] text-xs">Ctrl K</span>
            </Button>

            <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label="Toggle theme" className="p-2">
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-teal-400" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const next = haptics.toggleSound()
                setSoundEnabled(next)
              }}
              aria-label="Toggle UI Sound FX"
              title={soundEnabled ? 'UI Sound FX On (click to mute)' : 'UI Sound FX Off (click to enable)'}
              className="p-2"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-teal-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-[var(--text-muted)]" />
              )}
            </Button>

            {user && <NotificationBell />}

            {user && (
              <Button variant="ghost" size="sm" onClick={toggleChat} aria-label="Support chat" className="p-2 hidden sm:inline-flex">
                <MessageCircle className="w-4 h-4" />
              </Button>
            )}

            {user?.role === 'ADMIN' && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} title="Admin Portal" className="p-2">
                <Shield className="w-4 h-4 text-teal-400" />
              </Button>
            )}

            {user ? (
              <div className="hidden sm:flex items-center gap-1.5">
                <Button variant="ghost" size="sm" onClick={() => navigate('/profile')} className="gap-2">
                  <img
                    src={user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'}
                    alt=""
                    className="w-6 h-6 rounded-full border border-[var(--border)]"
                  />
                  <span className="hidden md:inline font-medium text-xs">{user.displayName}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  title="Sign out"
                  onClick={() => {
                    logout()
                    navigate('/login')
                  }}
                  className="p-2 text-[var(--text-muted)] hover:text-rose-400"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => navigate('/login')} className="gap-1.5 hidden sm:inline-flex">
                <User className="w-4 h-4" /> Sign in
              </Button>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl glass border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition"
              aria-label="Open mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-teal-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Personalized Taste bar */}
        {user && (
          <div className="border-t border-[var(--border)] overflow-x-auto scrollbar-thin">
            <div className="mx-auto max-w-7xl px-3 sm:px-4 h-9 flex items-center gap-2 text-xs">
              <span className="text-[var(--text-muted)] shrink-0 flex items-center gap-1 font-medium">
                <Sparkles className="w-3 h-3 text-teal-400" /> For you:
              </span>
              {tasteTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    const match = MEDIA_TYPES.find(
                      (t) =>
                        t.label.toLowerCase().includes(String(tab).toLowerCase()) ||
                        String(tab)
                          .toLowerCase()
                          .includes(t.key.toLowerCase().split('_')[0].toLowerCase())
                    )
                    navigate(match?.path || '/browse/MOVIE', { state: { taste: tab } })
                  }}
                  className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-teal-500/10 text-[var(--text-muted)] hover:text-teal-300 whitespace-nowrap transition"
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer Slide-over Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 240 }}
              className="absolute top-0 right-0 bottom-0 w-4/5 max-w-xs glass-card border-l border-[var(--border)] p-5 flex flex-col justify-between overflow-y-auto shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-teal-400 text-slate-950 flex items-center justify-center font-bold text-xs">
                      Ω
                    </span>
                    <span className="font-display font-bold text-lg"><span className="text-teal-400">Omni</span>Verse</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* User quick status in drawer */}
                {user ? (
                  <div className="mt-4 p-3 rounded-xl bg-black/15 dark:bg-white/5 border border-[var(--border)] flex items-center gap-3">
                    <img
                      src={user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'}
                      alt=""
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-[var(--text)] truncate">{user.displayName}</div>
                      <div className="text-xs text-[var(--text-muted)] truncate">{user.email}</div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <Button onClick={() => navigate('/login')} className="w-full">
                      Sign In / Register
                    </Button>
                  </div>
                )}

                {/* Mobile Navigation Links */}
                <div className="mt-6 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-2 mb-2">
                    Community & Discussions
                  </div>
                  <NavLink
                    to="/community"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                        isActive ? 'bg-teal-500/20 text-teal-300' : 'text-[var(--text)] hover:bg-white/5'
                      }`
                    }
                  >
                    <Flame className="w-4 h-4 text-rose-400" />
                    <span>Reddit Community Hub</span>
                    <span className="ml-auto text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-bold">
                      HOT
                    </span>
                  </NavLink>

                  <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-2 mt-5 mb-2">
                    Entertainment Catalog
                  </div>
                  {MEDIA_TYPES.map((t) => (
                    <NavLink
                      key={t.key}
                      to={t.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition ${
                          isActive ? 'bg-teal-500/20 text-teal-300' : 'text-[var(--text)] hover:bg-white/5'
                        }`
                      }
                    >
                      <span>{t.label}</span>
                      <span className="text-xs text-[var(--text-muted)]">Browse →</span>
                    </NavLink>
                  ))}
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-4 border-t border-[var(--border)] space-y-2">
                {user && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        navigate('/profile')
                        setMobileMenuOpen(false)
                      }}
                      className="w-full justify-start gap-2"
                    >
                      <User className="w-4 h-4" /> Profile & Library
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        logout()
                        navigate('/login')
                        setMobileMenuOpen(false)
                      }}
                      className="w-full justify-start gap-2 text-rose-400 hover:text-rose-300"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Outlet */}
      <motion.main
        className="flex-1"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Outlet />
      </motion.main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 text-center text-xs sm:text-sm text-[var(--text-muted)] mb-14 md:mb-0">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-[var(--text)]">OmniVerse</span>
            <span>· Track. Rate. Discuss across Movies, Games, Songs & Sports</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/community" className="hover:text-teal-300 transition">Community</Link>
            <Link to="/browse/MOVIE" className="hover:text-teal-300 transition">Movies</Link>
            <Link to="/browse/GAME" className="hover:text-teal-300 transition">Games</Link>
            <Link to="/community?channel=SPORTS" className="hover:text-teal-300 transition">Sports</Link>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Navigation Bar (md:hidden) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-[var(--border)] px-2 py-2 flex items-center justify-around shadow-lg">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition ${
              isActive ? 'text-teal-400 font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/discover"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition ${
              isActive ? 'text-amber-400 font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`
          }
        >
          <Zap className="w-5 h-5 text-amber-400" />
          <span>Swipe</span>
        </NavLink>

        <NavLink
          to="/browse/MOVIE"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition ${
              isActive ? 'text-teal-400 font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`
          }
        >
          <Compass className="w-5 h-5" />
          <span>Browse</span>
        </NavLink>

        <NavLink
          to="/community"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition relative ${
              isActive ? 'text-teal-400 font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`
          }
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <span>Community</span>
        </NavLink>

        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex flex-col items-center gap-1 p-1 text-[10px] font-medium text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </button>

        <NavLink
          to={user ? '/profile' : '/login'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition ${
              isActive ? 'text-teal-400 font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span>{user ? 'Profile' : 'Sign In'}</span>
        </NavLink>
      </nav>

      <GlobalSearch />
      <PersistentPlayerDock />
      {user && <ChatWidget />}
    </div>
  )
}
