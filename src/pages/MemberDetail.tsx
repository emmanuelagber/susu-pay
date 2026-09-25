import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGetMember, apiGetMemberContributions, apiGetMemberPayoutAccount } from '../lib/api'
import { getMemberCircle, simulateWebhook } from '../api/members'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import CopyButton from '../components/ui/CopyButton'
import Input from '../components/ui/Input'
import { ArrowLeftIcon, ArrowRightIcon, BankIcon } from '../components/ui/Icons'
import { getErrorMessages } from '../lib/errors'

function fmt(n: number) {
  return '₦' + n.toLocaleString('en-NG')
}

function fmtDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-text-ghost uppercase tracking-wider mb-1">{label}</p>
      <div className="text-sm text-text-base">{children}</div>
    </div>
  )
}

export default function MemberDetail() {
  const { memberId = '' } = useParams()
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [simAmount, setSimAmount] = useState('')
  const [simMessage, setSimMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const { data: member, isLoading: memberLoading } = useQuery({
    queryKey: ['member', memberId],
    queryFn: () => apiGetMember(memberId, accessToken!),
    enabled: !!memberId && !!accessToken,
  })

  const { data: circle, isLoading: circleLoading } = useQuery({
    queryKey: ['member-circle', memberId],
    queryFn: () => getMemberCircle(memberId, accessToken!),
    enabled: !!memberId && !!accessToken,
  })

  const { data: payoutAccount, isLoading: payoutLoading } = useQuery({
    queryKey: ['member-payout-account', memberId],
    queryFn: () => apiGetMemberPayoutAccount(memberId, accessToken!),
    enabled: !!memberId && !!accessToken,
  })

  // Dev tool gating: the webhook only records a payment against an open (unpaid) contribution
  // for the circle's current cycle, so check the member's history before enabling it.
  const { data: contributions } = useQuery({
    queryKey: ['member-contributions', memberId],
    queryFn: () => apiGetMemberContributions(memberId, accessToken!),
    enabled: import.meta.env.DEV && !!memberId && !!accessToken,
  })

  const currentCycle = circle?.currentCycle
  const currentEntry = contributions?.history.find(h => h.cycle === currentCycle)
  const simBlocker = !contributions || currentCycle === undefined
    ? null
    : !currentEntry
      ? `No contribution has been opened for cycle ${currentCycle} yet, so there's nothing to pay against.`
      : currentEntry.paidAt || currentEntry.status?.toLowerCase() === 'paid'
        ? `Cycle ${currentCycle} is already paid${currentEntry.paidAt ? ` (${fmtDate(currentEntry.paidAt)})` : ''}.`
        : null

  const simulateMutation = useMutation({
    mutationFn: () => {
      const amount = Number(simAmount || circle?.contributionAmount || 0)
      if (!amount || amount <= 0) throw new Error('Enter an amount greater than 0.')
      return simulateWebhook({ memberId, amount }, accessToken!)
    },
    onSuccess: result => {
      if (!result?.processed) {
        setSimMessage({ ok: false, text: `Not recorded: ${result?.message ?? 'the backend did not process the payment.'}` })
        return
      }
      setSimMessage({ ok: true, text: result.message ?? 'Contribution recorded.' })
      qc.invalidateQueries({ queryKey: ['member', memberId] })
      qc.invalidateQueries({ queryKey: ['member-circle', memberId] })
      qc.invalidateQueries({ queryKey: ['reconciliation'] })
      qc.invalidateQueries({ queryKey: ['adminMembers'] })
    },
    onError: error => setSimMessage({ ok: false, text: getErrorMessages(error, 'Simulation failed.').join(' ') }),
  })

  if (memberLoading) {
    return <div className="p-6 max-w-[1100px] mx-auto text-sm text-text-ghost">Loading member…</div>
  }

  if (!member) {
    return (
      <div className="p-6 max-w-[1100px] mx-auto">
        <p className="text-sm text-danger mb-3">Member not found.</p>
        <Link to="/members" className="text-xs text-blue-accent hover:underline">Back to members</Link>
      </div>
    )
  }

  const status = member.status ?? 'pending'

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-text-ghost hover:text-text-base mb-4"
      >
        <ArrowLeftIcon className="w-3.5 h-3.5" /> Back
      </button>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar initials={member.initials} size="lg" />
        <div>
          <h1 className="text-xl font-semibold text-text-base">{member.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={status === 'paid' ? 'green' : status === 'overdue' ? 'danger' : 'amber'} dot>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
            {member.payoutPosition !== undefined && (
              <span className="text-xs text-text-ghost">Payout position #{member.payoutPosition}</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Profile */}
        <Card>
          <h2 className="text-sm font-semibold text-text-base mb-4">Profile</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone">{member.phone || '—'}</Field>
            <Field label="Email">{member.email || '—'}</Field>
            <Field label="Joined">{fmtDate(member.joinedAt)}</Field>
            <Field label="Virtual account">
              {member.virtualAccount ? (
                <span className="flex items-center gap-2">
                  <code className="text-xs text-green-accent font-mono tracking-wider bg-green-accent/10 px-2 py-1 rounded">
                    {member.virtualAccount}
                  </code>
                  <CopyButton value={member.virtualAccount} />
                </span>
              ) : '—'}
            </Field>
          </div>
        </Card>

        {/* Circle */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-base">Circle</h2>
            {circle && (
              <Link
                to={`/circles/${circle.circleId}`}
                className="flex items-center gap-1 text-xs text-blue-accent hover:underline"
              >
                Manage circle <ArrowRightIcon className="w-3 h-3" />
              </Link>
            )}
          </div>
          {circleLoading ? (
            <p className="text-sm text-text-ghost">Loading circle…</p>
          ) : !circle ? (
            <p className="text-sm text-text-ghost">This member isn't in a circle.</p>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <p className="text-base font-semibold text-text-base">{circle.circleName}</p>
                <Badge variant={circle.plan === 'ADASHI' ? 'blue' : 'muted'}>{circle.plan}</Badge>
                <Badge variant={circle.status.toLowerCase() === 'active' ? 'green' : 'muted'} dot>
                  {circle.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Contribution">{fmt(circle.contributionAmount)} · {circle.frequency}</Field>
                <Field label="Cycle">{circle.currentCycle} of {circle.maxMembers}</Field>
                <Field label="Members">{circle.memberCount} / {circle.maxMembers}</Field>
                <Field label="Next contribution">{fmtDate(circle.nextContributionDate)}</Field>
                <Field label="Payout position">#{circle.requestingMemberPayoutPosition}</Field>
                <Field label="Membership">{circle.requestingMemberStatus}</Field>
              </div>
            </>
          )}
        </Card>

        {/* Payout account */}
        <Card>
          <h2 className="text-sm font-semibold text-text-base mb-4">Payout account</h2>
          {payoutLoading ? (
            <p className="text-sm text-text-ghost">Loading…</p>
          ) : payoutAccount ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-accent/15 text-green-accent flex items-center justify-center">
                <BankIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-base">
                  {payoutAccount.resolvedAccountName?.replace(/\s+/g, ' ') || payoutAccount.bankLabel}
                </p>
                <p className="text-xs text-text-ghost">
                  {payoutAccount.bankLabel} · <span className="font-mono">{payoutAccount.accountNumber}</span>
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-amber-accent">
              No payout account yet. The member adds this from their dashboard, and payouts can't be sent until they do.
            </p>
          )}
        </Card>

        {/* Dev tools */}
        {import.meta.env.DEV && (
          <Card className="border-dashed">
            <h2 className="text-sm font-semibold text-text-base mb-1">Simulate contribution</h2>
            <p className="text-xs text-text-ghost mb-4">
              Dev only. Sends a fake payment webhook for this member's virtual account.
            </p>
            <div className="flex items-end gap-3">
              <Input
                label="Amount (₦)"
                type="number"
                min={1}
                value={simAmount}
                placeholder={circle ? String(circle.contributionAmount) : '0'}
                onChange={e => setSimAmount(e.target.value)}
              />
              <Button
                variant="secondary"
                disabled={!!simBlocker}
                loading={simulateMutation.isPending}
                onClick={() => {
                  setSimMessage(null)
                  simulateMutation.mutate()
                }}
              >
                Simulate
              </Button>
            </div>
            {simBlocker && !simMessage && <p className="mt-3 text-xs text-amber-accent">{simBlocker}</p>}
            {simMessage && (
              <p className={['mt-3 text-xs', simMessage.ok ? 'text-green-accent' : 'text-danger'].join(' ')}>
                {simMessage.text}
              </p>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
