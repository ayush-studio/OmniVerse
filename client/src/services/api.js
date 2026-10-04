import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('omniverse_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRoute =
        error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/register') ||
        error.config?.url?.includes('/auth/me')
      if (!isAuthRoute && localStorage.getItem('omniverse_token')) {
        localStorage.removeItem('omniverse_token')
      }
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  onboarding: (data) => api.put('/auth/onboarding', data),
  updateProfile: (data) => api.put('/auth/profile', data),
  childLock: (data) => api.put('/auth/child-lock', data),
}

export const mediaApi = {
  list: (params) => api.get('/media', { params }),
  search: (q) => api.get('/media/search', { params: { q } }),
  genres: (type) => api.get('/media/genres', { params: type ? { type } : {} }),
  byIds: (ids) => api.get('/media/by-ids', { params: { ids: ids.join(',') } }),
  get: (id) => api.get(`/media/${id}`),
  getEnrichment: (id) => api.get(`/media/${id}/enrichment`),
  enrichment: (id) => api.get(`/media/${id}/enrichment`),
  recommendations: () => api.get('/media/recommendations'),
  library: (filter) => api.get('/media/library', { params: { filter } }),
  interact: (mediaId, data) => api.put(`/media/${mediaId}/interaction`, data),
}

export const listApi = {
  list: () => api.get('/lists'),
  create: (data) => api.post('/lists', data),
  get: (id) => api.get(`/lists/${id}`),
  remove: (id) => api.delete(`/lists/${id}`),
  addItem: (id, mediaId) => api.post(`/lists/${id}/items`, { mediaId }),
  removeItem: (id, mediaId) => api.delete(`/lists/${id}/items/${mediaId}`),
}

export const notificationApi = {
  list: () => api.get('/notifications'),
  markRead: (data) => api.post('/notifications/read', data),
}

export const forumApi = {
  listAllPosts: (params) => api.get('/forum/posts', { params }),
  createGeneralPost: (data) => api.post('/forum/posts', data),
  getTrending: () => api.get('/forum/trending'),
  listPosts: (mediaId, params) => api.get(`/forum/media/${mediaId}/posts`, { params }),
  createPost: (mediaId, data) => api.post(`/forum/media/${mediaId}/posts`, data),
  getPost: (postId) => api.get(`/forum/posts/${postId}`),
  comment: (postId, data) => api.post(`/forum/posts/${postId}/comments`, data),
  votePost: (postId, value) => api.post(`/forum/posts/${postId}/vote`, { value }),
  voteComment: (commentId, value) => api.post(`/forum/comments/${commentId}/vote`, { value }),
  deletePost: (postId) => api.delete(`/forum/posts/${postId}`),
}

export const adminApi = {
  stats: () => api.get('/admin/stats'),
  users: (params) => api.get('/admin/users', { params }),
  setRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  createMedia: (data) => api.post('/admin/media', data),
  updateMedia: (id, data) => api.put(`/admin/media/${id}`, data),
  deleteMedia: (id) => api.delete(`/admin/media/${id}`),
  bulkImport: (items) => api.post('/admin/media/bulk', { items }),
  forumPosts: (params) => api.get('/admin/forum/posts', { params }),
  deleteForumPost: (id) => api.delete(`/admin/forum/posts/${id}`),
}

export const chatApi = {
  history: (roomId) => api.get('/chat/history', { params: roomId ? { roomId } : {} }),
  rooms: () => api.get('/chat/rooms'),
  markRead: (roomId) => api.post('/chat/read', { roomId }),
}

export default api
