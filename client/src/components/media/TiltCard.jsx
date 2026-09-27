import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { haptics } from '@/utils/audioHaptics'

export default function TiltCard({
  children,
  className = '',
  isMasterpiece = false,
  onHoverSound = true,
  onClick,
}) {
  const cardRef = useRef(null)
  const [hovered, setHovered] = useState(false)

  // Motion values for tilt angles
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Spring physics for buttery-smooth recovery
  const mouseXSpring = useSpring(x, { stiffness: 260, damping: 20 })
  const mouseYSpring = useSpring(y, { stiffness: 260, damping: 20 })

  // Map coordinates to 3D rotation degrees
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['9deg', '-9deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-9deg', '9deg'])

  // Glare position
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%'])
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%'])

  function handleMouseMove(e) {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Normalize from -0.5 to 0.5
    x.set(mouseX / width - 0.5)
    y.set(mouseY / height - 0.5)
  }

  function handleMouseEnter() {
    setHovered(true)
    if (onHoverSound) {
      haptics.playPop()
    }
  }

  function handleMouseLeave() {
    setHovered(false)
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ scale: 1.03 }}
      transition={{ scale: { duration: 0.2 } }}
      className={`relative group perspective-1000 select-none ${isMasterpiece ? 'masterpiece-card' : ''} ${className}`}
    >
      {/* Holographic foil highlight border for masterpieces */}
      {isMasterpiece && (
        <div className="absolute -inset-[1.5px] rounded-2xl bg-gradient-to-r from-amber-400 via-rose-500 to-teal-400 opacity-60 blur-[1px] group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10" />
      )}

      {/* Card Content */}
      <div className="relative z-10 w-full h-full rounded-2xl overflow-hidden">
        {children}

        {/* Dynamic Specular Glare */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay"
          style={{
            background: `radial-gradient(circle 180px at ${glareX} ${glareY}, rgba(255, 255, 255, 0.35), transparent 70%)`,
          }}
        />
      </div>
    </motion.div>
  )
}
