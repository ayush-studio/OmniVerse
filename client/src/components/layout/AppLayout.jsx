import { useEffect, useState, useRef } from 'react'
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Moon,
  Sun,
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
  ChevronDown,
  Film,
  Tv,
  Gamepad2,
  BookOpen,
  BookMarked,
  Music,
  Sliders,
  Check,
} from 'lucide-react'
import { useAuthStore, useUiStore } from '@/store'
import { authApi } from '@/services/api'
import { Button } from '@/components/ui'
import { MEDIA_TYPES } from '@/utils/cn'
import { haptics } from '@/utils/audioHaptics'
import ChatWidget from '@/components/chat/ChatWidget'
import GlobalSearch from '@/components/layout/GlobalSearch'
import NotificationBell from '@/components/layout/NotificationBell'
import PersistentPlayerDock from '@/components/media/PersistentPlayerDock'

const CATEGORY_ICONS = {
  MOVIE: Film,
  SERIES: Tv,
  GAME: Gamepad2,
  BOOK: BookOpen,
  MANGA: BookMarked,
  MUSIC_ALBUM: Music,
}

export default function AppLayout() {
  const { user, token, setUser, logout } = useAuthStore()
  const {
    theme,
    toggleTheme,
    setSearchOpen,
    enableAntiGravity,
    toggleAntiGravity,
  } = useUiStore()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [browseDropdownOpen, setBrowseDropdownOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(haptics.enabled)

  const browseRef = useRef(null)
  const profileRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setBrowseDropdownOpen(false)
    setProfileDropdownOpen(false)
  }, [location.pathname])

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (browseRef.current && !browseRef.current.contains(e.target)) {
        setBrowseDropdownOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
      : ['Movies', 'Games', 'Anime', 'Series', 'Music']

  return (
    <div className="min-h-svh flex flex-col bg-[var(--bg)] text-[var(--text)] transition-colors duration-200">
      {/* Top Header Navbar - Redesigned, Decluttered & Modern */}
      <header className="sticky top-0 z-40 zerog-glass border-b border-[var(--border)] shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo & Primary Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="group flex items-center gap-2.5 font-display text-xl sm:text-2xl font-black tracking-tight shrink-0"
            >
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-400 via-cyan-400 to-indigo-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-[0_0_20px_rgba(20,184,166,0.5)] group-hover:scale-105 transition-transform duration-300">
                Ω
              </span>
              <span className="tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">Omni</span>
                <span className="text-[var(--text)]">Verse</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1.5">
              {/* Sleek Browse Categories Dropdown */}
              <div className="relative" ref={browseRef}>
                <button
                  type="button"
                  onClick={() => setBrowseDropdownOpen(!browseDropdownOpen)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                    browseDropdownOpen || location.pathname.startsWith('/browse')
                      ? 'bg-teal-500/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30 dark:border-teal-500/40 shadow-sm'
                      : 'text-slate-600 dark:text-[var(--text-muted)] hover:text-slate-900 dark:hover:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                  }`}
                  aria-expanded={browseDropdownOpen}
                >
                  <Compass className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
                  <span>Browse</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${browseDropdownOpen ? 'rotate-180 text-teal-600 dark:text-teal-300' : 'opacity-60'}`} />
                </button>

                <AnimatePresence>
                  {browseDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 mt-2 w-64 p-2 rounded-2xl bg-white/95 dark:bg-[#0b101e]/95 border border-slate-200 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50 backdrop-blur-2xl"
                    >
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[var(--text-muted)]">
                        Explore Catalog
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {MEDIA_TYPES.map((t) => {
                          const Icon = CATEGORY_ICONS[t.key] || Compass
                          const active = location.pathname === t.path
                          return (
                            <Link
                              key={t.key}
                              to={t.path}
                              onClick={() => setBrowseDropdownOpen(false)}
                              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                                active
                                  ? 'bg-teal-500/15 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 font-semibold'
                                  : 'text-slate-700 dark:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-teal-600 dark:hover:text-teal-300'
                              }`}
                            >
                              <div className={`p-1.5 rounded-lg ${active ? 'bg-teal-500/15 text-teal-600 dark:bg-teal-400/20 dark:text-teal-300' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-[var(--text-muted)]'}`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1">
                                <div>{t.label}</div>
                              </div>
                              {active && <Check className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />}
                            </Link>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Community Tab */}
              <NavLink
                to="/community"
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 dark:border-rose-500/40 shadow-sm'
                      : 'text-slate-600 dark:text-[var(--text-muted)] hover:text-slate-900 dark:hover:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                <Flame className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                <span>Community</span>
              </NavLink>

              {/* OmniSwipe Discover Tab */}
              <NavLink
                to="/discover"
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 dark:border-amber-500/40 shadow-sm'
                      : 'text-slate-600 dark:text-[var(--text-muted)] hover:text-slate-900 dark:hover:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>OmniSwipe</span>
              </NavLink>
            </nav>
          </div>

          {/* Center: Search Trigger (Responsive & Clean) */}
          <div className="flex-1 max-w-md mx-2 hidden sm:block">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="w-full h-9 px-3.5 rounded-full bg-slate-100 hover:bg-slate-200/70 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-[var(--border)] hover:border-teal-500/40 text-slate-500 hover:text-slate-900 dark:text-[var(--text-muted)] dark:hover:text-[var(--text)] text-xs flex items-center justify-between transition-all group"
            >
              <span className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400 group-hover:scale-110 transition-transform" />
                <span className="truncate">Search 500+ titles, genres, forums…</span>
              </span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-slate-200 dark:bg-white/10 text-[10px] font-mono text-slate-600 dark:text-[var(--text-muted)]">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Right: Actions, Notifications & Unified Profile Menu */}
          <div className="flex items-center gap-2">
            {/* Mobile search icon */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="sm:hidden p-2 rounded-full"
            >
              <Search className="w-4 h-4 text-teal-500 dark:text-teal-400" />
            </Button>

            {/* Notifications */}
            {user && <NotificationBell />}

            {/* Direct 1-Click Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                haptics.playClick()
                toggleTheme()
              }}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="p-2 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-all hover:scale-105 active:scale-95 shadow-xs"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Admin Shield (if admin) */}
            {user?.role === 'ADMIN' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin')}
                title="Admin Control Center"
                className="p-2 rounded-full text-teal-600 dark:text-teal-400 hover:bg-teal-500/10"
              >
                <Shield className="w-4 h-4" />
              </Button>
            )}

            {/* Unified User Profile & Quick Settings Menu */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/70 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-[var(--border)] hover:border-teal-500/30 transition-all duration-200"
                  aria-label="User Profile and Settings"
                >
                  <img
                    src={user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChuckleChief'}
                    alt=""
                    className="w-7 h-7 rounded-full border border-teal-500/40 object-cover shadow-sm"
                  />
                  <span className="hidden md:inline font-semibold text-xs text-slate-900 dark:text-[var(--text)] max-w-[100px] truncate">
                    {user.displayName}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-slate-500 dark:text-[var(--text-muted)] transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180 text-teal-600 dark:text-teal-400' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-72 p-2 rounded-2xl bg-white/95 dark:bg-[#0b101e]/95 border border-slate-200 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50 backdrop-blur-2xl"
                    >
                      {/* User Info Header */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center gap-3 mb-2">
                        <img
                          src={user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChuckleChief'}
                          alt=""
                          className="w-10 h-10 rounded-full border border-teal-500/50"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs truncate text-slate-900 dark:text-white">{user.displayName}</p>
                          <p className="text-[10px] text-slate-500 dark:text-[var(--text-muted)] truncate">{user.email}</p>
                          <span className="inline-block mt-1 text-[9px] px-1.5 py-0.2 rounded bg-teal-500/15 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 font-bold border border-teal-500/30">
                            {user.role}
                          </span>
                        </div>
                      </div>

                      {/* Navigation Link */}
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-teal-600 dark:hover:text-teal-300 transition"
                      >
                        <User className="w-4 h-4 text-teal-500 dark:text-teal-400" />
                        <span>My Library & Custom Lists</span>
                      </Link>

                      <div className="my-1.5 h-px bg-slate-200 dark:bg-[var(--border)]" />

                      {/* Quick Preference Toggles */}
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[var(--text-muted)]">
                        Experience Settings
                      </div>

                      {/* Anti-Gravity Tilt Toggle */}
                      <button
                        type="button"
                        onClick={toggleAntiGravity}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5 transition"
                      >
                        <span className="flex items-center gap-2">
                          <Sliders className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
                          <span>Zero-G 3D Tilt</span>
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${enableAntiGravity ? 'bg-teal-500/15 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-[var(--text-muted)]'}`}>
                          {enableAntiGravity ? 'ON' : 'OFF'}
                        </span>
                      </button>

                      {/* Audio Haptics Toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          const next = haptics.toggleSound()
                          setSoundEnabled(next)
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5 transition"
                      >
                        <span className="flex items-center gap-2">
                          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400 dark:text-[var(--text-muted)]" />}
                          <span>Audio Haptics</span>
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${soundEnabled ? 'bg-teal-500/15 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-[var(--text-muted)]'}`}>
                          {soundEnabled ? 'ON' : 'OFF'}
                        </span>
                      </button>

                      {/* Theme Toggle */}
                      <button
                        type="button"
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5 transition"
                      >
                        <span className="flex items-center gap-2">
                          {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
                          <span>Theme</span>
                        </span>
                        <span className="text-[10px] font-bold capitalize text-slate-500 dark:text-[var(--text-muted)]">
                          {theme}
                        </span>
                      </button>

                      <div className="my-1.5 h-px bg-slate-200 dark:bg-[var(--border)]" />

                      {/* Sign Out */}
                      <button
                        type="button"
                        onClick={() => {
                          logout()
                          navigate('/login')
                          setProfileDropdownOpen(false)
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Button size="sm" onClick={() => navigate('/login')} className="gap-1.5 text-xs rounded-full px-4">
                <User className="w-3.5 h-3.5" /> Sign in
              </Button>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full glass border border-slate-200 dark:border-[var(--border)] text-slate-600 dark:text-[var(--text-muted)] hover:text-slate-900 dark:hover:text-[var(--text)] transition"
              aria-label="Open mobile menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-teal-500 dark:text-teal-400" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Refined Taste Capsule Bar */}
        {user && (
          <div className="border-t border-slate-200 dark:border-[var(--border)]/60 bg-slate-50/90 dark:bg-black/20 backdrop-blur-md overflow-x-auto scrollbar-thin">
            <div className="mx-auto max-w-7xl px-3 sm:px-6 h-8 flex items-center gap-2 text-xs">
              <span className="text-slate-600 dark:text-[var(--text-muted)] shrink-0 flex items-center gap-1 font-semibold text-[11px]">
                <Sparkles className="w-3 h-3 text-teal-500 dark:text-teal-400" /> Curated for you:
              </span>
              <div className="flex items-center gap-1.5">
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
                    className="px-2.5 py-0.5 rounded-full bg-white dark:bg-white/5 hover:bg-teal-50 dark:hover:bg-teal-500/15 border border-slate-200 dark:border-white/5 hover:border-teal-400 dark:hover:border-teal-500/30 text-slate-700 dark:text-[var(--text-muted)] hover:text-teal-700 dark:hover:text-teal-300 text-[11px] whitespace-nowrap transition duration-150 font-medium shadow-xs"
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer Slide-over Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 240 }}
              className="absolute top-0 right-0 bottom-0 w-4/5 max-w-xs zerog-glass border-l border-[var(--border)] p-5 flex flex-col justify-between overflow-y-auto shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-teal-400 to-cyan-400 text-slate-950 flex items-center justify-center font-bold text-xs">
                      Ω
                    </span>
                    <span className="font-display font-bold text-lg"><span className="text-teal-400">Omni</span>Verse</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text)]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {user ? (
                  <div className="mt-4 p-3 rounded-2xl bg-white/5 border border-[var(--border)] flex items-center gap-3">
                    <img
                      src={user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChuckleChief'}
                      alt=""
                      className="w-10 h-10 rounded-full border border-teal-400/40"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-[var(--text)] truncate">{user.displayName}</div>
                      <div className="text-xs text-[var(--text-muted)] truncate">{user.email}</div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <Button onClick={() => navigate('/login')} className="w-full rounded-xl">
                      Sign In / Register
                    </Button>
                  </div>
                )}

                <div className="mt-6 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-2 mb-2">
                    Primary Hubs
                  </div>
                  <NavLink
                    to="/community"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                        isActive ? 'bg-rose-500/20 text-rose-300' : 'text-[var(--text)] hover:bg-white/5'
                      }`
                    }
                  >
                    <Flame className="w-4 h-4 text-rose-400" />
                    <span>Community Discussions</span>
                  </NavLink>
                  <NavLink
                    to="/discover"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                        isActive ? 'bg-amber-500/20 text-amber-300' : 'text-[var(--text)] hover:bg-white/5'
                      }`
                    }
                  >
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>OmniSwipe Matchmaker</span>
                  </NavLink>

                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-2 mt-5 mb-2">
                    Browse Categories
                  </div>
                  {MEDIA_TYPES.map((t) => {
                    const Icon = CATEGORY_ICONS[t.key] || Compass
                    return (
                      <NavLink
                        key={t.key}
                        to={t.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                            isActive ? 'bg-teal-500/20 text-teal-300 font-semibold' : 'text-[var(--text)] hover:bg-white/5'
                          }`
                        }
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon className="w-3.5 h-3.5 text-teal-400" />
                          <span>{t.label}</span>
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">Explore →</span>
                      </NavLink>
                    )
                  })}
                </div>
              </div>

              {user && (
                <div className="pt-4 border-t border-[var(--border)] space-y-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={toggleTheme}
                    className="w-full justify-between gap-2 rounded-xl text-xs"
                  >
                    <span className="flex items-center gap-2">
                      {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                      <span>Theme</span>
                    </span>
                    <span className="capitalize text-[10px] text-[var(--text-muted)] font-bold">{theme}</span>
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      navigate('/profile')
                      setMobileMenuOpen(false)
                    }}
                    className="w-full justify-start gap-2 rounded-xl text-xs"
                  >
                    <User className="w-4 h-4" /> My Profile & Lists
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      logout()
                      navigate('/login')
                      setMobileMenuOpen(false)
                    }}
                    className="w-full justify-start gap-2 text-rose-500 dark:text-rose-400 hover:text-rose-600 rounded-xl text-xs"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Page Outlet */}
      <motion.main
        className="flex-1"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Outlet />
      </motion.main>

      {/* Modern Compact Footer */}
      <footer className="border-t border-[var(--border)] py-8 text-center text-xs text-[var(--text-muted)] mb-14 md:mb-0 bg-black/10">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-sm text-[var(--text)]">OmniVerse</span>
            <span>· Track. Rate. Discuss. Built with Anti-Gravity UI</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/community" className="hover:text-teal-300 transition">Community</Link>
            <Link to="/browse/MOVIE" className="hover:text-teal-300 transition">Movies</Link>
            <Link to="/browse/GAME" className="hover:text-teal-300 transition">Games</Link>
            <Link to="/discover" className="hover:text-teal-300 transition">OmniSwipe</Link>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 zerog-glass border-t border-[var(--border)] px-3 py-2 flex items-center justify-around shadow-2xl">
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

      {/* Global Modals & Support Dock */}
      <GlobalSearch />
      <PersistentPlayerDock />
      <ChatWidget />
    </div>
  )
}
