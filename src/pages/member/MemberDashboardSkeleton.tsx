// ─── Skeleton ─────────────────────────────────────────────────────────────────
import Badge from '../../components/ui/Badge'
import { CircleLogo } from '../../components/ui/Icons';
function Shimmer({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse rounded-md bg-border/60 ${className}`} style={style} />
}

function StatBoxSkeleton() {
  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <Shimmer className="h-2.5 w-24 mb-3" />
      <Shimmer className="h-5 w-16 mb-2" />
      <Shimmer className="h-2.5 w-20" />
    </div>
  )
}

function NotifRowSkeleton() {
  return (
    <div className="flex items-start gap-3 px-5 py-3.5 border-b border-border last:border-0">
      <Shimmer className="w-7 h-7 rounded-full flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <Shimmer className="h-3.5 w-40 mb-2" />
        <Shimmer className="h-2.5 w-56" />
      </div>
    </div>
  )
}

function MemberDashboardSkeleton() {
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
        <Shimmer className="w-8 h-8 rounded-full" />
      </header>

      <div className="max-w-[860px] mx-auto px-5 py-6">
        {/* Page header */}
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Shimmer className="h-6 w-48 mb-2" />
            <Shimmer className="h-3.5 w-56" />
          </div>
          <div className="flex flex-col items-end gap-1">
            <Shimmer className="h-2.5 w-14" />
            <Shimmer className="h-8 w-40 rounded-lg" />
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-6 border-b border-border mb-6">
          <Shimmer className="h-4 w-12 mb-3" />
          <Shimmer className="h-4 w-24 mb-3" />
          <Shimmer className="h-4 w-16 mb-3" />
          <Shimmer className="h-4 w-24 mb-3" />
        </div>

        {/* Home tab shape */}
        <div className="space-y-5">
          {/* Virtual account card */}
          <div className="rounded-2xl border border-border p-5">
            <Shimmer className="h-2.5 w-52 mb-4" />
            <Shimmer className="h-8 w-48 mb-3" />
            <Shimmer className="h-5 w-32 mb-4" />
            <Shimmer className="h-14 w-full rounded-xl" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatBoxSkeleton />
            <StatBoxSkeleton />
            <StatBoxSkeleton />
          </div>

          {/* Circle info */}
          <div className="bg-surface rounded-xl border border-border p-5">
            <Shimmer className="h-2.5 w-16 mb-3" />
            <Shimmer className="h-4 w-40 mb-3" />
            <Shimmer className="h-3 w-full max-w-md mb-3" />
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Shimmer className="h-3 w-24" />
              <Shimmer className="h-3 w-24" />
              <Shimmer className="h-3 w-28" />
              <Shimmer className="h-3 w-24" />
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border">
              <Shimmer className="h-3.5 w-28" />
            </div>
            <NotifRowSkeleton />
            <NotifRowSkeleton />
            <NotifRowSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MemberDashboardSkeleton