import { mockDelay, shouldSimulateError, MockApiError } from './_helpers'
import type { NotificationFeedItem } from '../types/sprint2'

const ADMIN_NOTIFICATIONS: NotificationFeedItem[] = [
  {
    id: 'n001',
    type: 'payment_confirmed',
    category: 'payment',
    title: 'Payment received',
    body: 'Ngozi Adeyemi paid ₦10,000 · Office Ajo — Cycle 1',
    isRead: false,
    createdAt: '2026-07-16T07:30:00',
    meta: { circleId: 'c1', circleName: 'Office Ajo', memberId: 'm7', memberName: 'Ngozi Adeyemi', amount: 10000, cycle: 1 },
  },
  {
    id: 'n002',
    type: 'payment_confirmed',
    category: 'payment',
    title: 'Payment received',
    body: 'Chidi Kalu paid ₦10,000 · Office Ajo — Cycle 1',
    isRead: false,
    createdAt: '2026-07-15T09:14:00',
    meta: { circleId: 'c1', circleName: 'Office Ajo', memberId: 'm1', memberName: 'Chidi Kalu', amount: 10000, cycle: 1 },
  },
  {
    id: 'n003',
    type: 'payment_confirmed',
    category: 'payment',
    title: 'Payment received',
    body: 'Tunde Bello paid ₦10,000 · Office Ajo — Cycle 1',
    isRead: false,
    createdAt: '2026-07-15T08:52:00',
    meta: { circleId: 'c1', circleName: 'Office Ajo', memberId: 'm8', memberName: 'Tunde Bello', amount: 10000, cycle: 1 },
  },
  {
    id: 'n004',
    type: 'payment_confirmed',
    category: 'payment',
    title: 'Payment received',
    body: 'Ada Okafor paid ₦10,000 · Office Ajo — Cycle 1',
    isRead: true,
    createdAt: '2026-07-14T08:47:00',
    meta: { circleId: 'c1', circleName: 'Office Ajo', memberId: 'm2', memberName: 'Ada Okafor', amount: 10000, cycle: 1 },
  },
  {
    id: 'n005',
    type: 'payment_overdue',
    category: 'payment',
    title: 'Payment overdue',
    body: "Emeka Mba's payment for Office Ajo is 5 days overdue",
    isRead: false,
    createdAt: '2026-07-13T09:00:00',
    meta: { circleId: 'c1', circleName: 'Office Ajo', memberId: 'm4', memberName: 'Emeka Mba', cycle: 1 },
  },
  {
    id: 'n006',
    type: 'payment_overdue',
    category: 'payment',
    title: 'Payment overdue',
    body: "Ade Nwosu's payment for Office Ajo is 3 days overdue",
    isRead: true,
    createdAt: '2026-07-13T09:01:00',
    meta: { circleId: 'c1', circleName: 'Office Ajo', memberId: 'm10', memberName: 'Ade Nwosu', cycle: 1 },
  },
  {
    id: 'n007',
    type: 'partial_payment',
    category: 'payment',
    title: 'Partial payment received',
    body: 'Ugo Eze paid ₦7,500 of ₦10,000 · Office Ajo — Cycle 1',
    isRead: true,
    createdAt: '2026-07-12T11:30:00',
    meta: { circleId: 'c1', circleName: 'Office Ajo', memberId: 'm6', memberName: 'Ugo Eze', amount: 7500, cycle: 1 },
  },
  {
    id: 'n008',
    type: 'member_joined',
    category: 'system',
    title: 'New member joined',
    body: 'Ugo Eze joined Office Ajo — Lagos HQ',
    isRead: true,
    createdAt: '2026-07-12T10:00:00',
    meta: { circleId: 'c1', circleName: 'Office Ajo', memberId: 'm6', memberName: 'Ugo Eze' },
  },
  {
    id: 'n009',
    type: 'match_resolved',
    category: 'payment',
    title: 'Transaction matched',
    body: 'TXN003 manually matched to Ade Nwosu · Office Ajo',
    isRead: true,
    createdAt: '2026-07-11T16:45:00',
    meta: { circleId: 'c1', circleName: 'Office Ajo', memberId: 'm10', memberName: 'Ade Nwosu' },
  },
  {
    id: 'n010',
    type: 'payout_released',
    category: 'payout',
    title: 'Payout sent',
    body: 'Tunde Obi received ₦150,000 · Family Savings — Cycle 2',
    isRead: true,
    createdAt: '2026-07-10T15:22:00',
    meta: { circleId: 'c2', circleName: 'Family Savings', memberName: 'Tunde Obi', amount: 150000, cycle: 2 },
  },
  {
    id: 'n011',
    type: 'circle_paused',
    category: 'system',
    title: 'Circle paused',
    body: 'Market Women Ajo was paused temporarily',
    isRead: true,
    createdAt: '2026-07-05T14:00:00',
    meta: { circleName: 'Market Women Ajo' },
  },
  {
    id: 'n012',
    type: 'circle_resumed',
    category: 'system',
    title: 'Circle resumed',
    body: 'Market Women Ajo has been resumed',
    isRead: true,
    createdAt: '2026-07-07T09:00:00',
    meta: { circleName: 'Market Women Ajo' },
  },
  {
    id: 'n013',
    type: 'payout_released',
    category: 'payout',
    title: 'Payout processing',
    body: 'Kemi Adewale payout of ₦150,000 is being processed · Family Savings — Cycle 3',
    isRead: false,
    createdAt: '2026-06-30T12:00:00',
    meta: { circleId: 'c2', circleName: 'Family Savings', memberName: 'Kemi Adewale', amount: 150000, cycle: 3 },
  },
]

const MEMBER_NOTIFICATIONS: NotificationFeedItem[] = [
  {
    id: 'mn001',
    type: 'payment_confirmed',
    category: 'payment',
    title: 'Payment confirmed',
    body: 'Your payment of ₦10,000 was received · Office Ajo — Cycle 1',
    isRead: false,
    createdAt: '2026-07-15T09:14:00',
    meta: { circleId: 'c1', circleName: 'Office Ajo', amount: 10000, cycle: 1 },
  },
  {
    id: 'mn002',
    type: 'payout_released',
    category: 'payout',
    title: 'Payout update',
    body: 'You are first in line for the Office Ajo payout — ₦120,000 releases when all members pay',
    isRead: false,
    createdAt: '2026-07-15T09:15:00',
    meta: { circleId: 'c1', circleName: 'Office Ajo', amount: 120000, cycle: 1 },
  },
  {
    id: 'mn003',
    type: 'member_joined',
    category: 'system',
    title: 'Circle update',
    body: 'Ugo Eze joined Office Ajo — you now have 12 of 12 members',
    isRead: true,
    createdAt: '2026-07-12T10:00:00',
    meta: { circleId: 'c1', circleName: 'Office Ajo' },
  },
]

const _readIds = new Set<string>()

export async function mock_getNotifications(
  userId: string,
  role: 'admin' | 'member' = 'admin',
): Promise<NotificationFeedItem[]> {
  await mockDelay()
  if (shouldSimulateError('notifications')) {
    throw new MockApiError('Failed to load notifications. Please try again.', 503)
  }
  const base = role === 'member' ? MEMBER_NOTIFICATIONS : ADMIN_NOTIFICATIONS
  return base.map(n => ({ ...n, isRead: n.isRead || _readIds.has(n.id) }))
}

export async function mock_markAllRead(userId: string, role: 'admin' | 'member' = 'admin'): Promise<boolean> {
  await mockDelay(200, 100)
  if (shouldSimulateError('mark_read')) {
    throw new MockApiError('Failed to mark notifications as read.', 500)
  }
  const base = role === 'member' ? MEMBER_NOTIFICATIONS : ADMIN_NOTIFICATIONS
  base.forEach(n => _readIds.add(n.id))
  return true
}
