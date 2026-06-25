import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { apiLogin } from '../lib/api'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { CircleLogo } from '../components/ui/Icons'

export default function Login() {
  const [email, setEmail] = useState('admin@susucircle.ng')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: () => apiLogin(email, password),
    onSuccess: (user) => {
      login(user)
      navigate(user.role === 'member' ? '/member' : '/overview', { replace: true })
    },
    onError: () => setError('Invalid credentials. Please try again.'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }
    mutation.mutate()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0B1929' }}>
      <div className="w-full max-w-[400px]">
        {/* Card */}
        <div
          className="rounded-2xl border p-8"
          style={{ background: '#122035', borderColor: '#1A3048' }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: '#4B7CF3' }}
            >
              <CircleLogo className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-text-base">Susu Circle</h1>
            <p className="text-sm text-text-dim mt-0.5">Coordinator dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            {error && (
              <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={mutation.isPending}
              className="w-full mt-1"
            >
              Sign in
            </Button>
          </form>

          {/* Demo hint */}
          <p className="text-xs text-text-ghost text-center mt-5">
            Demo: use any email to sign in as admin,{' '}
            <span
              className="text-blue-accent cursor-pointer hover:underline"
              onClick={() => setEmail('chidi@example.com')}
            >
              chidi@example.com
            </span>{' '}
            for member view.
          </p>
        </div>
      </div>
    </div>
  )
}
