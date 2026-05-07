'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AppNav from '@/components/AppNav';
import AppSidebar from '@/components/AppSidebar';
import MobileNav from '@/components/MobileNav';
import { isLoggedIn, getChat, saveChat, type ChatMessage, type Partner } from '@/lib/store';

const AI_RESPONSES: Array<{
  keywords: string[];
  text: string;
  recommendation?: { name: string; specialization: string; platform: Partner; slots: number };
}> = [
  {
    keywords: ['spánok', 'nespim', 'nespávam', 'nespavosť', 'insomnia'],
    text: 'Problémy so spánkom sú veľmi časté pri chronickom strese. Z toho, čo opisujete, odporúčam individuálnu terapiu so zameraním na kognitívno-behaviorálnu terapiu nespavosti (CBT-I). Táto metóda má najsilnejšie vedecké dôkazy pre riešenie spánkových problémov.',
    recommendation: { name: 'Mgr. Lucia K.', specialization: 'KBT · spánková hygiena · stres · 4 voľné termíny', platform: 'Hedepy', slots: 4 },
  },
  {
    keywords: ['úzkosť', 'panika', 'strach', 'obava', 'nervozita'],
    text: 'Úzkosť je veľmi bežná a veľmi liečiteľná. Z vášho popisu vidím, že pravdepodobne ide o generalizovanú úzkostnú poruchu. Odporúčam začať s KBT terapeutom, ktorý sa špecializuje na úzkostné poruchy — väčšina ľudí zaznamená výraznú úľavu do 8–12 sedení.',
    recommendation: { name: 'PhDr. Martin H.', specialization: 'KBT · úzkostné poruchy · panická porucha · 2 voľné termíny', platform: 'Ksebe', slots: 2 },
  },
  {
    keywords: ['vzťah', 'partner', 'manžel', 'manželka', 'rozvod', 'odlúčenie'],
    text: 'Vzťahové problémy môžu byť veľmi vyčerpávajúce. Navrhujem dvojstupňový prístup: začnite individuálnou terapiou na spracovanie vlastných pocitov, potom zvážte párovú terapiu, ak partner bude ochotný. To dáva lepšie výsledky ako začínať párovou terapiou, keď je napätie vysoké.',
    recommendation: { name: 'Mgr. Katarína V.', specialization: 'Vzťahová terapia · párová terapia · KBT · 3 voľné termíny', platform: 'Mojra', slots: 3 },
  },
  {
    keywords: ['vyhorenie', 'burnout', 'vyčerpanie', 'práca', 'stres', 'tlak'],
    text: 'Vyhorenie je vážny stav, ktorý si vyžaduje systematický prístup — nie len dovolenku. Z toho, čo opisujete, odporúčam terapeuta so skúsenosťami s pracovným vyhorením a hranicami. Dôležité je pracovať na príčinách, nie len na symptómoch.',
    recommendation: { name: 'Mgr. Jana R.', specialization: 'Vyhorenie · pracovný stres · hranice · 6 voľných termínov', platform: 'Hedepy', slots: 6 },
  },
  {
    keywords: ['smútok', 'depresia', 'deprimovaný', 'smutný', 'bezmocnosť'],
    text: 'Ďakujem, že ste sa podelili. To, čo opisujete, zasluhuje odbornú pozornosť. Odporúčam psychoterapeuta so skúsenosťami s depresiou. Ak by ste cítili akútnu krízu, kontaktujte Linku dôvery Nezábudka: 0800 800 566 (24/7, bezplatne).',
    recommendation: { name: 'PhDr. Soňa M.', specialization: 'Depresia · smutnok · existenciálne krízy · 3 voľné termíny', platform: 'Ksebe', slots: 3 },
  },
];

function getAIResponse(userText: string): typeof AI_RESPONSES[0] {
  const lower = userText.toLowerCase();
  for (const r of AI_RESPONSES) {
    if (r.keywords.some((k) => lower.includes(k))) return r;
  }
  return {
    text: 'Ďakujem, že ste sa so mnou podelili. Na základe vášho opisu odporúčam začať so skúseným psychoterapeutom, ktorý si vypočuje váš príbeh bez predsudkov a pomôže vám nájsť ten správny smer. Nemali by ste na to zostať sami.',
    recommendation: { name: 'Mgr. Peter N.', specialization: 'Všeobecná psychoterapia · KBT · humanistická terapia · 5 voľných termínov', platform: 'Hedepy', slots: 5 },
    keywords: [],
  };
}

export default function AIPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/prihlasenie'); return; }
    setMessages(getChat());
  }, [router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
    const resp = getAIResponse(userMsg.content);
    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'ai',
      content: resp.text,
      timestamp: new Date().toISOString(),
      recommendation: resp.recommendation,
    };
    const final = [...updated, aiMsg];
    setMessages(final);
    saveChat(final);
    setLoading(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const reset = () => {
    const initial: ChatMessage[] = [{
      id: Date.now().toString(),
      role: 'ai',
      content: 'Dobrý deň! Som váš AI poradca v Teraplan. Povedzte mi vlastnými slovami, čo riešite — bez formulárov, bez škál od 0 do 10. Čokoľvek, čo vám leží na srdci.',
      timestamp: new Date().toISOString(),
    }];
    setMessages(initial);
    saveChat(initial);
  };

  return (
    <>
      <AppNav />
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', height: 'calc(100vh - 61px)' }}>
        <AppSidebar />
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '16px 40px', borderBottom: '1px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="live-dot" />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-ink)' }}>Teraplan AI · poradca</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
                Opíšte vlastnými slovami, čo riešite — odporučíme vám terapeuta.
              </div>
            </div>
            <button onClick={reset} style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', padding: '8px 12px', border: '1px solid var(--rule-2)', cursor: 'pointer', background: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Nový rozhovor
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {messages.map((m) => (
              <div key={m.id} className={`chat-msg ${m.role}`}>
                <div className="msg-who">{m.role === 'user' ? 'Vy' : 'Teraplan AI'}</div>
                <div className="msg-bubble">{m.content}</div>
                {m.recommendation && (
                  <div style={{ padding: '14px 18px', background: 'var(--accent-tint)', border: '1px solid var(--accent)', display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center', maxWidth: 480 }}>
                    <div>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--accent-ink)' }}>{m.recommendation.name}</div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent-ink)', opacity: 0.8, marginTop: 4 }}>{m.recommendation.specialization}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '8px 12px', background: 'var(--accent-ink)', color: 'var(--bg)', whiteSpace: 'nowrap' }}>
                      {m.recommendation.platform} →
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="chat-msg ai">
                <div className="msg-who">Teraplan AI</div>
                <div className="msg-bubble" style={{ fontStyle: 'italic', color: 'var(--muted)' }}>
                  <span className="live-dot" />Analyzujem váš podnet…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="chat-input-bar">
            <textarea
              className="chat-input"
              placeholder="Opíšte vlastnými slovami, čo riešite… (Enter = odoslať, Shift+Enter = nový riadok)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="btn btn-primary"
              style={{ borderRadius: 0, padding: '14px 24px', opacity: (!input.trim() || loading) ? 0.5 : 1 }}
            >
              Odoslať ↵
            </button>
          </div>
        </div>
      </div>
      <MobileNav />
    </>
  );
}
