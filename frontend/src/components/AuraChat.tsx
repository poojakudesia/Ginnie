import React, { useState, useRef, useEffect } from 'react';
import { DLAura } from './DLAura';
import { DLButton } from './DLButton';
import { streamAuraChat, AuraMessage } from '../api/aura';

interface AuraChatProps {
  onClose: () => void;
  initialMessage?: string;
}

export const AuraChat: React.FC<AuraChatProps> = ({ onClose, initialMessage }) => {
  const [messages, setMessages] = useState<AuraMessage[]>([
    {
      role: 'assistant',
      content: initialMessage || "Hi love ✦ I'm Ginnie, your personal manifestation guide. What's on your heart today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [dots, setDots] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!streaming) return;
    const t = setInterval(() => setDots((d) => (d + 1) % 4), 400);
    return () => clearInterval(t);
  }, [streaming]);

  const send = async () => {
    if (!input.trim() || streaming) return;
    const userMsg: AuraMessage = { role: 'user', content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setStreaming(true);

    const allMsgs = [...messages, userMsg];
    let reply = '';

    setMessages((m) => [...m, { role: 'assistant', content: '' }]);

    try {
      for await (const chunk of streamAuraChat(allMsgs)) {
        reply += chunk;
        setMessages((m) => [
          ...m.slice(0, -1),
          { role: 'assistant', content: reply },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m.slice(0, -1),
        { role: 'assistant', content: "I'm here with you. Let's try that again ✦" },
      ]);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--paper)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 20px',
          borderBottom: '1px solid var(--line)',
          flexShrink: 0,
        }}
      >
        <DLAura size={40} glow />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--sans)', fontWeight: 500, fontSize: 15, color: 'var(--ink)' }}>
            Ginnie ✦
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em' }}>
            YOUR GINNIE
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            background: 'var(--card)',
            border: '1.5px solid var(--line)',
            cursor: 'pointer',
            fontSize: 16,
            color: 'var(--ink)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'flex-end',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            }}
          >
            {msg.role === 'assistant' && <DLAura size={32} glow={false} />}
            <div
              style={{
                maxWidth: '78%',
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, var(--btn), var(--btn-deep))'
                  : 'var(--card)',
                color: msg.role === 'user' ? '#fff' : 'var(--ink)',
                fontFamily: 'var(--sans)',
                fontSize: 14,
                lineHeight: 1.55,
                boxShadow: msg.role === 'assistant'
                  ? 'inset 0 1px 0 rgba(255,255,255,0.7), 0 2px 8px rgba(0,0,0,0.06)'
                  : 'none',
              }}
            >
              {msg.content === '' && streaming
                ? <span style={{ opacity: 0.5 }}>{'•'.repeat(dots + 1)}</span>
                : msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: '12px 16px 20px',
          borderTop: '1px solid var(--line)',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-end',
          flexShrink: 0,
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Message Ginnie..."
          rows={1}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: 18,
            border: '1.5px solid var(--line)',
            background: 'var(--card)',
            fontFamily: 'var(--sans)',
            fontSize: 14,
            color: 'var(--ink)',
            outline: 'none',
            resize: 'none',
            lineHeight: 1.4,
          }}
        />
        <DLButton
          variant="primary"
          size="sm"
          onClick={send}
          disabled={!input.trim() || streaming}
          style={{ flexShrink: 0, padding: '11px 18px' }}
        >
          ↑
        </DLButton>
      </div>
    </div>
  );
};
