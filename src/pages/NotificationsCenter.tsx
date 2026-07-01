import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotifications, markNotificationRead } from '../api/notifications'
import { useAuth } from '../context/AuthContext'
import type { NotificationFeedItem, NotificationCategory } from '../types/sprint2'
import {
  BellIcon, CheckIcon, WalletIcon, UsersIcon, GearIcon, ArrowRightIcon,
} from '../components/ui/Icons'

type Filter = 'all' | NotificationCategory

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)   return 'Just now'
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7)   return `${d}d ago`
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
}

function NotifIcon({ type }: { type: NotificationFeedItem['type'] }) {
  const base = 'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0'
  if (type === 'payment_confirmed' || type === 'payment_received' || type === 'partial_payment') {
    return (
      <div className={`${base} bg-green-accent/15`}>
        <CheckIcon className="w-4 h-4 text-green-accent" />
      </div>
    )
  }
  if (type === 'payout_triggered' || type === 'payout_completed' || type === 'payout_released') {
    return (
      <div className={`${base} bg-blue-accent/15`}>
        <WalletIcon className="w-4 h-4 text-blue-accent" />
      </div>
    )
  }
  if (type === 'payout_failed') {
    return (
      <div className={`${base} bg-danger/15`}>
        <WalletIcon className="w-4 h-4 text-danger" />
      </div>
    )
  }
  if (type === 'payment_overdue') {
    return (
      <div className={`${base} bg-danger/15`}>
        <BellIcon className="w-4 h-4 text-danger" />
      </div>
    )
  }
  if (type === 'member_joined') {
    return (
      <div className={`${base} bg-blue-accent/10`}>
        <UsersIcon className="w-4 h-4 text-blue-accent" />
      </div>
    )
  }
  if (type === 'match_resolved' || type === 'circle_paused' || type === 'circle_resumed' || type === 'circle_completed') {
    return (
      <div className={`${base} bg-amber-accent/15`}>
        <ArrowRightIcon className="w-4 h-4 text-amber-accent" />
      </div>
    )
  }
  return (
    <div className={`${base} bg-border/50`}>
      <GearIcon className="w-4 h-4 text-text-ghost" />
    </div>
  )
}

function NotifItem({ item, onMarkRead, isPending }: { item: NotificationFeedItem; onMarkRead: (id: string) => void; isPending: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !item.isRead && onMarkRead(item.id)}
      disabled={item.isRead || isPending}
      className={[
        'w-full flex items-start gap-3 px-5 py-4 border-b border-border last:border-0 transition-colors text-left',
        item.isRead ? '' : 'bg-blue-accent/[0.03] hover:bg-blue-accent/[0.05]',
      ].join(' ')}
    >
      <NotifIcon type={item.type} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={['text-sm', item.isRead ? 'text-text-dim' : 'font-medium text-text-base'].join(' ')}>
            {item.title}
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {!item.isRead && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-accent flex-shrink-0" />
            )}
            <p className="text-[11px] text-text-ghost whitespace-nowrap">{relativeTime(item.createdAt)}</p>
          </div>
        </div>
        <p className="text-xs text-text-ghost mt-0.5 leading-relaxed">{item.body}</p>
        {(item.circleName || item.meta?.circleName) && (
          <p className="text-[11px] text-text-ghost mt-1 opacity-60">{item.circleName ?? item.meta?.circleName}</p>
        )}
      </div>
    </button>
  )
}

export default function NotificationsCenter() {
  const { user, accessToken } = useAuth()
  const qc = useQueryClient()
  const [filter, setFilter] = useState<Filter>('all')

  const role = user?.role ?? 'admin'

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['notifications', user?.id, role],
    queryFn: () => getNotifications(user!.id, role, accessToken!),
    enabled: !!user && !!accessToken,
    retry: 1,
  })

  const notifications = data?.items ?? []

  const markReadMutation = useMutation({
    mutationFn: ({ notificationId }: { notificationId: string }) => markNotificationRead(user!.id, role, notificationId, accessToken!),
    onSuccess: (_data, variables) => {
      qc.setQueryData(['notifications', user?.id, role], (old: { items?: NotificationFeedItem[]; unreadCount?: number } | undefined) => {
        if (!old) return old
        return {
          ...old,
          unreadCount: Math.max(0, (old.unreadCount ?? 0) - 1),
          items: (old.items ?? []).map(item => item.id === variables.notificationId ? { ...item, isRead: true } : item),
        }
      })
      qc.invalidateQueries({ queryKey: ['notifications', user?.id, role] })
    },
  })

  const filtered = notifications.filter(n => filter === 'all' || n.category === filter)
  const unreadCount = data?.unreadCount ?? notifications.filter(n => !n.isRead).length

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all',     label: 'All' },
    { key: 'payment', label: 'Payments' },
    { key: 'payout',  label: 'Payouts' },
    { key: 'system',  label: 'System' },
  ]

  return (
    <div className="p-6 max-w-[720px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-base">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-text-ghost mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <p className="text-xs text-text-ghost">Tap an unread item to mark it read</p>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={[
              'text-xs px-3 py-1.5 rounded-lg transition-colors',
              filter === f.key
                ? 'bg-blue-accent text-white'
                : 'text-text-dim hover:text-text-base hover:bg-surface-alt border border-border',
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-text-ghost text-sm">Loading…</div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-sm text-danger mb-2">Failed to load notifications.</p>
            <button onClick={() => refetch()} className="text-xs text-blue-accent hover:underline">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center px-6">
            <div className="w-10 h-10 rounded-full bg-border/40 flex items-center justify-center mx-auto mb-3">
              <BellIcon className="w-5 h-5 text-text-ghost" />
            </div>
            <p className="text-sm text-text-ghost">No notifications yet.</p>
            <p className="text-xs text-text-ghost mt-1 opacity-60">
              Payments, payouts, and circle updates will appear here.
            </p>
          </div>
        ) : (
          filtered.map(n => (
            <NotifItem
              key={n.id}
              item={n}
              onMarkRead={(notificationId) => markReadMutation.mutate({ notificationId })}
              isPending={markReadMutation.isPending && markReadMutation.variables?.notificationId === n.id}
            />
          ))
        )}
      </div>
    </div>
  )
}
