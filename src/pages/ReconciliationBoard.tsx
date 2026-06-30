import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getReconciliationBoard } from '../api/contributions'
import { useAuth } from '../context/AuthContext'
import { useSelectedCircle } from '../hooks/useSelectedCircle'
import CircleSelector from '../components/ui/CircleSelector'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import type { ReconciliationRow, ReconciliationStatus } from '../types/sprint2'
import { LinkIcon, SortAscIcon, SortDescIcon } from '../components/ui/Icons'

type Filter = 'all' | ReconciliationStatus
type SortKey = 'position' | 'name' | 'receivedAmount' | 'status'

const STATUS_ORDER: Record<ReconciliationStatus, number> = {
  paid: 0, partial: 1, overdue: 2, unpaid: 3,
}

function fmt(n: number) {
  return '₦' + n.toLocaleString('en-NG')
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

function statusBadge(row: ReconciliationRow) {
  if (row.status === 'paid')    return <Badge variant="green" dot>Paid</Badge>
  if (row.status === 'partial') return <Badge variant="amber" dot>Partial</Badge>
  if (row.status === 'overdue') return <Badge variant="danger" dot>{row.daysOverdue}d overdue</Badge>
  return <Badge variant="muted" dot>Unpaid</Badge>
}

function SortBtn({ col, current, dir, onClick }: {
  col: SortKey; current: SortKey; dir: 'asc' | 'desc'; onClick: (k: SortKey) => void
}) {
  const active = col === current
  return (
    <button
      onClick={() => onClick(col)}
      className="inline-flex items-center gap-1 hover:text-text-base transition-colors"
    >
      {active
        ? dir === 'asc'
          ? <SortAscIcon className="w-3 h-3 text-blue-accent" />
          : <SortDescIcon className="w-3 h-3 text-blue-accent" />
        : <SortAscIcon className="w-3 h-3 opacity-30" />}
    </button>
  )
}

export default function ReconciliationBoard() {
  const { accessToken } = useAuth()
  const { circleId, selectedCircle, setCircleId, circles } = useSelectedCircle()
  const [filter, setFilter] = useState<Filter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('position')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const { data: rows = [], isLoading, error, refetch } = useQuery({
    queryKey: ['reconciliation', circleId],
    queryFn: () => getReconciliationBoard(circleId, accessToken!),
    enabled: !!circleId && !!accessToken,
  })

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const filtered = rows.filter(r => filter === 'all' || r.status === filter)

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0
    if (sortKey === 'position')       cmp = a.position - b.position
    else if (sortKey === 'name')      cmp = a.name.localeCompare(b.name)
    else if (sortKey === 'receivedAmount') cmp = a.receivedAmount - b.receivedAmount
    else if (sortKey === 'status')    cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    return sortDir === 'asc' ? cmp : -cmp
  })

  const totalExpected  = rows.reduce((s, r) => s + r.expectedAmount, 0)
  const totalReceived  = rows.reduce((s, r) => s + r.receivedAmount, 0)
  const paidCount      = rows.filter(r => r.status === 'paid').length
  const partialCount   = rows.filter(r => r.status === 'partial').length
  const overdueCount   = rows.filter(r => r.status === 'overdue').length
  const unpaidCount    = rows.filter(r => r.status === 'unpaid').length
  const ratePercent    = totalExpected > 0 ? Math.round((totalReceived / totalExpected) * 100) : 0

  const FILTERS: { key: Filter; label: string; count: number }[] = [
    { key: 'all',     label: 'All',     count: rows.length },
    { key: 'paid',    label: 'Paid',    count: paidCount },
    { key: 'partial', label: 'Partial', count: partialCount },
    { key: 'overdue', label: 'Overdue', count: overdueCount },
    { key: 'unpaid',  label: 'Unpaid',  count: unpaidCount },
  ]

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-text-base">Contribution Tracking</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <CircleSelector circles={circles} selectedId={circleId} onChange={setCircleId} />
            {selectedCircle && (
              <span className="text-xs text-text-ghost">
                · Cycle {selectedCircle.cycle} of {selectedCircle.totalCycles}
              </span>
            )}
          </div>
        </div>
        <Link to={`/reconciliation/match?circleId=${circleId}`}>
          <Button variant="secondary" size="sm">
            <LinkIcon className="w-3.5 h-3.5 mr-1.5" />
            Match transactions
          </Button>
        </Link>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-[11px] text-text-ghost uppercase tracking-wider mb-1">Collected</p>
          <p className="text-lg font-bold text-green-accent tabular-nums">{fmt(totalReceived)}</p>
          <p className="text-xs text-text-ghost mt-0.5">of {fmt(totalExpected)}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-[11px] text-text-ghost uppercase tracking-wider mb-1">Rate</p>
          <p className={[
            'text-lg font-bold tabular-nums',
            ratePercent >= 80 ? 'text-green-accent' : ratePercent >= 50 ? 'text-amber-accent' : 'text-danger',
          ].join(' ')}>{ratePercent}%</p>
          <p className="text-xs text-text-ghost mt-0.5">{paidCount} of {rows.length} paid</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-[11px] text-text-ghost uppercase tracking-wider mb-1">Attention</p>
          <p className="text-lg font-bold text-amber-accent tabular-nums">{partialCount + overdueCount}</p>
          <p className="text-xs text-text-ghost mt-0.5">{partialCount} partial · {overdueCount} overdue</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-[11px] text-text-ghost uppercase tracking-wider mb-1">Unpaid</p>
          <p className="text-lg font-bold text-text-dim tabular-nums">{unpaidCount}</p>
          <p className="text-xs text-text-ghost mt-0.5">members outstanding</p>
        </div>
      </div>

      {/* Collection progress bar */}
      <div className="bg-surface border border-border rounded-xl p-4 mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-text-ghost">Collection progress</p>
          <p className="text-xs font-medium text-text-base">{fmt(totalReceived)} / {fmt(totalExpected)}</p>
        </div>
        <div className="h-2 bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${ratePercent}%`,
              background: ratePercent >= 80 ? '#00C78C' : ratePercent >= 50 ? '#F59E0B' : '#EF4444',
            }}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={[
              'text-xs px-3 py-1.5 rounded-lg transition-colors',
              filter === f.key
                ? 'bg-blue-accent text-white'
                : 'text-text-dim hover:text-text-base hover:bg-surface-alt border border-border',
            ].join(' ')}
          >
            {f.label}
            <span className={['ml-1.5 tabular-nums', filter === f.key ? 'opacity-80' : 'text-text-ghost'].join(' ')}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-text-ghost uppercase tracking-wider py-3 pl-5 pr-4">
                  <span className="flex items-center gap-1">
                    Member
                    <SortBtn col="name" current={sortKey} dir={sortDir} onClick={handleSort} />
                  </span>
                </th>
                <th className="text-left text-xs font-medium text-text-ghost uppercase tracking-wider py-3 px-4 hidden sm:table-cell">
                  Virtual account
                </th>
                <th className="text-right text-xs font-medium text-text-ghost uppercase tracking-wider py-3 px-4">
                  <span className="flex items-center justify-end gap-1">
                    Received
                    <SortBtn col="receivedAmount" current={sortKey} dir={sortDir} onClick={handleSort} />
                  </span>
                </th>
                <th className="text-left text-xs font-medium text-text-ghost uppercase tracking-wider py-3 px-4 hidden md:table-cell">
                  Last payment
                </th>
                <th className="text-left text-xs font-medium text-text-ghost uppercase tracking-wider py-3 px-4">
                  <span className="flex items-center gap-1">
                    Status
                    <SortBtn col="status" current={sortKey} dir={sortDir} onClick={handleSort} />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-ghost text-sm">
                    Loading…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <p className="text-sm text-danger mb-2">Failed to load reconciliation data.</p>
                    <button onClick={() => refetch()} className="text-xs text-blue-accent hover:underline">
                      Try again
                    </button>
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-ghost text-sm">
                    No members match this filter.
                  </td>
                </tr>
              ) : sorted.map((row, i) => (
                <tr key={row.memberId} className="border-b border-border last:border-0 hover:bg-surface-alt/40 transition-colors">
                  <td className="py-3.5 pl-5 pr-4">
                    <div className="flex items-center gap-3">
                      <Avatar initials={row.initials} size="sm" index={i} />
                      <div>
                        <p className="text-sm font-medium text-text-base">{row.name}</p>
                        <p className="text-xs text-text-ghost">#{row.position}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 hidden sm:table-cell">
                    <code className="text-xs text-green-accent font-mono bg-green-accent/10 px-2 py-1 rounded">
                      {row.virtualAccount}
                    </code>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <p className="text-sm font-medium text-text-base tabular-nums">{fmt(row.receivedAmount)}</p>
                    {row.receivedAmount < row.expectedAmount && (
                      <p className="text-xs text-text-ghost tabular-nums">of {fmt(row.expectedAmount)}</p>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-sm text-text-dim hidden md:table-cell">
                    {fmtDate(row.lastPaymentDate)}
                  </td>
                  <td className="py-3.5 px-4">
                    {statusBadge(row)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
