import type { ReactNode } from 'react'

type BadgeVariant = 'green' | 'amber' | 'blue' | 'muted' | 'danger' | 'outline'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
  dot?: boolean
}

const variantClasses: Record<BadgeVariant, string> = {
  green:   'bg-green-accent/15 text-green-accent border border-green-accent/25',
  amber:   'bg-amber-accent/15 text-amber-accent border border-amber-accent/25',
  blue:    'bg-blue-accent/15 text-blue-accent border border-blue-accent/25',
  muted:   'bg-border/30 text-text-dim border border-border',
  danger:  'bg-danger/15 text-danger border border-danger/25',
  outline: 'bg-transparent text-text-dim border border-border-light',
}

export default function Badge({ variant = 'muted', children, className = '', dot }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {dot && (
        <span className={[
          'w-1.5 h-1.5 rounded-full flex-shrink-0',
          variant === 'green' ? 'bg-green-accent' :
          variant === 'amber' ? 'bg-amber-accent' :
          variant === 'blue' ? 'bg-blue-accent' :
          variant === 'danger' ? 'bg-danger' : 'bg-text-ghost',
        ].join(' ')} />
      )}
      {children}
    </span>
  )
}
