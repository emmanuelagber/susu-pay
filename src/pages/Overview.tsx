import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { apiGetOverview } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { StatCard } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { PlusIcon, ArrowRightIcon } from '../components/ui/Icons'
import { chartColors } from '../tokens'
import type { OverviewCircle } from '../types'
import OverviewSkeleton from '../components/overviewskeleton'

function fmt(n?: number | null) {
  if (n === null || n === undefined) return '—'
  return '₦' + n.toLocaleString('en-NG')
}

function CollectionBar({ rate }: { rate: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${rate}%`, background: rate >= 80 ? '#00C78C' : rate >= 50 ? '#F59E0B' : '#EF4444' }}
        />
      </div>
      <span className="text-xs tabular text-text-dim w-8 text-right">{rate}%</span>
    </div>
  )
}

function CircleRow({ circle }: { circle: OverviewCircle }) {
  const isActive = circle.status.toLowerCase() === 'active'
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-medium text-text-base truncate">{circle.name}</p>
          <Badge variant={circle.plan === 'ADASHI' ? 'blue' : 'muted'} className="text-[11px]">
            {circle.plan}
          </Badge>
        </div>
        <p className="text-xs text-text-ghost truncate">{circle.cycleInfo}</p>
      </div>
      <div className="w-28 flex-shrink-0">
        <CollectionBar rate={circle.collectionRatePercent} />
      </div>
      <Badge variant={isActive ? 'green' : 'muted'} dot>
        {circle.status}
      </Badge>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div
      className="text-xs rounded-lg border px-3 py-2.5 space-y-1 shadow-card-lg"
      style={{ background: chartColors.tooltip.bg, borderColor: chartColors.tooltip.border }}
    >
      <p className="text-text-ghost font-medium mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-text-dim capitalize">{p.name === 'expected' ? 'Expected' : 'Collected'}:</span>
          <span className="text-text-base tabular">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function Overview() {
  const { user, accessToken } = useAuth()
  const navigate = useNavigate()
  const [showAllCircles, setShowAllCircles] = useState(false)

  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats', user?.id],
    queryFn: () => apiGetOverview(user!.id, accessToken!),
    enabled: !!user && !!accessToken,
  })

  if(isLoading) {
    return <OverviewSkeleton />
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const visibleCircles = (stats?.activeCirclesList ?? []).slice(0, showAllCircles ? undefined : 4)
  const hasMoreCircles = (stats?.activeCirclesList?.length ?? 0) > 4

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text-base">
            {greeting()}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-text-ghost mt-0.5">
            Here's what's happening across your circles today.
          </p>
        </div>
        <Button
          variant="primary"
          icon={<PlusIcon className="w-4 h-4" />}
          onClick={() => navigate('/circles/new')}
        >
          New circle
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Circles" value={stats?.activeCircles ?? '—'} accent="blue" />
        <StatCard label="Total Members" value={stats?.totalMembers ?? '—'} />
        <StatCard
          label="Total Collected"
          value={stats ? fmt(stats.totalContributions) : '—'}
          accent="green"
          sub="all-time"
        />
        <StatCard
          label="Collection Rate"
          value={stats ? `${stats.collectionRate}%` : '—'}
          accent={
            stats
              ? stats.collectionRate >= 80
                ? 'green'
                : stats.collectionRate >= 50
                ? 'amber'
                : undefined
              : undefined
          }
          sub="this cycle"
        />
      </div>

      {/* Chart + Circles */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Area chart */}
        <div className="lg:col-span-3 bg-surface rounded-xl border border-border p-5 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-text-base">Contribution trends</h2>
              <p className="text-xs text-text-ghost mt-0.5">Expected vs actual collections</p>
            </div>
            <Badge variant="muted">2026</Badge>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor={chartColors.green} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={chartColors.green} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradExpected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor={chartColors.blue} stopOpacity={0.14} />
                    <stop offset="95%" stopColor={chartColors.blue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chartColors.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartColors.axis, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={7}
                  wrapperStyle={{ fontSize: 11, color: '#7B96B0', paddingTop: 12 }}
                />
                <Area type="monotone" dataKey="expected" stroke={chartColors.blue} strokeWidth={1.5} fill="url(#gradExpected)" dot={false} />
                <Area type="monotone" dataKey="actual" stroke={chartColors.green} strokeWidth={1.5} fill="url(#gradActual)" dot={false} activeDot={{ r: 4, fill: chartColors.green }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active circles list */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-5 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-base">Active circles</h2>
            {hasMoreCircles && (
              <button
                onClick={() => setShowAllCircles(v => !v)}
                className="text-xs text-blue-accent flex items-center gap-1 hover:opacity-80 transition-opacity"
              >
                {showAllCircles ? 'Show less' : 'View all'} <ArrowRightIcon className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {visibleCircles.length > 0 ? (
              visibleCircles.map(c => <CircleRow key={c.id} circle={c} />)
            ) : (
              <p className="text-sm text-text-ghost text-center py-8">No active circles.</p>
            )}
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="mt-4 w-full"
            icon={<PlusIcon className="w-3.5 h-3.5" />}
            onClick={() => navigate('/circles/new')}
          >
            Create new circle
          </Button>
        </div>
      </div>
    </div>
  )
}
