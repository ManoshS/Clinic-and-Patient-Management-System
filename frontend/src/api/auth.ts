import { apiFetch } from './client'

export interface LoginResponse {
  access_token: string
  token_type: string
  role: string
  patient_id: number | null
}

export interface RegisterRequest {
  username: string
  password: string
  role: string
  first_name?: string
  last_name?: string
  dob?: string
  gender?: string
  blood_group?: string
  contact?: string
  address?: string
}

export const login = (username: string, password: string) =>
  apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })

export const register = (data: RegisterRequest) =>
  apiFetch<{ message: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const logout = () => apiFetch('/auth/logout', { method: 'POST' })
