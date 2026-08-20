import type { ReactNode } from 'react'

export type BadgeTone = 'neutral' | 'accent' | 'warn' | 'danger' | 'ok'

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}

/** Small status marker: stock level, category, payment method, sold-out. */
export function Badge({ tone = 'neutral', children, className = '' }: BadgeProps) {
  return <span className={`badge badge--${tone} ${className}`.trim()}>{children}</span>
}

/** Maps a stock count to the tone the whole app uses for that level. */
export function stockTone(stock: number, threshold = 3): BadgeTone {
  if (stock <= 0) return 'danger'
  if (stock <= threshold) return 'warn'
  return 'ok'
}
