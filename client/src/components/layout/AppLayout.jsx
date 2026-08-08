import { useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Moon, Sun, MessageCircle, LogOut, Shield, User, Search } from 'lucide-react'
import { useAuthStore, useUiStore } from '@/store'
import { authApi } from '@/services/api'
import { Button } from '@/components/ui'
import { MEDIA_TYPES } from '@/utils/cn'
import ChatWidget from '@/components/chat/ChatWidget'
import GlobalSearch from '@/components/layout/GlobalSearch'
import NotificationBell from '@/components/layout/NotificationBell'

export default function AppLayout() {
  const { user, token, setUser, logout } = useAuthStore()
  const { theme, toggleTheme, toggleChat, setSearchOpen } = useUiStore()
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

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
    <div className="min-h-svh flex flex-col">
      <header className="sticky top-0 z-40 glass border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center gap-4">
          <Link to="/" className="font-display text-xl font-extrabold tracking-tight shrink-0">
            <span className="text-teal-400">Omni</span>Verse
          </Link>

          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto scrollbar-thin">
            {MEDIA_TYPES.map((t) => (
              <NavLink
                key={t.key}
                to={t.path}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm transition ${
                    isActive
                      ? 'bg-teal-500/15 text-teal-300'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5'
                  }`
                }
              >
                {t.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span className="hidden md:inline text-[var(--text-muted)] text-xs">Ctrl K</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            {user && <NotificationBell />}
            {user && (
              <Button variant="ghost" size="sm" onClick={toggleChat} aria-label="Support chat">
                <MessageCircle className="w-4 h-4" />
              </Button>
            )}
            {user?.role === 'ADMIN' && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
                <Shield className="w-4 h-4" />
              </Button>
            )}
            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
                  <img
                    src={user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'}
                    alt=""
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="hidden sm:inline">{user.displayName}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    logout()
                    navigate('/login')
                  }}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => navigate('/login')}>
                <User className="w-4 h-4" /> Sign in
              </Button>
            )}
          </div>
        </div>

        {user && (
          <div className="border-t border-[var(--border)] overflow-x-auto scrollbar-thin">
            <div className="mx-auto max-w-7xl px-4 h-10 flex items-center gap-2 text-xs">
              <span className="text-[var(--text-muted)] shrink-0">For you:</span>
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
                  className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-teal-500/10 text-[var(--text-muted)] hover:text-teal-300 whitespace-nowrap transition"
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <motion.main
        className="flex-1"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Outlet />
      </motion.main>

      <footer className="border-t border-[var(--border)] py-8 text-center text-sm text-[var(--text-muted)]">
        OmniVerse · Track · Rate · Discuss across Movies, Games, Music & more
      </footer>

      <GlobalSearch />
      {user && <ChatWidget />}
    </div>
  )
}
