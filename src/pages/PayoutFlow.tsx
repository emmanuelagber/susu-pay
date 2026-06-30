import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPayoutCycleInfo, triggerPayout, getPayoutHistory } from '../api/payouts'
import { useAuth } from '../context/AuthContext'
import { useSelectedCircle } from '../hooks/useSelectedCircle'
import CircleSelector from '../components/ui/CircleSelector'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import { CheckIcon, WalletIcon } from '../components/ui/Icons'
import type { PayoutQueueEntry, PayoutHistoryRecord } from '../types/sprint2'

function fmt(n: number) {
  return '₦' + n.toLocaleString('en-NG')
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

function QueueRow({ entry, index }: { entry: PayoutQueueEntry; index: number }) {
  const isCurrent = entry.status === 'current'
  const isDone    = entry.status === 'completed'
  const isFailed  = entry.status === 'failed'

  return (
    <div className={[
      'flex items-center gap-3 px-4 py-3 border-b border-border last:border-0',
      isCurrent ? 'bg-blue-accent/5' : '',
    ].join(' ')}>
      <div className={[
        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
        isDone   ? 'bg-green-accent/20 text-green-accent' :
        isFailed ? 'bg-danger/20 text-danger' :
        isCurrent ? 'bg-blue-accent/20 text-blue-accent ring-2 ring-blue-accent/40' :
        'bg-border text-text-ghost',
      ].join(' ')}>
        {isDone ? <CheckIcon className="w-3 h-3" /> : entry.position}
      </div>
      <Avatar initials={entry.initials} size="sm" index={index} />
      <div className="flex-1 min-w-0">
        <p className={['text-sm font-medium', isCurrent ? 'text-text-base' : 'text-text-dim'].join(' ')}>
          {entry.name}
        </p>
        <p className="text-xs text-text-ghost font-mono">{entry.virtualAccount}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold text-text-base tabular-nums">{fmt(entry.payoutAmount)}</p>
        {isCurrent && <Badge variant="blue" dot>Current</Badge>}
        {isDone    && <Badge variant="green" dot>Paid {entry.paidDate ? fmtDate(entry.paidDate) : ''}</Badge>}
        {isFailed  && <Badge variant="danger" dot>Failed</Badge>}
      </div>
    </div>
  )
}

function HistoryRow({ record }: { record: PayoutHistoryRecord }) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-surface-alt/40 transition-colors">
      <td className="py-3 pl-5 pr-4">
        <p className="text-sm text-text-base font-medium">{record.recipientName}</p>
        <p className="text-xs text-text-ghost">{record.circleName}</p>
      </td>
      <td className="py-3 px-4 text-sm text-text-dim text-center">Cycle {record.cycleNumber}</td>
      <td className="py-3 px-4 text-sm font-semibold text-text-base tabular-nums text-right">
        {fmt(record.amount)}
      </td>
      <td className="py-3 px-4">
        {record.status === 'completed' && <Badge variant="green" dot>Completed</Badge>}
        {record.status === 'failed'    && <Badge variant="danger" dot>Failed</Badge>}
        {record.status === 'processing' && <Badge variant="amber" dot>Processing</Badge>}
      </td>
      <td className="py-3 pr-5 pl-4 text-xs text-text-ghost">{fmtDate(record.processedAt)}</td>
    </tr>
  )
}

export default function PayoutFlow() {
  const { accessToken } = useAuth()
  const qc = useQueryClient()
  const { circleId, selectedCircle, setCircleId, circles } = useSelectedCircle()

  const { data: cycleInfo, isLoading: cycleLoading, error: cycleError, refetch: refetchCycle } = useQuery({
    queryKey: ['payoutCycle', circleId],
    queryFn: () => getPayoutCycleInfo(circleId, accessToken!),
    enabled: !!circleId && !!accessToken,
  })

  const { data: history = [], isLoading: histLoading } = useQuery({
    queryKey: ['payoutHistory', circleId],
    queryFn: () => getPayoutHistory(circleId, accessToken!),
    enabled: !!circleId && !!accessToken,
  })

  const payoutMutation = useMutation({
    mutationFn: () => triggerPayout(circleId, accessToken!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payoutCycle', circleId] })
      qc.invalidateQueries({ queryKey: ['payoutHistory', circleId] })
    },
  })

  const info = cycleInfo
  const collected = info?.membersCollected ?? 0
  const total     = info?.totalMembers ?? 0
  const ratePercent = total > 0 ? Math.round((collected / total) * 100) : 0

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-text-base">Payouts</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <CircleSelector circles={circles} selectedId={circleId} onChange={setCircleId} />
            {selectedCircle && (
              <span className="text-xs text-text-ghost">
                · Cycle {selectedCircle.cycle} of {selectedCircle.totalCycles}
              </span>
            )}
          </div>
        </div>
      </div>

      {cycleLoading ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-ghost text-sm mb-5">
          Loading payout info…
        </div>
      ) : cycleError ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center mb-5">
          <p className="text-sm text-danger mb-2">Failed to load payout information.</p>
          <button onClick={() => refetchCycle()} className="text-xs text-blue-accent hover:underline">Retry</button>
        </div>
      ) : !info ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-ghost text-sm mb-5">
          No payout data for this circle.
        </div>
      ) : (
        <>
          {/* Current payout card */}
          <div className={[
            'bg-surface border rounded-xl p-6 mb-5',
            info.canTrigger ? 'border-green-accent/40' : 'border-border',
          ].join(' ')}>
            <p className="text-xs text-text-ghost uppercase tracking-wider mb-4">Current payout</p>

            {info.currentRecipient ? (
              <div className="flex items-start gap-4 mb-5 flex-wrap">
                <div className="flex-1 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-accent/15 text-blue-accent flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {info.currentRecipient.initials}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-text-base">{info.currentRecipient.name}</p>
                    <p className="text-xs text-text-ghost">Position #{info.currentRecipient.position} · {info.currentRecipient.virtualAccount}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-text-base tabular-nums">
                    {fmt(info.expectedPayoutAmount)}
                  </p>
                  <p className="text-xs text-text-ghost mt-0.5">expected payout</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-ghost mb-5">No current recipient.</p>
            )}

            {/* Collection progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-text-ghost">Collection progress</p>
                <p className="text-xs font-semibold text-text-base">{collected}/{total} paid</p>
              </div>
              <div className="h-2.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${ratePercent}%`,
                    background: ratePercent === 100 ? '#00C78C' : ratePercent >= 70 ? '#F59E0B' : '#4B7CF3',
                  }}
                />
              </div>
            </div>

            {/* Blockers */}
            {!info.canTrigger && info.blockers.length > 0 && (
              <div className="bg-amber-accent/10 border border-amber-accent/25 rounded-lg px-3.5 py-2.5 mb-4">
                {info.blockers.map((b, i) => (
                  <p key={i} className="text-xs text-amber-accent">{b}</p>
                ))}
              </div>
            )}

            {/* Payout status feedback */}
            {payoutMutation.isSuccess && (
              <div className="bg-green-accent/10 border border-green-accent/25 rounded-lg px-3.5 py-2.5 mb-4">
                <p className="text-xs text-green-accent">Payout triggered — processing now. You'll be notified when complete.</p>
              </div>
            )}
            {payoutMutation.isError && (
              <div className="bg-danger/10 border border-danger/25 rounded-lg px-3.5 py-2.5 mb-4">
                <p className="text-xs text-danger">
                  {payoutMutation.error instanceof Error ? payoutMutation.error.message : 'Payout failed.'}
                </p>
              </div>
            )}

            <Button
              variant="primary"
              disabled={!info.canTrigger || payoutMutation.isSuccess}
              loading={payoutMutation.isPending}
              onClick={() => payoutMutation.mutate()}
            >
              <WalletIcon className="w-4 h-4 mr-2" />
              {payoutMutation.isSuccess ? 'Payout processing…' : `Trigger payout — ${fmt(info.expectedPayoutAmount)}`}
            </Button>
          </div>

          {/* Payout queue */}
          <div className="bg-surface border border-border rounded-xl mb-5 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border">
              <h2 className="text-sm font-semibold text-text-base">Payout order</h2>
            </div>
            <div>
              {info.queue.map((entry, i) => (
                <QueueRow key={entry.memberId} entry={entry} index={i} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* History table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border">
          <h2 className="text-sm font-semibold text-text-base">Payout history</h2>
        </div>
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
              {histLoading ? (
                <tr><td colSpan={5} className="py-10 text-center text-text-ghost text-sm">Loading…</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-text-ghost text-sm">No payouts yet.</td></tr>
              ) : history.map(r => <HistoryRow key={r.id} record={r} />)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
