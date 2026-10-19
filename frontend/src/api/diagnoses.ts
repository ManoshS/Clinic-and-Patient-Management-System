import type { Diagnosis } from '../types'
import { apiFetch } from './client'

export const getDiagnoses = (appt_id?: number) =>
  apiFetch<Diagnosis[]>(`/diagnoses/${appt_id ? `?appt_id=${appt_id}` : ''}`)

export const createDiagnosis = (data: { appt_id: number; description: string; icd_code?: string; severity?: string }) =>
  apiFetch<Diagnosis>('/diagnoses/', { method: 'POST', body: JSON.stringify(data) })
