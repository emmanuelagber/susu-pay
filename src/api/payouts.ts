import { USE_MOCK, apiGet, apiPost } from './_client'
import { mock_getPayoutCycleInfo, mock_triggerPayout, mock_getPayoutHistory } from '../mocks/payouts'
import type { PayoutCycleInfo, PayoutHistoryRecord } from '../types/sprint2'

export async function getPayoutCycleInfo(
  circleId: string,
  token: string,
): Promise<PayoutCycleInfo | null> {
  if (USE_MOCK) return mock_getPayoutCycleInfo(circleId)
  return apiGet<PayoutCycleInfo>(`/circles/${circleId}/payout/info`, token)
}

export async function triggerPayout(
  circleId: string,
  token: string,
): Promise<{ status: string; reference: string }> {
  if (USE_MOCK) return mock_triggerPayout(circleId)
  return apiPost<{ status: string; reference: string }>(
    `/circles/${circleId}/payout`,
    {},
    token,
  )
}

export async function getPayoutHistory(
  circleId: string,
  token: string,
): Promise<PayoutHistoryRecord[]> {
  if (USE_MOCK) return mock_getPayoutHistory(circleId)
  return apiGet<PayoutHistoryRecord[]>(`/circles/${circleId}/payout/history`, token)
}
