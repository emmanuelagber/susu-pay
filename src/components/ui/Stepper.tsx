import { CheckIcon } from './Icons'

interface StepperProps {
  steps: string[]
  current: number
}

export default function Stepper({ steps, current }: StepperProps) {
  return (
    <div className="flex items-center">
      {steps.map((label, i) => {
        const step = i + 1
        const isDone = step < current
        const isActive = step === current
        const isFuture = step > current

        return (
          <div key={label} className="flex items-center">
            {/* connector line before (skip for first) */}
            {i > 0 && (
              <div
                className={[
                  'h-px w-8 sm:w-12 flex-shrink-0',
                  isDone ? 'bg-green-accent' : 'bg-border-light',
                ].join(' ')}
              />
            )}

            <div className="flex items-center gap-2">
              {/* circle */}
              <div
                className={[
                  'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold transition-colors',
                  isDone
                    ? 'bg-green-accent text-bg'
                    : isActive
                    ? 'bg-blue-accent text-white ring-2 ring-blue-accent/30'
                    : 'bg-transparent border border-border-light text-text-ghost',
                ].join(' ')}
              >
                {isDone ? <CheckIcon className="w-3.5 h-3.5" /> : step}
              </div>

              {/* label — hide on small screens except active */}
              <span
                className={[
                  'text-xs font-medium whitespace-nowrap',
                  isActive ? 'text-text-base' : isFuture ? 'text-text-ghost' : 'text-text-dim',
                  !isActive && 'hidden sm:block',
                ].join(' ')}
              >
                {label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
