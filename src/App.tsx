import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Overview from './pages/Overview'
import Members from './pages/Members'
import Reports from './pages/Reports'
import CreateCircle from './pages/circle/CreateCircle'
import MemberDashboard from './pages/member/MemberDashboard'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  const { user } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/register"
          element={user ? <Navigate to={user.role === 'member' ? '/member' : '/overview'} replace /> : <Register />}
        />
        <Route
          path="/login"
          element={user ? <Navigate to={user.role === 'member' ? '/member' : '/overview'} replace /> : <Login />}
        />

        {/* Admin routes */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="members" element={<Members />} />
          <Route path="reports" element={<Reports />} />
          <Route path="circles/new" element={<CreateCircle />} />
          <Route path="settings" element={<div className="p-8 text-text-dim">Settings — coming soon</div>} />
        </Route>

        {/* Member route */}
        <Route
          path="/member"
          element={
            <RequireAuth>
              <MemberDashboard />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to={user ? '/overview' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
