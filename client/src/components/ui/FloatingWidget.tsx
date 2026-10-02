import React from 'react'
import { motion } from 'framer-motion'
import { useUiStore } from '@/store'
import { cn } from '@/utils/cn'

export interface FloatingWidgetProps {
  children: React.ReactNode
  /** When true, buoyancy is suspended and the widget locks strictly into place */
  isOpen?: boolean
  className?: string
  /** Float amplitude in pixels (default 5px) */
  amplitude?: number
  /** Cycle duration in seconds (default 3.5s) */
  duration?: number
}

/**
 * FloatingWidget: Buoyant anti-gravity floating wrapper.
 * Features subtle vertical levitation (4-6px, 3.5s cycle) using GPU-accelerated translate3d.
 * Locks solidly into position when opened or when reduced motion is preferred.
 */
export function FloatingWidget({
  children,
  isOpen = false,
  className = '',
  amplitude = 5,
  duration = 3.5,
}: FloatingWidgetProps) {
  const enableAntiGravity = useUiStore((s) => s.enableAntiGravity ?? true)
  const reducedMotion = useUiStore((s) => s.reducedMotion ?? false)

  const shouldLevitate = enableAntiGravity && !reducedMotion && !isOpen

  return (
    <motion.div
      animate={
        shouldLevitate
          ? {
              y: [-amplitude, amplitude, -amplitude],
              rotate: [-0.4, 0.4, -0.4],
            }
          : { y: 0, rotate: 0 }
      }
      transition={{
        duration,
        repeat: Infinity,
        ease: [0.45, 0.05, 0.55, 0.95],
      }}
      className={cn('will-change-transform transform-gpu', className)}
    >
      {children}
    </motion.div>
  )
}

export default FloatingWidget
