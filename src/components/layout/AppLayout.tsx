import { useState, useEffect } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from './Sidebar'
import Avatar from '../ui/Avatar'
import { MenuIcon } from '../ui/Icons'

export default function AppLayout() {
  const { user, switchRole } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Close drawer whenever the route changes (nav item tapped)
  useEffect(() => setSidebarOpen(false), [location.pathname])

  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'member') return <Navigate to="/member" replace />

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ── Mobile backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────
          Desktop: part of the normal flex flow (relative).
          Mobile: fixed overlay that slides in from the left.
      ── */}
      <div
        className={[
          'fixed inset-y-0 left-0 z-30',
          'transition-transform duration-200 ease-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          // On md+ it's always visible and participates in flex layout
          'md:relative md:flex-shrink-0 md:translate-x-0',
        ].join(' ')}
      >
        <Sidebar />
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header className="flex items-center gap-3 px-4 md:px-6 py-3.5 border-b border-border flex-shrink-0">

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-1.5 -ml-1 rounded-md text-text-dim hover:text-text-base hover:bg-surface-alt transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <MenuIcon className="w-5 h-5" />
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Demo role switcher — hidden on very small screens */}
          <button
            onClick={switchRole}
            className="hidden sm:block text-[11px] text-text-ghost hover:text-text-dim border border-border rounded px-2 py-1 transition-colors"
            title="Switch to member view (demo)"
          >
            Member view
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-sm text-text-dim">{user.name}</span>
            <Avatar initials={user.initials} size="sm" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
