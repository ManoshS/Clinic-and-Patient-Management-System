import { useEffect, useState, useCallback } from 'react'
import { getAppointments, createAppointment, updateAppointment, cancelAppointment } from '../../api/appointments'
import { getPatients } from '../../api/patients'
import { getProfessionals } from '../../api/professionals'
import type { Appointment, Patient, Professional } from '../../types'
import { StatusBadge } from '../../components/StatusBadge'
import { Plus, Pencil, X, Filter } from 'lucide-react'
import { format } from 'date-fns'

const statusOptions = ['', 'scheduled', 'completed', 'cancelled', 'no-show']

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDoctor, setFilterDoctor] = useState(0)
  const [showDialog, setShowDialog] = useState(false)
  const [editing, setEditing] = useState<Appointment | null>(null)
  const [form, setForm] = useState({ patient_id: 0, hp_id: 0, scheduled_dt: '', notes: '', status: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    getAppointments({ status: filterStatus || undefined, hp_id: filterDoctor || undefined })
      .then(setAppointments)
      .finally(() => setLoading(false))
  }, [filterStatus, filterDoctor])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    getPatients().then(setPatients)
    getProfessionals().then(setDoctors)
  }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ patient_id: 0, hp_id: 0, scheduled_dt: '', notes: '', status: '' })
    setError(''); setShowDialog(true)
  }
  const openEdit = (a: Appointment) => {
    setEditing(a)
    setForm({ patient_id: a.patient_id, hp_id: a.hp_id, scheduled_dt: a.scheduled_dt.slice(0, 16), notes: a.notes ?? '', status: a.status })
    setError(''); setShowDialog(true)
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      if (editing) {
        await updateAppointment(editing.appt_id, { scheduled_dt: form.scheduled_dt, notes: form.notes, status: form.status || undefined })
      } else {
        if (!form.patient_id || !form.hp_id || !form.scheduled_dt) { setError('Patient, doctor and date are required'); setSaving(false); return }
        await createAppointment({ patient_id: form.patient_id, hp_id: form.hp_id, scheduled_dt: form.scheduled_dt, notes: form.notes || undefined })
      }
      setShowDialog(false); load()
    } catch (e) { setError((e as Error).message) }
    finally { setSaving(false) }
  }

  const handleCancel = async (id: number) => {
    if (!confirm('Cancel this appointment?')) return
    await cancelAppointment(id); load()
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 text-sm mt-1">{appointments.length} appointments</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition">
          <Plus className="w-4 h-4" /> Book Appointment
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
          {statusOptions.map((s) => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
        <select value={filterDoctor} onChange={(e) => setFilterDoctor(Number(e.target.value))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
          <option value={0}>All Doctors</option>
          {doctors.map((d) => <option key={d.hp_id} value={d.hp_id}>Dr. {d.first_name} {d.last_name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>{['Patient','Doctor','Scheduled','Status','Notes',''].map((h) => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {appointments.map((a) => (
                <tr key={a.appt_id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">{a.patient_name}</td>
                  <td className="px-4 py-3 text-gray-600">Dr. {a.doctor_name}</td>
                  <td className="px-4 py-3 text-gray-600">{format(new Date(a.scheduled_dt), 'dd MMM yyyy, HH:mm')}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3 text-gray-400 text-xs max-w-xs truncate">{a.notes ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(a)} className="text-gray-400 hover:text-indigo-600 p-1 rounded transition"><Pencil className="w-3.5 h-3.5" /></button>
                      {a.status !== 'cancelled' && (
                        <button onClick={() => handleCancel(a.appt_id)} className="text-gray-400 hover:text-red-500 p-1 rounded transition"><X className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && appointments.length === 0 && <p className="text-center py-12 text-gray-400 text-sm">No appointments found</p>}
      </div>

      {/* Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold">{editing ? 'Edit Appointment' : 'Book Appointment'}</h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              {!editing && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Patient</label>
                  <select value={form.patient_id} onChange={(e) => setForm((f) => ({ ...f, patient_id: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value={0}>Select patient…</option>
                    {patients.map((p) => <option key={p.patient_id} value={p.patient_id}>{p.first_name} {p.last_name}</option>)}
                  </select>
                </div>
              )}
              {!editing && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Doctor</label>
                  <select value={form.hp_id} onChange={(e) => setForm((f) => ({ ...f, hp_id: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value={0}>Select doctor…</option>
                    {doctors.map((d) => <option key={d.hp_id} value={d.hp_id}>Dr. {d.first_name} {d.last_name} — {d.specialization}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date & Time</label>
                <input type="datetime-local" value={form.scheduled_dt} onChange={(e) => setForm((f) => ({ ...f, scheduled_dt: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              {editing && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {statusOptions.filter(Boolean).map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
            </div>
            {error && <p className="px-6 text-sm text-red-600">{error}</p>}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowDialog(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg disabled:opacity-60">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
