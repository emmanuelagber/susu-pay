import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
  iconRight?: ReactNode
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-blue-accent text-white hover:opacity-90 focus-visible:ring-2 focus-visible:ring-blue-accent/50',
  secondary:
    'bg-transparent text-text-base border border-border-light hover:bg-surface-alt focus-visible:ring-2 focus-visible:ring-border-light',
  ghost:
    'bg-transparent text-text-dim hover:text-text-base hover:bg-surface-alt focus-visible:ring-2 focus-visible:ring-border-light',
  danger:
    'bg-transparent text-danger border border-danger/40 hover:bg-danger/10 focus-visible:ring-2 focus-visible:ring-danger/40',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-sm gap-2',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  iconRight,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center font-medium rounded-lg transition-all outline-none',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
      {...rest}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      {children}
      {iconRight && !loading && <span className="flex-shrink-0">{iconRight}</span>}
    </button>
  )
}
