import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { apiGetCircle, apiGetMember, apiGetMemberContributions, apiGetMemberNotifications, apiMarkMemberNotificationsRead } from '../../lib/api'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import { CopyIcon, CheckIcon, InfoIcon, LogOutIcon } from '../../components/ui/Icons'
import { CircleLogo } from '../../components/ui/Icons'
import type { Member } from '../../types'

function fmt(n: number) {
  return '₦' + n.toLocaleString('en-NG')
}

function VirtualAccountCard({
  account,
  name,
}: {
  account: string
  name: string
}) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(account.replace(/\s/g, '')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      className="rounded-xl p-5 border relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #062F1B 0%, #0A2318 60%, #041A11 100%)',
        borderColor: '#00C78C33',
      }}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,199,140,0.12) 0%, transparent 70%)' }}
      />

      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-green-accent/70 mb-3">
        Your unique contribution account
      </p>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl font-bold text-text-base tracking-wider font-mono tabular">
          {account}
        </span>
        <button
          onClick={copy}
          className="p-1.5 rounded-md text-green-accent/60 hover:text-green-accent hover:bg-green-accent/10 transition-colors flex-shrink-0"
          aria-label="Copy account number"
        >
          {copied ? <CheckIcon className="w-4 h-4 text-green-accent" /> : <CopyIcon className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-medium text-green-accent/80 bg-green-accent/10 border border-green-accent/20 px-2 py-0.5 rounded">
          Nomba MFB
        </span>
        <span className="text-xs text-green-accent/50">·</span>
        <span className="text-xs text-green-accent/60">Account name: {name.toUpperCase()}</span>
      </div>

      <div className="flex gap-2 items-start p-3 rounded-lg bg-green-accent/5 border border-green-accent/15">
        <InfoIcon className="w-3.5 h-3.5 text-green-accent/60 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-green-accent/70 leading-relaxed">
          Save this as a beneficiary in your banking app. Any transfer to this number auto-reconciles instantly.
        </p>
      </div>
    </div>
  )
}

function StatBox({
  label,
  primary,
  secondary,
  accent,
}: {
  label: string
  primary: string
  secondary?: string
  accent?: string
}) {
  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <p className="text-[11px] text-text-ghost uppercase tracking-wider mb-2">{label}</p>
      <p className={['text-xl font-bold tabular', accent ?? 'text-text-base'].join(' ')}>{primary}</p>
      {secondary && <p className="text-xs text-text-ghost mt-0.5">{secondary}</p>}
    </div>
  )
}

function MemberStatusRow({
  member,
  index,
  isCurrentUser,
}: {
  member: Member
  index: number
  isCurrentUser: boolean
}) {
  return (
    <tr
      className={[
        'border-b border-border last:border-0 transition-colors',
        isCurrentUser ? 'bg-blue-accent/5' : 'hover:bg-surface-alt/40',
      ].join(' ')}
    >
      <td className="py-3 pl-4 pr-3">
        <div className="flex items-center gap-2.5">
          <Avatar initials={member.initials} size="sm" index={index} />
          <div>
            <p className="text-sm font-medium text-text-base">
              {member.name}
              {isCurrentUser && (
                <span className="ml-1.5 text-[11px] text-blue-accent bg-blue-accent/10 px-1.5 py-0.5 rounded">
                  You
                </span>
              )}
            </p>
          </div>
        </div>
      </td>
      <td className="py-3 px-3 text-sm text-text-dim text-center tabular">
        #{member.payoutPosition}
      </td>
      <td className="py-3 px-3">
        <Badge
          variant={member.status === 'paid' ? 'green' : member.status === 'overdue' ? 'danger' : 'muted'}
          dot
        >
          {member.status === 'paid' ? 'Paid' : member.status === 'overdue' ? 'Overdue' : 'Pending'}
        </Badge>
      </td>
      <td className="py-3 pr-4 pl-3 text-sm tabular text-right">
        {member.amountPaid ? (
          <span className="text-green-accent">{fmt(member.amountPaid)}</span>
        ) : (
          <span className="text-text-ghost">—</span>
        )}
      </td>
    </tr>
  )
}

export default function MemberDashboard() {
  const { user, accessToken, logout, switchRole } = useAuth()
  const navigate = useNavigate()

  const circleId = user?.circleId ?? 'c1'
  const memberId = user?.memberId ?? 'm1'

  const { data: circle } = useQuery({
    queryKey: ['circle', circleId, accessToken],
    queryFn: () => accessToken ? apiGetCircle(circleId, accessToken) : Promise.resolve(null),
    enabled: !!accessToken,
  })
  const { data: memberProfile } = useQuery({
    queryKey: ['member-profile', memberId, accessToken],
    queryFn: () => accessToken && memberId ? apiGetMember(memberId, accessToken) : Promise.resolve(null),
    enabled: !!accessToken && !!memberId,
  })
  const { data: contributions } = useQuery({
    queryKey: ['member-contributions', memberId, accessToken],
    queryFn: () => accessToken && memberId ? apiGetMemberContributions(memberId, accessToken) : Promise.resolve([]),
    enabled: !!accessToken && !!memberId,
  })
  const { data: notifications = [] } = useQuery({
    queryKey: ['member-notifications', memberId, accessToken],
    queryFn: () => accessToken && memberId ? apiGetMemberNotifications(memberId, accessToken, 1, 5) : Promise.resolve([]),
    enabled: !!accessToken && !!memberId,
  })
  const markReadMutation = useMutation({
    mutationFn: () => accessToken && memberId ? apiMarkMemberNotificationsRead(memberId, accessToken) : Promise.resolve(false),
  })

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const me = circle?.members.find(m => m.id === memberId) ?? circle?.members[0]
  const paidCount = circle?.members.filter(m => m.status === 'paid').length ?? 0
  const totalCount = circle?.members.length ?? 0
  const remaining = (circle?.maxMembers ?? 0) - totalCount
  const allPaid = paidCount === totalCount && totalCount > 0
  const dueDate = circle ? new Date(circle.startDate) : new Date()
  dueDate.setMonth(dueDate.getMonth() + (circle?.cycle ?? 1) - 1)

  const dueDateStr = dueDate.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="min-h-screen" style={{ background: '#0B1929' }}>
      {/* Topbar */}
      <header className="border-b border-border px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: '#4B7CF3' }}
          >
            <CircleLogo className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-text-base">Susu Circle</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={switchRole}
            className="text-[11px] text-text-ghost hover:text-text-dim border border-border rounded px-2 py-1"
          >
            Switch to admin view
          </button>
          {user && (
            <div className="flex items-center gap-2.5">
              <span className="text-sm text-text-dim">{user.name}</span>
              <Avatar initials={user.initials} size="sm" />
            </div>
          )}
          <button onClick={handleLogout} className="text-text-ghost hover:text-danger transition-colors">
            <LogOutIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="p-6 max-w-[820px] mx-auto">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-text-base">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          {circle && (
            <p className="text-sm text-text-dim mt-1">
              {circle.name}
              <span className="text-text-ghost mx-2">·</span>
              Cycle {circle.cycle} of {circle.totalCycles}
              <span className="text-text-ghost mx-2">·</span>
              <Badge variant={circle.plan === 'ADASHI' ? 'blue' : 'muted'} className="text-[11px]">
                {circle.plan} plan
              </Badge>
            </p>
          )}
        </div>

        {/* Virtual account card */}
        {me && (
          <div className="mb-5">
            <VirtualAccountCard account={me.virtualAccount ?? '—'} name={me.name} />
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatBox
            label="Contribution due"
            primary={circle ? fmt(circle.contribution) : '—'}
            secondary={`Due ${dueDateStr}`}
            accent="text-green-accent"
          />
          <StatBox
            label="Your payout position"
            primary={me ? `#${me.payoutPosition}` : '—'}
            secondary={me?.payoutPosition === 1 ? 'First to receive' : `${me?.payoutPosition}${ordinal(me?.payoutPosition ?? 0)} in line`}
          />
          <StatBox
            label="Circle members"
            primary={`${totalCount}/${circle?.maxMembers ?? '—'}`}
            secondary={`Spots remaining: ${remaining}`}
          />
        </div>

        {(memberProfile || contributions?.length || notifications.length) && (
          <div className="bg-surface rounded-xl border border-border p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-text-base">Activity snapshot</h2>
              <button
                onClick={() => markReadMutation.mutate()}
                className="text-[11px] text-blue-accent hover:opacity-80"
              >
                {markReadMutation.isPending ? 'Saving…' : 'Mark read'}
              </button>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] text-text-ghost uppercase tracking-wider">Member profile</p>
                <p className="text-sm font-semibold text-text-base mt-1">{memberProfile?.name ?? user?.name ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] text-text-ghost uppercase tracking-wider">Contributions</p>
                <p className="text-sm font-semibold text-text-base mt-1">{contributions?.length ?? 0} entries</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] text-text-ghost uppercase tracking-wider">Notifications</p>
                <p className="text-sm font-semibold text-text-base mt-1">{notifications.filter(n => !n.isRead).length} unread</p>
              </div>
            </div>
          </div>
        )}

        {/* Cycle status */}
        {circle && (
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="text-sm font-semibold text-text-base">
                  Cycle {circle.cycle} — contribution status
                </h2>
                <p className="text-xs text-text-ghost mt-0.5">Members paid this cycle</p>
              </div>
              <Badge variant={allPaid ? 'green' : 'amber'} dot>
                {paidCount}/{totalCount} paid
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-text-ghost uppercase tracking-wider py-2.5 pl-4 pr-3">
                      Member
                    </th>
                    <th className="text-center text-xs font-medium text-text-ghost uppercase tracking-wider py-2.5 px-3">
                      Position
                    </th>
                    <th className="text-left text-xs font-medium text-text-ghost uppercase tracking-wider py-2.5 px-3">
                      Status
                    </th>
                    <th className="text-right text-xs font-medium text-text-ghost uppercase tracking-wider py-2.5 pr-4 pl-3">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {circle.members.map((member, i) => (
                    <MemberStatusRow
                      key={member.id}
                      member={member}
                      index={i}
                      isCurrentUser={member.id === memberId}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Payout unlock bar */}
            {me && !allPaid && (
              <div className="flex items-start gap-2.5 px-5 py-3.5 border-t border-border bg-surface-alt/40">
                <InfoIcon className="w-3.5 h-3.5 text-text-ghost flex-shrink-0 mt-0.5" />
                <p className="text-xs text-text-ghost">
                  Payout to <span className="text-text-dim">{circle.members.find(m => m.payoutPosition === 1)?.name}</span> releases automatically
                  when all {totalCount} members have paid.
                </p>
              </div>
            )}
            {allPaid && (
              <div className="flex items-start gap-2.5 px-5 py-3.5 border-t border-border bg-green-accent/5">
                <CheckIcon className="w-3.5 h-3.5 text-green-accent flex-shrink-0 mt-0.5" />
                <p className="text-xs text-green-accent/80">
                  All members have paid. Payout processing…
                </p>
              </div>
            )}
          </div>
        )}

        {/* History link placeholder */}
        <div className="mt-4 flex gap-2">
          <button className="text-xs text-text-ghost hover:text-blue-accent transition-colors">
            View payment history
          </button>
          <span className="text-text-ghost">·</span>
          <button className="text-xs text-text-ghost hover:text-blue-accent transition-colors">
            Notifications
          </button>
        </div>
      </div>
    </div>
  )
}

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] ?? s[v] ?? s[0]
}
