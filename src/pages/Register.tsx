import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { apiRegister } from '../lib/api'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { CircleLogo } from '../components/ui/Icons'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: () => apiRegister({ name, email, phone, password, confirmPassword }),
    onSuccess: auth => {
      login(auth)
      navigate('/overview', { replace: true })
    },
    onError: (error: unknown) => {
      setError(error instanceof Error ? error.message : 'Registration failed. Please try again.')
    },
  })

  const validate = () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      return false
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return false
    }
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    mutation.mutate()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0B1929' }}>
      <div className="w-full max-w-[420px]">
        <div className="rounded-2xl border p-8" style={{ background: '#122035', borderColor: '#1A3048' }}>
          <div className="flex flex-col items-center mb-7">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: '#4B7CF3' }}>
              <CircleLogo className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-text-base">Create account</h1>
            <p className="text-sm text-text-dim mt-0.5">Register for Susu Circle</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Full name"
              type="text"
              placeholder="Jane Doe"
              value={name}
              onChange={e => setName(e.target.value)}
              autoComplete="name"
            />
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
            <Input
              label="Phone number"
              type="tel"
              placeholder="08012345678"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              autoComplete="tel"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <Input
              label="Confirm password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
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
              Register
            </Button>
          </form>

          <p className="text-xs text-text-ghost text-center mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
