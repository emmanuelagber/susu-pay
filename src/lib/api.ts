import type {
  Circle,
  Member,
  AdminMember,
  MemberStatus,
  ContributionRecord,
  NotificationItem,
  PayoutRecord,
  AuthResponse,
  AuthUser,
  AuthTokens,
  DashboardStats,
  ReportsData,
  CreateCircleFormData,
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL

async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const message = body?.message || response.statusText || 'Request failed'
    throw new Error(message)
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
      user?: {
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

  const userData = response.data.admin || response.data.user
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
    throw new Error(body?.message || response.statusText || 'Export failed')
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

export async function apiGetCircle(id: string, token: string): Promise<Circle | null> {
  try {
    const response = await apiRequest<{
      success: boolean
      data: Circle
    }>(`/circles/${id}`, {}, token)

    return response.data
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
      data: Member
    }>(`/members/${id}`, {}, token)

    return response.data
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
    throw new Error(body?.message || response.statusText || 'Passport request failed')
  }

  return response.text()
}

export async function apiGetContributionBoard(circleId: string, token: string, cycle?: number): Promise<any[]> {
  const params = new URLSearchParams()
  if (cycle) params.set('cycle', String(cycle))
  const response = await apiRequest<{
    success: boolean
    data: any[]
  }>(`/circles/${circleId}/board${params.toString() ? `?${params.toString()}` : ''}`, {}, token)

  return response.data
}

export async function apiGetMemberContributions(memberId: string, token: string): Promise<ContributionRecord[]> {
  const response = await apiRequest<{
    success: boolean
    data: ContributionRecord[]
  }>(`/members/${memberId}/contributions`, {}, token)

  return response.data
}

export async function apiGetMemberNotifications(memberId: string, token: string, page = 1, pageSize = 20): Promise<NotificationItem[]> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  const response = await apiRequest<{
    success: boolean
    data: NotificationItem[]
  }>(`/members/${memberId}/notifications?${params.toString()}`, {}, token)

  return response.data
}

export async function apiMarkMemberNotificationsRead(memberId: string, token: string): Promise<boolean> {
  const response = await apiRequest<{ success: boolean; data: boolean }>(`/members/${memberId}/notifications/read`, {
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
  }>('/circles/members', {
    method: 'POST',
    body: JSON.stringify({ circleId, ...data }),
  }, token)

  return response.data
}
