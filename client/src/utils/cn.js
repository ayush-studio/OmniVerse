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

export const COMMUNITY_CHANNELS = [
  { key: 'ALL', label: 'All Communities', sub: 'r/all', desc: 'Trending across movies, games, sports, music & anime' },
  { key: 'GAMES', label: 'Gaming & Esports', sub: 'r/gaming', desc: 'Discussions, builds, tips, and gaming news' },
  { key: 'MOVIES', label: 'Movies & Cinema', sub: 'r/movies', desc: 'Film analysis, box office debates, and reviews' },
  { key: 'SERIES', label: 'Series & Anime', sub: 'r/series', desc: 'Episode theories, episode discussions, and tier lists' },
  { key: 'SPORTS', label: 'Sports & Athletics', sub: 'r/sports', desc: 'Football, basketball, cricket, F1, and match talk' },
  { key: 'MUSIC', label: 'Music & Songs', sub: 'r/music', desc: 'Album drops, song debates, lyrics, and concert talk' },
  { key: 'BOOKS', label: 'Books & Manga', sub: 'r/books', desc: 'Chapter discussions, book clubs, and light novels' },
  { key: 'QA', label: 'Ask Omni (Q&A)', sub: 'r/askomni', desc: 'Ask questions, get personalized recommendations & answers' },
]

export const POST_TYPES = [
  { key: 'DISCUSSION', label: 'Discussion', flair: '💬 Discussion', badgeClass: 'bg-teal-500/15 text-teal-300 border-teal-500/30' },
  { key: 'QUESTION', label: 'Question', flair: '❓ Question', badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  { key: 'HOT_TAKE', label: 'Hot Take', flair: '🔥 Hot Take', badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  { key: 'THEORY', label: 'Theory', flair: '🧠 Fan Theory', badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  { key: 'REVIEW', label: 'Review', flair: '⭐ Review', badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  { key: 'RECOMMENDATION', label: 'Recommendation', flair: '🎯 Recommendation', badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
]

export function getChannelInfo(key) {
  return COMMUNITY_CHANNELS.find((c) => c.key === key?.toUpperCase()) || COMMUNITY_CHANNELS[0]
}

export function getPostTypeInfo(key) {
  return POST_TYPES.find((p) => p.key === key?.toUpperCase()) || POST_TYPES[0]
}
