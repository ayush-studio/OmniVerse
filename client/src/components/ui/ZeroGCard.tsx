import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useZeroG } from '@/hooks/useZeroG'
import { cn } from '@/utils/cn'

export interface ZeroGCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  innerClassName?: string
  maxTilt?: number
  glowColor?: 'teal' | 'amber' | 'violet' | 'cyan' | 'none'
  isMasterpiece?: boolean
}

/**
 * ZeroGCard: Anti-Gravity 3D card wrapper.
 * Features cursor-directed 3D tilt (max ±5°), spring return, and a specular sheen reflection overlay.
 * Keeps nested interactive controls (watchlist, ratings, buttons) absolutely anchored.
 */
export function ZeroGCard({
  children,
  className = '',
  innerClassName = '',
  maxTilt = 5,
  glowColor = 'teal',
  isMasterpiece = false,
  ...props
}: ZeroGCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const {
    ref,
    rotateX,
    rotateY,
    sheenX,
    sheenY,
    handleMouseMove,
    handleMouseLeave,
    handleFocus,
    isMotionActive,
  } = useZeroG({ maxTilt, stiffness: 300, damping: 20 })

  const glowStyles = {
    teal: 'hover:shadow-[0_16px_36px_-8px_rgba(20,184,166,0.38)] hover:border-teal-400/40',
    amber: 'hover:shadow-[0_16px_36px_-8px_rgba(245,158,11,0.38)] hover:border-amber-400/40',
    violet: 'hover:shadow-[0_16px_36px_-8px_rgba(168,85,247,0.38)] hover:border-violet-400/40',
    cyan: 'hover:shadow-[0_16px_36px_-8px_rgba(56,189,248,0.38)] hover:border-cyan-400/40',
    none: '',
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        handleMouseLeave()
      }}
      onFocus={handleFocus}
      style={{
        transformStyle: 'preserve-3d',
        rotateX: isMotionActive ? rotateX : 0,
        rotateY: isMotionActive ? rotateY : 0,
      }}
      whileHover={isMotionActive ? { scale: 1.025 } : {}}
      transition={{ scale: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
      className={cn(
        'relative group select-none transition-colors duration-300 will-change-transform',
        '[perspective:1200px]',
        glowStyles[glowColor],
        className
      )}
      {...props}
    >
      {/* Masterpiece holographic halo for top-tier items */}
      {isMasterpiece && (
        <div
          aria-hidden="true"
          className="absolute -inset-[1.5px] rounded-2xl bg-gradient-to-r from-amber-400 via-rose-500 to-teal-400 opacity-60 blur-[2px] group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10"
        />
      )}

      {/* Main card content container */}
      <div className={cn('relative z-10 w-full h-full rounded-2xl overflow-hidden', innerClassName)}>
        {children}

        {/* Specular sheen reflection overlay */}
        {isMotionActive && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay"
            style={{
              background: `radial-gradient(circle 240px at ${sheenX} ${sheenY}, rgba(255, 255, 255, 0.38), transparent 75%)`,
            }}
          />
        )}
      </div>
    </motion.div>
  )
}

export default ZeroGCard
