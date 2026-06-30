import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { apiGetReports, apiExportReports } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { StatCard } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { chartColors } from '../tokens'
import type { CircleBreakdown } from '../types'

function fmt(n: number) {
  return '₦' + n.toLocaleString('en-NG')
}

function CircleBreakdownCard({ b }: { b: CircleBreakdown }) {
  const rate = b.ratePercent
  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-text-base">{b.name}</p>
          <p className="text-xs text-text-ghost mt-0.5">{b.cycleInfo}</p>
        </div>
        <Badge variant={b.plan === 'ADASHI' ? 'blue' : 'muted'}>{b.plan}</Badge>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <p className="text-[11px] text-text-ghost uppercase tracking-wide mb-1">Collected</p>
          <p className="text-sm font-semibold text-green-accent tabular">{fmt(b.collected)}</p>
        </div>
        <div>
          <p className="text-[11px] text-text-ghost uppercase tracking-wide mb-1">Expected</p>
          <p className="text-sm font-semibold text-text-base tabular">{fmt(b.expected)}</p>
        </div>
        <div>
          <p className="text-[11px] text-text-ghost uppercase tracking-wide mb-1">Rate</p>
          <p className={[
            'text-sm font-semibold tabular',
            rate >= 80 ? 'text-green-accent' : rate >= 50 ? 'text-amber-accent' : 'text-danger',
          ].join(' ')}>
            {rate}%
          </p>
        </div>
      </div>

      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${rate}%`,
            background: rate >= 80 ? '#00C78C' : rate >= 50 ? '#F59E0B' : '#EF4444',
          }}
        />
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div
      className="text-xs rounded-lg border px-3 py-2.5 shadow-card-lg"
      style={{ background: chartColors.tooltip.bg, borderColor: chartColors.tooltip.border }}
    >
      <p className="text-text-ghost font-medium mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ background: chartColors.green }} />
        <span className="text-text-base tabular">{fmt(payload[0]?.value ?? 0)}</span>
      </div>
    </div>
  )
}

export default function Reports() {
  const { user, accessToken } = useAuth()

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports', user?.id],
    queryFn: () => apiGetReports(user!.id, accessToken!),
    enabled: !!user && !!accessToken,
  })

  const rate = reports?.overallRatePercent ?? 0

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text-base">Reports</h1>
          <p className="text-sm text-text-ghost mt-0.5">Collection analytics across all circles.</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            if (user?.id && accessToken) {
              apiExportReports(user.id, accessToken).catch(console.error)
            }
          }}
        >
          Export CSV
        </Button>
      </div>

      {/* Top stats — sourced directly from the reports endpoint */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total collected"
          value={reports ? fmt(reports.totalCollected) : '—'}
          accent="green"
        />
        <StatCard
          label="Total expected"
          value={reports ? fmt(reports.totalExpected) : '—'}
        />
        <StatCard
          label="Overall rate"
          value={reports ? `${rate}%` : '—'}
          accent={rate >= 80 ? 'green' : rate >= 50 ? 'amber' : undefined}
        />
        <StatCard
          label="Active circles"
          value={reports?.activeCirclesCount ?? '—'}
          accent="blue"
        />
      </div>

      {/* Bar chart */}
      <div className="bg-surface rounded-xl border border-border p-5 mb-6">
        <h2 className="text-sm font-semibold text-text-base mb-4">Monthly collections (2026)</h2>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={reports?.chartData}
              margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
              barSize={18}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: chartColors.axis, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: chartColors.axis, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(75,124,243,0.06)' }} />
              <Bar dataKey="actual" radius={[4, 4, 0, 0]}>
                {reports?.chartData?.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.actual >= entry.expected ? chartColors.green : chartColors.amber}
                    opacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-circle breakdown */}
      <div>
        <h2 className="text-sm font-semibold text-text-base mb-3">Circle breakdown</h2>
        {isLoading ? (
          <p className="text-sm text-text-ghost">Loading…</p>
        ) : !reports?.circleBreakdowns?.length ? (
          <p className="text-sm text-text-ghost">No circle data available.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {reports.circleBreakdowns.map(b => (
              <CircleBreakdownCard key={b.circleId} b={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
