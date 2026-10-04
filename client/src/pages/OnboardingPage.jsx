import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/store'
import { AVATAR_PRESETS, TASTE_TAGS, FORMAT_OPTIONS, cn } from '@/utils/cn'
import { Button, Input, Label, Textarea, Select } from '@/components/ui'
import { ArrowRight, Sparkles } from 'lucide-react'
import { haptics } from '@/utils/audioHaptics'

export default function OnboardingPage() {
  const setUser = useAuthStore((s) => s.setUser)
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [avatarUrl, setAvatarUrl] = useState(AVATAR_PRESETS[0])
  const [favoriteQuote, setFavoriteQuote] = useState('')
  const [genres, setGenres] = useState([])
  const [formats, setFormats] = useState([])
  const [childLockEnabled, setChildLockEnabled] = useState(false)
  const [childLockPin, setChildLockPin] = useState('')
  const [maxMaturityRating, setMaxMaturityRating] = useState('ADULT_18')
  const [loading, setLoading] = useState(false)

  const steps = useMemo(() => ['Avatar', 'Taste', 'Safety'], [])

  function toggle(list, setList, value) {
    setList((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }

  async function finish() {
    setLoading(true)
    haptics.playClick()
    try {
      const { data } = await authApi.onboarding({
        avatarUrl,
        favoriteQuote,
        tasteProfile: { genres, formats },
        childLockEnabled,
        childLockPin: childLockEnabled ? childLockPin : undefined,
        maxMaturityRating,
      })
      setUser(data.user)
      haptics.playFavorite()
      navigate('/')
    } catch (err) {
      console.warn('Onboarding update non-critical error, continuing to home:', err?.message)
      const currentUser = useAuthStore.getState().user
      if (currentUser) {
        setUser({ ...currentUser, onboardingComplete: true })
      }
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl glass rounded-3xl p-8"
      >
        <div className="flex items-center justify-between">
          <p className="font-display text-2xl font-bold">
            Build your <span className="text-teal-400">persona</span>
          </p>
          <button
            type="button"
            onClick={finish}
            className="text-xs text-[var(--text-muted)] hover:text-teal-300 transition flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-white/5"
            title="Skip preference setup"
          >
            <span>Skip for now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex gap-2 mt-4 mb-8">
          {steps.map((s, i) => (
            <div
              key={s}
              className={cn(
                'flex-1 h-1.5 rounded-full',
                i <= step ? 'bg-teal-400' : 'bg-white/10'
              )}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <Label>Pick a preset avatar</Label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {AVATAR_PRESETS.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setAvatarUrl(url)}
                  className={cn(
                    'rounded-2xl overflow-hidden border-2 transition',
                    avatarUrl === url ? 'border-teal-400' : 'border-transparent'
                  )}
                >
                  <img src={url} alt="" className="w-full aspect-square bg-slate-800" />
                </button>
              ))}
            </div>
            <div>
              <Label>Favorite quote / bio</Label>
              <Textarea
                value={favoriteQuote}
                onChange={(e) => setFavoriteQuote(e.target.value)}
                placeholder="I watch lore, then spoilers, then lore again."
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <Label>Formats you live for</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {FORMAT_OPTIONS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggle(formats, setFormats, f)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm border transition',
                      formats.includes(f)
                        ? 'border-teal-400 bg-teal-500/15 text-teal-300'
                        : 'border-[var(--border)] text-[var(--text-muted)]'
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Taste tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {TASTE_TAGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggle(genres, setGenres, t)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm border transition',
                      genres.includes(t)
                        ? 'border-sky-400 bg-sky-500/15 text-sky-300'
                        : 'border-[var(--border)] text-[var(--text-muted)]'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={childLockEnabled}
                onChange={(e) => setChildLockEnabled(e.target.checked)}
              />
              Enable child lock (PIN)
            </label>
            {childLockEnabled && (
              <div>
                <Label>4-digit PIN</Label>
                <Input
                  value={childLockPin}
                  onChange={(e) => setChildLockPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="1234"
                />
              </div>
            )}
            <div>
              <Label>Max maturity rating</Label>
              <Select
                value={maxMaturityRating}
                onChange={setMaxMaturityRating}
                options={[
                  { value: 'G', label: 'G' },
                  { value: 'PG13', label: 'PG-13' },
                  { value: 'R', label: 'R' },
                  { value: 'ADULT_18', label: '18+' },
                ]}
              />
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
          {step < 2 ? (
            <Button onClick={() => setStep((s) => s + 1)}>Continue</Button>
          ) : (
            <Button onClick={finish} disabled={loading || (childLockEnabled && childLockPin.length < 4)}>
              {loading ? 'Saving…' : 'Enter OmniVerse'}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
