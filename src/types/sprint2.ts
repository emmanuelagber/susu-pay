export type ReconciliationStatus = 'paid' | 'partial' | 'overdue' | 'unpaid'
export type PayoutStatus = 'pending' | 'current' | 'completed' | 'failed'
export type NotificationType =
  | 'payment_confirmed'
  | 'payment_received'
  | 'payment_overdue'
  | 'partial_payment'
  | 'member_joined'
  | 'payout_triggered'
  | 'payout_failed'
  | 'payout_completed'
  | 'payout_released'
  | 'match_resolved'
  | 'circle_paused'
  | 'circle_resumed'
  | 'circle_completed'
export type NotificationCategory = 'payment' | 'payout' | 'system'

export interface ReconciliationRow {
  memberId: string
  name: string
  initials: string
  virtualAccount: string
  expectedAmount: number
  receivedAmount: number
  lastPaymentDate: string | null
  status: ReconciliationStatus
  daysOverdue?: number
  position: number
}

export interface UnmatchedTransaction {
  id: string
  virtualAccountNumber: string
  senderAccountNumber: string
  amount: number
  receivedAt: string
  transactionReference: string
  senderName?: string
  possibleMemberId?: string
}

export interface MatchResult {
  matched: boolean
  transactionId: string
  memberId: string
  updatedStatus: ReconciliationStatus
}

export interface PayoutQueueEntry {
  position: number
  memberId: string
  name: string
  initials: string
  virtualAccount: string
  payoutAmount: number
  status: PayoutStatus
  scheduledDate?: string
  paidDate?: string
}

export interface PayoutCycleInfo {
  circleId: string
  circleName: string
  cycleNumber: number
  totalCycles: number
  expectedPayoutAmount: number
  currentRecipient: PayoutQueueEntry | null
  membersCollected: number
  totalMembers: number
  canTrigger: boolean
  blockers: string[]
  queue: PayoutQueueEntry[]
}

export interface PayoutHistoryRecord {
  id: string
  circleName: string
  cycleNumber: number
  recipientName: string
  recipientInitials: string
  amount: number
  status: 'completed' | 'failed' | 'processing'
  processedAt: string
  reference?: string
}

export interface CircleSettingsData {
  id: string
  name: string
  description: string
  contribution: number
  frequency: string
  plan: string
  maxMembers: number
  currentMemberCount: number
  startDate: string
  payoutOrder: string
  status: 'active' | 'paused' | 'pending' | 'completed'
  hasStarted: boolean
  firstContributionReceived: boolean
}

export interface CircleSettingsPatch {
  name?: string
  description?: string
  maxMembers?: number
  startDate?: string
  status?: 'active' | 'paused'
}

export interface NotificationFeedItem {
  id: string
  type: NotificationType
  category: NotificationCategory
  title: string
  body: string
  isRead: boolean
  createdAt: string
  circleName?: string
  meta?: {
    circleId?: string
    circleName?: string
    memberId?: string
    memberName?: string
    amount?: number
    cycle?: number
  }
}

export interface NotificationListResponse {
  unreadCount: number
  total: number
  page: number
  pageSize: number
  items: NotificationFeedItem[]
}
