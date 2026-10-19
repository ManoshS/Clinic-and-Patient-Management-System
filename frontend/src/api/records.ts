import type { ClinicalRecord } from '../types'
import { apiFetch } from './client'

export const getClinicalRecords = (patient_id: number) =>
  apiFetch<ClinicalRecord[]>(`/clinical-records/${patient_id}`)
