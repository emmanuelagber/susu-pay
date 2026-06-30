import { mockDelay, shouldSimulateError, MockApiError } from './_helpers'
import type { UnmatchedTransaction, MatchResult } from '../types/sprint2'

const TRANSACTIONS: Record<string, UnmatchedTransaction[]> = {
  c1: [
    {
      id: 'txn001',
      fromVirtualAccount: '9998123456',
      amount: 10000,
      receivedAt: '2026-07-14T09:15:00',
      reference: 'NMB240714001',
      senderName: 'C KALU',
    },
    {
      id: 'txn002',
      fromVirtualAccount: '9920334566',
      amount: 7500,
      receivedAt: '2026-07-12T11:30:00',
      reference: 'NMB240712002',
      senderName: 'UGO EZE',
      possibleMemberId: 'm6',
    },
    {
      id: 'txn003',
      fromVirtualAccount: '0099987654',
      amount: 9800,
      receivedAt: '2026-07-11T14:22:00',
      reference: 'NMB240711003',
      senderName: 'A NWOSU',
    },
    {
      id: 'txn004',
      fromVirtualAccount: '9926334111',
      amount: 10000,
      receivedAt: '2026-07-09T08:45:00',
      reference: 'NMB240709004',
    },
    {
      id: 'txn005',
      fromVirtualAccount: '0000123456',
      amount: 5000,
      receivedAt: '2026-07-08T16:10:00',
      reference: 'NMB240708005',
      senderName: 'RASHEED L',
    },
  ],
  c2: [
    {
      id: 'txn010',
      fromVirtualAccount: '9999887766',
      amount: 25000,
      receivedAt: '2026-07-13T10:00:00',
      reference: 'NMB240713010',
      senderName: 'B FASHOLA',
      possibleMemberId: 'n4',
    },
  ],
}

const _removed: Record<string, Set<string>> = {}

export async function mock_getUnmatchedTransactions(circleId: string): Promise<UnmatchedTransaction[]> {
  await mockDelay()
  if (shouldSimulateError('unmatched_transactions')) {
    throw new MockApiError('Failed to load unmatched transactions.', 503)
  }
  const removed = _removed[circleId] ?? new Set<string>()
  return (TRANSACTIONS[circleId] ?? TRANSACTIONS.c1 ?? []).filter(t => !removed.has(t.id))
}

export async function mock_matchTransaction(
  transactionId: string,
  memberId: string,
  circleId: string,
): Promise<MatchResult> {
  await mockDelay(400, 400)
  if (shouldSimulateError('match_transaction')) {
    throw new MockApiError('Match failed — transaction may have already been processed.', 409)
  }
  if (!_removed[circleId]) _removed[circleId] = new Set()
  _removed[circleId].add(transactionId)
  return {
    matched: true,
    transactionId,
    memberId,
    updatedStatus: 'paid',
  }
}
