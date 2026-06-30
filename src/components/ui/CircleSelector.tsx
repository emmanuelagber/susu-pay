import { ChevronDownIcon } from './Icons'
import type { Circle } from '../../types'

interface Props {
  circles: Circle[]
  selectedId: string
  onChange: (id: string) => void
  className?: string
}

export default function CircleSelector({ circles, selectedId, onChange, className = '' }: Props) {
  if (circles.length <= 1) {
    return (
      <span className={['text-sm font-medium text-text-base', className].join(' ')}>
        {circles[0]?.name ?? '—'}
      </span>
    )
  }

  return (
    <div className={['relative inline-flex items-center', className].join(' ')}>
      <select
        value={selectedId}
        onChange={e => onChange(e.target.value)}
        className="appearance-none h-8 pl-3 pr-8 bg-surface border border-border rounded-lg text-sm text-text-base outline-none focus:border-blue-accent cursor-pointer"
      >
        {circles.map(c => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="w-3.5 h-3.5 text-text-ghost absolute right-2.5 pointer-events-none" />
    </div>
  )
}
