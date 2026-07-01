import { apiGet } from './_client'
import type { ReconciliationRow } from '../types/sprint2'

interface ReconciliationMatchMember {
  id: string
  name: string
  virtualAccountNumber: string
  status: string
}

interface ReconciliationMatchResponse {
  circleId: string
  circleName: string
  unmatchedCount: number
  unmatchedTransactions: Array<{
    id: string
    fromVirtualAccount: string
    amount: number
    receivedAt: string
    reference: string
    senderName?: string
    possibleMemberId?: string
  }>
  members: ReconciliationMatchMember[]
}

function toStatus(value: string): ReconciliationRow['status'] {
  switch (value?.toLowerCase()) {
    case 'paid':
      return 'paid'
    case 'partial':
      return 'partial'
    case 'overdue':
      return 'overdue'
    default:
      return 'unpaid'
  }
}

function initialsFromName(name: string): string {
  const parts = name.split(' ').filter(Boolean)
  const initials = parts.slice(0, 2).map(part => part[0]?.toUpperCase() ?? '').join('')
  return initials || 'U'
}

export async function getReconciliationBoard(
  adminId: string,
  circleId: string,
  token: string,
): Promise<ReconciliationRow[]> {
  const data = await apiGet<ReconciliationMatchResponse>(
    `/admin/${adminId}/circles/${circleId}/reconciliation/match`,
    token,
  )

  return (data.members ?? []).map((member, index) => ({
    memberId: member.id,
    name: member.name,
    initials: initialsFromName(member.name),
    virtualAccount: member.virtualAccountNumber ?? '',
    expectedAmount: 0,
    receivedAmount: 0,
    lastPaymentDate: null,
    status: toStatus(member.status),
    position: index + 1,
  }))
}
