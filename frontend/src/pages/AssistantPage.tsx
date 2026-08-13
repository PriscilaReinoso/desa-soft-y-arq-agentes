import { useEffect, useRef, useState } from 'react'
import { assistantInitialMessages, assistantSuggestions } from '../data/mock'
import { sendMessage } from '../services/chat.service'
import type { ChatMessage } from '../types/domain'

function renderText(text: string) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g)
    return (
      <span key={i}>
        {parts.map((p, j) => (j % 2 === 1 ? <strong key={j}>{p}</strong> : p))}
        {i < lines.length - 1 && <br />}
      </span>
    )
  })
}

const assistantAvatarClass =
  'w-[30px] h-[30px] rounded-lg bg-gradient-to-br from-primary to-[#3A5A7A] text-white flex items-center justify-center text-sm shrink-0'

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(assistantInitialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const conversationIdRef = useRef<string | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: ChatMessage = { role: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const { answer, conversation_id } = await sendMessage(text, conversationIdRef.current ?? undefined)
      conversationIdRef.current = conversation_id
      setMessages((prev) => [...prev, { role: 'assistant', text: answer }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'No pude conectar con el asistente. Asegurate de que el servicio esté levantado en el puerto 8001.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-9 pt-6 pb-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-primary to-[#3A5A7A] flex items-center justify-center text-xl text-white">
            ✦
          </div>
          <div>
            <div className="font-extrabold text-lg text-foreground">Asistente IA</div>
            <div className="text-xs text-muted-foreground">Consultas inteligentes sobre tu inventario</div>
          </div>
          <span className="ml-auto text-[11px] font-bold bg-success/10 text-success px-3 py-1 rounded-full">
            ● En línea
          </span>
        </div>

        {/* Quick suggestions */}
        <div className="flex gap-2 mt-3.5 flex-wrap">
          {assistantSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="px-[14px] py-1.5 bg-muted border border-border rounded-full text-xs font-semibold text-foreground cursor-pointer transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-9 py-6 flex flex-col gap-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className={`${assistantAvatarClass} mr-2.5 mt-0.5`}>✦</div>
            )}
            <div
              className={`max-w-[72%] px-4 py-3 text-sm leading-[1.6] font-medium ${
                m.role === 'user'
                  ? 'rounded-[16px_16px_4px_16px] bg-primary text-white'
                  : 'rounded-[16px_16px_16px_4px] bg-card text-foreground border border-border'
              }`}
            >
              {renderText(m.text)}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-2.5">
            <div className={assistantAvatarClass}>✦</div>
            <div className="px-[18px] py-3.5 bg-card border border-border rounded-[16px_16px_16px_4px] flex gap-1.5 items-center">
              {[0, 1, 2].map((j) => (
                <div
                  key={j}
                  style={{ animation: `bounce 1s ease-in-out ${j * 0.2}s infinite` }}
                  className="w-[7px] h-[7px] rounded-full bg-primary opacity-40"
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-9 pt-4 pb-6 border-t border-border bg-card shrink-0">
        <div className="flex gap-2.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send(input)
              }
            }}
            placeholder="Preguntá sobre tu inventario…"
            className="flex-1 px-4 py-3 border-[1.5px] border-border rounded-[10px] text-sm bg-background outline-none transition-colors"
            onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />
          <button
            type="button"
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className={`px-5 py-3 rounded-[10px] text-sm font-bold transition-colors ${
              input.trim() && !loading
                ? 'bg-primary text-white cursor-pointer'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            Enviar
          </button>
        </div>
        <div className="text-[11px] text-muted-foreground mt-2 text-center">
          Presioná Enter para enviar · Los datos provienen de tu inventario en tiempo real
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
