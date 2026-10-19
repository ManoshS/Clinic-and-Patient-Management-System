import type { Department } from '../types'
import { apiFetch } from './client'

export const getDepartments = () => apiFetch<Department[]>('/departments/')
