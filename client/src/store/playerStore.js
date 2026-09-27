import { create } from 'zustand'

export const usePlayerStore = create((set) => ({
  activeMedia: null,
  isMinimized: false,
  isOpen: false,

  playTrailer: ({ title, youtubeKey, watchUrl, mediaId, coverUrl }) => {
    set({
      activeMedia: {
        type: 'TRAILER',
        title,
        youtubeKey,
        watchUrl,
        mediaId,
        coverUrl,
      },
      isOpen: true,
      isMinimized: false,
    })
  },

  playAudio: ({ trackName, artistName, audioUrl, coverUrl, mediaId }) => {
    set({
      activeMedia: {
        type: 'AUDIO',
        title: trackName,
        artistName,
        audioUrl,
        coverUrl,
        mediaId,
      },
      isOpen: true,
      isMinimized: true, // Audio starts nicely docked
    })
  },

  minimize: () => set({ isMinimized: true }),
  maximize: () => set({ isMinimized: false }),
  close: () => set({ isOpen: false, activeMedia: null, isMinimized: false }),
}))
