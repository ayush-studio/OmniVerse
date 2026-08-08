import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { cn } from '@/utils/cn'

export default function EmptyState({
  title = 'Nothing here yet',
  description,
  actionLabel,
  actionTo,
  onAction,
  className,
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-dashed border-[var(--border)] px-6 py-14 text-center',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.12),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(56,189,248,0.1),transparent_40%)]" />
      <div className="relative mx-auto max-w-md space-y-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/15 text-2xl">
          ◈
        </div>
        <h3 className="font-display text-xl font-bold">{title}</h3>
        {description && <p className="text-sm text-[var(--text-muted)] leading-relaxed">{description}</p>}
        {(actionTo || onAction) && (
          <div className="pt-2">
            {actionTo ? (
              <Link to={actionTo}>
                <Button>{actionLabel || 'Browse'}</Button>
              </Link>
            ) : (
              <Button onClick={onAction}>{actionLabel || 'Get started'}</Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
