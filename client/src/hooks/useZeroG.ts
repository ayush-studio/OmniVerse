import { useRef, useEffect, useCallback } from 'react'
import { useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion'
import { useUiStore } from '@/store'

export interface ZeroGOptions {
  /** Maximum rotation angle in degrees (default ±5deg) */
  maxTilt?: number
  /** Spring stiffness for recovery (default 300) */
  stiffness?: number
  /** Spring damping for smooth settling (default 20) */
  damping?: number
  /** Manually disable tilt */
  disabled?: boolean
}

export interface UseZeroGReturn {
  ref: React.RefObject<HTMLDivElement | null>
  rotateX: MotionValue<string>
  rotateY: MotionValue<string>
  sheenX: MotionValue<string>
  sheenY: MotionValue<string>
  handleMouseMove: (e: React.MouseEvent<HTMLElement>) => void
  handleMouseLeave: () => void
  handleFocus: () => void
  isMotionActive: boolean
}

/**
 * useZeroG: Anti-Gravity 3D tilt and specular sheen physics hook.
 *
 * Implements GPU-accelerated cursor-following physics with dampened
 * normalized coordinates (-1 to 1) and automatic prefers-reduced-motion fallback.
 */
export function useZeroG({
  maxTilt = 5,
  stiffness = 300,
  damping = 20,
  disabled = false,
}: ZeroGOptions = {}): UseZeroGReturn {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const enableAntiGravity = useUiStore((s) => s.enableAntiGravity ?? true)
  const reducedMotion = useUiStore((s) => s.reducedMotion ?? false)

  // Normalized motion values (-1 to 1 relative to card center)
  const xNorm = useMotionValue(0)
  const yNorm = useMotionValue(0)

  // Physics springs with requested stiffness: 300, damping: 20
  const xSpring = useSpring(xNorm, { stiffness, damping })
  const ySpring = useSpring(yNorm, { stiffness, damping })

  // Map normalized coordinates to 3D rotation angles (strictly max ±maxTilt degrees)
  const rotateX = useTransform(ySpring, [-1, 1], [`${maxTilt}deg`, `-${maxTilt}deg`])
  const rotateY = useTransform(xSpring, [-1, 1], [`-${maxTilt}deg`, `${maxTilt}deg`])

  // Specular sheen coordinates for cursor-following glare (0% to 100%)
  const sheenX = useTransform(xSpring, [-1, 1], ['0%', '100%'])
  const sheenY = useTransform(ySpring, [-1, 1], ['0%', '100%'])

  // Listen to OS prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleMotionChange = (e: MediaQueryListEvent) => {
      useUiStore.getState().setReducedMotion?.(e.matches)
    }

    if (mediaQuery.matches) {
      useUiStore.getState().setReducedMotion?.(true)
    }

    mediaQuery.addEventListener('change', handleMotionChange)
    return () => mediaQuery.removeEventListener('change', handleMotionChange)
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (disabled || !enableAntiGravity || reducedMotion || !cardRef.current) return

      const rect = cardRef.current.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return

      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // Calculate normalized position (-1 to 1) from card center
      const normalizedX = (mouseX / rect.width - 0.5) * 2
      const normalizedY = (mouseY / rect.height - 0.5) * 2

      xNorm.set(Math.max(-1, Math.min(1, normalizedX)))
      yNorm.set(Math.max(-1, Math.min(1, normalizedY)))
    },
    [disabled, enableAntiGravity, reducedMotion, xNorm, yNorm]
  )

  const handleMouseLeave = useCallback(() => {
    xNorm.set(0)
    yNorm.set(0)
  }, [xNorm, yNorm])

  const handleFocus = useCallback(() => {
    // Instantly reset tilt and position to 0 on :focus-visible for accessibility
    xNorm.jump(0)
    yNorm.jump(0)
  }, [xNorm, yNorm])

  return {
    ref: cardRef,
    rotateX,
    rotateY,
    sheenX,
    sheenY,
    handleMouseMove,
    handleMouseLeave,
    handleFocus,
    isMotionActive: enableAntiGravity && !reducedMotion && !disabled,
  }
}

export default useZeroG
