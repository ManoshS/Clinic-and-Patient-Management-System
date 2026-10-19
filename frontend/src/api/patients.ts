import type { Patient } from '../types'
import { apiFetch } from './client'

export const getPatients = (search = '') =>
  apiFetch<Patient[]>(`/patients/${search ? `?search=${encodeURIComponent(search)}` : ''}`)

export const getPatient = (id: number) => apiFetch<Patient>(`/patients/${id}`)

export const createPatient = (data: Omit<Patient, 'patient_id' | 'registered_at'>) =>
  apiFetch<Patient>('/patients/', { method: 'POST', body: JSON.stringify(data) })

export const updatePatient = (id: number, data: Partial<Omit<Patient, 'patient_id' | 'registered_at'>>) =>
  apiFetch<Patient>(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) })
