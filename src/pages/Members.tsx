import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiGetCircles } from '../lib/api'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import type { Member, Circle } from '../types'

function fmt(n: number) {
  return '₦' + n.toLocaleString('en-NG')
}

function MemberRow({ member, index, circle }: { member: Member; index: number; circle: Circle }) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-surface-alt/50 transition-colors">
      <td className="py-3.5 pl-5 pr-4">
        <div className="flex items-center gap-3">
          <Avatar initials={member.initials} size="sm" index={index} />
          <div>
            <p className="text-sm font-medium text-text-base">{member.name}</p>
            <p className="text-xs text-text-ghost">{member.phone}</p>
          </div>
        </div>
      </td>
      <td className="py-3.5 px-4">
        <code className="text-xs text-green-accent font-mono tracking-wider bg-green-accent/10 px-2 py-1 rounded">
          {member.virtualAccount}
        </code>
      </td>
      <td className="py-3.5 px-4 text-sm text-text-dim text-center tabular">
        #{member.payoutPosition}
      </td>
      <td className="py-3.5 px-4">
        <Badge
          variant={
            member.status === 'paid' ? 'green' :
            member.status === 'overdue' ? 'danger' : 'amber'
          }
          dot
        >
          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
        </Badge>
      </td>
      <td className="py-3.5 px-4 text-sm tabular text-right text-text-base">
        {member.amountPaid ? fmt(member.amountPaid) : <span className="text-text-ghost">—</span>}
      </td>
      <td className="py-3.5 pr-5 pl-4 text-xs text-text-ghost">
        <Badge variant="muted">{circle.name}</Badge>
      </td>
    </tr>
  )
}

export default function Members() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all')

  const { data: circles, isLoading } = useQuery({
    queryKey: ['circles'],
    queryFn: apiGetCircles,
  })

  const allMembers: Array<{ member: Member; circle: Circle }> = []
  circles?.forEach(c => {
    c.members.forEach(m => allMembers.push({ member: m, circle: c }))
  })

  const filtered = allMembers.filter(({ member }) => {
    const matchesSearch =
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.phone.includes(search) ||
      member.virtualAccount.includes(search)
    const matchesFilter = filter === 'all' || member.status === filter
    return matchesSearch && matchesFilter
  })

  const paidCount = allMembers.filter(({ member }) => member.status === 'paid').length
  const pendingCount = allMembers.filter(({ member }) => member.status === 'pending').length

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text-base">Members</h1>
          <p className="text-sm text-text-ghost mt-0.5">
            {allMembers.length} total · {paidCount} paid · {pendingCount} pending
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <input
          type="search"
          placeholder="Search by name, phone, or account…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-9 bg-surface border border-border rounded-lg text-sm text-text-base placeholder-text-ghost px-3 outline-none focus:border-blue-accent w-72"
        />
        <div className="flex gap-1">
          {(['all', 'paid', 'pending', 'overdue'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                'text-xs px-3 py-1.5 rounded-lg transition-colors capitalize',
                filter === f
                  ? 'bg-blue-accent text-white'
                  : 'text-text-dim hover:text-text-base hover:bg-surface-alt border border-border',
              ].join(' ')}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-text-ghost uppercase tracking-wider py-3 pl-5 pr-4">
                  Member
                </th>
                <th className="text-left text-xs font-medium text-text-ghost uppercase tracking-wider py-3 px-4">
                  Virtual account
                </th>
                <th className="text-center text-xs font-medium text-text-ghost uppercase tracking-wider py-3 px-4">
                  Position
                </th>
                <th className="text-left text-xs font-medium text-text-ghost uppercase tracking-wider py-3 px-4">
                  Status
                </th>
                <th className="text-right text-xs font-medium text-text-ghost uppercase tracking-wider py-3 px-4">
                  Paid
                </th>
                <th className="text-left text-xs font-medium text-text-ghost uppercase tracking-wider py-3 pr-5 pl-4">
                  Circle
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-ghost text-sm">
                    Loading members…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-ghost text-sm">
                    No members match your search.
                  </td>
                </tr>
              ) : (
                filtered.map(({ member, circle }, i) => (
                  <MemberRow key={`${circle.id}-${member.id}`} member={member} circle={circle} index={i} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
