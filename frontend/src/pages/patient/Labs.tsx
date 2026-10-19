import { useEffect, useState } from 'react'
import { getPatientLabs } from '../../api/labs'
import type { Lab } from '../../types'
import { StatusBadge } from '../../components/StatusBadge'
import { useAuth } from '../../hooks/useAuth'
import { FlaskConical } from 'lucide-react'
import { format } from 'date-fns'

export default function Labs() {
  const { user } = useAuth()
  const [labs, setLabs] = useState<Lab[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.patient_id) return
    getPatientLabs(user.patient_id).then(setLabs).finally(() => setLoading(false))
  }, [user])

  if (loading) {
    return <div className="flex items-center justify-center py-24"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Lab Results</h1>
        <p className="text-gray-500 text-sm mt-1">{labs.length} investigations</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {labs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No lab investigations yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                {['Test', 'Ordered', 'Status', 'Result', 'Reference Range'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {labs.map((l) => (
                <tr key={l.lab_id} className={`transition ${l.result ? 'hover:bg-green-50/30' : 'hover:bg-amber-50/30'}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">{l.test_name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{format(new Date(l.ordered_at), 'dd MMM yyyy')}</td>
                  <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                  <td className="px-4 py-3">
                    {l.result
                      ? <span className="text-gray-800 font-medium">{l.result}</span>
                      : <span className="text-amber-500 text-xs italic">Pending</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{l.ref_range ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
