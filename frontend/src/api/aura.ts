import { useAuthStore } from '../store/auth';
import { API_BASE } from './client';

export interface AuraMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function* streamAuraChat(
  messages: AuraMessage[],
  context?: Record<string, unknown>
): AsyncGenerator<string> {
  const token = useAuthStore.getState().token;

  const response = await fetch(`${API_BASE}/aura/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ messages, context }),
  });

  if (!response.ok) {
    throw new Error(`Aura error: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          const text = parsed.choices?.[0]?.delta?.content ?? parsed.text ?? '';
          if (text) yield text;
        } catch {
          // skip malformed
        }
      }
    }
  }
}
