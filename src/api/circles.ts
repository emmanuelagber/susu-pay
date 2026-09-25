import { apiGet, apiPatch } from './_client'

import type { CircleSettingsData, CircleSettingsPatch } from '../types/sprint2'

// There is no /circles/{id}/settings endpoint: settings are read from GET /circles/{id}
// and saved through PATCH /circles/{circleId} (fields) and PATCH /circles/status (status).

interface CircleDto {
  id: string
  name: string
  description?: string
  plan: number
  contributionAmount: number
  frequency: number
  maxMembers: number
  currentMemberCount: number
  currentCycle: number
  status: number
  payoutOrder: number
  startDate: string
}

const PLANS = ['BAM', 'ADASHI']
const FREQUENCIES = ['Weekly', 'Fortnightly', 'Monthly']
const PAYOUT_ORDERS = ['Sequential', 'Random', 'Bidding']
// Backend CircleStatus is 0-3 with no names in Swagger; 3 = Paused is assumed.
const STATUSES: CircleSettingsData['status'][] = ['pending', 'active', 'completed', 'paused']

function toDateInput(iso: string) {
  return iso ? iso.slice(0, 10) : ''
}

export async function getCircleSettings(
  circleId: string,
  token: string,
): Promise<CircleSettingsData | null> {
  const c = await apiGet<CircleDto>(`/circles/${circleId}`, token)
  const hasStarted = !!c.startDate && new Date(c.startDate) <= new Date()

  return {
    id: c.id,
    name: c.name,
    description: c.description ?? '',
    contribution: c.contributionAmount,
    frequency: FREQUENCIES[c.frequency] ?? String(c.frequency),
    plan: PLANS[c.plan] ?? String(c.plan),
    maxMembers: c.maxMembers,
    currentMemberCount: c.currentMemberCount,
    startDate: toDateInput(c.startDate),
    payoutOrder: PAYOUT_ORDERS[c.payoutOrder] ?? String(c.payoutOrder),
    status: STATUSES[c.status] ?? 'pending',
    hasStarted,
    // Not exposed by the API; treat a started circle as having received contributions.
    firstContributionReceived: hasStarted,
  }
}

export async function updateCircleSettings(
  circleId: string,
  patch: CircleSettingsPatch,
  token: string,
): Promise<void> {
  const current = await apiGet<CircleDto>(`/circles/${circleId}`, token)
  const { status } = patch

  // Nullable fields are sent only when they changed (null = leave as is); re-sending the
  // existing start date is rejected once it's in the past.
  const changed = <T,>(next: T | undefined, prev: T) => (next !== undefined && next !== prev ? next : null)
  const name = changed(patch.name, current.name)
  const description = changed(patch.description, current.description ?? '')
  const maxMembers = changed(patch.maxMembers, current.maxMembers)
  const startDate = changed(patch.startDate && toDateInput(patch.startDate), toDateInput(current.startDate))

  if (name !== null || description !== null || maxMembers !== null || startDate !== null) {
    // The enums aren't nullable in UpdateCircleCommand, so always send the current values
    // to avoid them defaulting to 0.
    await apiPatch<unknown>(`/circles/${circleId}`, {
      circleId,
      name,
      description,
      contributionAmount: null,
      frequency: current.frequency,
      maxMembers,
      payoutOrder: current.payoutOrder,
      startDate: startDate ? `${startDate}T${current.startDate?.slice(11) || '00:00:00Z'}` : null,
    }, token)
  }

  const newStatus = status ? STATUSES.indexOf(status) : -1
  if (newStatus >= 0 && newStatus !== current.status) {
    await apiPatch<unknown>('/circles/status', { circleId, newStatus }, token)
  }
}
