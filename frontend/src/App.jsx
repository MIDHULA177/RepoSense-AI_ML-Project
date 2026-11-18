import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing   from './pages/Landing'
import Login     from './pages/Login'
import Signup    from './pages/Signup'
import AppPage   from './pages/AppPage'
import Dashboard from './pages/Dashboard'
import './index.css'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--dark)' }}>
      <div className="text-sm" style={{ color: 'var(--muted)' }}>Loading...</div>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/app" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"          element={<Landing />} />
          <Route path="/login"     element={<GuestOnly><Login /></GuestOnly>} />
          <Route path="/signup"    element={<GuestOnly><Signup /></GuestOnly>} />
          <Route path="/app"       element={<Protected><AppPage /></Protected>} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
