import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCircleSettings, updateCircleSettings } from '../api/circles'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { ArrowLeftIcon, InfoIcon, LockIcon } from '../components/ui/Icons'
import type { CircleSettingsPatch } from '../types/sprint2'

function LockNote({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 mt-1.5">
      <LockIcon className="w-3.5 h-3.5 text-text-ghost flex-shrink-0 mt-0.5" />
      <p className="text-xs text-text-ghost">{text}</p>
    </div>
  )
}

function FieldRow({
  label,
  locked,
  lockReason,
  children,
}: {
  label: string
  locked?: boolean
  lockReason?: string
  children: React.ReactNode
}) {
  return (
    <div className="grid sm:grid-cols-[180px_1fr] gap-2 py-4 border-b border-border last:border-0 items-start">
      <div>
        <p className="text-sm font-medium text-text-base">{label}</p>
        {locked && lockReason && <LockNote text={lockReason} />}
      </div>
      <div>{children}</div>
    </div>
  )
}

export default function CircleSettings() {
  const { circleId = '' } = useParams<{ circleId: string }>()
  const { accessToken } = useAuth()
  const qc = useQueryClient()

  const { data: settings, isLoading, error, refetch } = useQuery({
    queryKey: ['circleSettings', circleId],
    queryFn: () => getCircleSettings(circleId, accessToken!),
    enabled: !!circleId && !!accessToken,
  })

  const [form, setForm] = useState<CircleSettingsPatch>({})
  const [dirty, setDirty] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  useEffect(() => {
    if (settings) {
      setForm({
        name: settings.name,
        description: settings.description,
        maxMembers: settings.maxMembers,
        startDate: settings.startDate,
        status: settings.status === 'paused' ? 'paused' : 'active',
      })
      setDirty(false)
    }
  }, [settings])

  const patch = (key: keyof CircleSettingsPatch, val: string | number) => {
    setForm(f => ({ ...f, [key]: val }))
    setDirty(true)
    setSaveStatus('idle')
  }

  const updateMutation = useMutation({
    mutationFn: (p: CircleSettingsPatch) => updateCircleSettings(circleId, p, accessToken!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['circleSettings', circleId] })
      setDirty(false)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 3000)
    },
    onError: () => {
      setSaveStatus('error')
    },
  })

  if (isLoading) {
    return (
      <div className="p-6 max-w-[720px] mx-auto">
        <p className="text-sm text-text-ghost">Loading settings…</p>
      </div>
    )
  }

  if (error || !settings) {
    return (
      <div className="p-6 max-w-[720px] mx-auto">
        <p className="text-sm text-danger mb-2">Failed to load circle settings.</p>
        <button onClick={() => refetch()} className="text-xs text-blue-accent hover:underline">Retry</button>
      </div>
    )
  }

  const isFinancialLocked = settings.firstContributionReceived
  const isDateLocked      = settings.hasStarted

  return (
    <div className="p-6 max-w-[720px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/overview" className="text-text-ghost hover:text-text-base transition-colors">
          <ArrowLeftIcon className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-text-base">Circle Settings</h1>
          <p className="text-sm text-text-ghost">{settings.name}</p>
        </div>
      </div>

      {/* Basic info */}
      <div className="bg-surface border border-border rounded-xl px-5 mb-5">
        <p className="text-xs font-semibold text-text-ghost uppercase tracking-wider pt-4 pb-2">Basic information</p>
        <FieldRow label="Circle name">
          <input
            value={form.name ?? ''}
            onChange={e => patch('name', e.target.value)}
            className="w-full h-9 bg-surface-alt border border-border rounded-lg text-sm text-text-base px-3 outline-none focus:border-blue-accent"
          />
        </FieldRow>
        <FieldRow label="Description">
          <textarea
            value={form.description ?? ''}
            onChange={e => patch('description', e.target.value)}
            rows={2}
            className="w-full bg-surface-alt border border-border rounded-lg text-sm text-text-base px-3 py-2 outline-none focus:border-blue-accent resize-none"
          />
        </FieldRow>
      </div>

      {/* Financial — locked after first contribution */}
      <div className="bg-surface border border-border rounded-xl px-5 mb-5">
        <div className="flex items-center gap-2 pt-4 pb-2">
          <p className="text-xs font-semibold text-text-ghost uppercase tracking-wider">Financial settings</p>
          {isFinancialLocked && (
            <span className="inline-flex items-center gap-1 text-[11px] text-text-ghost bg-border/30 border border-border px-2 py-0.5 rounded-full">
              <LockIcon className="w-2.5 h-2.5" />
              Locked
            </span>
          )}
        </div>
        <FieldRow
          label="Contribution"
          locked={isFinancialLocked}
          lockReason="Cannot change after the first contribution is received."
        >
          <p className="text-sm text-text-dim h-9 flex items-center">
            ₦{settings.contribution.toLocaleString('en-NG')}
          </p>
        </FieldRow>
        <FieldRow
          label="Frequency"
          locked={isFinancialLocked}
          lockReason="Locked for the life of the circle."
        >
          <p className="text-sm text-text-dim h-9 flex items-center">{settings.frequency}</p>
        </FieldRow>
        <FieldRow
          label="Plan"
          locked={isFinancialLocked}
          lockReason="Cannot change the savings plan after creation."
        >
          <div className="h-9 flex items-center">
            <Badge variant={settings.plan === 'ADASHI' ? 'blue' : 'muted'}>{settings.plan}</Badge>
          </div>
        </FieldRow>
        <FieldRow
          label="Payout order"
          locked={isFinancialLocked}
          lockReason="Locked after the first cycle begins."
        >
          <p className="text-sm text-text-dim h-9 flex items-center">{settings.payoutOrder}</p>
        </FieldRow>
      </div>

      {/* Membership */}
      <div className="bg-surface border border-border rounded-xl px-5 mb-5">
        <p className="text-xs font-semibold text-text-ghost uppercase tracking-wider pt-4 pb-2">Membership</p>
        <FieldRow label="Max members">
          <div>
            <input
              type="number"
              min={settings.currentMemberCount}
              max={50}
              value={form.maxMembers ?? settings.maxMembers}
              onChange={e => patch('maxMembers', Number(e.target.value))}
              className="w-28 h-9 bg-surface-alt border border-border rounded-lg text-sm text-text-base px-3 outline-none focus:border-blue-accent"
            />
            <p className="text-xs text-text-ghost mt-1.5">
              Currently {settings.currentMemberCount} member{settings.currentMemberCount !== 1 ? 's' : ''} · Cannot reduce below current count.
            </p>
          </div>
        </FieldRow>
        <FieldRow
          label="Start date"
          locked={isDateLocked}
          lockReason="Cannot change start date once the first cycle has begun."
        >
          {isDateLocked ? (
            <p className="text-sm text-text-dim h-9 flex items-center">{settings.startDate}</p>
          ) : (
            <input
              type="date"
              value={form.startDate ?? settings.startDate}
              onChange={e => patch('startDate', e.target.value)}
              className="h-9 bg-surface-alt border border-border rounded-lg text-sm text-text-base px-3 outline-none focus:border-blue-accent"
            />
          )}
        </FieldRow>
      </div>

      {/* Status */}
      <div className="bg-surface border border-border rounded-xl px-5 mb-6">
        <p className="text-xs font-semibold text-text-ghost uppercase tracking-wider pt-4 pb-2">Circle status</p>
        <div className="py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={[
                  'w-2 h-2 rounded-full',
                  settings.status === 'active' ? 'bg-green-accent' : 'bg-amber-accent',
                ].join(' ')} />
                <p className="text-sm font-medium text-text-base capitalize">{settings.status}</p>
              </div>
              {form.status === 'paused' && form.status !== settings.status && (
                <div className="flex items-start gap-1.5 mt-2">
                  <InfoIcon className="w-3.5 h-3.5 text-amber-accent flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-accent">
                    Pausing will suspend all automatic payment tracking until resumed.
                  </p>
                </div>
              )}
            </div>
            {settings.status !== 'completed' && (
              <Button
                variant={form.status === 'paused' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => patch('status', form.status === 'active' ? 'paused' : 'active')}
              >
                {form.status === 'active' ? 'Pause circle' : 'Resume circle'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Save bar */}
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          disabled={!dirty || updateMutation.isPending}
          loading={updateMutation.isPending}
          onClick={() => updateMutation.mutate(form)}
        >
          Save changes
        </Button>
        {saveStatus === 'saved' && (
          <span className="text-xs text-green-accent flex items-center gap-1">
            <CheckIcon className="w-3.5 h-3.5" />
            Saved
          </span>
        )}
        {saveStatus === 'error' && (
          <span className="text-xs text-danger">
            {updateMutation.error instanceof Error ? updateMutation.error.message : 'Save failed.'}
          </span>
        )}
        {dirty && (
          <button
            onClick={() => {
              if (settings) {
                setForm({
                  name: settings.name,
                  description: settings.description,
                  maxMembers: settings.maxMembers,
                  startDate: settings.startDate,
                  status: settings.status === 'paused' ? 'paused' : 'active',
                })
                setDirty(false)
              }
            }}
            className="text-xs text-text-ghost hover:text-text-base transition-colors"
          >
            Discard
          </button>
        )}
      </div>
    </div>
  )
}
