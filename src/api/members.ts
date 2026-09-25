import { apiGet, apiPost } from './_client'
import type { MemberCircle } from '../types/sprint2'

export async function getMemberCircle(memberId: string, token: string): Promise<MemberCircle> {
  return apiGet<MemberCircle>(`/members/${memberId}/circle`, token)
}

/**
 * Dev-only: pretends the member paid `amount` into their virtual account.
 * The call returns 200 even when nothing was recorded, so check `processed`.
 */
export async function simulateWebhook(
  body: { memberId: string; amount: number },
  token: string,
): Promise<{ processed: boolean; message?: string }> {
  return apiPost<{ processed: boolean; message?: string }>('/dev/simulate-webhook', body, token)
}
