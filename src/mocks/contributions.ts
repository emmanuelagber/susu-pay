import { mockDelay, shouldSimulateError, MockApiError } from './_helpers'
import type { ReconciliationRow } from '../types/sprint2'

const BOARD: Record<string, ReconciliationRow[]> = {
  c1: [
    { memberId: 'm1',  name: 'Chidi Kalu',      initials: 'CK', virtualAccount: '9920011234', expectedAmount: 10000, receivedAmount: 10000, lastPaymentDate: '2026-07-15', status: 'paid',    position: 1 },
    { memberId: 'm2',  name: 'Ada Okafor',       initials: 'AO', virtualAccount: '9926011235', expectedAmount: 10000, receivedAmount: 10000, lastPaymentDate: '2026-07-14', status: 'paid',    position: 2 },
    { memberId: 'm3',  name: 'Bisi Nwusu',       initials: 'BN', virtualAccount: '9926011236', expectedAmount: 10000, receivedAmount: 0,     lastPaymentDate: null,         status: 'unpaid',  position: 3 },
    { memberId: 'm4',  name: 'Emeka Mba',        initials: 'EM', virtualAccount: '9920334459', expectedAmount: 10000, receivedAmount: 0,     lastPaymentDate: '2026-07-08', status: 'overdue', position: 4, daysOverdue: 5 },
    { memberId: 'm5',  name: 'Fatima Kolo',      initials: 'FK', virtualAccount: '9926011260', expectedAmount: 10000, receivedAmount: 0,     lastPaymentDate: null,         status: 'unpaid',  position: 5 },
    { memberId: 'm6',  name: 'Ugo Eze',          initials: 'UE', virtualAccount: '9920334566', expectedAmount: 10000, receivedAmount: 7500,  lastPaymentDate: '2026-07-12', status: 'partial', position: 6 },
    { memberId: 'm7',  name: 'Ngozi Adeyemi',    initials: 'NA', virtualAccount: '9920334567', expectedAmount: 10000, receivedAmount: 10000, lastPaymentDate: '2026-07-16', status: 'paid',    position: 7 },
    { memberId: 'm8',  name: 'Tunde Bello',      initials: 'TB', virtualAccount: '9926334568', expectedAmount: 10000, receivedAmount: 10000, lastPaymentDate: '2026-07-15', status: 'paid',    position: 8 },
    { memberId: 'm9',  name: 'Kemi Olawale',     initials: 'KO', virtualAccount: '9920334569', expectedAmount: 10000, receivedAmount: 0,     lastPaymentDate: null,         status: 'unpaid',  position: 9 },
    { memberId: 'm10', name: 'Ade Nwosu',        initials: 'AN', virtualAccount: '9926334570', expectedAmount: 10000, receivedAmount: 0,     lastPaymentDate: '2026-07-10', status: 'overdue', position: 10, daysOverdue: 3 },
    { memberId: 'm11', name: 'Sola Oluwole',     initials: 'SO', virtualAccount: '9920334571', expectedAmount: 10000, receivedAmount: 10000, lastPaymentDate: '2026-07-16', status: 'paid',    position: 11 },
    { memberId: 'm12', name: 'Rasheed Lawal',    initials: 'RL', virtualAccount: '9926334572', expectedAmount: 10000, receivedAmount: 0,     lastPaymentDate: null,         status: 'unpaid',  position: 12 },
  ],
  c2: [
    { memberId: 'n1', name: 'Ngozi Obi',    initials: 'NO', virtualAccount: '9920445600', expectedAmount: 25000, receivedAmount: 25000, lastPaymentDate: '2026-07-14', status: 'paid',   position: 1 },
    { memberId: 'n2', name: 'Tunde Obi',    initials: 'TO', virtualAccount: '9926445601', expectedAmount: 25000, receivedAmount: 25000, lastPaymentDate: '2026-07-13', status: 'paid',   position: 2 },
    { memberId: 'n3', name: 'Kemi Adewale', initials: 'KA', virtualAccount: '9920445602', expectedAmount: 25000, receivedAmount: 25000, lastPaymentDate: '2026-07-15', status: 'paid',   position: 3 },
    { memberId: 'n4', name: 'Bode Fashola', initials: 'BF', virtualAccount: '9926445603', expectedAmount: 25000, receivedAmount: 0,     lastPaymentDate: null,         status: 'unpaid', position: 4 },
    { memberId: 'n5', name: 'Amara Eze',    initials: 'AE', virtualAccount: '9920445604', expectedAmount: 25000, receivedAmount: 25000, lastPaymentDate: '2026-07-12', status: 'paid',   position: 5 },
    { memberId: 'n6', name: 'Remi Hassan',  initials: 'RH', virtualAccount: '9926445605', expectedAmount: 25000, receivedAmount: 18000, lastPaymentDate: '2026-07-11', status: 'partial', position: 6 },
  ],
}

export async function mock_getReconciliationBoard(circleId: string): Promise<ReconciliationRow[]> {
  await mockDelay()
  if (shouldSimulateError('reconciliation_board')) {
    throw new MockApiError('Failed to load reconciliation board. Please try again.', 503)
  }
  return BOARD[circleId] ?? BOARD.c1 ?? []
}
