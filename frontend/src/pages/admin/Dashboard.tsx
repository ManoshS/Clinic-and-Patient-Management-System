import { useEffect, useState } from 'react'
import { getStats } from '../../api/stats'
import { getAppointments } from '../../api/appointments'
import { getDepartments } from '../../api/departments'
import type { Stats, Appointment, Department } from '../../types'
import { StatCard } from '../../components/StatCard'
import { StatusBadge } from '../../components/StatusBadge'
import { Users, Calendar, Clock, FlaskConical, Building2 } from 'lucide-react'
import { format } from 'date-fns'

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getStats(), getAppointments(), getDepartments()])
      .then(([s, a, d]) => {
        setStats(s)
        setAppointments(a.slice(0, 6))
        setDepartments(d)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back — here's what's happening today</p>
      </div>

      {/* Stat cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Patients"
            value={stats.total_patients}
            icon={<Users className="w-5 h-5 text-indigo-600" />}
            color="bg-indigo-50"
            subtitle="Registered"
          />
          <StatCard
            title="Appointments"
            value={stats.total_appointments}
            icon={<Calendar className="w-5 h-5 text-blue-600" />}
            color="bg-blue-50"
            subtitle="All time"
          />
          <StatCard
            title="Scheduled"
            value={stats.scheduled_appointments}
            icon={<Clock className="w-5 h-5 text-green-600" />}
            color="bg-green-50"
            subtitle="Upcoming"
          />
          <StatCard
            title="Pending Labs"
            value={stats.pending_labs}
            icon={<FlaskConical className="w-5 h-5 text-amber-600" />}
            color="bg-amber-50"
            subtitle="Awaiting results"
          />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Appointments */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Recent Appointments</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {appointments.length === 0 && (
              <p className="text-center text-gray-400 py-8 text-sm">No appointments found</p>
            )}
            {appointments.map((a) => (
              <div key={a.appt_id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-gray-50 transition">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0">
                  {a.patient_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{a.patient_name}</p>
                  <p className="text-xs text-gray-400">Dr. {a.doctor_name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-500">{format(new Date(a.scheduled_dt), 'dd MMM, HH:mm')}</p>
                  <div className="mt-0.5"><StatusBadge status={a.status} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Departments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            <h2 className="text-base font-semibold text-gray-900">Departments</h2>
          </div>
          <div className="p-4 space-y-3">
            {departments.map((d) => (
              <div key={d.dept_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{d.dept_name}</p>
                  <p className="text-xs text-gray-400">Head: {d.head_name ?? '—'}</p>
                </div>
                <span className="text-xs bg-indigo-100 text-indigo-700 font-medium px-2 py-1 rounded-full">
                  {d.staff_count} staff
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
