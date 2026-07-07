import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { apiForgotPassword } from '../lib/api'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => apiForgotPassword(email),
    onSuccess: () => {
      navigate('/reset-password', { state: { email } })
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    mutation.mutate()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#080F1A' }}>
      <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-6">
        <h1 className="text-xl font-semibold text-text-base mb-1">Forgot password</h1>
        <p className="text-sm text-text-ghost mb-6">
          Enter your email and we'll send you a code to reset your password.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Button
            type="submit"
            variant="primary"
            loading={mutation.isPending}
            disabled={mutation.isPending}
          >
            Send reset code
          </Button>
        </form>

        <p className="text-xs text-text-ghost text-center mt-5">
          Remembered your password?{' '}
          <Link to="/login" className="text-blue-accent hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  )
}