import type { Lab } from '../types'
import { apiFetch } from './client'

export const getAllLabs = () => apiFetch<Lab[]>('/lab-investigations/')

export const getPatientLabs = (patient_id: number) =>
  apiFetch<Lab[]>(`/lab-investigations/${patient_id}`)

export const createLab = (data: { patient_id: number; ordered_by: number; test_name: string; ref_range?: string }) =>
  apiFetch<Lab>('/lab-investigations/', { method: 'POST', body: JSON.stringify(data) })

export const updateLab = (id: number, data: { result?: string; status?: string }) =>
  apiFetch<Lab>(`/lab-investigations/${id}`, { method: 'PUT', body: JSON.stringify(data) })
