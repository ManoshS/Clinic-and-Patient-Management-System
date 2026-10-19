import { useEffect, useState } from 'react'
import { getAllLabs, createLab, updateLab } from '../../api/labs'
import { getPatients } from '../../api/patients'
import { getProfessionals } from '../../api/professionals'
import type { Lab, Patient, Professional } from '../../types'
import { StatusBadge } from '../../components/StatusBadge'
import { Plus, FlaskConical, Pencil } from 'lucide-react'
import { format } from 'date-fns'

export default function LabInvestigations() {
  const [labs, setLabs] = useState<Lab[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showResult, setShowResult] = useState<Lab | null>(null)
  const [addForm, setAddForm] = useState({ patient_id: 0, ordered_by: 0, test_name: '', ref_range: '' })
  const [resultForm, setResultForm] = useState({ result: '', status: 'completed' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => { setLoading(true); getAllLabs().then(setLabs).finally(() => setLoading(false)) }
  useEffect(() => { load(); getPatients().then(setPatients); getProfessionals().then(setDoctors) }, [])

  const handleAdd = async () => {
    if (!addForm.patient_id || !addForm.ordered_by || !addForm.test_name) { setError('Fill all required fields'); return }
    setSaving(true); setError('')
    try { await createLab(addForm); setShowAdd(false); load() }
    catch (e) { setError((e as Error).message) }
    finally { setSaving(false) }
  }

  const handleResult = async () => {
    if (!showResult) return
    setSaving(true); setError('')
    try { await updateLab(showResult.lab_id, resultForm); setShowResult(null); load() }
    catch (e) { setError((e as Error).message) }
    finally { setSaving(false) }
  }

  const doctorName = (id: number) => {
    const d = doctors.find((x) => x.hp_id === id)
    return d ? `Dr. ${d.first_name} ${d.last_name}` : `HP#${id}`
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lab Investigations</h1>
          <p className="text-gray-500 text-sm mt-1">{labs.length} investigations</p>
        </div>
        <button onClick={() => { setAddForm({ patient_id: 0, ordered_by: 0, test_name: '', ref_range: '' }); setError(''); setShowAdd(true) }} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition">
          <Plus className="w-4 h-4" /> Order Lab Test
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>{['Patient','Test','Ordered By','Status','Result','Ref Range','Date',''].map((h) => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {labs.map((l) => (
                <tr key={l.lab_id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">{l.patient_name ?? `Patient #${l.patient_id}`}</td>
                  <td className="px-4 py-3 text-gray-800">{l.test_name}</td>
                  <td className="px-4 py-3 text-gray-500">{doctorName(l.ordered_by)}</td>
                  <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                  <td className="px-4 py-3 text-gray-700 text-xs">{l.result ?? <span className="text-gray-300 italic">Pending</span>}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{l.ref_range ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{format(new Date(l.ordered_at), 'dd MMM yy')}</td>
                  <td className="px-4 py-3">
                    {l.status === 'pending' && (
                      <button onClick={() => { setResultForm({ result: '', status: 'completed' }); setError(''); setShowResult(l) }} className="text-gray-400 hover:text-indigo-600 p-1 rounded transition" title="Enter result">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && labs.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <FlaskConical className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No lab investigations</p>
          </div>
        )}
      </div>

      {/* Order Lab Dialog */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-gray-100"><h2 className="text-lg font-semibold">Order Lab Test</h2></div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Patient</label>
                <select value={addForm.patient_id} onChange={(e) => setAddForm((f) => ({ ...f, patient_id: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value={0}>Select patient…</option>
                  {patients.map((p) => <option key={p.patient_id} value={p.patient_id}>{p.first_name} {p.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Ordered By</label>
                <select value={addForm.ordered_by} onChange={(e) => setAddForm((f) => ({ ...f, ordered_by: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value={0}>Select doctor…</option>
                  {doctors.map((d) => <option key={d.hp_id} value={d.hp_id}>Dr. {d.first_name} {d.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Test Name</label>
                <input type="text" value={addForm.test_name} onChange={(e) => setAddForm((f) => ({ ...f, test_name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. CBC, Lipid Profile…" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Reference Range</label>
                <input type="text" value={addForm.ref_range} onChange={(e) => setAddForm((f) => ({ ...f, ref_range: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. < 100 mg/dL" />
              </div>
            </div>
            {error && <p className="px-6 text-sm text-red-600">{error}</p>}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleAdd} disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg disabled:opacity-60">{saving ? 'Saving…' : 'Order'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Enter Result Dialog */}
      {showResult && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="px-6 py-5 border-b border-gray-100"><h2 className="text-lg font-semibold">Enter Result — {showResult.test_name}</h2></div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Result</label>
                <textarea value={resultForm.result} onChange={(e) => setResultForm((f) => ({ ...f, result: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select value={resultForm.status} onChange={(e) => setResultForm((f) => ({ ...f, status: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            {error && <p className="px-6 text-sm text-red-600">{error}</p>}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowResult(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleResult} disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg disabled:opacity-60">{saving ? 'Saving…' : 'Submit'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
