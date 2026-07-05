import { apiGet, apiPost } from './_client'
import type { PayoutCycleInfo, PayoutHistoryRecord, PayoutQueueEntry } from '../types/sprint2'

interface PayoutBoardResponse {
  circleId: string
  circleName: string
  plan: string
  currentCycle: number
  totalCycles: number
  expectedPayout: number
  currentPayout: {
    memberId: string
    memberName: string
    payoutPosition: number
    virtualAccountNumber: string
    expectedPayout: number
    paidCount: number
    totalMembers: number
    collected: number
    expectedTotal: number
    isReadyToRelease: boolean
    alreadyPaid: boolean
    gatingMessage?: string
  }
  payoutOrder: Array<{
    position: number
    memberId: string
    memberName: string
    virtualAccountNumber: string
    amount: number
    state: string
  }>
  history: Array<Record<string, unknown>>
}

interface MemberPayoutResponse {
  memberId: string
  myPosition: number
  myStatus: string
  expectedPayout: number
  circlePaidCount: number
  circleTotalMembers: number
  circleCollectionRatePercent: number
  payoutQueue: Array<{
    position: number
    memberId: string
    memberName: string
    isRequestingMember: boolean
    status: string
    amount: number
  }>
  history: Array<Record<string, unknown>>
}

function initialsFromName(name: string): string {
  const parts = name.split(' ').filter(Boolean)
  const initials = parts.slice(0, 2).map(part => part[0]?.toUpperCase() ?? '').join('')
  return initials || 'U'
}

function toQueueStatus(state: string): PayoutQueueEntry['status'] {
  const normalized = state?.toLowerCase()
  if (normalized === 'current') return 'current'
  if (normalized === 'completed') return 'completed'
  if (normalized === 'failed') return 'failed'
  return 'pending'
}

function toHistoryRecord(item: Record<string, unknown>): PayoutHistoryRecord {
  const recipientName = (item.recipientName as string) ?? (item.memberName as string) ?? 'Unknown'
  const amount = Number(item.amount ?? item.expectedPayout ?? 0)
  const statusValue = String(item.status ?? item.state ?? 'completed').toLowerCase()

  return {
    id: String(item.id ?? item.memberId ?? `${recipientName}-${amount}`),
    circleName: String(item.circleName ?? ''),
    cycleNumber: Number(item.cycleNumber ?? 1),
    recipientName,
    recipientInitials: initialsFromName(recipientName),
    amount,
    status: statusValue === 'completed' || statusValue === 'processing' || statusValue === 'failed'
      ? (statusValue as PayoutHistoryRecord['status'])
      : 'completed',
    processedAt: String(item.processedAt ?? item.paidDate ?? item.createdAt ?? new Date().toISOString()),
    reference: item.reference as string | undefined,
  }
}

export async function getPayoutCycleInfo(
  circleId: string,
  token: string,
): Promise<PayoutCycleInfo | null> {
  const data = await apiGet<PayoutBoardResponse>(`/circles/${circleId}/payout-board`, token)

  return {
    circleId: data.circleId,
    circleName: data.circleName,
    cycleNumber: data.currentCycle,
    totalCycles: data.totalCycles,
    expectedPayoutAmount: data.expectedPayout,
    currentRecipient: data.currentPayout
      ? {
          position: data.currentPayout.payoutPosition,
          memberId: data.currentPayout.memberId,
          name: data.currentPayout.memberName,
          initials: initialsFromName(data.currentPayout.memberName),
          virtualAccount: data.currentPayout.virtualAccountNumber,
          payoutAmount: data.currentPayout.expectedPayout,
          status: 'current',
        }
      : null,
    membersCollected: data.currentPayout?.paidCount ?? 0,
    totalMembers: data.currentPayout?.totalMembers ?? data.payoutOrder.length,
    canTrigger: data.currentPayout?.isReadyToRelease ?? false,
    blockers: data.currentPayout?.gatingMessage ? [data.currentPayout.gatingMessage] : [],
    queue: (data.payoutOrder ?? []).map(entry => ({
      position: entry.position,
      memberId: entry.memberId,
      name: entry.memberName,
      initials: initialsFromName(entry.memberName),
      virtualAccount: entry.virtualAccountNumber,
      payoutAmount: entry.amount,
      status: toQueueStatus(entry.state),
    })),
  }
}

interface MemberPayoutResponse {
  memberId: string
  myPosition: number
  myStatus: string
  expectedPayout: number
  circlePaidCount: number
  circleTotalMembers: number
  circleCollectionRatePercent: number
  payoutQueue: Array<{
    position: number
    memberId: string
    memberName: string
    isRequestingMember: boolean
    status: string
    amount: number
  }>
  history: Array<Record<string, unknown>>
}

export async function getMemberPayoutInfo(
  memberId: string,
  token: string,
): Promise<PayoutCycleInfo | null> {
  const data = await apiGet<MemberPayoutResponse>(`/members/${memberId}/payout`, token)

  const myEntry = data.payoutQueue.find(q => q.isRequestingMember)

  return {
    expectedPayoutAmount: data.expectedPayout,
    currentRecipient: myEntry
      ? {
        position: myEntry.position,
        memberId: myEntry.memberId,
        name: myEntry.memberName,
        initials: initialsFromName(myEntry.memberName),
        virtualAccount: '',
        payoutAmount: myEntry.amount,
        status: toQueueStatus(myEntry.status),
      }
      : null,
    membersCollected: data.circlePaidCount,
    totalMembers: data.circleTotalMembers,
    blockers: [],
    queue: (data.payoutQueue ?? []).map(entry => ({
      position: entry.position,
      memberId: entry.memberId,
      name: entry.memberName,
      initials: initialsFromName(entry.memberName),
      virtualAccount: '',
      payoutAmount: entry.amount,
      status: toQueueStatus(entry.status),
    })),
  }
}

export async function triggerPayout(
  circleId: string,
  token: string,
): Promise<{ status: string; reference: string }> {
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
  const data = await apiGet<PayoutBoardResponse>(`/circles/${circleId}/payout-board`, token)
  return (data.history ?? []).map(item => toHistoryRecord(item as Record<string, unknown>))
}
