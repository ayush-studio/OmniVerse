import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        if (token) localStorage.setItem('omniverse_token', token)
        else localStorage.removeItem('omniverse_token')
        set({ token, user })
      },
      setUser: (user) => set({ user }),
      logout: () => {
        localStorage.removeItem('omniverse_token')
        set({ token: null, user: null })
      },
    }),
    {
      name: 'omniverse-auth',
      partialize: (s) => ({ token: s.token, user: s.user }),
    }
  )
)

export const useUiStore = create(
  persist(
    (set) => ({
      theme: 'dark',
      chatOpen: false,
      searchOpen: false,
      setTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
        set({ theme })
      },
      toggleTheme: () =>
        set((s) => {
          const theme = s.theme === 'dark' ? 'light' : 'dark'
          document.documentElement.classList.toggle('dark', theme === 'dark')
          return { theme }
        }),
      setChatOpen: (chatOpen) => set({ chatOpen }),
      toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen })),
      setSearchOpen: (searchOpen) => set({ searchOpen }),
      toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
    }),
    { name: 'omniverse-ui', partialize: (s) => ({ theme: s.theme }) }
  )
)

export const useRecentStore = create(
  persist(
    (set, get) => ({
      recent: [],
      addRecent: (item) => {
        if (!item?.id) return
        const entry = {
          id: item.id,
          title: item.title,
          type: item.type,
          coverImageUrl: item.coverImageUrl,
          averageRating: item.averageRating,
          releaseYear: item.releaseYear,
          viewedAt: Date.now(),
        }
        const next = [entry, ...get().recent.filter((r) => r.id !== item.id)].slice(0, 18)
        set({ recent: next })
      },
      clearRecent: () => set({ recent: [] }),
    }),
    { name: 'omniverse-recent' }
  )
)

export const useNotificationStore = create((set) => ({
  items: [],
  unread: 0,
  setNotifications: (items, unread) => set({ items, unread: unread ?? items.filter((n) => !n.isRead).length }),
  prepend: (notif) =>
    set((s) => ({
      items: [notif, ...s.items].slice(0, 40),
      unread: s.unread + 1,
    })),
  markAllReadLocal: () =>
    set((s) => ({
      items: s.items.map((n) => ({ ...n, isRead: true })),
      unread: 0,
    })),
}))
