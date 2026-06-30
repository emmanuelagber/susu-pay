import { mockDelay, shouldSimulateError, MockApiError } from './_helpers'
import type { PayoutCycleInfo, PayoutHistoryRecord } from '../types/sprint2'

const CYCLE_INFO: Record<string, PayoutCycleInfo> = {
  c1: {
    circleId: 'c1',
    circleName: 'Office Ajo — Lagos HQ',
    cycleNumber: 1,
    totalCycles: 12,
    expectedPayoutAmount: 120000,
    membersCollected: 5,
    totalMembers: 12,
    canTrigger: false,
    blockers: ['7 members have not paid yet', 'Payout releases when all 12 contributions are received'],
    currentRecipient: {
      position: 1,
      memberId: 'm1',
      name: 'Chidi Kalu',
      initials: 'CK',
      virtualAccount: '9920011234',
      payoutAmount: 120000,
      status: 'current',
    },
    queue: [
      { position: 1,  memberId: 'm1',  name: 'Chidi Kalu',   initials: 'CK', virtualAccount: '9920011234', payoutAmount: 120000, status: 'current' },
      { position: 2,  memberId: 'm2',  name: 'Ada Okafor',    initials: 'AO', virtualAccount: '9926011235', payoutAmount: 120000, status: 'pending' },
      { position: 3,  memberId: 'm3',  name: 'Bisi Nwusu',    initials: 'BN', virtualAccount: '9926011236', payoutAmount: 120000, status: 'pending' },
      { position: 4,  memberId: 'm4',  name: 'Emeka Mba',     initials: 'EM', virtualAccount: '9920334459', payoutAmount: 120000, status: 'pending' },
      { position: 5,  memberId: 'm5',  name: 'Fatima Kolo',   initials: 'FK', virtualAccount: '9926011260', payoutAmount: 120000, status: 'pending' },
      { position: 6,  memberId: 'm6',  name: 'Ugo Eze',       initials: 'UE', virtualAccount: '9920334566', payoutAmount: 120000, status: 'pending' },
      { position: 7,  memberId: 'm7',  name: 'Ngozi Adeyemi', initials: 'NA', virtualAccount: '9920334567', payoutAmount: 120000, status: 'pending' },
      { position: 8,  memberId: 'm8',  name: 'Tunde Bello',   initials: 'TB', virtualAccount: '9926334568', payoutAmount: 120000, status: 'pending' },
      { position: 9,  memberId: 'm9',  name: 'Kemi Olawale',  initials: 'KO', virtualAccount: '9920334569', payoutAmount: 120000, status: 'pending' },
      { position: 10, memberId: 'm10', name: 'Ade Nwosu',     initials: 'AN', virtualAccount: '9926334570', payoutAmount: 120000, status: 'pending' },
      { position: 11, memberId: 'm11', name: 'Sola Oluwole',  initials: 'SO', virtualAccount: '9920334571', payoutAmount: 120000, status: 'pending' },
      { position: 12, memberId: 'm12', name: 'Rasheed Lawal', initials: 'RL', virtualAccount: '9926334572', payoutAmount: 120000, status: 'pending' },
    ],
  },
  c2: {
    circleId: 'c2',
    circleName: 'Family Savings — Abuja',
    cycleNumber: 3,
    totalCycles: 6,
    expectedPayoutAmount: 150000,
    membersCollected: 5,
    totalMembers: 6,
    canTrigger: false,
    blockers: ['1 member has not paid yet — Bode Fashola'],
    currentRecipient: {
      position: 3,
      memberId: 'n3',
      name: 'Kemi Adewale',
      initials: 'KA',
      virtualAccount: '9920445602',
      payoutAmount: 150000,
      status: 'current',
    },
    queue: [
      { position: 1, memberId: 'n1', name: 'Ngozi Obi',    initials: 'NO', virtualAccount: '9920445600', payoutAmount: 150000, status: 'completed', paidDate: '2026-04-30' },
      { position: 2, memberId: 'n2', name: 'Tunde Obi',    initials: 'TO', virtualAccount: '9926445601', payoutAmount: 150000, status: 'completed', paidDate: '2026-05-31' },
      { position: 3, memberId: 'n3', name: 'Kemi Adewale', initials: 'KA', virtualAccount: '9920445602', payoutAmount: 150000, status: 'current' },
      { position: 4, memberId: 'n4', name: 'Bode Fashola', initials: 'BF', virtualAccount: '9926445603', payoutAmount: 150000, status: 'pending' },
      { position: 5, memberId: 'n5', name: 'Amara Eze',    initials: 'AE', virtualAccount: '9920445604', payoutAmount: 150000, status: 'pending' },
      { position: 6, memberId: 'n6', name: 'Remi Hassan',  initials: 'RH', virtualAccount: '9926445605', payoutAmount: 150000, status: 'pending' },
    ],
  },
}

const HISTORY: PayoutHistoryRecord[] = [
  { id: 'ph1', circleName: 'Family Savings — Abuja',    cycleNumber: 1, recipientName: 'Ngozi Obi',    recipientInitials: 'NO', amount: 150000, status: 'completed',  processedAt: '2026-04-30T15:22:00', reference: 'PAY240430001' },
  { id: 'ph2', circleName: 'Family Savings — Abuja',    cycleNumber: 2, recipientName: 'Tunde Obi',    recipientInitials: 'TO', amount: 150000, status: 'completed',  processedAt: '2026-05-31T14:11:00', reference: 'PAY240531002' },
  { id: 'ph3', circleName: 'Market Women Ajo',          cycleNumber: 1, recipientName: 'Chidi Kalu',   recipientInitials: 'CK', amount: 20000,  status: 'completed',  processedAt: '2026-01-31T10:05:00', reference: 'PAY240131001' },
  { id: 'ph4', circleName: 'Market Women Ajo',          cycleNumber: 2, recipientName: 'Ada Okafor',   recipientInitials: 'AO', amount: 20000,  status: 'completed',  processedAt: '2026-02-14T11:30:00', reference: 'PAY240214001' },
  { id: 'ph5', circleName: 'Market Women Ajo',          cycleNumber: 3, recipientName: 'Bisi Nwusu',   recipientInitials: 'BN', amount: 20000,  status: 'completed',  processedAt: '2026-02-28T09:45:00', reference: 'PAY240228001' },
  { id: 'ph6', circleName: 'Market Women Ajo',          cycleNumber: 4, recipientName: 'Emeka Mba',    recipientInitials: 'EM', amount: 20000,  status: 'failed',     processedAt: '2026-03-14T13:00:00', reference: 'PAY240314001' },
  { id: 'ph7', circleName: 'Market Women Ajo',          cycleNumber: 5, recipientName: 'Fatima Kolo',  recipientInitials: 'FK', amount: 20000,  status: 'completed',  processedAt: '2026-03-31T16:20:00', reference: 'PAY240331001' },
  { id: 'ph8', circleName: 'Family Savings — Abuja',    cycleNumber: 3, recipientName: 'Kemi Adewale', recipientInitials: 'KA', amount: 150000, status: 'processing', processedAt: '2026-06-30T12:00:00' },
]

let _payoutState: 'idle' | 'processing' | 'success' = 'idle'

export async function mock_getPayoutCycleInfo(circleId: string): Promise<PayoutCycleInfo | null> {
  await mockDelay()
  if (shouldSimulateError('payout_cycle')) {
    throw new MockApiError('Failed to load payout information.', 503)
  }
  return CYCLE_INFO[circleId] ?? CYCLE_INFO.c1 ?? null
}

export async function mock_triggerPayout(circleId: string): Promise<{ status: string; reference: string }> {
  await mockDelay(600, 600)
  if (shouldSimulateError('trigger_payout')) {
    throw new MockApiError('Payout failed — please contact support if the issue persists.', 500)
  }
  const info = CYCLE_INFO[circleId]
  if (!info?.canTrigger) {
    throw new MockApiError('Cannot trigger payout: not all members have paid.', 422)
  }
  _payoutState = 'success'
  return { status: 'processing', reference: `PAY${Date.now()}` }
}

export async function mock_getPayoutHistory(circleId: string): Promise<PayoutHistoryRecord[]> {
  await mockDelay(200, 200)
  if (shouldSimulateError('payout_history')) {
    throw new MockApiError('Failed to load payout history.', 503)
  }
  if (circleId) return HISTORY
  return HISTORY
}

export { _payoutState }
