import { apiGet } from './_client'
import { apiMarkNotificationRead } from '../lib/api'
import type { NotificationFeedItem, NotificationListResponse, NotificationType, NotificationCategory } from '../types/sprint2'

interface NotificationApiItem {
  id: string
  type: string
  category: string
  title: string
  body: string
  circleName?: string
  isRead: boolean
  createdAt: string
}

interface NotificationApiResponse {
  unreadCount?: number
  total?: number
  page?: number
  pageSize?: number
  items?: NotificationApiItem[]
}

function normalizeCategory(category: string): NotificationCategory {
  const value = category?.toLowerCase()
  if (value === 'payments' || value === 'payment') return 'payment'
  if (value === 'payouts' || value === 'payout') return 'payout'
  return 'system'
}

function normalizeType(type: string): NotificationType {
  const value = type?.toLowerCase()
  switch (value) {
    case 'paymentreceived':
    case 'payment_received':
      return 'payment_received'
    case 'paymentoverdue':
      return 'payment_overdue'
    case 'partialpayment':
      return 'partial_payment'
    case 'newmemberjoined':
      return 'member_joined'
    case 'payouttriggered':
      return 'payout_triggered'
    case 'payoutfailed':
      return 'payout_failed'
    case 'payoutcompleted':
      return 'payout_completed'
    case 'payment_confirmed':
      return 'payment_confirmed'
    case 'payout_released':
      return 'payout_released'
    case 'match_resolved':
      return 'match_resolved'
    case 'circle_paused':
      return 'circle_paused'
    case 'circle_resumed':
      return 'circle_resumed'
    case 'circle_completed':
      return 'circle_completed'
    default:
      return 'circle_completed'
  }
}

function mapNotification(item: NotificationApiItem): NotificationFeedItem {
  return {
    id: item.id,
    type: normalizeType(item.type),
    category: normalizeCategory(item.category),
    title: item.title,
    body: item.body,
    isRead: item.isRead,
    createdAt: item.createdAt,
    circleName: item.circleName,
    meta: item.circleName ? { circleName: item.circleName } : undefined,
  }
}

export async function getNotifications(
  userId: string,
  role: 'admin' | 'member',
  token: string,
): Promise<NotificationListResponse> {
  const data = await apiGet<NotificationApiResponse>(`/admin/${userId}/notifications`, token)
  return {
    unreadCount: data.unreadCount ?? 0,
    total: data.total ?? 0,
    page: data.page ?? 1,
    pageSize: data.pageSize ?? 20,
    items: (data.items ?? []).map(mapNotification),
  }
}

export async function markNotificationRead(
  userId: string,
  role: 'admin' | 'member',
  notificationId: string,
  token: string,
): Promise<boolean> {
  return apiMarkNotificationRead(userId, role, notificationId, token)
}
