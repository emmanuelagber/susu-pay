import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGetCircle } from '../../lib/api'
import { getPayoutCycleInfo, getPayoutHistory } from '../../api/payouts'
import {
  disburseCollection,
  getCollectionAccounts,
  getMemberAccounts,
  sweepCollection,
} from '../../api/collection'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card, { StatCard } from '../../components/ui/Card'
import CopyButton from '../../components/ui/CopyButton'
import Input, { Select } from '../../components/ui/Input'
import { ArrowLeftIcon, GearIcon, WalletIcon } from '../../components/ui/Icons'
import { getErrorMessages } from '../../lib/errors'
import type { CollectionActionResult, MemberAccount } from '../../types/sprint2'

type Tab = 'members' | 'collection' | 'payout' | 'history'

function fmt(n: number) {
  return '₦' + n.toLocaleString('en-NG')
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

function TabButton({ id, label, active, onClick }: { id: Tab; label: string; active: boolean; onClick: (t: Tab) => void }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={[
        'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
        active ? 'border-blue-accent text-text-base' : 'border-transparent text-text-ghost hover:text-text-dim',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

function Notice({ tone, children }: { tone: 'green' | 'danger' | 'amber'; children: React.ReactNode }) {
  const cls = {
    green: 'bg-green-accent/10 border-green-accent/25 text-green-accent',
    danger: 'bg-danger/10 border-danger/25 text-danger',
    amber: 'bg-amber-accent/10 border-amber-accent/25 text-amber-accent',
  }[tone]
  return <div className={`border rounded-lg px-3.5 py-2.5 text-xs ${cls}`}>{children}</div>
}

function describeResult(result: CollectionActionResult, fallback: string) {
  const parts: string[] = []
  if (result.count !== undefined) parts.push(`${result.count} contribution${result.count === 1 ? '' : 's'}`)
  if (result.amount !== undefined) parts.push(fmt(result.amount))
  const summary = parts.length ? parts.join(' · ') : fallback
  return [summary, result.reference ? `Ref ${result.reference}` : '', result.message ?? ''].filter(Boolean).join(' — ')
}

// ─── Members tab ──────────────────────────────────────────────────────────────

function MembersTab({ accounts, isLoading }: { accounts: MemberAccount[]; isLoading: boolean }) {
  const navigate = useNavigate()
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-center text-xs font-medium text-text-ghost uppercase tracking-wider py-3 pl-5 pr-2">#</th>
              <th className="text-left text-xs font-medium text-text-ghost uppercase tracking-wider py-3 px-4">Member</th>
              <th className="text-left text-xs font-medium text-text-ghost uppercase tracking-wider py-3 px-4">Virtual account</th>
              <th className="text-left text-xs font-medium text-text-ghost uppercase tracking-wider py-3 px-4">Payout account</th>
              <th className="text-left text-xs font-medium text-text-ghost uppercase tracking-wider py-3 pr-5 pl-4">Payout ready</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="py-12 text-center text-text-ghost text-sm">Loading member accounts…</td></tr>
            ) : accounts.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-text-ghost text-sm">No members in this circle.</td></tr>
            ) : (
              accounts.map((a, i) => (
                <tr
                  key={a.memberId}
                  onClick={() => navigate(`/members/${a.memberId}`)}
                  className="border-b border-border last:border-0 hover:bg-surface-alt/50 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 pl-5 pr-2 text-sm text-text-dim text-center tabular">{a.payoutPosition || '—'}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar initials={a.initials} size="sm" index={i} />
                      <p className="text-sm font-medium text-text-base">{a.name}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {a.virtualAccountNumber ? (
                      <span className="flex items-center gap-2">
                        <code className="text-xs text-green-accent font-mono tracking-wider bg-green-accent/10 px-2 py-1 rounded">
                          {a.virtualAccountNumber}
                        </code>
                        <CopyButton value={a.virtualAccountNumber} />
                      </span>
                    ) : <span className="text-text-ghost">—</span>}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-text-dim">
                    {a.payoutAccountNumber
                      ? <>{a.payoutBankName ? `${a.payoutBankName} · ` : ''}<span className="font-mono">{a.payoutAccountNumber}</span></>
                      : <span className="text-text-ghost">—</span>}
                  </td>
                  <td className="py-3.5 pr-5 pl-4">
                    <Badge variant={a.payoutReady ? 'green' : 'amber'} dot>
                      {a.payoutReady ? 'Ready' : 'No payout account'}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Collection tab ───────────────────────────────────────────────────────────

function CollectionTab({ circleId, token }: { circleId: string; token: string }) {
  const qc = useQueryClient()
  const [includeInactive, setIncludeInactive] = useState(false)

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['collection-accounts', circleId, includeInactive],
    queryFn: () => getCollectionAccounts(circleId, token, includeInactive),
  })

  const sweepMutation = useMutation({
    mutationFn: () => sweepCollection(circleId, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['collection-accounts', circleId] })
      qc.invalidateQueries({ queryKey: ['reconciliation'] })
      qc.invalidateQueries({ queryKey: ['payoutCycle', circleId] })
    },
  })

  const active = accounts.find(a => a.isActive) ?? accounts[0]

  return (
    <div className="flex flex-col gap-5">
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Pool balance" value={active ? fmt(active.balance) : '—'} accent="green" />
        <StatCard label="Collection account" value={active?.accountNumber || '—'} sub={active?.accountName} />
        <StatCard label="Bank" value={active?.bankName || '—'} />
      </div>

      <Card>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-sm font-semibold text-text-base">Sweep contributions</h2>
            <p className="text-xs text-text-ghost mt-0.5 max-w-md">
              Moves every reconciled contribution that hasn't been pooled yet from members' virtual accounts into
              this circle's collection account.
            </p>
          </div>
          <Button
            variant="primary"
            icon={<WalletIcon className="w-4 h-4" />}
            loading={sweepMutation.isPending}
            onClick={() => sweepMutation.mutate()}
          >
            Sweep now
          </Button>
        </div>
        {sweepMutation.isSuccess && (
          <div className="mt-4">
            <Notice tone="green">Swept: {describeResult(sweepMutation.data, 'Sweep completed.')}</Notice>
          </div>
        )}
        {sweepMutation.isError && (
          <div className="mt-4">
            <Notice tone="danger">{getErrorMessages(sweepMutation.error, 'Sweep failed.').join(' ')}</Notice>
          </div>
        )}
      </Card>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-base">Collection accounts</h2>
          <label className="flex items-center gap-2 text-xs text-text-dim cursor-pointer">
            <input type="checkbox" checked={includeInactive} onChange={e => setIncludeInactive(e.target.checked)} />
            Show inactive
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-text-ghost uppercase tracking-wider py-3 pl-5 pr-4">Account</th>
                <th className="text-left text-xs font-medium text-text-ghost uppercase tracking-wider py-3 px-4">Bank</th>
                <th className="text-right text-xs font-medium text-text-ghost uppercase tracking-wider py-3 px-4">Balance</th>
                <th className="text-left text-xs font-medium text-text-ghost uppercase tracking-wider py-3 pr-5 pl-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="py-10 text-center text-text-ghost text-sm">Loading…</td></tr>
              ) : accounts.length === 0 ? (
                <tr><td colSpan={4} className="py-10 text-center text-text-ghost text-sm">No collection account for this circle yet.</td></tr>
              ) : (
                accounts.map(a => (
                  <tr key={a.id} className="border-b border-border last:border-0">
                    <td className="py-3 pl-5 pr-4">
                      <span className="flex items-center gap-2">
                        <code className="text-xs font-mono tracking-wider text-text-base">{a.accountNumber}</code>
                        {a.accountNumber && <CopyButton value={a.accountNumber} />}
                      </span>
                      {a.accountName && <p className="text-xs text-text-ghost mt-0.5">{a.accountName}</p>}
                    </td>
                    <td className="py-3 px-4 text-sm text-text-dim">{a.bankName || '—'}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-text-base tabular-nums text-right">{fmt(a.balance)}</td>
                    <td className="py-3 pr-5 pl-4">
                      <Badge variant={a.isActive ? 'green' : 'muted'} dot>{a.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Payout tab ───────────────────────────────────────────────────────────────

function PayoutTab({ circleId, token, members }: { circleId: string; token: string; members: MemberAccount[] }) {
  const qc = useQueryClient()
  const [memberId, setMemberId] = useState('')
  const [amount, setAmount] = useState('')
  const [narration, setNarration] = useState('')
  const [confirming, setConfirming] = useState(false)

  const { data: cycle } = useQuery({
    queryKey: ['payoutCycle', circleId],
    queryFn: () => getPayoutCycleInfo(circleId, token),
  })

  const { data: accounts = [] } = useQuery({
    queryKey: ['collection-accounts', circleId, false],
    queryFn: () => getCollectionAccounts(circleId, token),
  })

  // Default the form to this cycle's recipient and expected payout once they load.
  useEffect(() => {
    if (!memberId && cycle?.currentRecipient) setMemberId(cycle.currentRecipient.memberId)
    if (!amount && cycle?.expectedPayoutAmount) setAmount(String(cycle.expectedPayoutAmount))
  }, [cycle, memberId, amount])

  const disburseMutation = useMutation({
    mutationFn: () => disburseCollection(
      circleId,
      { memberId, amount: Number(amount), narration: narration.trim() || undefined },
      token,
    ),
    onSuccess: () => {
      setConfirming(false)
      qc.invalidateQueries({ queryKey: ['collection-accounts', circleId] })
      qc.invalidateQueries({ queryKey: ['member-accounts', circleId] })
      qc.invalidateQueries({ queryKey: ['payoutCycle', circleId] })
      qc.invalidateQueries({ queryKey: ['payoutHistory', circleId] })
    },
    onError: () => setConfirming(false),
  })

  const pool = accounts.find(a => a.isActive) ?? accounts[0]
  const recipient = members.find(m => m.memberId === memberId)
  const numericAmount = Number(amount)

  const blockers: string[] = []
  if (!memberId) blockers.push('Choose a recipient.')
  if (recipient && !recipient.payoutReady) blockers.push(`${recipient.name} has no verified payout account yet.`)
  if (!numericAmount || numericAmount <= 0) blockers.push('Enter an amount greater than 0.')
  if (pool && numericAmount > pool.balance) blockers.push(`Pool balance (${fmt(pool.balance)}) is below the payout amount. Sweep contributions first.`)
  if (!pool) blockers.push('This circle has no collection account.')

  return (
    <Card>
      <h2 className="text-sm font-semibold text-text-base mb-1">Disburse from pool</h2>
      <p className="text-xs text-text-ghost mb-5">
        Debits the collection account and transfers to the member's verified bank account.
        {cycle?.currentRecipient && <> This cycle's recipient is <span className="text-text-base">{cycle.currentRecipient.name}</span>.</>}
      </p>

      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <Select label="Recipient" value={memberId} onChange={e => { setMemberId(e.target.value); setConfirming(false) }}>
          <option value="">Select member</option>
          {members.map(m => (
            <option key={m.memberId} value={m.memberId}>
              #{m.payoutPosition} {m.name}{m.payoutReady ? '' : ' (no payout account)'}
            </option>
          ))}
        </Select>
        <Input
          label="Amount (₦)"
          type="number"
          min={1}
          value={amount}
          onChange={e => { setAmount(e.target.value); setConfirming(false) }}
          hint={pool ? `Pool balance ${fmt(pool.balance)}` : undefined}
        />
        <Input label="Narration (optional)" value={narration} onChange={e => setNarration(e.target.value)} placeholder={`Cycle ${cycle?.cycleNumber ?? ''} payout`} />
      </div>

      {blockers.length > 0 && (
        <div className="mb-4">
          <Notice tone="amber">{blockers.map(b => <p key={b}>{b}</p>)}</Notice>
        </div>
      )}
      {disburseMutation.isSuccess && (
        <div className="mb-4">
          <Notice tone="green">Disbursed: {describeResult(disburseMutation.data, 'Transfer initiated.')}</Notice>
        </div>
      )}
      {disburseMutation.isError && (
        <div className="mb-4">
          <Notice tone="danger">{getErrorMessages(disburseMutation.error, 'Disbursement failed.').join(' ')}</Notice>
        </div>
      )}

      {confirming ? (
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-sm text-text-base">
            Send <span className="font-semibold">{fmt(numericAmount)}</span> to {recipient?.name ?? 'this member'}?
          </p>
          <Button variant="primary" loading={disburseMutation.isPending} onClick={() => disburseMutation.mutate()}>
            Confirm transfer
          </Button>
          <Button variant="ghost" disabled={disburseMutation.isPending} onClick={() => setConfirming(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="primary"
          icon={<WalletIcon className="w-4 h-4" />}
          disabled={blockers.length > 0}
          onClick={() => { disburseMutation.reset(); setConfirming(true) }}
        >
          Disburse {numericAmount > 0 ? fmt(numericAmount) : ''}
        </Button>
      )}
    </Card>
  )
}

// ─── History tab ──────────────────────────────────────────────────────────────

function HistoryTab({ circleId, token }: { circleId: string; token: string }) {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['payoutHistory', circleId],
    queryFn: () => getPayoutHistory(circleId, token),
  })

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-text-ghost uppercase tracking-wider py-3 pl-5 pr-4">Recipient</th>
              <th className="text-center text-xs font-medium text-text-ghost uppercase tracking-wider py-3 px-4">Cycle</th>
              <th className="text-right text-xs font-medium text-text-ghost uppercase tracking-wider py-3 px-4">Amount</th>
              <th className="text-left text-xs font-medium text-text-ghost uppercase tracking-wider py-3 px-4">Status</th>
              <th className="text-left text-xs font-medium text-text-ghost uppercase tracking-wider py-3 pr-5 pl-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="py-10 text-center text-text-ghost text-sm">Loading…</td></tr>
            ) : history.length === 0 ? (
              <tr><td colSpan={5} className="py-10 text-center text-text-ghost text-sm">No payouts yet.</td></tr>
            ) : (
              history.map(r => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="py-3 pl-5 pr-4 text-sm text-text-base font-medium">{r.recipientName}</td>
                  <td className="py-3 px-4 text-sm text-text-dim text-center">Cycle {r.cycleNumber}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-text-base tabular-nums text-right">{fmt(r.amount)}</td>
                  <td className="py-3 px-4">
                    <Badge variant={r.status === 'completed' ? 'green' : r.status === 'failed' ? 'danger' : 'amber'} dot>
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="py-3 pr-5 pl-4 text-xs text-text-ghost">{fmtDate(r.processedAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CircleDetail() {
  const { circleId = '' } = useParams()
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('members')

  const { data: circle, isLoading } = useQuery({
    queryKey: ['circle', circleId],
    queryFn: () => apiGetCircle(circleId, accessToken!),
    enabled: !!circleId && !!accessToken,
  })

  const { data: memberAccounts = [], isLoading: membersLoading } = useQuery({
    queryKey: ['member-accounts', circleId],
    queryFn: () => getMemberAccounts(circleId, accessToken!),
    enabled: !!circleId && !!accessToken,
  })

  if (isLoading) {
    return <div className="p-6 max-w-[1100px] mx-auto text-sm text-text-ghost">Loading circle…</div>
  }

  if (!circle || !accessToken) {
    return (
      <div className="p-6 max-w-[1100px] mx-auto">
        <p className="text-sm text-danger mb-3">Circle not found.</p>
        <Link to="/circles" className="text-xs text-blue-accent hover:underline">Back to circles</Link>
      </div>
    )
  }

  const readyCount = memberAccounts.filter(m => m.payoutReady).length

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <button
        onClick={() => navigate('/circles')}
        className="flex items-center gap-1.5 text-xs text-text-ghost hover:text-text-base mb-4"
      >
        <ArrowLeftIcon className="w-3.5 h-3.5" /> Circles
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-text-base">{circle.name}</h1>
            <Badge variant={circle.plan === 'ADASHI' ? 'blue' : 'muted'}>{circle.plan}</Badge>
            <Badge variant={circle.status === 'active' ? 'green' : 'muted'} dot>
              {circle.status.charAt(0).toUpperCase() + circle.status.slice(1)}
            </Badge>
          </div>
          <p className="text-sm text-text-ghost mt-1">
            {fmt(circle.contribution)} {circle.frequency.toLowerCase()} · Cycle {circle.cycle} of {circle.maxMembers} ·{' '}
            {memberAccounts.length}/{circle.maxMembers} members · {readyCount} payout-ready
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<GearIcon className="w-4 h-4" />}
          onClick={() => navigate(`/circles/${circleId}/settings`)}
        >
          Settings
        </Button>
      </div>

      <div className="flex border-b border-border mb-5 overflow-x-auto">
        <TabButton id="members" label="Members" active={tab === 'members'} onClick={setTab} />
        <TabButton id="collection" label="Collection" active={tab === 'collection'} onClick={setTab} />
        <TabButton id="payout" label="Payout" active={tab === 'payout'} onClick={setTab} />
        <TabButton id="history" label="History" active={tab === 'history'} onClick={setTab} />
      </div>

      {tab === 'members' && <MembersTab accounts={memberAccounts} isLoading={membersLoading} />}
      {tab === 'collection' && <CollectionTab circleId={circleId} token={accessToken} />}
      {tab === 'payout' && <PayoutTab circleId={circleId} token={accessToken} members={memberAccounts} />}
      {tab === 'history' && <HistoryTab circleId={circleId} token={accessToken} />}
    </div>
  )
}
