import { mockDelay, shouldSimulateError, MockApiError } from './_helpers'
import type { CircleSettingsData, CircleSettingsPatch } from '../types/sprint2'

const SETTINGS: Record<string, CircleSettingsData> = {
  c1: {
    id: 'c1',
    name: 'Office Ajo — Lagos HQ',
    description: 'Monthly savings group for the Lagos office team.',
    contribution: 10000,
    frequency: 'Monthly',
    plan: 'BAM',
    maxMembers: 12,
    currentMemberCount: 12,
    startDate: '2026-08-01',
    payoutOrder: 'Sequential',
    status: 'active',
    hasStarted: false,
    firstContributionReceived: true,
  },
  c2: {
    id: 'c2',
    name: 'Family Savings — Abuja',
    description: 'Family rotating savings, bi-monthly payout.',
    contribution: 25000,
    frequency: 'Monthly',
    plan: 'ADASHI',
    maxMembers: 6,
    currentMemberCount: 6,
    startDate: '2026-04-01',
    payoutOrder: 'Sequential',
    status: 'active',
    hasStarted: true,
    firstContributionReceived: true,
  },
}

const _overrides: Record<string, Partial<CircleSettingsData>> = {}

export async function mock_getCircleSettings(circleId: string): Promise<CircleSettingsData | null> {
  await mockDelay()
  if (shouldSimulateError('circle_settings')) {
    throw new MockApiError('Failed to load circle settings.', 503)
  }
  const base = SETTINGS[circleId] ?? SETTINGS.c1
  if (!base) return null
  return { ...base, ...(_overrides[circleId] ?? {}) }
}

export async function mock_updateCircleSettings(
  circleId: string,
  patch: CircleSettingsPatch,
): Promise<CircleSettingsData> {
  await mockDelay(400, 300)
  if (shouldSimulateError('update_circle')) {
    throw new MockApiError('Failed to save changes. Please try again.', 500)
  }
  const base = SETTINGS[circleId] ?? SETTINGS.c1
  if (!base) throw new MockApiError('Circle not found.', 404)
  _overrides[circleId] = { ...(_overrides[circleId] ?? {}), ...patch }
  return { ...base, ...(_overrides[circleId] ?? {}) }
}
