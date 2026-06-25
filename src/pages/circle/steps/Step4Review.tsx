import Badge from '../../../components/ui/Badge'
import Avatar from '../../../components/ui/Avatar'
import { CheckIcon, BankIcon } from '../../../components/ui/Icons'
import type { CreateCircleFormData, Member } from '../../../types'

interface Step4Props {
  data: CreateCircleFormData
  members: Member[]
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-xs text-text-ghost">{label}</span>
      <span className="text-sm text-text-base font-medium">{value}</span>
    </div>
  )
}

export default function Step4Review({ data, members }: Step4Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-text-base mb-1.5">Review &amp; launch</h2>
      <p className="text-sm text-text-dim mb-5">Confirm your circle details before going live.</p>

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Circle details */}
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-text-base">{data.name || 'Unnamed Circle'}</span>
            {data.plan && <Badge variant={data.plan === 'ADASHI' ? 'blue' : 'green'}>{data.plan}</Badge>}
          </div>
          <Row label="Contribution" value={data.contribution ? `₦${Number(data.contribution).toLocaleString('en-NG')}` : '—'} />
          <Row label="Frequency" value={data.frequency} />
          <Row label="Max members" value={data.maxMembers ? String(data.maxMembers) : '—'} />
          <Row label="Payout order" value={data.payoutOrder} />
          <Row label="Start date" value={data.startDate || '—'} />
          {data.description && <Row label="Description" value={data.description} />}
        </div>

        {/* Members preview */}
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-text-base">Members</span>
            <Badge variant="muted">{members.length} added</Badge>
          </div>
          {members.length === 0 ? (
            <p className="text-xs text-text-ghost py-4 text-center">No members added. You can add them after launch.</p>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {members.map((m, i) => (
                <div key={m.id} className="flex items-center gap-2.5 py-1">
                  <span className="text-xs text-text-ghost w-4 tabular text-right">#{i + 1}</span>
                  <Avatar initials={m.initials} size="sm" index={i} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-base truncate">{m.name}</p>
                  </div>
                  <code className="text-[11px] text-green-accent font-mono tracking-wider">
                    {m.virtualAccount}
                  </code>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Launch checklist */}
      <div className="mt-5 rounded-xl border border-green-accent/20 bg-green-accent/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <BankIcon className="w-4 h-4 text-green-accent" />
          <span className="text-sm font-medium text-text-base">What happens next</span>
        </div>
        <ul className="space-y-2">
          {[
            `${members.length} member${members.length !== 1 ? 's' : ''} receive their unique virtual account numbers via SMS`,
            'Contributions made to those accounts auto-reconcile to the circle',
            `Payouts release automatically in ${data.payoutOrder.toLowerCase()} order`,
            'You can track progress in real-time on your dashboard',
          ].map(item => (
            <li key={item} className="flex items-start gap-2.5 text-xs text-text-dim">
              <span className="w-4 h-4 rounded-full bg-green-accent/15 text-green-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckIcon className="w-2 h-2" />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
