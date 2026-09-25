import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiGetCircles } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { PlusIcon } from '../../components/ui/Icons'
import type { Circle } from '../../types'

function fmt(n: number) {
  return '₦' + n.toLocaleString('en-NG')
}

// GET /circles returns the raw backend DTO (numeric enums, contributionAmount, …)
// even though apiGetCircles types it as Circle, so read both shapes.
type RawCircle = Circle & Record<string, unknown>

const PLANS = ['BAM', 'ADASHI']
const FREQUENCIES = ['Weekly', 'Fortnightly', 'Monthly']
const STATUSES = ['Pending', 'Active', 'Completed', 'Paused']

function label(value: unknown, names: string[]) {
  if (typeof value === 'number') return names[value] ?? String(value)
  return value ? String(value) : '—'
}

function CircleTableRow({ circle, onOpen }: { circle: RawCircle; onOpen: () => void }) {
  const plan = label(circle.plan, PLANS)
  const status = label(circle.status, STATUSES)
  const contribution = Number(circle.contributionAmount ?? circle.contribution ?? 0)
  const memberCount = Number(circle.currentMemberCount ?? circle.memberCount ?? circle.members?.length ?? 0)

  return (
    <tr
      onClick={onOpen}
      className="border-b border-border last:border-0 hover:bg-surface-alt/50 transition-colors cursor-pointer"
    >
      <td className="py-3.5 pl-5 pr-4">
        <p className="text-sm font-medium text-text-base">{circle.name}</p>
        {circle.description && <p className="text-xs text-text-ghost truncate max-w-[280px]">{circle.description}</p>}
      </td>
      <td className="py-3.5 px-4">
        <Badge variant={plan === 'ADASHI' ? 'blue' : 'muted'}>{plan}</Badge>
      </td>
      <td className="py-3.5 px-4 text-sm tabular text-right text-text-base">
        {fmt(contribution)}
        <span className="text-xs text-text-ghost"> / {label(circle.frequency, FREQUENCIES).toLowerCase()}</span>
      </td>
      <td className="py-3.5 px-4 text-sm text-text-dim text-center tabular">
        {memberCount} / {circle.maxMembers ?? '—'}
      </td>
      <td className="py-3.5 px-4 text-sm text-text-dim text-center tabular">
        {String(circle.currentCycle ?? circle.cycle ?? '—')}
      </td>
      <td className="py-3.5 pr-5 pl-4">
        <Badge variant={status.toLowerCase() === 'active' ? 'green' : 'muted'} dot>{status}</Badge>
      </td>
    </tr>
  )
}

export default function Circles() {
  const { user, accessToken } = useAuth()
  const navigate = useNavigate()

  // Same key as useSelectedCircle, so the cache is shared.
  const { data: rawCircles = [], isLoading } = useQuery({
    queryKey: ['circles', user?.id],
    queryFn: () => apiGetCircles(user!.id, accessToken!, 1, 50),
    enabled: !!accessToken && !!user?.id,
  })

  const circles: RawCircle[] = Array.isArray(rawCircles)
    ? (rawCircles as RawCircle[])
    : Array.isArray((rawCircles as unknown as Record<string, unknown>)?.items)
      ? ((rawCircles as unknown as Record<string, unknown>).items as RawCircle[])
      : []

  const headers: Array<[string, string]> = [
    ['Circle', 'text-left pl-5 pr-4'],
    ['Plan', 'text-left px-4'],
    ['Contribution', 'text-right px-4'],
    ['Members', 'text-center px-4'],
    ['Cycle', 'text-center px-4'],
    ['Status', 'text-left pr-5 pl-4'],
  ]

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text-base">Circles</h1>
          <p className="text-sm text-text-ghost mt-0.5">{circles.length} circles</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<PlusIcon className="w-4 h-4" />}
          onClick={() => navigate('/circles/new')}
        >
          New circle
        </Button>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {headers.map(([title, cls]) => (
                  <th key={title} className={`${cls} text-xs font-medium text-text-ghost uppercase tracking-wider py-3`}>
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-ghost text-sm">Loading circles…</td>
                </tr>
              ) : circles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-ghost text-sm">No circles yet.</td>
                </tr>
              ) : (
                circles.map(circle => (
                  <CircleTableRow
                    key={circle.id}
                    circle={circle}
                    onOpen={() => navigate(`/circles/${circle.id}`)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
