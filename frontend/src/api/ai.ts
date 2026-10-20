import { apiFetch } from './client'

export interface ChatMessage {
  role: 'user' | 'model'
  content: string
}

export interface SummaryResponse {
  summary: string
  disclaimer: string
}

export interface ChatResponse {
  reply: string
  suggested_questions: string[]
  disclaimer: string
}

export const getAISummary = () =>
  apiFetch<SummaryResponse>('/ai/summary', { method: 'POST' })

export const sendAIChat = (message: string, history: ChatMessage[]) =>
  apiFetch<ChatResponse>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  })
