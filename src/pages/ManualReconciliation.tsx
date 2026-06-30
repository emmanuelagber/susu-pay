import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUnmatchedTransactions, matchTransaction } from '../api/transactions'
import { getReconciliationBoard } from '../api/contributions'
import { useAuth } from '../context/AuthContext'
import { useSelectedCircle } from '../hooks/useSelectedCircle'
import CircleSelector from '../components/ui/CircleSelector'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import { ArrowLeftIcon, LinkIcon, CheckIcon } from '../components/ui/Icons'
import type { UnmatchedTransaction, ReconciliationRow } from '../types/sprint2'

function fmt(n: number) {
  return '₦' + n.toLocaleString('en-NG')
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function TxnCard({
  txn,
  selected,
  onSelect,
}: {
  txn: UnmatchedTransaction
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={[
        'w-full text-left p-3.5 rounded-xl border transition-all',
        selected
          ? 'border-blue-accent bg-blue-accent/10 ring-1 ring-blue-accent/30'
          : 'border-border bg-surface hover:border-border-light hover:bg-surface-alt/40',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-sm font-semibold text-text-base tabular-nums">{fmt(txn.amount)}</p>
        {selected && <CheckIcon className="w-3.5 h-3.5 text-blue-accent flex-shrink-0 mt-0.5" />}
      </div>
      {txn.senderName && (
        <p className="text-xs text-text-dim mb-1">Sender: {txn.senderName}</p>
      )}
      <p className="text-xs text-text-ghost font-mono">{txn.fromVirtualAccount}</p>
      <p className="text-xs text-text-ghost mt-1">{fmtTime(txn.receivedAt)}</p>
      <p className="text-xs text-text-ghost opacity-60">{txn.reference}</p>
    </button>
  )
}

function MemberRow({
  row,
  selected,
  onSelect,
  index,
}: {
  row: ReconciliationRow
  selected: boolean
  onSelect: () => void
  index: number
}) {
  return (
    <button
      onClick={onSelect}
      className={[
        'w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3',
        selected
          ? 'border-blue-accent bg-blue-accent/10 ring-1 ring-blue-accent/30'
          : 'border-border bg-surface hover:border-border-light hover:bg-surface-alt/40',
      ].join(' ')}
    >
      <Avatar initials={row.initials} size="sm" index={index} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-base">{row.name}</p>
        <p className="text-xs text-text-ghost font-mono">{row.virtualAccount}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {row.status === 'paid'    && <Badge variant="green"  dot>Paid</Badge>}
        {row.status === 'partial' && <Badge variant="amber"  dot>Partial</Badge>}
        {row.status === 'overdue' && <Badge variant="danger" dot>Overdue</Badge>}
        {row.status === 'unpaid'  && <Badge variant="muted"  dot>Unpaid</Badge>}
        {selected && <CheckIcon className="w-3.5 h-3.5 text-blue-accent" />}
      </div>
    </button>
  )
}

export default function ManualReconciliation() {
  const { accessToken } = useAuth()
  const qc = useQueryClient()
  const { circleId, circles, setCircleId, selectedCircle } = useSelectedCircle()

  const [txnSearch, setTxnSearch] = useState('')
  const [memberSearch, setMemberSearch] = useState('')
  const [selectedTxnId, setSelectedTxnId] = useState<string | null>(null)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const { data: transactions = [], isLoading: txnLoading, error: txnError, refetch: refetchTxn } = useQuery({
    queryKey: ['unmatched', circleId],
    queryFn: () => getUnmatchedTransactions(circleId, accessToken!),
    enabled: !!circleId && !!accessToken,
  })

  const { data: members = [], isLoading: memberLoading, error: memberError, refetch: refetchMembers } = useQuery({
    queryKey: ['reconciliation', circleId],
    queryFn: () => getReconciliationBoard(circleId, accessToken!),
    enabled: !!circleId && !!accessToken,
  })

  const matchMutation = useMutation({
    mutationFn: ({ txnId, mId }: { txnId: string; mId: string }) =>
      matchTransaction(txnId, mId, circleId, accessToken!),
    onMutate: async ({ txnId }) => {
      await qc.cancelQueries({ queryKey: ['unmatched', circleId] })
      const prev = qc.getQueryData<UnmatchedTransaction[]>(['unmatched', circleId])
      qc.setQueryData<UnmatchedTransaction[]>(['unmatched', circleId], old =>
        old?.filter(t => t.id !== txnId) ?? [],
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['unmatched', circleId], ctx.prev)
      setToast({ type: 'error', msg: _err instanceof Error ? _err.message : 'Match failed.' })
      setTimeout(() => setToast(null), 4000)
    },
    onSuccess: () => {
      setSelectedTxnId(null)
      setSelectedMemberId(null)
      setToast({ type: 'success', msg: 'Transaction matched successfully.' })
      setTimeout(() => setToast(null), 3000)
      qc.invalidateQueries({ queryKey: ['reconciliation', circleId] })
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['unmatched', circleId] })
    },
  })

  const filteredTxns = transactions.filter(t =>
    !txnSearch ||
    t.fromVirtualAccount.includes(txnSearch) ||
    t.reference.toLowerCase().includes(txnSearch.toLowerCase()) ||
    (t.senderName ?? '').toLowerCase().includes(txnSearch.toLowerCase()),
  )

  const filteredMembers = members.filter(m =>
    !memberSearch ||
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.virtualAccount.includes(memberSearch),
  )

  const selectedTxn = transactions.find(t => t.id === selectedTxnId)
  const selectedMember = members.find(m => m.memberId === selectedMemberId)
  const canMatch = !!selectedTxnId && !!selectedMemberId && !matchMutation.isPending

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to={`/reconciliation?circleId=${circleId}`} className="text-text-ghost hover:text-text-base transition-colors">
              <ArrowLeftIcon className="w-4 h-4" />
            </Link>
            <h1 className="text-xl font-semibold text-text-base">Match Transactions</h1>
          </div>
          <div className="flex items-center gap-2 ml-6">
            <CircleSelector circles={circles} selectedId={circleId} onChange={setCircleId} />
            {selectedCircle && (
              <span className="text-xs text-text-ghost">· {transactions.length} unmatched</span>
            )}
          </div>
        </div>
      </div>

      {/* Match action bar */}
      {(selectedTxn || selectedMember) && (
        <div className="bg-blue-accent/10 border border-blue-accent/30 rounded-xl p-4 mb-5 flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-0 flex items-center gap-3 text-sm">
            {selectedTxn ? (
              <span className="text-text-base">
                <span className="font-semibold">{fmt(selectedTxn.amount)}</span>
                <span className="text-text-ghost ml-1.5">· {selectedTxn.reference}</span>
              </span>
            ) : (
              <span className="text-text-ghost">Select a transaction</span>
            )}
            <LinkIcon className="w-4 h-4 text-blue-accent flex-shrink-0" />
            {selectedMember ? (
              <span className="text-text-base font-semibold">{selectedMember.name}</span>
            ) : (
              <span className="text-text-ghost">Select a member</span>
            )}
          </div>
          <Button
            variant="primary"
            size="sm"
            disabled={!canMatch}
            loading={matchMutation.isPending}
            onClick={() => {
              if (selectedTxnId && selectedMemberId) {
                matchMutation.mutate({ txnId: selectedTxnId, mId: selectedMemberId })
              }
            }}
          >
            Confirm match
          </Button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={[
          'rounded-lg border px-4 py-3 mb-4 text-sm',
          toast.type === 'success'
            ? 'bg-green-accent/10 border-green-accent/30 text-green-accent'
            : 'bg-danger/10 border-danger/30 text-danger',
        ].join(' ')}>
          {toast.msg}
        </div>
      )}

      {/* Two-panel layout */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Left: Unmatched transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-base">
              Unmatched transactions
              <span className="ml-2 text-text-ghost font-normal">({filteredTxns.length})</span>
            </h2>
          </div>
          <input
            type="search"
            placeholder="Search by VA, sender, or ref…"
            value={txnSearch}
            onChange={e => setTxnSearch(e.target.value)}
            className="w-full h-9 bg-surface border border-border rounded-lg text-sm text-text-base placeholder-text-ghost px-3 outline-none focus:border-blue-accent mb-3"
          />
          {txnLoading ? (
            <p className="text-sm text-text-ghost py-8 text-center">Loading…</p>
          ) : txnError ? (
            <div className="py-8 text-center">
              <p className="text-sm text-danger mb-2">Failed to load transactions.</p>
              <button onClick={() => refetchTxn()} className="text-xs text-blue-accent hover:underline">Retry</button>
            </div>
          ) : filteredTxns.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-text-ghost">All transactions matched.</p>
              <p className="text-xs text-text-ghost mt-1 opacity-60">New unmatched payments will appear here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredTxns.map(t => (
                <TxnCard
                  key={t.id}
                  txn={t}
                  selected={selectedTxnId === t.id}
                  onSelect={() => setSelectedTxnId(prev => prev === t.id ? null : t.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Members */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-base">
              Members
              <span className="ml-2 text-text-ghost font-normal">({filteredMembers.length})</span>
            </h2>
          </div>
          <input
            type="search"
            placeholder="Search by name or VA…"
            value={memberSearch}
            onChange={e => setMemberSearch(e.target.value)}
            className="w-full h-9 bg-surface border border-border rounded-lg text-sm text-text-base placeholder-text-ghost px-3 outline-none focus:border-blue-accent mb-3"
          />
          {memberLoading ? (
            <p className="text-sm text-text-ghost py-8 text-center">Loading…</p>
          ) : memberError ? (
            <div className="py-8 text-center">
              <p className="text-sm text-danger mb-2">Failed to load members.</p>
              <button onClick={() => refetchMembers()} className="text-xs text-blue-accent hover:underline">Retry</button>
            </div>
          ) : filteredMembers.length === 0 ? (
            <p className="text-sm text-text-ghost py-8 text-center">No members found.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredMembers.map((m, i) => (
                <MemberRow
                  key={m.memberId}
                  row={m}
                  selected={selectedMemberId === m.memberId}
                  onSelect={() => setSelectedMemberId(prev => prev === m.memberId ? null : m.memberId)}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
