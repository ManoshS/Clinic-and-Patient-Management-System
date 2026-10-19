import { useEffect, useState } from 'react'
import { getAppointments } from '../../api/appointments'
import { getDiagnoses } from '../../api/diagnoses'
import { getPrescriptions } from '../../api/prescriptions'
import type { Appointment, Diagnosis, Prescription } from '../../types'
import { StatusBadge } from '../../components/StatusBadge'
import { useAuth } from '../../hooks/useAuth'
import { Calendar, ChevronDown, ChevronUp, Pill, Stethoscope } from 'lucide-react'
import { format } from 'date-fns'

interface ApptDetail {
  diagnoses: Diagnosis[]
  prescriptions: Prescription[]
  loaded: boolean
}

export default function Timeline() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [details, setDetails] = useState<Record<number, ApptDetail>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.patient_id) return
    getAppointments({ patient_id: user.patient_id })
      .then((appts) => setAppointments(appts.sort((a, b) => new Date(b.scheduled_dt).getTime() - new Date(a.scheduled_dt).getTime())))
      .finally(() => setLoading(false))
  }, [user])

  const toggle = async (appt: Appointment) => {
    const existing = details[appt.appt_id]
    if (existing !== undefined) {
      setDetails((d) => ({ ...d, [appt.appt_id]: { ...existing, loaded: !existing.loaded } }))
      return
    }
    const diagnoses = await getDiagnoses(appt.appt_id)
    const prescriptions = diagnoses.length > 0
      ? (await Promise.all(diagnoses.map((d) => getPrescriptions(d.diag_id)))).flat()
      : []
    setDetails((d) => ({ ...d, [appt.appt_id]: { diagnoses, prescriptions, loaded: true } }))
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full py-24"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Timeline</h1>
        <p className="text-gray-500 text-sm mt-1">{appointments.length} appointments in your history</p>
      </div>

      {appointments.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No appointments yet</p>
        </div>
      )}

      <div className="relative">
        {/* vertical line */}
        {appointments.length > 0 && <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200" />}

        <div className="space-y-4">
          {appointments.map((a) => {
            const det = details[a.appt_id]
            const open = det?.loaded ?? false

            return (
              <div key={a.appt_id} className="relative pl-10">
                {/* dot */}
                <div className={`absolute left-2.5 top-4 w-3 h-3 rounded-full border-2 border-white ring-2 ${a.status === 'completed' ? 'bg-green-500 ring-green-300' : a.status === 'cancelled' ? 'bg-red-400 ring-red-200' : 'bg-indigo-500 ring-indigo-200'}`} />

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggle(a)}
                    className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">{format(new Date(a.scheduled_dt), 'dd MMMM yyyy')}</p>
                        <StatusBadge status={a.status} />
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">Dr. {a.doctor_name}</p>
                      {a.notes && <p className="text-xs text-gray-400 mt-1 truncate">{a.notes}</p>}
                    </div>
                    {open ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />}
                  </button>

                  {open && det && (
                    <div className="border-t border-gray-100 px-5 py-4 space-y-4 bg-gray-50/50">
                      {det.diagnoses.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">No diagnoses recorded</p>
                      ) : (
                        det.diagnoses.map((diag) => (
                          <div key={diag.diag_id}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <Stethoscope className="w-3.5 h-3.5 text-indigo-500" />
                              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Diagnosis</span>
                            </div>
                            <p className="text-sm text-gray-800">{diag.description}</p>
                            <div className="flex gap-3 mt-1 text-xs text-gray-400">
                              {diag.icd_code && <span>ICD: {diag.icd_code}</span>}
                              {diag.severity && <StatusBadge status={diag.severity} />}
                            </div>

                            {/* Prescriptions for this diagnosis */}
                            {det.prescriptions.filter((rx) => rx.diag_id === diag.diag_id).length > 0 && (
                              <div className="mt-3 space-y-2">
                                <div className="flex items-center gap-2">
                                  <Pill className="w-3.5 h-3.5 text-purple-500" />
                                  <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Prescriptions</span>
                                </div>
                                {det.prescriptions.filter((rx) => rx.diag_id === diag.diag_id).map((rx) => (
                                  <div key={rx.rx_id} className="bg-white rounded-lg px-3 py-2 border border-gray-100 text-sm">
                                    <span className="font-medium text-gray-900">{rx.medication}</span>
                                    <span className="text-gray-400 ml-2 text-xs">
                                      {[rx.dosage, rx.frequency, rx.duration_days ? `${rx.duration_days} days` : null].filter(Boolean).join(' · ')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
