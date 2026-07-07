import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { apiResetPassword } from '../lib/api'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const prefillEmail = (location.state as { email?: string } | null)?.email ?? ''

  const [email, setEmail] = useState(prefillEmail)
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => apiResetPassword({ email, code, newPassword, confirmNewPassword }),
    onSuccess: () => {
      navigate('/login', { state: { passwordResetSuccess: true } })
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Reset failed. Check your code and try again.')
    },
  })

  const validate = (): string | null => {
    if (!email.trim()) return 'Email is required.'
    if (!code.trim()) return 'Reset code is required.'
    if (!newPassword) return 'New password is required.'
    if (newPassword.length < 8) return 'Password must be at least 8 characters.'
    if (newPassword !== confirmNewPassword) return 'Passwords do not match.'
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    setError(validationError)
    if (validationError) return
    mutation.mutate()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#080F1A' }}>
      <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-6">
        <h1 className="text-xl font-semibold text-text-base mb-1">Reset password</h1>
        <p className="text-sm text-text-ghost mb-6">
          Enter the code sent to your email along with your new password.
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
          <Input
            label="Reset code"
            placeholder="Enter the code from your email"
            value={code}
            onChange={e => setCode(e.target.value)}
          />
          <Input
            label="New password"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <Input
            label="Confirm new password"
            type="password"
            placeholder="••••••••"
            value={confirmNewPassword}
            onChange={e => setConfirmNewPassword(e.target.value)}
          />
          <Button
            type="submit"
            variant="primary"
            loading={mutation.isPending}
            disabled={mutation.isPending}
          >
            Reset password
          </Button>
        </form>

        <p className="text-xs text-text-ghost text-center mt-5">
          <Link to="/forgot-password" className="text-blue-accent hover:underline">Resend code</Link>
          {' · '}
          <Link to="/login" className="text-blue-accent hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  )
}