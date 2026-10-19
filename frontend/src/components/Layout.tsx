import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  LayoutDashboard, Users, Calendar, FlaskConical, FileText,
  Clock, LogOut, Activity,
} from 'lucide-react'

const adminNav = [
  { to: '/admin',              label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/admin/patients',     label: 'Patients',      icon: Users },
  { to: '/admin/appointments', label: 'Appointments',  icon: Calendar },
  { to: '/admin/labs',         label: 'Lab Investigations', icon: FlaskConical },
  { to: '/admin/records',      label: 'Clinical Records',   icon: FileText },
]

const patientNav = [
  { to: '/patient/timeline', label: 'My Timeline',  icon: Clock },
  { to: '/patient/labs',     label: 'My Labs',      icon: FlaskConical },
  { to: '/patient/records',  label: 'My Records',   icon: FileText },
]

export function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const nav = user?.role === 'admin' ? adminNav : patientNav

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-700">
          <Activity className="w-6 h-6 text-indigo-400 mr-2" />
          <span className="text-white font-bold text-lg tracking-tight">ClinIQ</span>
          <span className="ml-2 text-xs bg-indigo-600 text-white px-1.5 py-0.5 rounded font-medium">
            {user?.role === 'admin' ? 'Admin' : 'Patient'}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-slate-700">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.role === 'admin' ? 'A' : 'P'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">
                {user?.role === 'admin' ? 'Administrator' : `Patient #${user?.patient_id}`}
              </p>
              <p className="text-slate-400 text-xs capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
