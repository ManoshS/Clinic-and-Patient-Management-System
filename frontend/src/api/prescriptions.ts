import type { Prescription } from '../types'
import { apiFetch } from './client'

export const getPrescriptions = (diag_id?: number) =>
  apiFetch<Prescription[]>(`/prescriptions/${diag_id ? `?diag_id=${diag_id}` : ''}`)

export const createPrescription = (data: { diag_id: number; hp_id: number; medication: string; dosage?: string; frequency?: string; duration_days?: number }) =>
  apiFetch<Prescription>('/prescriptions/', { method: 'POST', body: JSON.stringify(data) })
