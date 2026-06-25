import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { CircleLogo, GridIcon, UsersIcon, ChartBarIcon, GearIcon, LogOutIcon } from '../ui/Icons'
import Avatar from '../ui/Avatar'

const NAV_ITEMS = [
  { label: 'Overview', path: '/overview', Icon: GridIcon },
  { label: 'Members',  path: '/members',  Icon: UsersIcon },
  { label: 'Reports',  path: '/reports',  Icon: ChartBarIcon },
  { label: 'Settings', path: '/settings', Icon: GearIcon },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="w-[220px] h-screen flex flex-col bg-[#0D1F33] border-r border-border">

      {/* Brand */}
      <div className="px-5 py-5 flex items-center gap-2.5 border-b border-border flex-shrink-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: '#4B7CF3' }}
        >
          <CircleLogo className="w-4 h-4 text-white" />
        </div>
        <p className="text-sm font-semibold text-text-base leading-none">Susu Circle</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, path, Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              [
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-[#1A3050] text-text-base'
                  : 'text-text-dim hover:text-text-base hover:bg-[#162840]',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={['w-4 h-4 flex-shrink-0', isActive ? 'text-text-base' : 'text-text-ghost'].join(' ')} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      {user && (
        <div className="px-4 py-4 border-t border-border flex-shrink-0">
          <div className="flex items-center gap-2.5 mb-3">
            <Avatar initials={user.initials} size="sm" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-text-base truncate">{user.name}</p>
              <p className="text-[11px] text-text-ghost truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-text-ghost hover:text-danger transition-colors"
          >
            <LogOutIcon className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      )}
    </aside>
  )
}
