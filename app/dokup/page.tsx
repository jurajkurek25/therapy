'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import AppNav from '@/components/AppNav';
import AppSidebar from '@/components/AppSidebar';
import MobileNav from '@/components/MobileNav';

const PRESETS = [10, 20, 30, 50, 60, 90];

export default function TopupPage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);
  const [amount, setAmount] = useState(30);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/user').then(r => r.json()).then(setUser);
    }
  }, [status]);

  const handlePurchase = async () => {
    if (paying) return;
    setPaying(true);
    setError('');

    const res = await fetch('/api/dokup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Chyba pri platbe.');
      setPaying(false);
      return;
    }

    window.location.href = data.checkoutUrl;
  };

  if (status === 'loading' || !user) return null;

  const fmt = (n: number) => n.toFixed(2).replace('.', ',');

  return (
    <>
      <AppNav credits={user.credits} />
      <div className="dashboard-layout">
        <AppSidebar />
        <main className="main-content">
          <div style={{ marginBottom: 32 }}>
            <span className="eyebrow">Dokúpiť kredity</span>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(36px, 4vw, 52px)', lineHeight: 1, letterSpacing: '-0.02em', margin: '8px 0 4px', fontWeight: 400 }}>
              1 € = 1 kredit.<br /><em style={{ fontStyle: 'italic', color: 'var(--accent-ink)' }}>Rovnaký kurz.</em>
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>
              Aktuálny stav: <strong style={{ color: 'var(--ink)', fontFamily: 'var(--serif)', fontSize: 18 }}>{user.credits}</strong> kreditov
            </p>
          </div>

          {error && <div className="status-bar error" style={{ marginBottom: 20 }}>⚠ {error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 48 }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 16 }}>
                Vyberte počet kreditov
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
                {PRESETS.map((p) => (
                  <button key={p} onClick={() => setAmount(p)}
                    style={{ padding: '20px 12px', border: `1px solid ${amount === p ? 'var(--ink)' : 'var(--rule-2)'}`, background: amount === p ? 'var(--ink)' : 'var(--paper)', color: amount === p ? 'var(--bg)' : 'var(--ink)', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontFamily: 'var(--serif)', fontSize: 32, lineHeight: 1 }}>{p}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em' }}>kreditov</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, marginTop: 4, opacity: amount === p ? 1 : 0.6 }}>{fmt(p)} €</span>
                  </button>
                ))}
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 12 }}>
                  Alebo zadajte vlastné množstvo
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '14px 18px', border: '1px solid var(--rule-2)', background: 'var(--paper)' }}>
                  <input type="number" min="5" max="500" step="5" value={amount}
                    onChange={(e) => setAmount(Math.max(5, Math.min(500, Number(e.target.value) || 5)))}
                    style={{ flex: 1, border: 'none', background: 'transparent', fontFamily: 'var(--serif)', fontSize: 36, color: 'var(--ink)', outline: 'none', width: '100%' }} />
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--muted)' }}>kreditov = {fmt(amount)} €</span>
                </div>
              </div>

              <input type="range" min="5" max="200" step="5" value={Math.min(200, amount)}
                onChange={(e) => setAmount(Number(e.target.value))}
                style={{ width: '100%', marginBottom: 32, accentColor: 'var(--accent-ink)' }} />

              <div style={{ padding: '20px', background: 'var(--paper)', border: '1px solid var(--rule)', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                  <span>{amount} kreditov × 1 €</span>
                  <span style={{ fontFamily: 'var(--mono)' }}>{fmt(amount)} €</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--muted)', paddingBottom: 12, borderBottom: '1px solid var(--rule)' }}>
                  <span>Servisný poplatok (dokup)</span>
                  <span style={{ fontFamily: 'var(--mono)' }}>0,00 €</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12 }}>
                  <span style={{ fontWeight: 600 }}>Celkom</span>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 24 }}>{fmt(amount)} €</span>
                </div>
              </div>

              <button onClick={handlePurchase} disabled={paying} className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', borderRadius: 0, padding: '18px 0', fontSize: 15, opacity: paying ? 0.7 : 1 }}>
                {paying ? 'Presmerovávam na Stripe…' : `Zaplatiť ${fmt(amount)} € →`}
              </button>
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', textAlign: 'center', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Bez záväzkov · bez servisného poplatku za dokup
              </div>
            </div>

            <div>
              <div style={{ background: 'var(--ink)', color: 'var(--bg)', padding: 28 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.6, marginBottom: 20 }}>
                  Po dokupe
                </div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 52, lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 4 }}>
                  {user.credits + amount}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>
                  kreditov celkom
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.15)', marginBottom: 20 }} />
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)' }}>
                  → {Math.floor((user.credits + amount) / 60)} × sedenie dostupné
                </div>
              </div>
              <div style={{ padding: 20, border: '1px solid var(--rule)', borderTop: 'none', background: 'var(--paper)', fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: 6 }}>Platobné metódy</strong>
                Platobná karta (VISA, Mastercard), Apple Pay, Google Pay. Platby spracúva Stripe — vaše kartové údaje neukladáme.
              </div>
            </div>
          </div>
        </main>
      </div>
      <MobileNav />
    </>
  );
}
