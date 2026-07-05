import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import {
  apiGetCircle,
  apiGetMember,
  apiGetMemberContributions,
  apiGetMemberNotifications,
  apiMarkMemberNotificationsRead,
} from '../../lib/api'
import { getMemberPayoutInfo, getPayoutCycleInfo } from '../../api/payouts'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import {
  CopyIcon, CheckIcon, InfoIcon, LogOutIcon, CircleLogo,
  BellIcon, WalletIcon, ReceiptIcon, ArrowRightIcon,
} from '../../components/ui/Icons'
import type { ContributionsSummary, NotificationItem, Circle, Member } from '../../types'
import type { PayoutCycleInfo, PayoutQueueEntry } from '../../types/sprint2'
import MemberDashboardSkeleton from './MemberDashboardSkeleton'

// ─── Local types ──────────────────────────────────────────────────────────────

type Tab = 'home' | 'contributions' | 'payout' | 'notifications'


// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n?: number | null) {
  if (n === null || n === undefined) return '—'
  return '₦' + n.toLocaleString('en-NG')
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] ?? s[v] ?? s[0]
}

function reltime(iso?: string | null): string {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
}

function mkInitials(name: string): string {
  return name.split(' ').map(n => n[0] ?? '').join('').toUpperCase().slice(0, 2) || '?'
}

// ─── VirtualAccountCard ───────────────────────────────────────────────────────

function VirtualAccountCard({ account, accountName }: { account: string; accountName: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(account.replace(/\s/g, '')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      className="rounded-2xl p-5 border relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #062F1B 0%, #0A2318 60%, #041A11 100%)',
        borderColor: '#00C78C33',
      }}
    >
      <div
        className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,199,140,0.10) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(75,124,243,0.07) 0%, transparent 70%)' }}
      />

      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-green-accent/70 mb-4">
        Your unique contribution account
      </p>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl font-bold text-white tracking-[0.06em] font-mono tabular">
          {account}
        </span>
        <button
          onClick={copy}
          className="p-2 rounded-lg text-green-accent/60 hover:text-green-accent hover:bg-green-accent/10 transition-colors flex-shrink-0"
          aria-label="Copy account number"
        >
          {copied
            ? <CheckIcon className="w-4 h-4 text-green-accent" />
            : <CopyIcon className="w-4 h-4" />}
        </button>
        {copied && (
          <span className="text-xs text-green-accent">Copied!</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4">
        <span className="text-xs font-medium text-green-accent bg-green-accent/10 border border-green-accent/20 px-2.5 py-0.5 rounded-full">
          Nomba MFB
        </span>
        <span className="text-xs text-green-accent/60 uppercase tracking-wide font-medium">
          {accountName}
        </span>
      </div>

      <div className="flex gap-2 items-start p-3.5 rounded-xl bg-white/[0.03] border border-green-accent/10">
        <InfoIcon className="w-3.5 h-3.5 text-green-accent/50 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-green-accent/60 leading-relaxed">
          Save this as a beneficiary in your banking app. Any transfer to this account number
          auto-reconciles with your circle contribution instantly — no manual matching needed.
        </p>
      </div>
    </div>
  )
}

// ─── StatBox ──────────────────────────────────────────────────────────────────

function StatBox({
  label, primary, secondary, accent,
}: {
  label: string; primary: string; secondary?: string; accent?: string
}) {
  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <p className="text-[11px] text-text-ghost uppercase tracking-wider mb-2">{label}</p>
      <p className={['text-xl font-bold tabular', accent ?? 'text-text-base'].join(' ')}>{primary}</p>
      {secondary && <p className="text-xs text-text-ghost mt-0.5">{secondary}</p>}
    </div>
  )
}

// ─── TabButton ────────────────────────────────────────────────────────────────

function TabButton({
  id, label, active, badge, onClick,
}: {
  id: Tab; label: string; active: boolean; badge?: number; onClick: (t: Tab) => void
}) {
  return (
    <button
      onClick={() => onClick(id)}
      className={[
        'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
        active
          ? 'border-blue-accent text-text-base'
          : 'border-transparent text-text-ghost hover:text-text-dim',
      ].join(' ')}
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="flex items-center justify-center min-w-[1rem] h-4 px-1 rounded-full bg-blue-accent text-white text-[10px] font-bold leading-none">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  )
}

// ─── Home tab ─────────────────────────────────────────────────────────────────

function HomeTab({
  circle,
  memberProfile,
  totalMembers,
  recentNotifs,
  onGoToNotifs,
}: {
  circle: Circle | null | undefined
  memberProfile: Member | null | undefined
  totalMembers?: number
  recentNotifs: NotificationItem[]
  onGoToNotifs: () => void
}) {
  const virtualAccount = memberProfile?.virtualAccount
  const accountName = memberProfile?.name ?? '—'
  const payoutPos = memberProfile?.payoutPosition
  const payoutPosDisplay : number | null = payoutPos != null ? payoutPos + 1 : null
  const memberCount = totalMembers ?? (circle as any)?.currentMemberCount ?? (circle as any)?.members?.length

  return (
    <div className="space-y-5">
      {/* Virtual account */}
      {virtualAccount ? (
        <VirtualAccountCard account={virtualAccount} accountName={accountName} />
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-6 text-center">
          <WalletIcon className="w-7 h-7 text-text-ghost/40 mx-auto mb-2" />
          <p className="text-sm text-text-ghost">No virtual account assigned yet.</p>
          <p className="text-xs text-text-ghost mt-1 opacity-60">
            Your unique contribution account will appear here once set up by your circle admin.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatBox
          label="Contribution amount"
          primary={circle?.contribution ? fmt(circle.contribution) : '—'}
          secondary={circle?.frequency ? `${circle.frequency} · per cycle` : undefined}
          accent="text-green-accent"
        />
        <StatBox
          label="My payout position"
          primary={payoutPosDisplay != null ? `#${payoutPosDisplay}` : '—'}
        secondary={payoutPosDisplay !== null ? `${payoutPosDisplay}${ordinal(payoutPosDisplay)} to receive payout` : undefined}
          accent="text-blue-accent"
        />
        <StatBox
          label="Circle members"
          primary={circle ? `${memberCount ?? '—'}/${circle.maxMembers}` : '—'}
          secondary={circle?.status ? `Status: ${circle.status}` : undefined}
        />
      </div>

      {/* Circle info */}
      {circle && (
        <div className="bg-surface rounded-xl border border-border p-5">
          <p className="text-[11px] text-text-ghost uppercase tracking-wider mb-3">My circle</p>
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h3 className="text-base font-semibold text-text-base">{circle.name}</h3>
                <Badge variant={circle.plan === 'ADASHI' ? 'blue' : 'muted'}>{circle.plan}</Badge>
                <Badge variant={circle.status === 'active' ? 'green' : 'muted'} dot>
                  {circle.status}
                </Badge>
              </div>
              {circle.description && (
                <p className="text-xs text-text-ghost mb-3 leading-relaxed">{circle.description}</p>
              )}
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
                <span className="text-text-ghost">
                  Frequency <span className="text-text-dim ml-1 font-medium">{circle.frequency}</span>
                </span>
                <span className="text-text-ghost">
                  Per cycle <span className="text-text-dim ml-1 font-medium">{fmt(circle.contribution)}</span>
                </span>
                <span className="text-text-ghost">
                  Progress <span className="text-text-dim ml-1 font-medium">Cycle {circle.cycle} / {circle.totalCycles}</span>
                </span>
                <span className="text-text-ghost">
                  Payout order <span className="text-text-dim ml-1 font-medium">{circle.payoutOrder}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent notifications */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <h3 className="text-sm font-semibold text-text-base">Recent activity</h3>
          <button
            onClick={onGoToNotifs}
            className="text-xs text-blue-accent flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            See all <ArrowRightIcon className="w-3 h-3" />
          </button>
        </div>
        {recentNotifs.length === 0 ? (
          <div className="py-8 text-center">
            <BellIcon className="w-6 h-6 text-text-ghost/30 mx-auto mb-2" />
            <p className="text-xs text-text-ghost">No recent activity.</p>
          </div>
        ) : (
          recentNotifs.map(n => (
            <div key={n.id} className="flex items-start gap-3 px-5 py-3.5 border-b border-border last:border-0">
              <div className={[
                'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                n.isRead ? 'bg-border/50' : 'bg-blue-accent/10',
              ].join(' ')}>
                <BellIcon className={['w-3.5 h-3.5', n.isRead ? 'text-text-ghost' : 'text-blue-accent'].join(' ')} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={[
                    'text-sm truncate',
                    n.isRead ? 'text-text-dim' : 'font-medium text-text-base',
                  ].join(' ')}>
                    {n.title ?? 'Notification'}
                  </p>
                  <p className="text-[11px] text-text-ghost whitespace-nowrap flex-shrink-0">
                    {reltime(n.createdAt)}
                  </p>
                </div>
                {n.body && (
                  <p className="text-xs text-text-ghost mt-0.5 line-clamp-1">{n.body}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ─── Contributions tab ────────────────────────────────────────────────────────

function ContributionsTab({
  summary,
}: {
  summary: ContributionsSummary | null | undefined
}) {
  const contributions = summary?.history ?? []
  const totalPaid = summary?.onTimeCount ?? 0
  const totalPayments = summary?.totalPayments ?? contributions.length
  const onTimePct = summary?.onTimeRatePercent ?? 0
  const totalAmount = summary?.totalContributed ?? 0
  const collected = summary?.circlePaidCount ?? 0
  const totalMembers = summary?.circleTotalMembers ?? 0
  const collectedPct = summary?.circleCollectionRatePercent ?? 0

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <StatBox
          label="Total payments"
          primary={String(totalPayments)}
          secondary="all cycles"
        />
        <StatBox
          label="Paid on time"
          primary={`${totalPaid}/${totalPayments}`}
          secondary={totalPayments > 0 ? `${onTimePct}% rate` : undefined}
          accent="text-green-accent"
        />
        <StatBox
          label="Total contributed"
          primary={fmt(totalAmount)}
          accent="text-blue-accent"
        />
      </div>

      {/* Circle-wide collection progress for the current cycle */}
      {totalMembers > 0 && (
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-text-ghost">
              Circle {summary?.circleName ? `"${summary.circleName}" ` : ''}
              collection this cycle
            </p>
            <p className="text-xs text-text-dim tabular">{collected}/{totalMembers} paid · {collectedPct}%</p>
          </div>
          <div className="h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${collectedPct}%`, background: collectedPct >= 80 ? '#00C78C' : collectedPct >= 50 ? '#F59E0B' : '#4B7CF3' }}
            />
          </div>
        </div>
      )}

      {/* My history */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-text-base">My contribution history</h3>
          <p className="text-xs text-text-ghost mt-0.5">All your circle payments across cycles</p>
        </div>
        {contributions.length === 0 ? (
          <div className="py-14 text-center">
            <ReceiptIcon className="w-8 h-8 text-text-ghost/30 mx-auto mb-3" />
            <p className="text-sm text-text-ghost">No contributions yet.</p>
            <p className="text-xs text-text-ghost mt-1 opacity-60">
              Transfer to your virtual account to make your first contribution.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-text-ghost uppercase tracking-wider py-2.5 pl-5 pr-3">Cycle</th>
                  <th className="text-left text-xs font-medium text-text-ghost uppercase tracking-wider py-2.5 px-3">Date paid</th>
                  <th className="text-left text-xs font-medium text-text-ghost uppercase tracking-wider py-2.5 px-3 hidden sm:table-cell">Due date</th>
                  <th className="text-left text-xs font-medium text-text-ghost uppercase tracking-wider py-2.5 px-3">Status</th>
                  <th className="text-right text-xs font-medium text-text-ghost uppercase tracking-wider py-2.5 pr-5 pl-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((c, i) => (
                  <tr
                    key={c.id ?? i}
                    className="border-b border-border last:border-0 hover:bg-surface-alt/40 transition-colors"
                  >
                    <td className="py-3.5 pl-5 pr-3 text-sm font-medium text-text-dim">
                      {c.cycle != null ? `Cycle ${c.cycle}` : '—'}
                    </td>
                    <td className="py-3.5 px-3 text-sm text-text-dim">
                      {c.paidAt
                        ? new Date(c.paidAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
                        : <span className="text-text-ghost">—</span>}
                    </td>
                    <td className="py-3.5 px-3 text-sm text-text-ghost hidden sm:table-cell">
                      {c.dueDate
                        ? new Date(c.dueDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="py-3.5 px-3">
                      <Badge
                        variant={
                          c.status === 'paid' ? 'green'
                            : c.status === 'overdue' ? 'danger'
                            : 'muted'
                        }
                        dot
                      >
                        {c.status ?? 'Unknown'}
                      </Badge>
                    </td>
                    <td className="py-3.5 pr-5 pl-3 text-sm tabular text-right">
                      {c.amount
                        ? <span className="text-green-accent">{fmt(c.amount)}</span>
                        : <span className="text-text-ghost">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Payout tab ───────────────────────────────────────────────────────────────

function statusLabel(status: PayoutQueueEntry['status']): string {
  if (status === 'completed') return 'Paid'
  if (status === 'current') return "This cycle's turn"
  if (status === 'failed') return 'Failed'
  return 'Pending'
}

function statusBadgeVariant(status: PayoutQueueEntry['status']): 'green' | 'blue' | 'danger' | 'muted' {
  if (status === 'completed') return 'green'
  if (status === 'current') return 'blue'
  if (status === 'failed') return 'danger'
  return 'muted'
}

function PayoutTab({
  memberId,
  payoutInfo,
}: {
  memberId: string
  payoutInfo: PayoutCycleInfo | null | undefined
}) {
  const queue = payoutInfo?.queue ?? []
  const myEntry = queue.find(q => q.memberId === memberId)
  const payoutPos = myEntry?.position ?? payoutInfo?.currentRecipient?.position
   const payoutPosDisplay : number | null = payoutPos != null ? payoutPos + 1 : null
  const paidCount = payoutInfo?.membersCollected ?? 0
  const totalCount = payoutInfo?.totalMembers ?? queue.length
  const paidPercent = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0
  const expectedPayout = myEntry?.payoutAmount ?? payoutInfo?.expectedPayoutAmount ?? 0
  const aheadOfMe = queue.filter(q =>
    q.position < (payoutPos ?? 999) && q.status !== 'completed'
  ).length
  const sortedQueue = [...queue].sort((a, b) => a.position - b.position)

  return (
    <div className="space-y-5">
      {/* Position hero */}
      <div
        className="rounded-2xl border border-border p-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #050E1F 0%, #071629 100%)' }}
      >
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(75,124,243,0.12) 0%, transparent 70%)' }}
        />
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-accent/70 mb-3">
          My payout position
        </p>

        <div className="flex items-end gap-4 mb-5">
          <span className="text-6xl font-bold text-white tabular leading-none">
            #{payoutPosDisplay ?? '—'}
          </span>
          {payoutPosDisplay !== null && totalCount > 0 && (
            <div className="mb-1 space-y-1.5">
              <Badge variant="blue">
                {payoutPos === 1 ? 'Next to receive' : `${aheadOfMe} member${aheadOfMe !== 1 ? 's' : ''} ahead`}
              </Badge>
              {expectedPayout > 0 && (
                <p className="text-xs text-text-ghost">
                  Expected <span className="text-text-dim font-semibold">{fmt(expectedPayout)}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-text-ghost">Circle collection progress</p>
            <p className="text-xs text-text-dim tabular">{paidCount}/{totalCount} paid · {paidPercent}%</p>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${paidPercent}%`,
                background: paidPercent >= 80 ? '#00C78C' : paidPercent >= 50 ? '#F59E0B' : '#4B7CF3',
              }}
            />
          </div>
          {paidPercent === 100 && (
            <p className="text-xs text-green-accent mt-2.5 flex items-center gap-1.5">
              <CheckIcon className="w-3.5 h-3.5" />
              All members have paid — payout is being processed
            </p>
          )}
        </div>
      </div>

      {/* Info callout */}
      {payoutPos && (
        <div className="flex gap-2.5 items-start p-4 rounded-xl bg-surface border border-border">
          <InfoIcon className="w-4 h-4 text-text-ghost flex-shrink-0 mt-0.5" />
          <p className="text-xs text-text-ghost leading-relaxed">
            Your payout of <span className="text-text-dim font-medium">{fmt(expectedPayout)}</span> will
            be released automatically to your registered bank account when it's your turn and all
            members in the cycle have contributed.
            {aheadOfMe > 0 && (
              <> There {aheadOfMe === 1 ? 'is' : 'are'} <span className="text-text-dim font-medium">{aheadOfMe} member{aheadOfMe !== 1 ? 's' : ''}</span> ahead of you in the queue.</>
            )}
          </p>
        </div>
      )}

      {/* Queue */}
      {sortedQueue.length > 0 ? (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-text-base">Payout queue</h3>
            <p className="text-xs text-text-ghost mt-0.5">The order members receive payouts</p>
          </div>
          <div className="divide-y divide-border">
            {sortedQueue.map((row, i) => {
              const isMe = row.memberId === memberId
              const name = row.name ?? 'Unknown'
              return (
                <div
                  key={row.memberId ?? i}
                  className={[
                    'flex items-center gap-3 px-5 py-3.5 transition-colors',
                    isMe ? 'bg-blue-accent/[0.05]' : '',
                  ].join(' ')}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-text-ghost"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    {row.position ?? i + 1}
                  </div>
                  <Avatar initials={row.initials ?? mkInitials(name)} size="sm" index={i} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-base">
                      {name}
                      {isMe && (
                        <span className="ml-1.5 text-[11px] text-blue-accent bg-blue-accent/10 px-1.5 py-0.5 rounded">
                          You
                        </span>
                      )}
                    </p>
                  </div>
                  <Badge variant={statusBadgeVariant(row.status)} dot>
                    {statusLabel(row.status)}
                  </Badge>
                  {row.payoutAmount > 0 && (
                    <span className="text-sm text-text-dim tabular w-24 text-right hidden sm:block">
                      {fmt(row.payoutAmount)}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border py-14 text-center">
          <WalletIcon className="w-8 h-8 text-text-ghost/30 mx-auto mb-3" />
          <p className="text-sm text-text-ghost">Payout queue not available yet.</p>
          <p className="text-xs text-text-ghost mt-1 opacity-60">
            The queue will appear once your circle is active.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Notifications tab ────────────────────────────────────────────────────────

function NotificationsTab({ memberId, token, }: { memberId: string; token: string; }) {
  const qc = useQueryClient()

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['member-notifs-full', memberId],
    queryFn: () => apiGetMemberNotifications(memberId, token, 1, 50),
    enabled: !!memberId && !!token,
  })

  const unread = notifications.filter(n => !n.isRead)

  const markAllMutation = useMutation({
    mutationFn: () => Promise.allSettled(
        unread.map(n => apiMarkMemberNotificationsRead(memberId, token, n.id))
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['member-notifs-full', memberId] })
      qc.invalidateQueries({ queryKey: ['member-notifications', memberId] })
    },
  })


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-ghost">
          {isLoading ? 'Loading…' : unread.length > 0 ? `${unread.length} unread` : '0 unread'}.
        </p>
        {unread.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
          >
            {markAllMutation.isPending ? 'Marking…' : 'Mark all read'}
          </Button>
        )}
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-text-ghost text-sm">Loading…</div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center px-6">
            <div className="w-10 h-10 rounded-full bg-border/40 flex items-center justify-center mx-auto mb-3">
              <BellIcon className="w-5 h-5 text-text-ghost" />
            </div>
            <p className="text-sm text-text-ghost">No notifications yet.</p>
            <p className="text-xs text-text-ghost mt-1 opacity-60">
              Payments, payouts, and circle updates will appear here.
            </p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={[
                'flex items-start gap-3 px-5 py-4 border-b border-border last:border-0',
                !n.isRead ? 'bg-blue-accent/[0.03]' : '',
              ].join(' ')}
            >
              <div className={[
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                !n.isRead ? 'bg-blue-accent/10' : 'bg-border/40',
              ].join(' ')}>
                <BellIcon className={['w-4 h-4', !n.isRead ? 'text-blue-accent' : 'text-text-ghost'].join(' ')} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={[
                    'text-sm',
                    !n.isRead ? 'font-medium text-text-base' : 'text-text-dim',
                  ].join(' ')}>
                    {n.title ?? 'Notification'}
                  </p>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {!n.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-accent flex-shrink-0" />
                    )}
                    <p className="text-[11px] text-text-ghost whitespace-nowrap">
                      {reltime(n.createdAt)}
                    </p>
                  </div>
                </div>
                {n.body && (
                  <p className="text-xs text-text-ghost mt-0.5 leading-relaxed">{n.body}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MemberDashboard() {
  const { user, accessToken, logout, } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('home')

  const memberId = user?.id || ''
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null)

  const { data: memberProfile, isLoading: isMemberProfileLoading } = useQuery({
    queryKey: ['member-profile', memberId],
    queryFn: () => apiGetMember(memberId, accessToken!),
    enabled: !!memberId && !!accessToken,
  })

  // The same person keeps one memberId across every circle they join — the backend dedupes on
  // username/phone/userId and only adds a membership, it doesn't mint a new member record. So a
  // member can genuinely sit in several circles/cycles/plans at once under this one memberId.
  // GET /members/{id} currently only returns a single circleId though — there's no endpoint yet
  // that lists all circles for a memberId. Until that ships, `circleOptions` below has exactly
  // one entry (derived from that single circleId) and the switcher defaults to it. When the
  // real "circles for this member" endpoint exists, swap its derivation here and the dropdown,
  // and every query keyed on `circleId`, keep working unchanged.
  const defaultCircleId = user?.circleId || memberProfile?.circleId || ''
  const circleId = selectedCircleId || defaultCircleId

  const { data: circle, isLoading: isCircleLoading } = useQuery({
    queryKey: ['circle', circleId],
    queryFn: () => apiGetCircle(circleId, accessToken!),
    enabled: !!circleId && !!accessToken,
  })

  const circleOptions = circle ? [{ id: circle.id, name: circle.name, plan: circle.plan }] : []

  const { data: contributionsSummary } = useQuery({
    queryKey: ['member-contributions', memberId],
    queryFn: () => apiGetMemberContributions(memberId, accessToken!),
    enabled: !!memberId && !!accessToken,
  })

  const { data: payoutInfo } = useQuery({
    queryKey: ['member-payout-info', memberId],
    queryFn: () => getMemberPayoutInfo(memberId, accessToken!),
    enabled: !!memberId && !!accessToken,
  })

  const { data: recentNotifs = [] } = useQuery({
    queryKey: ['member-notifications', memberId],
    queryFn: () => apiGetMemberNotifications(memberId, accessToken!, 1, 5),
    enabled: !!memberId && !!accessToken,
  })

  const unreadCount = recentNotifs.filter(n => !n.isRead).length

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (isMemberProfileLoading || isCircleLoading) {
    return (
      <MemberDashboardSkeleton />
    )
  } 

  return (
    <div className="min-h-screen" style={{ background: '#080F1A' }}>
      {/* Topbar */}
      <header
        className="sticky top-0 z-10 border-b border-border px-5 py-3.5 flex items-center justify-between"
        style={{ background: 'rgba(8,15,26,0.92)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: '#4B7CF3' }}
          >
            <CircleLogo className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-text-base">Susu Circle</span>
          <Badge variant="muted" className="hidden sm:inline-flex">Member</Badge>
        </div>

        <div className="flex items-center gap-3">
            {/* {user?.role === 'admin' && (
              <button
                onClick={() => { switchRole('admin'); navigate('/overview') }}
                className="text-[11px] text-text-ghost hover:text-text-dim border border-border rounded-lg px-2.5 py-1 transition-colors"
              >
                Admin view
              </button>
            )} */}
          {user && (
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-text-base leading-tight">{user.name}</p>
                <p className="text-[11px] text-text-ghost">Member</p>
              </div>
              <Avatar initials={user.initials} size="sm" />
            </div>
          )}
          <button
            onClick={handleLogout}
            className="text-text-ghost hover:text-danger transition-colors ml-1"
            aria-label="Log out"
          >
            <LogOutIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="max-w-[860px] mx-auto px-5 py-6">
        {/* Page header */}
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold text-text-base">
              {greeting()}, {user?.name?.split(' ')[0]}
            </h1>
            {circle ? (
              <p className="text-sm text-text-ghost mt-0.5">
                Cycle {circle.cycle} of {circle.totalCycles}
                <span className="mx-2 opacity-30">·</span>
                <span className={circle.status === 'active' ? 'text-green-accent' : ''}>
                  {circle.status}
                </span>
              </p>
            ) : (
              <p className="text-sm text-text-ghost mt-0.5">Your savings portal</p>
            )}
          </div>

          {circleOptions.length > 0 && (
            <div className="flex flex-col items-end gap-1">
              <label htmlFor="circle-switcher" className="text-[11px] text-text-ghost uppercase tracking-wider">
                Circle
              </label>
              <select
                id="circle-switcher"
                value={circleId}
                onChange={e => setSelectedCircleId(e.target.value)}
                className="text-sm font-medium text-text-base bg-surface border border-border rounded-lg px-3 py-1.5 min-w-[180px]"
              >
                {circleOptions.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {c.plan}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-border mb-6 overflow-x-auto">
          <TabButton id="home" label="Home" active={tab === 'home'} onClick={setTab} />
          <TabButton id="contributions" label="Contributions" active={tab === 'contributions'} onClick={setTab} />
          <TabButton id="payout" label="Payout" active={tab === 'payout'} onClick={setTab} />
          <TabButton
            id="notifications"
            label="Notifications"
            active={tab === 'notifications'}
            badge={unreadCount}
            onClick={setTab}
          />
        </div>

        {/* Tab content */}
        {tab === 'home' && (
          <HomeTab
            circle={circle}
            memberProfile={memberProfile}
            totalMembers={payoutInfo?.totalMembers}
            recentNotifs={recentNotifs}
            onGoToNotifs={() => setTab('notifications')}
          />
        )}
        {tab === 'contributions' && (
         <ContributionsTab summary={contributionsSummary} />
        )}
        {tab === 'payout' && (
          <PayoutTab
            memberId={memberId}
            payoutInfo={payoutInfo}
          />
        )}
        {tab === 'notifications' && accessToken && (
          <NotificationsTab memberId={memberId} token={accessToken} />
        )}
      </div>
    </div>
  )
}
