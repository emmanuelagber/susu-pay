import { USE_MOCK, apiGet, apiPost } from './_client'
import { mock_getNotifications, mock_markAllRead } from '../mocks/notifications'
import type { NotificationFeedItem } from '../types/sprint2'

export async function getNotifications(
  userId: string,
  role: 'admin' | 'member',
  token: string,
): Promise<NotificationFeedItem[]> {
  if (USE_MOCK) return mock_getNotifications(userId, role)
  return apiGet<NotificationFeedItem[]>(`/users/${userId}/notifications`, token)
}

export async function markAllNotificationsRead(
  userId: string,
  role: 'admin' | 'member',
  token: string,
): Promise<boolean> {
  if (USE_MOCK) return mock_markAllRead(userId, role)
  return apiPost<boolean>(`/users/${userId}/notifications/read-all`, {}, token)
}
