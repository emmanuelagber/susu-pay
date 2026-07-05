import { useEffect, useState } from 'react'
import { subscribeGlobalErrors } from '../../lib/errors'
import { XIcon } from './Icons'
import type { GlobalErrorPayload } from '../../lib/errors'

export default function GlobalErrorToast() {
  const [error, setError] = useState<GlobalErrorPayload | null>(null)

  useEffect(() => {
    return subscribeGlobalErrors(nextError => {
      setError(nextError)
      window.setTimeout(() => {
        setError(current => current?.id === nextError.id ? null : current)
      }, 8000)
    })
  }, [])

  if (!error) return null

  return (
    <div className="fixed right-4 top-4 z-50 w-[min(calc(100vw-2rem),420px)]">
      <div className="rounded-xl border border-danger/40 bg-[#160B12] shadow-card-lg">
        <div className="flex items-start gap-3 px-4 py-3">
          <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-danger" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-text-base">{error.title}</p>
            {error.messages.length === 1 ? (
              <p className="mt-1 text-sm leading-relaxed text-text-dim">{error.messages[0]}</p>
            ) : (
              <ul className="mt-1 space-y-1">
                {error.messages.map(message => (
                  <li key={message} className="text-sm leading-relaxed text-text-dim">
                    {message}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="rounded-md p-1 text-text-ghost transition-colors hover:bg-danger/10 hover:text-text-base"
            aria-label="Dismiss error"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
