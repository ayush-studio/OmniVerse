import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const MEDIA_TYPES = [
  { key: 'MOVIE', label: 'Movies', path: '/browse/MOVIE' },
  { key: 'SERIES', label: 'Series / Anime', path: '/browse/SERIES' },
  { key: 'GAME', label: 'Games', path: '/browse/GAME' },
  { key: 'BOOK', label: 'Books', path: '/browse/BOOK' },
  { key: 'MANGA', label: 'Manga', path: '/browse/MANGA' },
  { key: 'MUSIC_ALBUM', label: 'Music', path: '/browse/MUSIC_ALBUM' },
]

export const TASTE_TAGS = [
  'Action Movies',
  'AAA Story Games',
  'Shonen Manga',
  'Seinen Manga',
  'Anime',
  'Hindi Pop',
  'English Pop',
  'Sci-Fi',
  'Fantasy',
  'Horror',
  'Indie Games',
  'Classic Literature',
  'Thriller Series',
  'Romance',
  'Documentary',
]

export const FORMAT_OPTIONS = ['Movies', 'Anime', 'Series', 'Games', 'Books', 'Manga', 'Music']

export const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Naruto',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Levi',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Geralt',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ellie',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Spike',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Lara',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Goku',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ada',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Cloud',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Mikasa',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Kratos',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sakura',
]

export const WISHLIST_OPTIONS = [
  { value: 'NONE', label: 'Remove from list' },
  { value: 'PLAN_TO_WATCH', label: 'Plan to watch' },
  { value: 'ON_HOLD', label: 'On hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'DROPPED', label: 'Dropped' },
]

export function typeLabel(type) {
  return MEDIA_TYPES.find((t) => t.key === type)?.label || type
}
