'use client';
import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import AppNav from '@/components/AppNav';
import AppSidebar from '@/components/AppSidebar';
import MobileNav from '@/components/MobileNav';

type Msg = { id: string; role: 'user' | 'assistant'; content: string };

const INITIAL_MSG: Msg = {
  id: 'init',
  role: 'assistant',
  content: 'Dobrý deň! Som váš AI poradca v Teraplan. Povedzte mi vlastnými slovami, čo riešite — bez formulárov. Čokoľvek, čo vám leží na srdci.',
};

const STORAGE_KEY = 'teraplan_ai_chat_v2';

function parseRecommendations(text: string): Array<{ name: string; price: string; topics: string; url: string }> {
  const recs: Array<{ name: string; price: string; topics: string; url: string }> = [];
  const lines = text.split('\n');
  for (const line of lines) {
    const match = line.match(/\*\*([^*]+)\*\*\s*—\s*([^—]+)—\s*([^—]+)—\s*(https?:\/\/\S+)/);
    if (match) {
      recs.push({ name: match[1].trim(), price: match[2].trim(), topics: match[3].trim(), url: match[4].trim() });
    }
  }
  return recs;
}

function stripRecommendations(text: string): string {
  return text.replace(/\*\*[^*]+\*\*\s*—\s*[^—]+—\s*[^—]+—\s*https?:\/\/\S+/g, '').replace(/\n{3,}/g, '\n\n').trim();
}

function renderBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**')
          ? <strong key={i}>{p.slice(2, -2)}</strong>
          : p
      )}
    </>
  );
}

export default function AIPage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Msg[]>([INITIAL_MSG]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/user').then(r => r.ok ? r.json() : null).then(d => d && setUser(d));
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try { setMessages(JSON.parse(saved)); } catch {}
      }
    }
  }, [status]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const save = (msgs: Msg[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-40)));
  };

  const send = async () => {
    if (!input.trim() || streaming) return;
    const userMsg: Msg = { id: Date.now().toString(), role: 'user', content: input.trim() };
    const withUser = [...messages, userMsg];
    setMessages(withUser);
    setInput('');
    setStreaming(true);

    const aiId = (Date.now() + 1).toString();
    setStreamingId(aiId);
    const aiMsg: Msg = { id: aiId, role: 'assistant', content: '' };
    const withAi = [...withUser, aiMsg];
    setMessages(withAi);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: withUser.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) throw new Error('API error');

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += dec.decode(value, { stream: true });
        setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: full } : m));
      }

      const final = [...withUser, { id: aiId, role: 'assistant' as const, content: full }];
      setMessages(final);
      save(final);
    } catch {
      setMessages(prev => prev.map(m => m.id === aiId
        ? { ...m, content: 'Chyba pripojenia. Skúste to znova.' }
        : m));
    } finally {
      setStreaming(false);
      setStreamingId(null);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const reset = () => {
    const fresh = [INITIAL_MSG];
    setMessages(fresh);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (status === 'loading') return null;

  return (
    <>
      <AppNav credits={user?.credits} />
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', height: 'calc(100vh - 61px)' }}>
        <AppSidebar />
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Header */}
          <div style={{ padding: '16px 40px', borderBottom: '1px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)', flexShrink: 0 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="live-dot" />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-ink)' }}>
                  Teraplan AI · poradca
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
                Opíšte čo riešite — nájdeme vám terapeuta na Ksebe, Mojra alebo Hedepy.
              </div>
            </div>
            <button onClick={reset}
              style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', padding: '8px 12px', border: '1px solid var(--rule-2)', cursor: 'pointer', background: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Nový rozhovor
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {messages.map((m) => {
              const recs = m.role === 'assistant' ? parseRecommendations(m.content) : [];
              const text = m.role === 'assistant' ? stripRecommendations(m.content) : m.content;
              const isStreaming = m.id === streamingId;

              return (
                <div key={m.id} className={`chat-msg ${m.role === 'user' ? 'user' : 'ai'}`}>
                  <div className="msg-who">{m.role === 'user' ? 'Vy' : 'Teraplan AI'}</div>
                  <div className="msg-bubble" style={{ whiteSpace: 'pre-wrap' }}>
                    {text.split('\n').map((line, i) => (
                      <span key={i}>{renderBold(line)}{i < text.split('\n').length - 1 ? '\n' : ''}</span>
                    ))}
                    {isStreaming && <span style={{ opacity: 0.4 }}>▊</span>}
                  </div>
                  {recs.map((r, i) => (
                    <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center', padding: '14px 18px', background: 'var(--accent-tint)', border: '1px solid var(--accent)', maxWidth: 520, textDecoration: 'none', marginTop: 8 }}>
                      <div>
                        <div style={{ fontFamily: 'var(--serif)', fontSize: 19, color: 'var(--accent-ink)', letterSpacing: '-0.01em' }}>{r.name}</div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent-ink)', opacity: 0.8, marginTop: 3 }}>
                          {r.price} · {r.topics}
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '8px 12px', background: 'var(--accent-ink)', color: 'var(--bg)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        Otvoriť →
                      </div>
                    </a>
                  ))}
                </div>
              );
            })}

            {streaming && streamingId === null && (
              <div className="chat-msg ai">
                <div className="msg-who">Teraplan AI</div>
                <div className="msg-bubble" style={{ fontStyle: 'italic', color: 'var(--muted)' }}>
                  <span className="live-dot" /> Analyzujem váš podnet…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="chat-input-bar">
            <textarea
              ref={textareaRef}
              className="chat-input"
              placeholder="Opíšte vlastnými slovami, čo riešite… (Enter = odoslať, Shift+Enter = nový riadok)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              disabled={streaming}
            />
            <button onClick={send} disabled={!input.trim() || streaming} className="btn btn-primary"
              style={{ borderRadius: 0, padding: '14px 24px', opacity: (!input.trim() || streaming) ? 0.5 : 1 }}>
              Odoslať ↵
            </button>
          </div>
        </div>
      </div>
      <MobileNav />
    </>
  );
}
