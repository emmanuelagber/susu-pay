import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGetMemberPayoutAccount, apiSetMemberPayoutAccount } from '../../lib/api'
import { NIGERIAN_BANKS } from '../../lib/nigerianBanks'
import Button from '../../components/ui/Button'
import Input, { Select } from '../../components/ui/Input'
import { BankIcon, CheckIcon } from '../../components/ui/Icons'

function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) return accountNumber
  return `•••• ${accountNumber.slice(-4)}`
}

export default function PayoutAccountCard({ memberId, token }: { memberId: string; token: string }) {
  const qc = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [bankCode, setBankCode] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [error, setError] = useState<string | null>(null)

  const queryKey = ['member-payout-account', memberId]

  const { data: payoutAccount, isLoading } = useQuery({
    queryKey,
    queryFn: () => apiGetMemberPayoutAccount(memberId, token),
    enabled: !!memberId && !!token,
  })

  const mutation = useMutation({
    mutationFn: (payload: { bankCode: string; bankLabel: string; accountNumber: string }) =>
      apiSetMemberPayoutAccount(memberId, payload, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey })
      setIsEditing(false)
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Could not save your bank account. Please try again.')
    },
  })

  const openEditor = () => {
    setBankCode(payoutAccount?.bankCode ?? '')
    setAccountNumber(payoutAccount?.accountNumber ?? '')
    setError(null)
    setIsEditing(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const bank = NIGERIAN_BANKS.find(b => b.code === bankCode)
    if (!bank) {
      setError('Please select your bank.')
      return
    }
    if (!/^\d{10}$/.test(accountNumber.trim())) {
      setError('Enter a valid 10-digit account number.')
      return
    }
    mutation.mutate({ bankCode: bank.code, bankLabel: bank.label, accountNumber: accountNumber.trim() })
  }

  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl border border-border p-5 animate-pulse">
        <div className="h-4 w-40 bg-border/60 rounded mb-2" />
        <div className="h-3 w-64 bg-border/60 rounded" />
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="bg-surface rounded-xl border border-border p-5">
        <p className="text-sm font-semibold text-text-base mb-1">
          {payoutAccount ? 'Update payout account' : 'Add your payout account'}
        </p>
        <p className="text-xs text-text-ghost mb-4">
          This is the bank account your payout will be sent to when it's your turn.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <Select
            label="Bank"
            value={bankCode}
            onChange={e => setBankCode(e.target.value)}
          >
            <option value="">Select your bank…</option>
            {NIGERIAN_BANKS.map(b => (
              <option key={b.code} value={b.code}>{b.label}</option>
            ))}
          </Select>

          <Input
            label="Account number"
            inputMode="numeric"
            placeholder="0123456789"
            value={accountNumber}
            maxLength={10}
            onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ''))}
          />

          {error && (
            <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 mt-1">
            <Button type="submit" variant="primary" size="sm" loading={mutation.isPending}>
              Save
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    )
  }

  if (!payoutAccount) {
    return (
      <div className="rounded-xl border border-dashed border-border p-5 flex items-start gap-3">
        <BankIcon className="w-5 h-5 text-text-ghost/50 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-base">Add your payout account</p>
          <p className="text-xs text-text-ghost mt-0.5">
            We need your bank details on file so your payout can be sent when it's your turn.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={openEditor} className="flex-shrink-0">
          Add account
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-5 flex items-start gap-3">
      <div className="w-9 h-9 rounded-full bg-green-accent/10 flex items-center justify-center flex-shrink-0">
        <BankIcon className="w-4 h-4 text-green-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-text-base">{payoutAccount.bankLabel}</p>
          <CheckIcon className="w-3.5 h-3.5 text-green-accent" />
        </div>
        <p className="text-xs text-text-ghost mt-0.5 font-mono tracking-wide">
          {maskAccountNumber(payoutAccount.accountNumber)}
        </p>
      </div>
      <Button variant="ghost" size="sm" onClick={openEditor} className="flex-shrink-0">
        Edit
      </Button>
    </div>
  )
}
