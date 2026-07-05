import type {
  Circle,
  Member,
  AdminMember,
  MemberStatus,
  ContributionsSummary,
  NotificationItem,
  PayoutRecord,
  AuthResponse,
  AuthUser,
  AuthTokens,
  DashboardStats,
  ReportsData,
  CreateCircleFormData,
  Plan,
  Frequency,
  PayoutOrder,
  CircleStatus,
} from '../types'
import { createApiError, reportGlobalError } from './errors'

const API_BASE_URL = import.meta.env.VITE_API_URL

async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
      ...options,
    })
  } catch (error) {
    reportGlobalError(error, 'Network request failed.')
    throw error
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const error = createApiError(body, response.status, response.statusText)
    reportGlobalError(error)
    throw error
  }

  return response.json() as Promise<T>
}

function generateInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export async function apiRegister(data: {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}): Promise<AuthResponse> {
  const response = await apiRequest<{
    success: boolean
    data: {
      accessToken: string
      refreshToken: string
      admin: {
        id: string
        name: string
        email: string
        phone: string
      }
    }
    message: string
    errors: null | Record<string, string>
  }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  return {
    user: {
      id: response.data.admin.id,
      name: response.data.admin.name,
      initials: generateInitials(response.data.admin.name),
      email: response.data.admin.email,
      role: 'admin',
    },
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
  }
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  const response = await apiRequest<{
    success: boolean
    data: {
      accessToken: string
      refreshToken: string
      admin?: {
        id: string
        name: string
        email: string
        phone: string
      }
      member?: {
        id: string
        name: string
        email: string
        phone: string
      }
    }
    message: string
    errors: null | Record<string, string>
  }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  const userData = response.data.admin || response.data.member
  if (!userData) throw new Error('No user data in response')

  return {
    user: {
      id: userData.id,
      name: userData.name,
      initials: generateInitials(userData.name),
      email: userData.email,
      role: response.data.admin ? 'admin' : 'member',
    },
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
  }
}

export async function apiRefreshToken(accessToken: string, refreshToken: string): Promise<AuthTokens> {
  return apiRequest<AuthTokens>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ accessToken, refreshToken }),
  })
}

export async function apiGetOverview(adminId: string, token: string): Promise<DashboardStats> {
  const response = await apiRequest<{
    success: boolean
    data: any
  }>(`/admin/${adminId}/overview`, {}, token)

  const data = response.data
  return {
    totalCircles: data.activeCirclesCount ?? 0,
    activeCircles: data.activeCirclesCount ?? 0,
    totalMembers: data.totalMembers ?? 0,
    totalContributions: data.totalCollected ?? 0,
    pendingPayouts: 0,
    collectionRate: data.collectionRatePercent ?? 0,
    chartData: (data.contributionTrends ?? []).map((t: { month: string; expected: number; actual: number }) => ({
      month: t.month,
      expected: t.expected,
      actual: t.actual,
    })),
    activeCirclesList: data.activeCircles ?? [],
  }
}

export async function apiGetReports(adminId: string, token: string): Promise<ReportsData> {
  const response = await apiRequest<{
    success: boolean
    data: {
      totalCollected: number
      totalExpected: number
      overallRatePercent: number
      activeCirclesCount: number
      monthlyCollections: Array<{ month: string; monthNumber: number; collected: number; expected: number }>
      circleBreakdowns: Array<{
        circleId: string
        name: string
        plan: string
        cycleInfo: string
        collected: number
        expected: number
        ratePercent: number
      }>
    }
  }>(`/admin/${adminId}/reports`, {}, token)

  const d = response.data
  return {
    totalCollected: d.totalCollected,
    totalExpected: d.totalExpected,
    overallRatePercent: d.overallRatePercent,
    activeCirclesCount: d.activeCirclesCount,
    chartData: d.monthlyCollections.map(mc => ({
      month: mc.month,
      expected: mc.expected,
      actual: mc.collected,
    })),
    circleBreakdowns: d.circleBreakdowns.map(b => ({
      circleId: b.circleId,
      name: b.name,
      plan: b.plan,
      cycleInfo: b.cycleInfo,
      collected: b.collected,
      expected: b.expected,
      ratePercent: b.ratePercent,
    })),
  }
}

export async function apiExportReports(adminId: string, token: string, circleId?: string): Promise<void> {
  const params = new URLSearchParams()
  if (circleId) params.set('circleId', circleId)
  const query = params.toString() ? `?${params.toString()}` : ''
  const response = await fetch(`${API_BASE_URL}/admin/${adminId}/reports/export${query}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const error = createApiError(body, response.status, response.statusText || 'Export failed')
    reportGlobalError(error, 'Export failed')
    throw error
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `reports-${adminId}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export async function apiGetAdminMembers(
  adminId: string,
  token: string,
  search?: string,
  circleId?: string,
  status?: string,
  page = 1,
  pageSize = 50,
): Promise<AdminMember[]> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  if (search) params.set('search', search)
  if (circleId) params.set('circleId', circleId)
  if (status) params.set('status', status)

  const response = await apiRequest<{
    success: boolean
    data: {
      items: Array<{
        memberId: string
        name: string
        phone: string
        virtualAccountNumber: string | null
        payoutPosition: number
        status: string
        paidAmount: number
        expectedAmount: number
        circleId: string
        circleName: string
        circlePlan: string
        currentCycle: number
      }>
      total: number
      page: number
      pageSize: number
    }
  }>(`/admin/${adminId}/members?${params.toString()}`, {}, token)

  return response.data.items.map(item => ({
    id: item.memberId,
    name: item.name,
    initials: item.name
      .split(' ')
      .map(n => n[0] ?? '')
      .join('')
      .toUpperCase()
      .slice(0, 2),
    phone: item.phone,
    virtualAccount: item.virtualAccountNumber ?? undefined,
    payoutPosition: item.payoutPosition,
    status: item.status.toLowerCase() as MemberStatus,
    amountPaid: item.paidAmount,
    joinedAt: undefined,
    circleId: item.circleId,
    circleName: item.circleName,
  }))
}

export async function apiGetCircles(adminId: string, token: string, page = 1, pageSize = 20): Promise<Circle[]> {
  const q = new URLSearchParams({ adminId, page: String(page), pageSize: String(pageSize) })
  const response = await apiRequest<{
    success: boolean
    data: Circle[]
  }>(`/circles?${q.toString()}`, {}, token)

  return response.data
}

function planFromApi(value: number | string | null): Plan {
  return value === 1 || String(value) === '1' ? 'ADASHI' : 'BAM'
}

function frequencyFromApi(value: number | string | null): Frequency {
  switch (Number(value)) {
    case 0:
      return 'Weekly'
    case 1:
      return 'Fortnightly'
    default:
      return 'Monthly'
  }
}

function payoutOrderFromApi(value: number | string | null): PayoutOrder {
  switch (Number(value)) {
    case 1:
      return 'Random'
    case 2:
      return 'Bidding'
    default:
      return 'Sequential'
  }
}

function circleStatusFromApi(value: number | string | null): CircleStatus {
  switch (Number(value)) {
    case 1:
      return 'active'
    case 2:
      return 'completed'
    default:
      return 'pending'
  }
}

function memberStatusFromApi(value: number | string | null): MemberStatus | undefined {
  switch (Number(value)) {
    case 2:
      return 'paid'
    case 1:
      return 'overdue'
    default:
      return 'pending'
  }
}



export async function apiGetCircle(id: string, token: string): Promise<Circle | null> {
  try {
    const response = await apiRequest<{
      success: boolean
      data: {
        id: string
        name: string
        description?: string
        plan: number
        contributionAmount: number
        frequency: number
        maxMembers: number
        currentMemberCount: number
        currentCycle: number
        status: number
        payoutOrder: number
        startDate: string
        nextContributionDate?: string
        adminName?: string
      }
    }>(`/circles/${id}`, {}, token)

    const circle = response.data
    return {
      id: circle.id,
      name: circle.name,
      description: circle.description,
      plan: planFromApi(circle.plan),
      contribution: circle.contributionAmount,
      frequency: frequencyFromApi(circle.frequency),
      members: [],
      maxMembers: circle.maxMembers,
      cycle: circle.currentCycle,
      totalCycles: circle.currentCycle,
      startDate: circle.startDate,
      payoutOrder: payoutOrderFromApi(circle.payoutOrder),
      status: circleStatusFromApi(circle.status),
      createdAt: circle.startDate,
    }
  } catch {
    return null
  }
}
  export async function apiUpdateCircleStatus(circleId: string, newStatus: number, token: string) {
    const response = await apiRequest<{ success: boolean; data: any }>('/circles/status', {
      method: 'PATCH',
      body: JSON.stringify({ circleId, newStatus }),
    }, token)

    return response.data
  }

function planToEnum(plan: string | null) {
  switch (plan) {
    case 'ADASHI': return 1
    case 'BAM': return 0
    default: return 0
  }
}

function frequencyToEnum(freq: string) {
  switch (freq) {
    case 'Weekly': return 0
    case 'Fortnightly': return 1
    case 'Monthly': return 2
    default:
      return 2 
  }
}

function payoutOrderToEnum(order: string) {
  switch (order) {
    case 'Random': return 1
    case 'Bidding': return 2
    case 'Sequential':
    default:
      return 0
  }
}

export async function apiCreateCircle(data: CreateCircleFormData, adminId: string, token: string): Promise<Circle> {
  const payload = {
    adminId,
    name: data.name,
    description: data.description || '',
    plan: planToEnum(String(data.plan)),
    contributionAmount: Number(data.contribution || 0),
    frequency: frequencyToEnum(String(data.frequency)),
    maxMembers: Number(data.maxMembers || 0),
    payoutOrder: payoutOrderToEnum(String(data.payoutOrder)),
    startDate: data.startDate ? `${data.startDate}T00:00:00.000Z` : '',
  }

  const response = await apiRequest<{
    success: boolean
    data: Circle
  }>('/circles', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token)

  return response.data
}

export async function apiGetCircleMembers(circleId: string, token: string): Promise<Member[]> {
  const response = await apiRequest<{
    success: boolean
    data: Member[]
  }>(`/circles/${circleId}/members`, {}, token)

  return response.data
}

export async function apiGetMember(id: string, token: string): Promise<Member | null> {
  try {
    const response = await apiRequest<{
      success: boolean
      data: {
        id: string
        circleId: string
        name: string
        phone: string
        email: string
        payoutPosition: number
        virtualAccountNumber: string
        bankName?: string
        status: number
        creditScore?: number
        creditTier?: string
        consecutiveOnTimeStreak?: number
        joinedAt: string
      }
    }>(`/members/${id}`, {}, token)

    const member = response.data
    return {
      id: member.id,
      name: member.name,
      initials: generateInitials(member.name),
      phone: member.phone,
      email: member.email,
      virtualAccount: member.virtualAccountNumber ?? undefined,
      payoutPosition: member.payoutPosition,
      status: memberStatusFromApi(member.status),
      joinedAt: member.joinedAt,
      circleId: member.circleId,
      circleName: undefined,
    }
  } catch {
    return null
  }
}

export async function apiGetMemberPassport(id: string, token: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/members/${id}/passport`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const error = createApiError(body, response.status, response.statusText || 'Passport request failed')
    reportGlobalError(error, 'Passport request failed')
    throw error
  }

  return response.text()
}


export async function apiGetMemberContributions(memberId: string, token: string): Promise<ContributionsSummary> {
  const response = await apiRequest<{
    success: boolean
    data: {
      memberId: string
      circleName: string
      totalPayments: number
      onTimeCount: number
      resolvedCycleCount: number
      onTimeRatePercent: number
      totalContributed: number
      circlePaidCount: number
      circleTotalMembers: number
      circleCollectionRatePercent: number
      history: Array<{
        cycleNumber: number
        datePaid: string | null
        dueDate: string
        status: string
        amount: number
      }>
    }
  }>(`/members/${memberId}/contributions/summary`, {}, token)

  const data = response.data

  return {
    memberId: data.memberId,
    circleName: data.circleName,
    totalPayments: data.totalPayments,
    onTimeCount: data.onTimeCount,
    resolvedCycleCount: data.resolvedCycleCount,
    onTimeRatePercent: data.onTimeRatePercent,
    totalContributed: data.totalContributed,
    circlePaidCount: data.circlePaidCount,
    circleTotalMembers: data.circleTotalMembers,
    circleCollectionRatePercent: data.circleCollectionRatePercent,
    history: data.history.map(item => ({
      id: `cycle-${item.cycleNumber}`,
      cycle: item.cycleNumber,
      amount: item.amount,
      status: item.status,
      dueDate: item.dueDate,
      paidAt: item.datePaid ?? undefined,
    })),
  }
}

export async function apiGetMemberNotifications(memberId: string, token: string, page = 1, pageSize = 20): Promise<NotificationItem[]> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  const response = await apiRequest<{
    success: boolean
    data: {
      items: NotificationItem[]
      total?: number
      page?: number
      pageSize?: number
    }
  }>(`/members/${memberId}/notification-center?${params.toString()}`, {}, token)

  return Array.isArray(response.data) ? response.data : response.data.items ?? []
}

export async function apiMarkMemberNotificationsRead(memberId: string, token: string, notificationId: string): Promise<boolean> {
  const response = await apiRequest<{ success: boolean; data: boolean }>(`/members/${memberId}/notification-center/${notificationId}/read`, {
    method: 'PATCH',
  }, token)

  return response.data
}

export async function apiMarkNotificationRead(
  userId: string,
  role: 'admin' | 'member',
  notificationId: string,
  token: string,
): Promise<boolean> {
  const basePath = role === 'member' ? `/members/${userId}` : `/admin/${userId}`
  const response = await apiRequest<{ success: boolean; data: boolean }>(`${basePath}/notifications/${notificationId}/read`, {
    method: 'PATCH',
  }, token)

  return response.data
}

export async function apiTriggerPayout(circleId: string, token: string, adminOverride = false): Promise<any> {
  const params = new URLSearchParams({ adminOverride: String(adminOverride) })
  const response = await apiRequest<{ success: boolean; data: any }>(`/circles/${circleId}/payout?${params.toString()}`, {
    method: 'POST',
  }, token)

  return response.data
}

export async function apiGetPayouts(circleId: string, token: string): Promise<PayoutRecord[]> {
  const response = await apiRequest<{
    success: boolean
    data: PayoutRecord[]
  }>(`/circles/${circleId}/payouts`, {}, token)

  return response.data
}

export async function apiNombaWebhook(payload: unknown): Promise<any> {
  return apiRequest('/webhooks/nomba', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function apiAddMember(
  circleId: string,
  data: { name: string; phone: string; email?: string },
  token: string,
): Promise<Member> {
  const response = await apiRequest<{
    success: boolean
    data: Member
  }>(`/circles/${circleId}/members`, {
    method: 'POST',
    body: JSON.stringify(data),
  }, token)

  return response.data
}
