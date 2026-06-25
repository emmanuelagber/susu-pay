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
  phone: string
  email?: string
  virtualAccount: string
  payoutPosition: number
  status: MemberStatus
  amountPaid?: number
  joinedAt: string
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

export interface DashboardStats {
  totalCircles: number
  activeCircles: number
  totalMembers: number
  totalContributions: number
  pendingPayouts: number
  collectionRate: number
}

export interface ChartDataPoint {
  month: string
  expected: number
  actual: number
}
