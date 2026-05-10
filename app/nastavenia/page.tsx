'use client';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import AppNav from '@/components/AppNav';
import AppSidebar from '@/components/AppSidebar';
import MobileNav from '@/components/MobileNav';

const PLAN_LABELS: Record<string, string> = {
  start: 'Štart', stabilita: 'Stabilita', rytmus: 'Rytmus',
};
const PLAN_CREDITS: Record<string, number> = {
  start: 9, stabilita: 30, rytmus: 60,
};
const PLANS = [
  { id: 'start',     label: 'Štart',     monthly: 9,  credits: 9,  total: '11,90' },
  { id: 'stabilita', label: 'Stabilita', monthly: 30, credits: 30, total: '32,90' },
  { id: 'rytmus',    label: 'Rytmus',    monthly: 60, credits: 60, total: '62,90' },
];

type Section = 'profil' | 'plan' | 'bezpecnost' | 'fakturacia';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);
  const [section, setSection] = useState<Section>('profil');
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState('');
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const loadUser = () =>
    fetch('/api/user').then(r => r.json()).then(d => {
      setUser(d);
      setName(d.name);
    });

  useEffect(() => {
    if (status === 'authenticated') loadUser();
  }, [status]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    await loadUser();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const openBillingPortal = async () => {
    const res = await fetch('/api/subscription', { method: 'PATCH' });
    const data = await res.json();
    if (data.portalUrl) window.location.href = data.portalUrl;
  };

  const cancelSubscription = async () => {
    setCanceling(true);
    await fetch('/api/subscription', { method: 'DELETE' });
    await loadUser();
    setCancelConfirm(false);
    setCanceling(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (status === 'loading' || !user) return null;

  const NAV: Array<{ id: Section; label: string; icon: string }> = [
    { id: 'profil',      label: 'Profil',       icon: '◦' },
    { id: 'plan',        label: 'Predplatné',   icon: '▣' },
    { id: 'bezpecnost',  label: 'Bezpečnosť',   icon: '◈' },
    { id: 'fakturacia',  label: 'Faktúry',      icon: '◻' },
  ];

  return (
    <>
      <AppNav credits={user.credits} />
      <div className="dashboard-layout">
        <AppSidebar />
        <main className="main-content">
          <div style={{ marginBottom: 32 }}>
            <span className="eyebrow">Nastavenia</span>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(36px, 4vw, 52px)', lineHeight: 1, letterSpacing: '-0.02em', margin: '8px 0', fontWeight: 400 }}>Účet</h1>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 40 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {NAV.map((n) => (
                <button key={n.id} onClick={() => setSection(n.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: section === n.id ? 'var(--paper)' : 'none', border: '1px solid', borderColor: section === n.id ? 'var(--rule-2)' : 'transparent', textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 14, color: section === n.id ? 'var(--ink)' : 'var(--muted)', transition: 'all 0.15s' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{n.icon}</span>
                  {n.label}
                </button>
              ))}
              <div style={{ height: 1, background: 'var(--rule)', margin: '12px 0' }} />
              <button onClick={() => signOut({ callbackUrl: '/' })}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--muted)' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>→</span>
                Odhlásiť sa
              </button>
            </div>

            <div>
              {saved && (
                <div className="status-bar success" style={{ marginBottom: 20 }}>✓ Zmeny boli uložené</div>
              )}

              {section === 'profil' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--serif)', fontSize: 28, margin: '0 0 24px', letterSpacing: '-0.01em', fontWeight: 400 }}>Profil</h2>
                  <form onSubmit={saveProfile}>
                    <div className="field">
                      <label>Celé meno</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="field">
                      <label>E-mail</label>
                      <input type="email" value={user.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                    </div>
                    <div style={{ padding: '16px 18px', background: 'var(--paper)', border: '1px solid var(--rule)', fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
                      <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: 4 }}>Člen od</strong>
                      {new Date(user.createdAt).toLocaleDateString('sk-SK')} · {user.memberMonths} mesiacov
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ borderRadius: 0 }}>
                      Uložiť zmeny →
                    </button>
                  </form>
                </div>
              )}

              {section === 'plan' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--serif)', fontSize: 28, margin: '0 0 8px', letterSpacing: '-0.01em', fontWeight: 400 }}>Predplatné</h2>
                  <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 28px' }}>
                    Aktuálny plán: <strong style={{ color: 'var(--ink)' }}>{PLAN_LABELS[user.plan] ?? user.plan}</strong> · {PLAN_CREDITS[user.plan] ?? '?'} kreditov mesačne
                    {' · '}
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: user.subscriptionStatus === 'active' ? 'var(--accent-ink)' : 'var(--muted)' }}>
                      {user.subscriptionStatus === 'active' ? '✓ aktívne' : user.subscriptionStatus === 'canceled' ? 'zrušené' : 'čaká na platbu'}
                    </span>
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                    {PLANS.map((p) => (
                      <div key={p.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', border: `1px solid ${user.plan === p.id ? 'var(--ink)' : 'var(--rule-2)'}`, background: user.plan === p.id ? 'var(--paper)' : 'transparent', position: 'relative' }}>
                        {user.plan === p.id && (
                          <span style={{ position: 'absolute', top: -1, left: 0, background: 'var(--ink)', color: 'var(--bg)', fontFamily: 'var(--mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', padding: '4px 8px' }}>
                            Aktuálny
                          </span>
                        )}
                        <div style={{ flex: 1, marginTop: user.plan === p.id ? 8 : 0 }}>
                          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, letterSpacing: '-0.01em' }}>{p.label}</div>
                          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>→ {p.credits} kreditov mesačne</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'var(--serif)', fontSize: 24 }}>{p.total} €</div>
                          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>/mes.</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: '16px 18px', background: 'var(--paper)', border: '1px solid var(--rule)', fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
                    Zmenu plánu alebo platobnej metódy spravujte cez Stripe zákaznícky portál.
                  </div>
                  <button onClick={openBillingPortal} className="btn btn-primary" style={{ borderRadius: 0, marginBottom: 40 }}>
                    Otvoriť Stripe portál →
                  </button>

                  <div style={{ paddingTop: 32, borderTop: '1px solid var(--rule)' }}>
                    <h3 style={{ fontFamily: 'var(--serif)', fontSize: 22, margin: '0 0 12px', fontWeight: 400, color: 'var(--muted)' }}>
                      Zrušenie predplatného
                    </h3>
                    <p style={{ fontSize: 14, color: 'var(--muted)', margin: '0 0 16px', lineHeight: 1.6 }}>
                      Naakumulované kredity ({user.credits} kr.) ostávajú aktívne 12 mesiacov od poslednej platby.
                    </p>
                    {!cancelConfirm ? (
                      <button onClick={() => setCancelConfirm(true)}
                        style={{ padding: '10px 18px', border: '1px solid var(--rule-2)', background: 'none', fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--muted)', cursor: 'pointer' }}>
                        Zrušiť predplatné
                      </button>
                    ) : (
                      <div style={{ padding: '20px', border: '1px solid var(--rule-2)', background: 'var(--paper)' }}>
                        <p style={{ fontSize: 14, margin: '0 0 16px', fontWeight: 500 }}>Naozaj chcete zrušiť predplatné?</p>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button onClick={cancelSubscription} disabled={canceling}
                            style={{ padding: '10px 18px', border: '1px solid var(--rule-2)', background: 'var(--ink)', color: 'var(--bg)', fontFamily: 'var(--sans)', fontSize: 14, cursor: 'pointer', opacity: canceling ? 0.6 : 1 }}>
                            {canceling ? 'Ruším…' : 'Áno, zrušiť'}
                          </button>
                          <button onClick={() => setCancelConfirm(false)}
                            style={{ padding: '10px 18px', border: '1px solid var(--rule-2)', background: 'none', fontFamily: 'var(--sans)', fontSize: 14, cursor: 'pointer', color: 'var(--muted)' }}>
                            Nie, ponechať
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {section === 'bezpecnost' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--serif)', fontSize: 28, margin: '0 0 24px', letterSpacing: '-0.01em', fontWeight: 400 }}>Bezpečnosť</h2>
                  <div style={{ marginBottom: 32 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px' }}>Zmena hesla</h3>
                    <div className="field"><label>Aktuálne heslo</label><input type="password" placeholder="••••••••" /></div>
                    <div className="field"><label>Nové heslo</label><input type="password" placeholder="min. 8 znakov" /></div>
                    <div className="field"><label>Potvrdiť nové heslo</label><input type="password" placeholder="••••••••" /></div>
                    <button className="btn btn-primary" style={{ borderRadius: 0 }}>Zmeniť heslo →</button>
                  </div>
                  <div style={{ paddingTop: 28, borderTop: '1px solid var(--rule)' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 12px' }}>Dáta a súkromie</h3>
                    <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 16px' }}>
                      Teraplan spracúva vaše dáta v súlade s GDPR. Konverzácie s AI poradcom slúžia výhradne na odporučenie terapeuta.
                    </p>
                    <button className="btn btn-ghost" style={{ borderRadius: 0, fontSize: 13, color: '#8b3232', borderColor: '#e8b4b4' }}>Vymazať účet</button>
                  </div>
                </div>
              )}

              {section === 'fakturacia' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--serif)', fontSize: 28, margin: '0 0 24px', letterSpacing: '-0.01em', fontWeight: 400 }}>Faktúry</h2>
                  <p style={{ fontSize: 14, color: 'var(--muted)', margin: '0 0 20px', lineHeight: 1.6 }}>
                    Všetky faktúry a platby sú dostupné v Stripe zákazníckom portáli.
                  </p>
                  <button onClick={openBillingPortal} className="btn btn-primary" style={{ borderRadius: 0 }}>
                    Otvoriť Stripe portál (faktúry) →
                  </button>
                  <div style={{ marginTop: 24, border: '1px solid var(--rule)', borderBottom: 'none' }}>
                    {user.transactions.slice(0, 10).map((t: any) => (
                      <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: 16, padding: '14px 20px', borderBottom: '1px solid var(--rule)', alignItems: 'center', fontSize: 14 }}>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>
                          {new Date(t.createdAt).toLocaleDateString('sk-SK')}
                        </span>
                        <span>{t.description}</span>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: t.amount > 0 ? 'var(--accent-ink)' : 'var(--muted)' }}>
                          {t.amount > 0 ? '+' : ''}{t.amount} kr.
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <MobileNav />
    </>
  );
}
