import type { Appointment } from '../types'
import { apiFetch } from './client'

export const getAppointments = (filters: { patient_id?: number; status?: string; hp_id?: number } = {}) => {
  const params = new URLSearchParams()
  if (filters.patient_id) params.set('patient_id', String(filters.patient_id))
  if (filters.status) params.set('status', filters.status)
  if (filters.hp_id) params.set('hp_id', String(filters.hp_id))
  const qs = params.toString()
  return apiFetch<Appointment[]>(`/appointments/${qs ? `?${qs}` : ''}`)
}

export const createAppointment = (data: { patient_id: number; hp_id: number; scheduled_dt: string; notes?: string }) =>
  apiFetch<Appointment>('/appointments/', { method: 'POST', body: JSON.stringify(data) })

export const updateAppointment = (id: number, data: Partial<{ scheduled_dt: string; actual_dt: string; status: string; notes: string }>) =>
  apiFetch<Appointment>(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const cancelAppointment = (id: number) =>
  apiFetch<{ message: string }>(`/appointments/${id}`, { method: 'DELETE' })
