import { useState } from 'react'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Avatar from '../../../components/ui/Avatar'
import Badge from '../../../components/ui/Badge'
import { PlusIcon, InfoIcon } from '../../../components/ui/Icons'
import type { Member, CreateCircleFormData } from '../../../types'

interface Step3Props {
  circleData: CreateCircleFormData
  members: Member[]
  onAddMember: (member: Member) => void
}

export default function Step3Members({ circleData, members, onAddMember }: Step3Props) {
  // staging only; API calls occur after circle creation
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const maxMembers = Number(circleData.maxMembers) || 12

  // Local add: members are staged locally during circle creation. They are persisted
  // to the backend after the circle is created.

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Name is required'
    if (!phone.trim()) e.phone = 'Phone is required'
    if (phone && !/^0[7-9][01]\d{8}$/.test(phone.replace(/\s/g, ''))) {
      e.phone = 'Enter a valid Nigerian phone number'
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = 'Enter a valid email'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleAdd = () => {
    if (!validate()) return
    if (members.length >= maxMembers) return
    // create a local member object
    const id = `local-${Date.now()}`
    const initials = name
      .split(' ')
      .map(n => n[0] ?? '')
      .join('')
      .toUpperCase()
      .slice(0, 2)
    const member: Member = {
      id,
      name: name.trim(),
      initials,
      phone: phone.trim(),
      email: email || undefined,
      virtualAccount: 'Provisioning',
      payoutPosition: members.length + 1,
      status: 'pending',
      joinedAt: new Date().toISOString(),
    }

    onAddMember(member)
    setName('')
    setPhone('')
    setEmail('')
  }

  return (
    <div className="grid sm:grid-cols-2 gap-6">
      {/* Add member form */}
      <div>
        <h2 className="text-base font-semibold text-text-base mb-4">Add a member</h2>

        <div className="flex flex-col gap-3.5">
          <Input
            label="Full name"
            placeholder="Enter full name…"
            value={name}
            onChange={e => setName(e.target.value)}
            error={errors.name}
          />
          <Input
            label="Phone number"
            type="tel"
            placeholder="08012345678"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            error={errors.phone}
          />
          <Input
            label="Email (optional)"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            error={errors.email}
          />

          <Button
            variant="secondary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={handleAdd}
            loading={false}
            disabled={members.length >= maxMembers}
            className="mt-1"
          >
            Add member
          </Button>
        </div>

        {members.length >= maxMembers && (
          <p className="text-xs text-amber-accent mt-3">
            Circle is full ({maxMembers}/{maxMembers} members).
          </p>
        )}

        {/* Provision note */}
        <div className="flex gap-2.5 p-3 rounded-lg bg-border/30 border border-border mt-4">
          <InfoIcon className="w-3.5 h-3.5 text-text-ghost flex-shrink-0 mt-0.5" />
          <p className="text-xs text-text-ghost leading-relaxed">
            Nomba MX provisioned immediately on save. Member receives SMS with their virtual account number.
          </p>
        </div>
      </div>

      {/* Members list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text-base">Members added</h2>
          <Badge variant="muted">{members.length}/{maxMembers}</Badge>
        </div>

        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed border-border">
            <p className="text-sm text-text-ghost">No members added yet.</p>
            <p className="text-xs text-text-ghost mt-1">Add at least one to continue.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
            {members.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-border">
                <Avatar initials={m.initials} size="sm" index={i} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-base truncate">{m.name}</p>
                  <p className="text-xs text-text-ghost">{m.phone}</p>
                </div>
                <code className="text-[11px] text-green-accent font-mono tracking-wider flex-shrink-0">
                  {m.virtualAccount}
                </code>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
