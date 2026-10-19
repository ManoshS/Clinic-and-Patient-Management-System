import { useEffect, useState } from 'react'
import { getClinicalRecords } from '../../api/records'
import type { ClinicalRecord } from '../../types'
import { StatusBadge } from '../../components/StatusBadge'
import { useAuth } from '../../hooks/useAuth'
import { FileText } from 'lucide-react'
import { format } from 'date-fns'

export default function Records() {
  const { user } = useAuth()
  const [records, setRecords] = useState<ClinicalRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.patient_id) return
    getClinicalRecords(user.patient_id).then(setRecords).finally(() => setLoading(false))
  }, [user])

  if (loading) {
    return <div className="flex items-center justify-center py-24"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Clinical Records</h1>
        <p className="text-gray-500 text-sm mt-1">{records.length} visit records</p>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No clinical records yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((r) => (
            <div key={r.record_id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
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
    </div>
  )
}
