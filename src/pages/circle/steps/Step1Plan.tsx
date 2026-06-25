import Badge from '../../../components/ui/Badge'
import { CheckIcon } from '../../../components/ui/Icons'
import type { Plan } from '../../../types'

interface Step1Props {
  selected: Plan | null
  onSelect: (plan: Plan) => void
}

const plans = [
  {
    id: 'BAM' as Plan,
    name: 'BAM',
    tagline: 'Basic Automated Management — for small groups up to 12',
    features: [
      'Up to 12 members',
      'Monthly cycles',
      'Auto reconciliation',
      'Credit scoring',
      'Advanced analytics',
    ],
    recommended: false,
  },
  {
    id: 'ADASHI' as Plan,
    name: 'ADASHI',
    tagline: 'Advanced Dashboard — full features for up to 50 members',
    features: [
      'Up to 50 members',
      'Fortnightly/monthly',
      'Underpay/overpay handling',
      'Credit scoring & passport',
      'Full analytics + CSV export',
    ],
    recommended: true,
  },
]

export default function Step1Plan({ selected, onSelect }: Step1Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-text-base mb-1.5">Choose a plan</h2>
      <p className="text-sm text-text-dim mb-6">Select the plan that fits your group's needs</p>

      <div className="grid sm:grid-cols-2 gap-4">
        {plans.map(plan => {
          const isSelected = selected === plan.id
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onSelect(plan.id)}
              className={[
                'relative text-left rounded-xl border p-5 transition-all',
                isSelected
                  ? 'border-green-accent ring-1 ring-green-accent/25 bg-surface-alt'
                  : 'border-border bg-surface hover:border-border-light',
              ].join(' ')}
            >
              {/* Badges */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base font-bold text-text-base">{plan.name}</span>
                {isSelected && (
                  <Badge variant="green" className="text-[11px]">
                    <CheckIcon className="w-2.5 h-2.5" /> Selected
                  </Badge>
                )}
                {plan.recommended && !isSelected && (
                  <Badge variant="amber" className="text-[11px]">Recommended</Badge>
                )}
                {plan.recommended && isSelected && (
                  <Badge variant="amber" className="text-[11px]">Recommended</Badge>
                )}
              </div>

              <p className="text-xs text-text-ghost mb-4 leading-relaxed">{plan.tagline}</p>

              <ul className="space-y-2">
                {plan.features.map(feat => (
                  <li key={feat} className="flex items-center gap-2.5 text-xs">
                    <span
                      className={[
                        'w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0',
                        isSelected ? 'bg-green-accent/20 text-green-accent' : 'bg-amber-accent/20 text-amber-accent',
                      ].join(' ')}
                    >
                      {isSelected ? <CheckIcon className="w-2 h-2" /> : <span className="text-[8px] font-bold">·</span>}
                    </span>
                    <span className={isSelected ? 'text-text-dim' : 'text-text-ghost'}>{feat}</span>
                  </li>
                ))}
              </ul>
            </button>
          )
        })}
      </div>
    </div>
  )
}
