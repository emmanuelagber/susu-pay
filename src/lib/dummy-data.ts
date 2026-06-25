import type { Member, Circle, AuthUser, DashboardStats, ChartDataPoint } from '../types'

export const DUMMY_MEMBERS: Member[] = [
  {
    id: 'm1',
    name: 'Chidi Kalu',
    initials: 'CK',
    phone: '09090000111',
    email: 'chidi@example.com',
    virtualAccount: '9920 0112 3456',
    payoutPosition: 1,
    status: 'paid',
    amountPaid: 10000,
    joinedAt: '2026-07-15',
  },
  {
    id: 'm2',
    name: 'Ada Okafor',
    initials: 'AO',
    phone: '08034044035',
    email: 'ada@example.com',
    virtualAccount: '9926 0112 3457',
    payoutPosition: 2,
    status: 'paid',
    amountPaid: 10000,
    joinedAt: '2026-07-15',
  },
  {
    id: 'm3',
    name: 'Bisi Nwusu',
    initials: 'BN',
    phone: '08054456789',
    email: 'bisi@example.com',
    virtualAccount: '9926 0112 3458',
    payoutPosition: 3,
    status: 'pending',
    joinedAt: '2026-07-15',
  },
  {
    id: 'm4',
    name: 'Emeka Mba',
    initials: 'EM',
    phone: '09007789888',
    email: 'emeka@example.com',
    virtualAccount: '0900 7789 3459',
    payoutPosition: 4,
    status: 'pending',
    joinedAt: '2026-07-15',
  },
  {
    id: 'm5',
    name: 'Fatima Kolo',
    initials: 'FK',
    phone: '09089000011',
    email: 'fatima@example.com',
    virtualAccount: '9926 0112 3460',
    payoutPosition: 5,
    status: 'pending',
    joinedAt: '2026-07-15',
  },
  {
    id: 'm6',
    name: 'Ugo Eze',
    initials: 'UE',
    phone: '08022334455',
    email: 'ugo@example.com',
    virtualAccount: '9920 0334 5566',
    payoutPosition: 6,
    status: 'pending',
    joinedAt: '2026-07-16',
  },
]

export const FAMILY_MEMBERS: Member[] = [
  {
    id: 'f1', name: 'Ngozi Obi', initials: 'NO', phone: '08011223344',
    virtualAccount: '9920 1122 3344', payoutPosition: 1, status: 'paid', amountPaid: 25000, joinedAt: '2026-03-20',
  },
  {
    id: 'f2', name: 'Tunde Obi', initials: 'TO', phone: '08033445566',
    virtualAccount: '9926 3344 5566', payoutPosition: 2, status: 'paid', amountPaid: 25000, joinedAt: '2026-03-20',
  },
  {
    id: 'f3', name: 'Kemi Adewale', initials: 'KA', phone: '08055667788',
    virtualAccount: '9920 5566 7788', payoutPosition: 3, status: 'paid', amountPaid: 25000, joinedAt: '2026-03-20',
  },
]

export const DUMMY_CIRCLES: Circle[] = [
  {
    id: 'c1',
    name: 'Office Ajo — Lagos HQ',
    plan: 'BAM',
    cycle: 1,
    totalCycles: 12,
    contribution: 10000,
    frequency: 'Monthly',
    members: DUMMY_MEMBERS,
    maxMembers: 100,
    startDate: '2026-08-01',
    payoutOrder: 'Sequential',
    description: 'Monthly office savings group',
    status: 'active',
    createdAt: '2026-07-10',
  },
  {
    id: 'c2',
    name: 'Family Savings — Abuja',
    plan: 'ADASHI',
    cycle: 3,
    totalCycles: 6,
    contribution: 25000,
    frequency: 'Monthly',
    members: FAMILY_MEMBERS,
    maxMembers: 6,
    startDate: '2026-04-01',
    payoutOrder: 'Sequential',
    status: 'active',
    createdAt: '2026-03-20',
  },
  {
    id: 'c3',
    name: 'Market Women Ajo',
    plan: 'BAM',
    cycle: 6,
    totalCycles: 10,
    contribution: 5000,
    frequency: 'Fortnightly',
    members: DUMMY_MEMBERS.slice(0, 4),
    maxMembers: 10,
    startDate: '2026-01-15',
    payoutOrder: 'Sequential',
    status: 'active',
    createdAt: '2026-01-10',
  },
]

export const ADMIN_USER: AuthUser = {
  id: 'u1',
  name: 'Amaka Obi',
  initials: 'AO',
  email: 'admin@susucircle.ng',
  role: 'admin',
}

export const MEMBER_USER: AuthUser = {
  id: 'm1',
  name: 'Chidi Kalu',
  initials: 'CK',
  email: 'chidi@example.com',
  role: 'member',
  circleId: 'c1',
  memberId: 'm1',
}

export const DASHBOARD_STATS: DashboardStats = {
  totalCircles: 3,
  activeCircles: 3,
  totalMembers: 13,
  totalContributions: 370000,
  pendingPayouts: 2,
  collectionRate: 71,
}

export const CHART_DATA: ChartDataPoint[] = [
  { month: 'Jan', expected: 50000, actual: 50000 },
  { month: 'Feb', expected: 50000, actual: 45000 },
  { month: 'Mar', expected: 50000, actual: 50000 },
  { month: 'Apr', expected: 75000, actual: 75000 },
  { month: 'May', expected: 75000, actual: 60000 },
  { month: 'Jun', expected: 75000, actual: 75000 },
  { month: 'Jul', expected: 75000, actual: 20000 },
]
