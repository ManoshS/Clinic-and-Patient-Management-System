import { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, RefreshCw, Bot, User, AlertTriangle, ChevronRight } from 'lucide-react'
import { getAISummary, sendAIChat } from '../../api/ai'
import type { ChatMessage } from '../../api/ai'

type Message = {
  role: 'user' | 'ai'
  content: string
  suggestions?: string[]
}

const STARTER_QUESTIONS = [
  'What are my current medications?',
  'Summarize my recent lab results',
  'What conditions have I been diagnosed with?',
]

function renderMarkdown(text: string) {
  // bold: **text**
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  // bullet lists: lines starting with - or *
  html = html.replace(/^[*-] (.+)/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)/s, '<ul class="list-disc pl-4 space-y-0.5 my-1">$1</ul>')
  // line breaks
  html = html.replace(/\n\n/g, '</p><p class="mt-2">')
  html = html.replace(/\n/g, '<br />')
  return `<p>${html}</p>`
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState('')
  const [chatError, setChatError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chatLoading])

  const generateSummary = async () => {
    setSummaryLoading(true)
    setSummaryError('')
    try {
      const res = await getAISummary()
      setSummary(res.summary)
    } catch (e) {
      setSummaryError((e as Error).message)
    } finally {
      setSummaryLoading(false)
    }
  }

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || chatLoading) return
    setInput('')
    setChatError('')

    const newMsg: Message = { role: 'user', content: trimmed }
    setMessages(prev => [...prev, newMsg])
    setChatLoading(true)

    const history: ChatMessage[] = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      content: m.content,
    }))

    try {
      const res = await sendAIChat(trimmed, history)
      setMessages(prev => [
        ...prev,
        { role: 'ai', content: res.reply, suggestions: res.suggested_questions },
      ])
    } catch (e) {
      setChatError((e as Error).message)
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setChatLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Health Assistant</h1>
          <p className="text-gray-500 text-sm">Powered by Google Gemini — grounded in your own records</p>
        </div>
      </div>

      {/* ── Health Summary Panel ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-600" />
            <h2 className="font-semibold text-gray-800">My Health Summary</h2>
          </div>
          <button
            onClick={generateSummary}
            disabled={summaryLoading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            {summaryLoading
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating…</>
              : <><Sparkles className="w-4 h-4" /> Generate Summary</>
            }
          </button>
        </div>

        <div className="px-6 py-5">
          {summaryError && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {summaryError}
            </div>
          )}

          {!summary && !summaryLoading && !summaryError && (
            <div className="text-center py-10 text-gray-400">
              <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Click "Generate Summary" to get an AI overview of your health records</p>
            </div>
          )}

          {summary && (
            <>
              <div
                className="text-gray-700 text-sm leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(summary) }}
              />
              <div className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-amber-700 text-xs">AI-generated — not medical advice. Consult your doctor for diagnosis or treatment.</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Chat Panel ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col" style={{ minHeight: '480px' }}>
        {/* Chat header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-600" />
            <h2 className="font-semibold text-gray-800">Ask a Question</h2>
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => { setMessages([]); setChatError('') }}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition"
            >
              <RefreshCw className="w-3 h-3" /> New conversation
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && !chatLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bot className="w-12 h-12 text-indigo-200 mb-3" />
              <p className="text-gray-500 text-sm mb-5">Ask me anything about your health records</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {STARTER_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full transition"
                  >
                    <ChevronRight className="w-3 h-3" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-indigo-600" />
                </div>
              )}

              <div className={`max-w-[78%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                {msg.role === 'user' ? (
                  <div className="bg-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm">
                    {msg.content}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 space-y-2">
                    <div
                      className="text-gray-700 text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                    />
                    <div className="flex items-center gap-1.5 pt-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      <span className="text-amber-600 text-xs">AI-generated — not medical advice</span>
                    </div>
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-1.5">
                        {msg.suggestions.map(q => (
                          <button
                            key={q}
                            onClick={() => sendMessage(q)}
                            className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded-full transition"
                          >
                            <ChevronRight className="w-3 h-3" />
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {chatLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {chatError && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {chatError}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about your health records…"
              disabled={chatLoading}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-60 transition"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || chatLoading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
