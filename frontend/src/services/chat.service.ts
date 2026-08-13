const CHAT_API_BASE_URL = 'http://127.0.0.1:8001'

export interface ChatResponse {
  conversation_id: string
  answer: string
}

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function sendMessage(question: string, conversationId?: string): Promise<ChatResponse> {
  let response: Response
  try {
    response = await fetch(`${CHAT_API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, conversation_id: conversationId ?? null }),
    })
  } catch {
    throw new Error('No se pudo conectar con el asistente')
  }

  if (!response.ok) {
    throw new Error(`Error ${response.status}`)
  }

  return (await response.json()) as ChatResponse
}
