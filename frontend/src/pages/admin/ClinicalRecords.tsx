import { useEffect, useState } from 'react'
import { getPatients } from '../../api/patients'
import { getClinicalRecords } from '../../api/records'
import type { Patient, ClinicalRecord } from '../../types'
import { StatusBadge } from '../../components/StatusBadge'
import { FileText, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'

export default function ClinicalRecords() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedId, setSelectedId] = useState(0)
  const [records, setRecords] = useState<ClinicalRecord[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { getPatients().then(setPatients) }, [])

  useEffect(() => {
    if (!selectedId) { setRecords([]); return }
    setLoading(true)
    getClinicalRecords(selectedId).then(setRecords).finally(() => setLoading(false))
  }, [selectedId])

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clinical Records</h1>
        <p className="text-gray-500 text-sm mt-1">Select a patient to view their visit history</p>
      </div>

      {/* Patient picker */}
      <div className="relative w-full max-w-sm">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(Number(e.target.value))}
          className="w-full appearance-none border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value={0}>Select a patient…</option>
          {patients.map((p) => <option key={p.patient_id} value={p.patient_id}>{p.first_name} {p.last_name}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {loading && <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>}

      {!loading && selectedId > 0 && records.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>No clinical records for this patient</p>
        </div>
      )}

      {!loading && records.length > 0 && (
        <div className="space-y-4">
          {records.map((r) => (
            <div key={r.record_id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{format(new Date(r.visit_date), 'dd MMMM yyyy')}</p>
                  <p className="text-sm text-gray-500 mt-0.5">Dr. {r.doctor_name} · {r.specialization}</p>
                </div>
                {r.type && <StatusBadge status={r.type} />}
              </div>
              {r.chief_complaint && (
                <div className="mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Chief Complaint</span>
                  <p className="text-sm text-gray-700 mt-1">{r.chief_complaint}</p>
                </div>
              )}
              {r.notes && (
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Notes</span>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{r.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!selectedId && (
        <div className="text-center py-16 text-gray-300">
          <FileText className="w-16 h-16 mx-auto mb-3 opacity-20" />
          <p className="text-gray-400">Choose a patient above to view records</p>
        </div>
      )}
    </div>
  )
}
