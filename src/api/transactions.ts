import { USE_MOCK, apiGet, apiPost } from './_client'
import { mock_getUnmatchedTransactions, mock_matchTransaction } from '../mocks/transactions'
import type { UnmatchedTransaction, MatchResult } from '../types/sprint2'

export async function getUnmatchedTransactions(
  circleId: string,
  token: string,
): Promise<UnmatchedTransaction[]> {
  if (USE_MOCK) return mock_getUnmatchedTransactions(circleId)
  return apiGet<UnmatchedTransaction[]>(`/circles/${circleId}/transactions/unmatched`, token)
}

export async function matchTransaction(
  transactionId: string,
  memberId: string,
  circleId: string,
  token: string,
): Promise<MatchResult> {
  if (USE_MOCK) return mock_matchTransaction(transactionId, memberId, circleId)
  return apiPost<MatchResult>(
    `/circles/${circleId}/transactions/${transactionId}/match`,
    { memberId },
    token,
  )
}
