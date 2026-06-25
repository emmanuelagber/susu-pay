import type { InputHTMLAttributes, ReactNode } from 'react'

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> & {
  label?: string
  error?: string
  hint?: string
  prefix?: ReactNode
  suffix?: ReactNode
}

export default function Input({ label, error, hint, prefix, suffix, className = '', id, ...rest }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-text-dim">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-text-ghost text-sm pointer-events-none">{prefix}</span>
        )}
        <input
          id={inputId}
          className={[
            'w-full h-10 bg-bg border rounded-lg text-sm text-text-base placeholder-text-ghost',
            'transition-colors outline-none',
            'focus:border-blue-accent focus:ring-1 focus:ring-blue-accent/30',
            error ? 'border-danger' : 'border-border',
            prefix ? 'pl-8' : 'pl-3',
            suffix ? 'pr-8' : 'pr-3',
            className,
          ].join(' ')}
          {...rest}
        />
        {suffix && (
          <span className="absolute right-3 text-text-ghost text-sm pointer-events-none">{suffix}</span>
        )}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      {hint && !error && <p className="text-xs text-text-ghost">{hint}</p>}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  children: ReactNode
}

export function Select({ label, error, children, className = '', id, ...rest }: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-text-dim">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={[
          'w-full h-10 bg-bg border rounded-lg text-sm text-text-base px-3',
          'transition-colors outline-none appearance-none',
          'focus:border-blue-accent focus:ring-1 focus:ring-blue-accent/30',
          error ? 'border-danger' : 'border-border',
          className,
        ].join(' ')}
        {...rest}
      >
        {children}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className = '', id, ...rest }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-text-dim">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={[
          'w-full bg-bg border rounded-lg text-sm text-text-base placeholder-text-ghost p-3',
          'transition-colors outline-none resize-none',
          'focus:border-blue-accent focus:ring-1 focus:ring-blue-accent/30',
          error ? 'border-danger' : 'border-border',
          className,
        ].join(' ')}
        {...rest}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
