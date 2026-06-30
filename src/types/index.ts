export type Plan = 'BAM' | 'ADASHI'
export type Frequency = 'Monthly' | 'Fortnightly' | 'Weekly'
export type PayoutOrder = 'Sequential' | 'Random' | 'Bidding'
export type CircleStatus = 'active' | 'pending' | 'completed'
export type MemberStatus = 'paid' | 'pending' | 'overdue'
export type UserRole = 'admin' | 'member'

export interface Member {
  id: string
  name: string
  initials: string
  phone?: string
  email?: string
  virtualAccount?: string
  payoutPosition?: number
  status?: MemberStatus
  amountPaid?: number
  joinedAt?: string
  circleId?: string
  circleName?: string
}

export interface AdminMember extends Member {}

export interface ContributionRecord {
  id: string
  amount?: number
  status?: string
  cycle?: number
  dueDate?: string
  paidAt?: string
  createdAt?: string
}

export interface NotificationItem {
  id: string
  title?: string
  body?: string
  isRead?: boolean
  createdAt?: string
}

export interface PayoutRecord {
  id: string
  amount?: number
  status?: string
  createdAt?: string
  recipient?: string
}

export interface Circle {
  id: string
  name: string
  plan: Plan
  cycle: number
  totalCycles: number
  contribution: number
  frequency: Frequency
  members: Member[]
  maxMembers: number
  startDate: string
  payoutOrder: PayoutOrder
  description?: string
  status: CircleStatus
  createdAt: string
}

export interface AuthUser {
  id: string
  name: string
  initials: string
  email: string
  role: UserRole
  circleId?: string
  memberId?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

export interface CreateCircleFormData {
  plan: Plan | null
  name: string
  contribution: number | ''
  frequency: Frequency
  maxMembers: number | ''
  startDate: string
  payoutOrder: PayoutOrder
  description: string
}

export interface OverviewCircle {
  id: string
  name: string
  plan: string
  cycleInfo: string
  memberCount: number
  maxMembers: number
  contributionAmount: number
  frequency: string
  collectionRatePercent: number
  status: string
}

export interface DashboardStats {
  totalCircles: number
  activeCircles: number
  totalMembers: number
  totalContributions: number
  pendingPayouts: number
  collectionRate: number
  chartData: ChartDataPoint[]
  activeCirclesList: OverviewCircle[]
}

export interface ChartDataPoint {
  month: string
  expected: number
  actual: number
}

export interface CircleBreakdown {
  circleId: string
  name: string
  plan: string
  cycleInfo: string
  collected: number
  expected: number
  ratePercent: number
}

export interface ReportsData {
  totalCollected: number
  totalExpected: number
  overallRatePercent: number
  activeCirclesCount: number
  chartData: ChartDataPoint[]
  circleBreakdowns: CircleBreakdown[]
}
