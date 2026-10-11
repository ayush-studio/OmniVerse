import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/store'
import { Button, Input, Label } from '@/components/ui'
import { haptics } from '@/utils/audioHaptics'

export default function LoginPage() {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', displayName: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  if (token && user) {
    return <Navigate to="/" replace />
  }

  async function instantDemoLogin(email, password) {
    setError('')
    setMode('login')
    // Visually fill email and password boxes
    setForm((prev) => ({ ...prev, email, password }))
    setLoading(true)
    haptics.playClick()
    try {
      // Short delay so user clearly sees inputs populated
      await new Promise((resolve) => setTimeout(resolve, 250))
      const { data } = await authApi.login({ email, password })
      setAuth(data.token, data.user)
      haptics.playFavorite()
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to authenticate demo user')
    } finally {
      setLoading(false)
    }
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    haptics.playClick()
    try {
      const { data } =
        mode === 'login'
          ? await authApi.login({ email: form.email, password: form.password })
          : await authApi.register(form)
      setAuth(data.token, data.user)
      haptics.playFavorite()
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh grid lg:grid-cols-2">
      <div
        className="relative hidden lg:block bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80)',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'var(--hero-overlay)' }} />
        <div className="relative z-10 h-full flex flex-col justify-end p-12">
          <p className="font-display text-5xl font-extrabold tracking-tight">
            <span className="text-teal-400">Omni</span>Verse
          </p>
          <p className="mt-3 text-lg text-[var(--text-muted)] max-w-md">
            One universe for movies, games, manga, music, and the communities that obsess over them.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md glass rounded-3xl p-8 space-y-4"
        >
          <div>
            <h1 className="font-display text-3xl font-bold">
              {mode === 'login' ? 'Welcome back' : 'Join OmniVerse'}
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {mode === 'login' ? 'Sign in to sync your lists & forums' : 'Create your entertainment identity'}
            </p>
          </div>

          {mode === 'register' && (
            <div>
              <Label>Display name</Label>
              <Input
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                required
              />
            </div>
          )}
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="mb-0">Password</Label>
              <button
                type="button"
                onClick={() => {
                  haptics.playClick()
                  setShowPassword(!showPassword)
                }}
                className="text-xs text-[var(--text-muted)] hover:text-teal-400 flex items-center gap-1.5 transition select-none cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Show</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                placeholder={mode === 'login' ? '••••••••' : 'Min 6 characters'}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => {
                  haptics.playClick()
                  setShowPassword(!showPassword)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-400 transition p-1 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <Button className="w-full" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>

          <p className="text-sm text-center text-[var(--text-muted)]">
            {mode === 'login' ? (
              <>
                New here?{' '}
                <button type="button" className="text-teal-400" onClick={() => setMode('register')}>
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" className="text-teal-400" onClick={() => setMode('login')}>
                  Sign in
                </button>
              </>
            )}
          </p>

          <div className="pt-2 border-t border-[var(--border)] space-y-2">
            <p className="text-[11px] font-bold text-center uppercase tracking-wider text-[var(--text-muted)]">
              Quick Demo Accounts
            </p>
            <button
              type="button"
              disabled={loading}
              onClick={() => instantDemoLogin('chuckle@omniverse.app', 'chuckle123')}
              className="w-full py-2 px-3 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 text-xs font-semibold flex items-center justify-between transition disabled:opacity-50"
            >
              <span>👑 Chuckle Chieftain (Full Library & Debates)</span>
              <span className="text-[10px] bg-teal-400/20 px-2 py-0.5 rounded font-bold">1-Click Login</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => instantDemoLogin('demo@omniverse.app', 'user123')}
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[var(--text-muted)] hover:text-white transition flex items-center justify-between disabled:opacity-50"
            >
              <span>👤 Demo User (Explorer)</span>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-medium">1-Click Login</span>
            </button>
          </div>

          <Link to="/" className="block text-center text-xs text-[var(--text-muted)] hover:text-teal-300">
            Continue browsing without account
          </Link>
        </motion.form>
      </div>
    </div>
  )
}
