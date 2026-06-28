import Input, { Select, Textarea } from '../../../components/ui/Input'
import Badge from '../../../components/ui/Badge'
import { InfoIcon } from '../../../components/ui/Icons'
import type { CreateCircleFormData, Frequency, PayoutOrder } from '../../../types'

interface Step2Props {
  data: CreateCircleFormData
  onChange: (data: Partial<CreateCircleFormData>) => void
}

export default function Step2Details({ data, onChange }: Step2Props) {
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-5">
        <h2 className="text-lg font-semibold text-text-base">Circle details</h2>
        <Badge variant="green">{data.plan} plan</Badge>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div className="sm:col-span-2">
          <Input
            label="Circle name"
            placeholder="e.g. Office Ajo — Lagos HQ"
            value={data.name}
            onChange={e => onChange({ name: e.target.value })}
          />
        </div>

        <Input
          label="Contribution amount (₦)"
          type="number"
          placeholder="10000"
          value={data.contribution}
          onChange={e => onChange({ contribution: e.target.value === '' ? '' : Number(e.target.value) })}
          prefix="₦"
        />

        <Select
          label="Frequency"
          value={data.frequency}
          onChange={e => onChange({ frequency: e.target.value as Frequency })}
        >
          <option value="Monthly">Monthly</option>
          <option value="Fortnightly">Fortnightly</option>
          <option value="Weekly">Weekly</option>
        </Select>

        <Input
          label="Max members"
          type="number"
          placeholder={data.plan === 'BAM' ? '12' : '100'}
          value={data.maxMembers}
          onChange={e => onChange({ maxMembers: e.target.value === '' ? '' : Number(e.target.value) })}
        />

        <Input
          label="Start date"
          type="date"
          value={data.startDate}
          onChange={e => onChange({ startDate: e.target.value })}
        />

        <div className="sm:col-span-2">
          <Select
            label="Payout order"
            value={data.payoutOrder}
            onChange={e => onChange({ payoutOrder: e.target.value as PayoutOrder })}
          >
            <option value="Sequential">Sequential (join order)</option>
            <option value="Random">Random draw</option>
            <option value="Bidding">Bidding</option>
          </Select>
        </div>

        <div className="sm:col-span-2">
          <Textarea
            label="Description (optional)"
            placeholder="Monthly office savings group…"
            value={data.description}
            onChange={e => onChange({ description: e.target.value })}
            rows={3}
          />
        </div>
      </div>

      {/* Info banner */}
      <div className="flex gap-3 p-3.5 rounded-lg bg-blue-accent/8 border border-blue-accent/20">
        <InfoIcon className="w-4 h-4 text-blue-accent flex-shrink-0 mt-0.5" />
        <p className="text-xs text-text-dim leading-relaxed">
          Each member will receive a unique Nomba virtual account number upon joining.
          They save this number as a bank beneficiary and all transfers auto-reconcile instantly.
        </p>
      </div>
    </div>
  )
}
