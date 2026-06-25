import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  highlight?: 'green' | 'blue' | 'amber' | 'none'
}

export default function Card({ children, className = '', highlight = 'none' }: CardProps) {
  const ring =
    highlight === 'green'
      ? 'border-green-accent/60 ring-1 ring-green-accent/20'
      : highlight === 'blue'
      ? 'border-blue-accent/60 ring-1 ring-blue-accent/20'
      : highlight === 'amber'
      ? 'border-amber-accent/60 ring-1 ring-amber-accent/20'
      : 'border-border'

  return (
    <div
      className={[
        'bg-surface rounded-xl border p-5',
        ring,
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

export function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string | number
  sub?: string
  accent?: 'green' | 'blue' | 'amber'
}) {
  const valueColor =
    accent === 'green'
      ? 'text-green-accent'
      : accent === 'blue'
      ? 'text-blue-accent'
      : accent === 'amber'
      ? 'text-amber-accent'
      : 'text-text-base'

  return (
    <Card>
      <p className="text-xs text-text-ghost uppercase tracking-wider mb-2">{label}</p>
      <p className={['text-2xl font-bold tabular-nums', valueColor].join(' ')}>{value}</p>
      {sub && <p className="text-xs text-text-ghost mt-1">{sub}</p>}
    </Card>
  )
}
