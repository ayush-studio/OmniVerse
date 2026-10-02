import { useState } from 'react'
import { motion } from 'framer-motion'
import { useZeroG } from '@/hooks/useZeroG'
import { haptics } from '@/utils/audioHaptics'

export default function TiltCard({
  children,
  className = '',
  isMasterpiece = false,
  onHoverSound = true,
  onClick,
}) {
  const [hovered, setHovered] = useState(false)
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
  } = useZeroG({ maxTilt: 5, stiffness: 300, damping: 20 })

  function handleMouseEnter() {
    setHovered(true)
    if (onHoverSound) {
      haptics.playPop()
    }
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => {
        setHovered(false)
        handleMouseLeave()
      }}
      onFocus={handleFocus}
      onClick={onClick}
      style={{
        transformStyle: 'preserve-3d',
        rotateX: isMotionActive ? rotateX : 0,
        rotateY: isMotionActive ? rotateY : 0,
      }}
      whileHover={isMotionActive ? { scale: 1.025 } : {}}
      transition={{ scale: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }}
      className={`relative group [perspective:1200px] select-none will-change-transform ${isMasterpiece ? 'masterpiece-card' : ''} ${className}`}
    >
      {/* Holographic foil highlight border for masterpieces */}
      {isMasterpiece && (
        <div
          aria-hidden="true"
          className="absolute -inset-[1.5px] rounded-2xl bg-gradient-to-r from-amber-400 via-rose-500 to-teal-400 opacity-60 blur-[1px] group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10"
        />
      )}

      {/* Card Content with absolute anchoring for controls */}
      <div className="relative z-10 w-full h-full rounded-2xl overflow-hidden">
        {children}

        {/* Dynamic Specular Sheen (GPU accelerated radial gradient) */}
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

