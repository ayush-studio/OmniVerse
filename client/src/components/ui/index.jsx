import { cn } from '@/utils/cn'
import { useEffect, useRef, useState } from 'react'

export function Button({ className, variant = 'primary', size = 'md', ...props }) {
  const variants = {
    primary:
      'bg-teal-500 text-slate-950 hover:bg-teal-400 shadow-[0_0_24px_rgba(20,184,166,0.25)]',
    secondary: 'glass text-[var(--text)] hover:bg-white/10',
    ghost: 'bg-transparent hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text)]',
    danger: 'bg-rose-500/90 text-white hover:bg-rose-500',
    outline: 'border border-[var(--border)] hover:border-teal-400/50 text-[var(--text)]',
  }
  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  }
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full h-11 rounded-xl border border-[var(--border)] bg-black/5 dark:bg-white/5 px-3 text-sm outline-none focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20 transition',
        className
      )}
      {...props}
    />
  )
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'w-full rounded-xl border border-[var(--border)] bg-black/5 dark:bg-white/5 px-3 py-2 text-sm outline-none focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20 transition min-h-[100px]',
        className
      )}
      {...props}
    />
  )
}

export function Label({ className, ...props }) {
  return <label className={cn('text-sm text-[var(--text-muted)] mb-1.5 block', className)} {...props} />
}

export function Badge({ className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-medium bg-teal-500/15 text-teal-300 border border-teal-500/20',
        className
      )}
      {...props}
    />
  )
}

export function Skeleton({ className }) {
  return <div className={cn('skeleton rounded-xl', className)} />
}

export function Select({ className, value, onChange, options = [], placeholder = 'Select…' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div className={cn('relative min-w-[160px]', className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full h-11 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 text-sm text-left',
          'flex items-center justify-between gap-2 outline-none transition',
          'hover:border-teal-400/40 focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20',
          open && 'border-teal-400/50 ring-2 ring-teal-400/20'
        )}
      >
        <span className={selected ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'}>
          {selected?.label || placeholder}
        </span>
        <svg
          className={cn('w-4 h-4 text-[var(--text-muted)] transition-transform', open && 'rotate-180')}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[#0f172a] dark:bg-[#121a2b] shadow-2xl shadow-black/40">
          <ul className="py-1 max-h-64 overflow-y-auto scrollbar-thin">
            {options.map((opt) => {
              const active = opt.value === value
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    className={cn(
                      'w-full px-3 py-2.5 text-left text-sm transition',
                      active
                        ? 'bg-teal-500/20 text-teal-300'
                        : 'text-[var(--text)] hover:bg-white/10 hover:text-teal-200'
                    )}
                    onClick={() => {
                      onChange?.(opt.value)
                      setOpen(false)
                    }}
                  >
                    {opt.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

export { ZeroGCard } from './ZeroGCard'
export { FloatingWidget } from './FloatingWidget'

