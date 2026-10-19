import type { Professional } from '../types'
import { apiFetch } from './client'

export const getProfessionals = (filters: { dept_id?: number; role?: string } = {}) => {
  const params = new URLSearchParams()
  if (filters.dept_id) params.set('dept_id', String(filters.dept_id))
  if (filters.role) params.set('role', filters.role)
  const qs = params.toString()
  return apiFetch<Professional[]>(`/healthcare-professionals/${qs ? `?${qs}` : ''}`)
}
