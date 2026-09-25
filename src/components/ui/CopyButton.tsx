import { useState } from 'react'
import { CheckIcon, CopyIcon } from './Icons'

export default function CopyButton({ value, className = '' }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  const copy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(value.replace(/\s/g, '')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? 'Copied!' : 'Copy'}
      className={['text-text-ghost hover:text-text-base transition-colors', className].join(' ')}
    >
      {copied ? <CheckIcon className="w-3.5 h-3.5 text-green-accent" /> : <CopyIcon className="w-3.5 h-3.5" />}
    </button>
  )
}
