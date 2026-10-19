import { useEffect, useState, useCallback } from 'react'
import { getPatients, createPatient, updatePatient } from '../../api/patients'
import type { Patient } from '../../types'
import { StatusBadge } from '../../components/StatusBadge'
import { Plus, Search, Pencil, User } from 'lucide-react'
import { format } from 'date-fns'

type PatientForm = {
  first_name: string; last_name: string; dob: string; gender: string
  blood_group: string; contact: string; address: string
}
const empty: PatientForm = { first_name: '', last_name: '', dob: '', gender: '', blood_group: '', contact: '', address: '' }

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editing, setEditing] = useState<Patient | null>(null)
  const [form, setForm] = useState<PatientForm>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback((q = '') => {
    setLoading(true)
    getPatients(q).then(setPatients).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const t = setTimeout(() => load(search), 300)
    return () => clearTimeout(t)
  }, [search, load])

  const openAdd = () => { setEditing(null); setForm(empty); setError(''); setShowDialog(true) }
  const openEdit = (p: Patient) => {
    setEditing(p)
    setForm({ first_name: p.first_name, last_name: p.last_name, dob: p.dob ?? '', gender: p.gender ?? '', blood_group: p.blood_group ?? '', contact: p.contact ?? '', address: p.address ?? '' })
    setError('')
    setShowDialog(true)
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      if (editing) {
        await updatePatient(editing.patient_id, form)
      } else {
        await createPatient(form)
      }
      setShowDialog(false)
      load(search)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const Field = ({ label, name, type = 'text' }: { label: string; name: keyof PatientForm; type?: string }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  )

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500 text-sm mt-1">{patients.length} registered patients</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition">
          <Plus className="w-4 h-4" /> Add Patient
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or contact…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                {['Patient', 'DOB', 'Gender', 'Blood', 'Contact', 'Registered', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {patients.map((p) => (
                <tr key={p.patient_id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                        {p.first_name[0]}{p.last_name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{p.first_name} {p.last_name}</p>
                        <p className="text-xs text-gray-400">#{p.patient_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.dob ? format(new Date(p.dob), 'dd MMM yyyy') : '—'}</td>
                  <td className="px-4 py-3">
                    {p.gender && <StatusBadge status={p.gender.toLowerCase()} />}
                    {!p.gender && <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-800">{p.blood_group ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.contact ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {p.registered_at ? format(new Date(p.registered_at), 'dd MMM yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-indigo-600 transition p-1 rounded">
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && patients.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <User className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No patients found</p>
          </div>
        )}
      </div>

      {/* Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit Patient' : 'Add Patient'}</h2>
            </div>
            <div className="px-6 py-5 grid grid-cols-2 gap-4">
              <Field label="First Name" name="first_name" />
              <Field label="Last Name" name="last_name" />
              <Field label="Date of Birth" name="dob" type="date" />
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
                <select value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select…</option>
                  {['Male','Female','Other'].map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Blood Group</label>
                <select value={form.blood_group} onChange={(e) => setForm((f) => ({ ...f, blood_group: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select…</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
              <Field label="Contact" name="contact" />
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                <textarea value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
            </div>
            {error && <p className="px-6 text-sm text-red-600">{error}</p>}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowDialog(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition disabled:opacity-60">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
