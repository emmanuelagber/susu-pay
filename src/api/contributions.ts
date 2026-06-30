import { USE_MOCK, apiGet } from './_client'
import { mock_getReconciliationBoard } from '../mocks/contributions'
import type { ReconciliationRow } from '../types/sprint2'

export async function getReconciliationBoard(
  circleId: string,
  token: string,
): Promise<ReconciliationRow[]> {
  if (USE_MOCK) return mock_getReconciliationBoard(circleId)
  return apiGet<ReconciliationRow[]>(`/circles/${circleId}/board`, token)
}
