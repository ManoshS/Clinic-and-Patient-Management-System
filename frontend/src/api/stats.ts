import type { Stats } from '../types'
import { apiFetch } from './client'

export const getStats = () => apiFetch<Stats>('/stats/')
