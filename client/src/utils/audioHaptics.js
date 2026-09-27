// Lightweight zero-asset UI audio synthesizer using native Web Audio API
// No external mp3/wav files required, zero network cost, works 100% offline.

class AudioHaptics {
  constructor() {
    this.ctx = null
    this.enabled = typeof window !== 'undefined' ? localStorage.getItem('omniverse_sound_enabled') === 'true' : false
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  toggleSound() {
    this.enabled = !this.enabled
    if (typeof window !== 'undefined') {
      localStorage.setItem('omniverse_sound_enabled', String(this.enabled))
    }
    if (this.enabled) {
      this.playSuccess()
    }
    return this.enabled
  }

  playClick() {
    if (!this.enabled) return
    try {
      this.init()
      if (!this.ctx) return
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(600, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.04)

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start()
      osc.stop(this.ctx.currentTime + 0.04)
    } catch {
      // AudioContext unavailable or blocked by autoplay policy
    }
  }

  playPop() {
    if (!this.enabled) return
    try {
      this.init()
      if (!this.ctx) return
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(320, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(740, this.ctx.currentTime + 0.06)

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.06)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start()
      osc.stop(this.ctx.currentTime + 0.06)
    } catch {}
  }

  playSuccess() {
    if (!this.enabled) return
    try {
      this.init()
      if (!this.ctx) return
      const now = this.ctx.currentTime

      // Two-tone cheerful chime (E5 -> B5)
      const playTone = (freq, start, duration) => {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, start)

        gain.gain.setValueAtTime(0.05, start)
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

        osc.connect(gain)
        gain.connect(this.ctx.destination)

        osc.start(start)
        osc.stop(start + duration)
      }

      playTone(659.25, now, 0.12)
      playTone(987.77, now + 0.08, 0.22)
    } catch {}
  }

  playFavorite() {
    if (!this.enabled) return
    try {
      this.init()
      if (!this.ctx) return
      const now = this.ctx.currentTime
      // Sparkle chord
      ;[523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + idx * 0.04)

        gain.gain.setValueAtTime(0.04, now + idx * 0.04)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.18)

        osc.connect(gain)
        gain.connect(this.ctx.destination)

        osc.start(now + idx * 0.04)
        osc.stop(now + idx * 0.04 + 0.18)
      })
    } catch {}
  }
}

export const haptics = new AudioHaptics()
