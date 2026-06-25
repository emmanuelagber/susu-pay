/**
 * Fake API layer — mirrors the shape of real endpoints.
 * Replace each function body with actual fetch() calls once the backend is ready.
 */
import {
  DUMMY_CIRCLES,
  ADMIN_USER,
  MEMBER_USER,
  DASHBOARD_STATS,
  CHART_DATA,
} from './dummy-data'
import type {
  Circle,
  Member,
  AuthUser,
  DashboardStats,
  ChartDataPoint,
  CreateCircleFormData,
} from '../types'

const delay = (ms = 600) => new Promise<void>(resolve => setTimeout(resolve, ms))

// POST /api/auth/login
export async function apiLogin(email: string, _password: string): Promise<AuthUser> {
  await delay(800)
  if (email.toLowerCase().includes('chidi') || email.toLowerCase().includes('member')) {
    return MEMBER_USER
  }
  return ADMIN_USER
}

// GET /api/circles
export async function apiGetCircles(): Promise<Circle[]> {
  await delay()
  return DUMMY_CIRCLES
}

// GET /api/circles/:id
export async function apiGetCircle(id: string): Promise<Circle | null> {
  await delay(400)
  return DUMMY_CIRCLES.find(c => c.id === id) ?? null
}

// POST /api/circles
export async function apiCreateCircle(data: CreateCircleFormData): Promise<Circle> {
  await delay(900)
  return {
    id: `c${Date.now()}`,
    name: data.name,
    plan: data.plan!,
    cycle: 1,
    totalCycles: Number(data.maxMembers),
    contribution: Number(data.contribution),
    frequency: data.frequency,
    members: [],
    maxMembers: Number(data.maxMembers),
    startDate: data.startDate,
    payoutOrder: data.payoutOrder,
    description: data.description,
    status: 'pending',
    createdAt: new Date().toISOString().split('T')[0],
  }
}

// GET /api/circles/:id/members
export async function apiGetMembers(circleId: string): Promise<Member[]> {
  await delay()
  const circle = DUMMY_CIRCLES.find(c => c.id === circleId)
  return circle?.members ?? []
}

// POST /api/circles/:id/members
export async function apiAddMember(
  _circleId: string,
  data: { name: string; phone: string; email?: string },
): Promise<Member> {
  await delay(600)
  const initials = data.name
    .split(' ')
    .map(n => n[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const acct = [
    String(9000 + Math.floor(Math.random() * 1000)),
    String(1000 + Math.floor(Math.random() * 9000)).padStart(4, '0'),
    String(1000 + Math.floor(Math.random() * 9000)).padStart(4, '0'),
  ].join(' ')
  return {
    id: `m${Date.now()}`,
    name: data.name,
    initials,
    phone: data.phone,
    email: data.email,
    virtualAccount: acct,
    payoutPosition: 0,
    status: 'pending',
    joinedAt: new Date().toISOString().split('T')[0],
  }
}

// GET /api/dashboard/stats
export async function apiGetStats(): Promise<DashboardStats> {
  await delay(500)
  return DASHBOARD_STATS
}

// GET /api/dashboard/chart
export async function apiGetChartData(): Promise<ChartDataPoint[]> {
  await delay(400)
  return CHART_DATA
}
