import { apiGet, apiPost } from './_client'
import type { UnmatchedTransaction, MatchResult } from '../types/sprint2'

interface ReconciliationMatchResponse {
  unmatchedCount: number
  unmatchedTransactions: UnmatchedTransaction[]
}

export async function getUnmatchedTransactions(
  adminId: string,
  circleId: string,
  token: string,
): Promise<UnmatchedTransaction[]> {
  const data = await apiGet<ReconciliationMatchResponse>(
    `/admin/${adminId}/circles/${circleId}/reconciliation/match`,
    token,
  )

  return data.unmatchedTransactions ?? []
}

export async function matchTransaction(
  adminId: string,
  transactionId: string,
  memberId: string,
  token: string,
): Promise<MatchResult> {
  return apiPost<MatchResult>(
    `/admin/${adminId}/reconciliation/match`,
    { transactionId, memberId },
    token,
  )
}
