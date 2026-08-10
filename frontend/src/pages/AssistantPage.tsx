import { useEffect, useRef, useState } from 'react'
import { assistantInitialMessages, assistantSuggestions } from '../data/mock'
import type { ChatMessage } from '../types/domain'

const simulateResponse = (question: string): string => {
  const q = question.toLowerCase()
  if (q.includes('stock bajo') || q.includes('mínimo') || q.includes('reponer'))
    return "Detecté **27 artículos bajo su stock mínimo**. Los más urgentes son:\n\n• Tornillo autorroscante 1\" → 42 unid. (mín. 200)\n• Cinta de teflón x 10m → 8 unid. (mín. 50)\n• Lija grano 120 → 15 unid. (mín. 100)\n• Cable unipolar 2.5mm rojo → 12 mt. (mín. 50)\n\n¿Quiero generar una orden de compra para estos artículos?"
  if (q.includes('similares') || q.includes('similar'))
    return "Para el artículo **A-001 (Tornillo autorroscante 1\")** encontré los siguientes similares en inventario:\n\n• A-002 — Tornillo hex 3/8 x 2\" (stock: 380)\n• A-003 — Tornillo parker 8 x 1\" (stock: 94)\n\nTambién hay productos de reemplazo ofrecidos por tu proveedor **MetalSur** con 15% de descuento esta semana."
  if (q.includes('más vendidos') || q.includes('vendido'))
    return "Los **5 artículos más vendidos** en agosto son:\n\n1. Cable unipolar 2.5mm — 340 mt. vendidos\n2. Tornillo autorroscante 1\" — 1.820 unid.\n3. Disyuntor bipolar 32A — 48 unid.\n4. Cinta de teflón x 10m — 210 unid.\n5. Pintura látex blanca 4L — 62 unid.\n\n¿Querés ver el detalle de alguno en particular?"
  if (q.includes('metalsur') || q.includes('compras'))
    return "En compras a **MetalSur** durante 2026 registré:\n\n• Enero: $28.400\n• Febrero: $31.200\n• Marzo: $19.800\n• Abril–Julio: $142.600\n• **Total YTD: $221.900**\n\nEl saldo pendiente actual es de $12.400. ¿Querés ver el historial completo de pedidos?"
  return "Entendí tu consulta. Según el inventario actual, puedo decirte que tenés **1.842 artículos registrados** en 4 depósitos, con 27 productos bajo stock mínimo y 34 órdenes de venta pendientes.\n\n¿Querés que profundice en algún aspecto específico del inventario?"
}

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

const assistantAvatar = {
  width: 30,
  height: 30,
  borderRadius: 8,
  background: 'linear-gradient(135deg, #4A6B8A 0%, #3A5A7A 100%)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 14,
  flexShrink: 0,
} as const

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(assistantInitialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: ChatMessage = { role: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setTimeout(() => {
      const response = simulateResponse(text)
      setMessages((prev) => [...prev, { role: 'assistant', text: response }])
      setLoading(false)
    }, 1200)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '24px 36px 16px', borderBottom: '1px solid var(--border)', background: '#fff', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #4A6B8A 0%, #3A5A7A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#fff' }}>
            ✦
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--foreground)' }}>Asistente IA</div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Consultas inteligentes sobre tu inventario</div>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, background: '#7B9A4A18', color: '#7B9A4A', padding: '4px 12px', borderRadius: 99 }}>
            ● En línea
          </span>
        </div>

        {/* Quick suggestions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          {assistantSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              style={{
                padding: '6px 14px',
                background: 'var(--muted)',
                border: '1px solid var(--border)',
                borderRadius: 99,
                fontFamily: 'inherit',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--foreground)',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 36px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'assistant' && (
              <div style={{ ...assistantAvatar, marginRight: 10, marginTop: 2 }}>✦</div>
            )}
            <div
              style={{
                maxWidth: '72%',
                padding: '12px 16px',
                borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: m.role === 'user' ? 'var(--primary)' : '#fff',
                color: m.role === 'user' ? '#fff' : 'var(--foreground)',
                border: m.role === 'assistant' ? '1px solid var(--border)' : 'none',
                fontSize: 14,
                lineHeight: 1.6,
                fontWeight: 500,
              }}
            >
              {renderText(m.text)}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ ...assistantAvatar }}>✦</div>
            <div style={{ padding: '14px 18px', background: '#fff', border: '1px solid var(--border)', borderRadius: '16px 16px 16px 4px', display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0, 1, 2].map((j) => (
                <div
                  key={j}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    opacity: 0.4,
                    animation: `bounce 1s ease-in-out ${j * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '16px 36px 24px', borderTop: '1px solid var(--border)', background: '#fff', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 10 }}>
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
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1.5px solid var(--border)',
              borderRadius: 10,
              fontFamily: 'inherit',
              fontSize: 14,
              background: 'var(--background)',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />
          <button
            type="button"
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            style={{
              padding: '12px 20px',
              background: input.trim() && !loading ? 'var(--primary)' : 'var(--muted)',
              border: 'none',
              borderRadius: 10,
              color: input.trim() && !loading ? '#fff' : 'var(--muted-foreground)',
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: 700,
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s',
            }}
          >
            Enviar
          </button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 8, textAlign: 'center' }}>
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
