import { useEffect, useState } from 'react'
import { extractDominantColor } from '@/utils/colorThief'

export default function AmbientBackdrop({ imageUrl }) {
  const [ambientColor, setAmbientColor] = useState(null)

  useEffect(() => {
    let active = true
    if (imageUrl) {
      extractDominantColor(imageUrl).then((color) => {
        if (active && color) {
          setAmbientColor(color)
        }
      })
    }
    return () => {
      active = false
    }
  }, [imageUrl])

  if (!imageUrl) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Dynamic Chroma Color Aura */}
      {ambientColor && (
        <div
          className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[85vw] max-w-[1200px] h-[550px] rounded-full blur-[130px] animate-pulse-chroma pointer-events-none"
          style={{
            backgroundColor: ambientColor.glowRgba,
          }}
        />
      )}

      {/* Blurred image projection */}
      <img
        src={imageUrl}
        alt=""
        aria-hidden="true"
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover scale-150 blur-3xl filter saturate-150 opacity-35 transform-gpu"
      />

      {/* Darkening vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg)]/80 to-[var(--bg)]" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-[var(--bg)]/90" />
    </div>
  )
}
