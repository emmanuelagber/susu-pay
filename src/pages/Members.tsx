import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiAddMember, apiGetAdminMembers, apiGetCircles } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Input, { Select } from '../components/ui/Input'
import { PlusIcon } from '../components/ui/Icons'
import { getErrorMessages } from '../lib/errors'
import type { Circle, Member } from '../types'

function fmt(n: number) {
  return '₦' + n.toLocaleString('en-NG')
}

function MemberRow({ member, index, circleName }: { member: Member; index: number; circleName?: string }) {
  const status = member.status ?? 'pending'
  return (
    <tr className="border-b border-border last:border-0 hover:bg-surface-alt/50 transition-colors">
      <td className="py-3.5 pl-5 pr-4">
        <div className="flex items-center gap-3">
          <Avatar initials={member.initials} size="sm" index={index} />
          <div>
            <p className="text-sm font-medium text-text-base">{member.name}</p>
            <p className="text-xs text-text-ghost">{member.phone ?? '—'}</p>
          </div>
        </div>
      </td>
      <td className="py-3.5 px-4">
        <code className="text-xs text-green-accent font-mono tracking-wider bg-green-accent/10 px-2 py-1 rounded">
          {member.virtualAccount ?? '—'}
        </code>
      </td>
      <td className="py-3.5 px-4 text-sm text-text-dim text-center tabular">
        #{member.payoutPosition ?? '—'}
      </td>
      <td className="py-3.5 px-4">
        <Badge
          variant={
            status === 'paid' ? 'green' :
            status === 'overdue' ? 'danger' : 'amber'
          }
          dot
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </td>
      <td className="py-3.5 px-4 text-sm tabular text-right text-text-base">
        {member.amountPaid ? fmt(member.amountPaid) : <span className="text-text-ghost">—</span>}
      </td>
      <td className="py-3.5 pr-5 pl-4 text-xs text-text-ghost">
        <Badge variant="muted">{circleName ?? 'Unassigned'}</Badge>
      </td>
    </tr>
  )
}

export default function Members() {
  const { user, accessToken } = useAuth()
  const qc = useQueryClient()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all')
  const [showAddMember, setShowAddMember] = useState(false)
  const [selectedCircleId, setSelectedCircleId] = useState(params.get('circleId') ?? '')
  const [memberName, setMemberName] = useState('')
  const [memberPhone, setMemberPhone] = useState('')
  const [memberEmail, setMemberEmail] = useState('')
  const [memberFormError, setMemberFormError] = useState<string | null>(null)
  const [memberFormSuccess, setMemberFormSuccess] = useState<string | null>(null)

  const { data: rawCircles = [] } = useQuery({
    queryKey: ['circles', user?.id],
    queryFn: () => apiGetCircles(user!.id, accessToken!, 1, 50),
    enabled: !!accessToken && !!user?.id,
  })

  const circles: Circle[] = Array.isArray(rawCircles)
    ? rawCircles
    : Array.isArray((rawCircles as unknown as Record<string, unknown>)?.items)
      ? ((rawCircles as unknown as Record<string, unknown>).items as Circle[])
      : []

  const resolvedCircleId = selectedCircleId || circles[0]?.id || ''

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['adminMembers', user?.id, search, filter],
    queryFn: () => user && accessToken
      ? apiGetAdminMembers(user.id, accessToken, search.trim() || undefined, undefined, filter === 'all' ? undefined : filter, 1, 50)
      : Promise.resolve([]),
    enabled: !!accessToken && !!user?.id,
  })

  const addMemberMutation = useMutation({
    mutationFn: () => {
      if (!accessToken) throw new Error('No auth token')
      if (!resolvedCircleId) throw new Error('Select a circle first.')
      if (!memberName.trim()) throw new Error('Member name is required.')
      if (!memberPhone.trim()) throw new Error('Phone number is required.')

      return apiAddMember(
        resolvedCircleId,
        {
          name: memberName.trim(),
          phone: memberPhone.trim(),
          email: memberEmail.trim() || undefined,
        },
        accessToken,
      )
    },
    onSuccess: () => {
      const circle = circles.find(c => c.id === resolvedCircleId)
      setMemberName('')
      setMemberPhone('')
      setMemberEmail('')
      setMemberFormError(null)
      setMemberFormSuccess(`Member added${circle ? ` to ${circle.name}` : ''}.`)
      qc.invalidateQueries({ queryKey: ['adminMembers', user?.id] })
      qc.invalidateQueries({ queryKey: ['circles', user?.id] })
    },
    onError: (error) => {
      setMemberFormSuccess(null)
      setMemberFormError(getErrorMessages(error, 'Failed to add member.').join(' '))
    },
  })

  const handleCircleChange = (id: string) => {
    setSelectedCircleId(id)
    setParams(prev => {
      if (id) prev.set('circleId', id)
      else prev.delete('circleId')
      return prev
    })
  }

  const filtered = members && members.filter(member => {
    const matchesSearch =
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      (member.phone ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (member.virtualAccount ?? '').toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || member.status === filter
    return matchesSearch && matchesFilter
  })

  const paidCount = members.filter(member => member.status === 'paid').length
  const pendingCount = members.filter(member => member.status === 'pending').length

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text-base">Members</h1>
          <p className="text-sm text-text-ghost mt-0.5">
            {members.length} total · {paidCount} paid · {pendingCount} pending
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<PlusIcon className="w-4 h-4" />}
          onClick={() => setShowAddMember(open => !open)}
        >
          Add member
        </Button>
      </div>

      {showAddMember && (
        <div className="bg-surface rounded-xl border border-border p-5 mb-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-text-base">Add member to circle</h2>
              <p className="text-xs text-text-ghost mt-0.5">Choose an existing circle and enter the member details.</p>
            </div>
            {memberFormSuccess && (
              <span className="text-xs text-green-accent">{memberFormSuccess}</span>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Select
              label="Circle"
              value={resolvedCircleId}
              onChange={e => handleCircleChange(e.target.value)}
              error={!resolvedCircleId ? 'Create a circle first.' : undefined}
            >
              <option value="">Select circle</option>
              {circles.map(circle => (
                <option key={circle.id} value={circle.id}>
                  {circle.name}
                </option>
              ))}
            </Select>
            <Input
              label="Full name"
              value={memberName}
              onChange={e => setMemberName(e.target.value)}
              placeholder="John Doe"
            />
            <Input
              label="Phone"
              type="tel"
              value={memberPhone}
              onChange={e => setMemberPhone(e.target.value)}
              placeholder="07036090000"
            />
            <Input
              label="Email"
              type="email"
              value={memberEmail}
              onChange={e => setMemberEmail(e.target.value)}
              placeholder="member@example.com"
            />
          </div>

          {memberFormError && (
            <p className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {memberFormError}
            </p>
          )}

          <div className="mt-4 flex justify-end">
            <Button
              variant="primary"
              loading={addMemberMutation.isPending}
              disabled={!resolvedCircleId}
              onClick={() => addMemberMutation.mutate()}
            >
              Add to circle
            </Button>
          </div>
        </div>
      )}

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
                filtered.map((member, i) => (
                  <MemberRow key={member.id} member={member} circleName={member.circleName} index={i} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
