function Shimmer({ className = '', style }: { className?: string , style?: React.CSSProperties}) {
  return (
    <div className={`animate-pulse rounded-md bg-border/60 ${className}`} style={style} />
  )
}

function StatCardSkeleton() {
  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <Shimmer className="h-3 w-20 mb-3" />
      <Shimmer className="h-6 w-16 mb-2" />
      <Shimmer className="h-2.5 w-12" />
    </div>
  )
}

function CircleRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <Shimmer className="h-3.5 w-32 mb-2" />
        <Shimmer className="h-2.5 w-24" />
      </div>
      <div className="w-28 flex-shrink-0">
        <Shimmer className="h-1.5 w-full" />
      </div>
      <Shimmer className="h-4 w-16 rounded-full" />
    </div>
  )
}

function OverviewSkeleton() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Shimmer className="h-6 w-52 mb-2" />
          <Shimmer className="h-3.5 w-72" />
        </div>
        <Shimmer className="h-9 w-32 rounded-lg" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Chart + Circles */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Chart area */}
        <div className="lg:col-span-3 bg-surface rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Shimmer className="h-3.5 w-36 mb-2" />
              <Shimmer className="h-2.5 w-48" />
            </div>
            <Shimmer className="h-4 w-12 rounded-full" />
          </div>
          <Shimmer className="w-full" style={{ height: 220 } as React.CSSProperties} />
        </div>

        {/* Active circles list */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <Shimmer className="h-3.5 w-28" />
          </div>
          <div className="flex-1">
            <CircleRowSkeleton />
            <CircleRowSkeleton />
            <CircleRowSkeleton />
            <CircleRowSkeleton />
          </div>
          <Shimmer className="h-8 w-full mt-4 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default OverviewSkeleton