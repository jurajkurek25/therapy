'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppNav from '@/components/AppNav';
import AppSidebar from '@/components/AppSidebar';
import MobileNav from '@/components/MobileNav';
import { isLoggedIn, getUser, saveUser, setLoggedIn, PLAN_LABELS, PLAN_CREDITS, type User, type Plan } from '@/lib/store';

const PLANS: Array<{ id: Plan; label: string; monthly: number; credits: number; total: string }> = [
  { id: 'start', label: 'Štart', monthly: 9, credits: 9, total: '11,90' },
  { id: 'stabilita', label: 'Stabilita', monthly: 30, credits: 30, total: '32,90' },
  { id: 'rytmus', label: 'Rytmus', monthly: 60, credits: 60, total: '62,90' },
];

type Section = 'profil' | 'plan' | 'bezpecnost' | 'fakturacia';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [section, setSection] = useState<Section>('profil');
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newPlan, setNewPlan] = useState<Plan>('stabilita');
  const [cancelConfirm, setCancelConfirm] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/prihlasenie'); return; }
    const u = getUser();
    setUser(u);
    setName(u.name);
    setEmail(u.email);
    setNewPlan(u.plan);
  }, [router]);

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updated = { ...user, name, email };
    saveUser(updated);
    setUser(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const changePlan = () => {
    if (!user) return;
    const updated = { ...user, plan: newPlan, credits: user.credits };
    saveUser(updated);
    setUser(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const logout = () => {
    setLoggedIn(false);
    router.push('/');
  };

  if (!user) return null;

  const NAV: Array<{ id: Section; label: string; icon: string }> = [
    { id: 'profil', label: 'Profil', icon: '◦' },
    { id: 'plan', label: 'Predplatné', icon: '▣' },
    { id: 'bezpecnost', label: 'Bezpečnosť', icon: '◈' },
    { id: 'fakturacia', label: 'Faktúry', icon: '◻' },
  ];

  return (
    <>
      <AppNav />
      <div className="dashboard-layout">
        <AppSidebar />
        <main className="main-content">
          <div style={{ marginBottom: 32 }}>
            <span className="eyebrow">Nastavenia</span>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(36px, 4vw, 52px)', lineHeight: 1, letterSpacing: '-0.02em', margin: '8px 0', fontWeight: 400 }}>
              Účet
            </h1>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 40 }}>
            {/* Section nav */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {NAV.map((n) => (
                <button key={n.id} onClick={() => setSection(n.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: section === n.id ? 'var(--paper)' : 'none', border: '1px solid', borderColor: section === n.id ? 'var(--rule-2)' : 'transparent', textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 14, color: section === n.id ? 'var(--ink)' : 'var(--muted)', transition: 'all 0.15s' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{n.icon}</span>
                  {n.label}
                </button>
              ))}
              <div style={{ height: 1, background: 'var(--rule)', margin: '12px 0' }} />
              <button onClick={logout}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--muted)', transition: 'color 0.15s' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>→</span>
                Odhlásiť sa
              </button>
            </div>

            {/* Content */}
            <div>
              {saved && (
                <div className="status-bar success" style={{ marginBottom: 20 }}>
                  ✓ Zmeny boli uložené
                </div>
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
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div style={{ padding: '16px 18px', background: 'var(--paper)', border: '1px solid var(--rule)', fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
                      <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: 4 }}>Člen od</strong>
                      {user.memberSince} · účet #{user.email.split('@')[0].toUpperCase().slice(0, 6)}
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
                    Aktuálny plán: <strong style={{ color: 'var(--ink)' }}>{PLAN_LABELS[user.plan]}</strong> · {PLAN_CREDITS[user.plan]} kreditov mesačne
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                    {PLANS.map((p) => (
                      <label key={p.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', border: `1px solid ${newPlan === p.id ? 'var(--ink)' : 'var(--rule-2)'}`, background: newPlan === p.id ? 'var(--paper)' : 'transparent', cursor: 'pointer', transition: 'all 0.15s', position: 'relative' }}>
                        {user.plan === p.id && (
                          <span style={{ position: 'absolute', top: -1, left: 0, background: 'var(--ink)', color: 'var(--bg)', fontFamily: 'var(--mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', padding: '4px 8px' }}>
                            Aktuálny
                          </span>
                        )}
                        <input type="radio" name="plan" value={p.id} checked={newPlan === p.id} onChange={() => setNewPlan(p.id)} style={{ accentColor: 'var(--accent-ink)', marginTop: user.plan === p.id ? 12 : 0 }} />
                        <div style={{ flex: 1, marginTop: user.plan === p.id ? 8 : 0 }}>
                          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, letterSpacing: '-0.01em' }}>{p.label}</div>
                          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>→ {p.credits} kreditov mesačne</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'var(--serif)', fontSize: 24 }}>{p.total} €</div>
                          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>/mes.</div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {newPlan !== user.plan && (
                    <div style={{ padding: '12px 16px', background: 'var(--accent-tint)', border: '1px solid var(--accent)', fontSize: 13, color: 'var(--accent-ink)', marginBottom: 16 }}>
                      Zmena z <strong>{PLAN_LABELS[user.plan]}</strong> na <strong>{PLAN_LABELS[newPlan]}</strong> sa prejaví od ďalšieho zúčtovacieho obdobia.
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={changePlan} disabled={newPlan === user.plan} className="btn btn-primary" style={{ borderRadius: 0, opacity: newPlan === user.plan ? 0.5 : 1 }}>
                      Zmeniť plán →
                    </button>
                  </div>

                  <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid var(--rule)' }}>
                    <h3 style={{ fontFamily: 'var(--serif)', fontSize: 22, margin: '0 0 12px', fontWeight: 400, color: 'var(--muted)' }}>
                      Zrušenie predplatného
                    </h3>
                    <p style={{ fontSize: 14, color: 'var(--muted)', margin: '0 0 16px', lineHeight: 1.6 }}>
                      Predplatné môžete zrušiť kedykoľvek. Naakumulované kredity ({user.credits} kr.) ostávajú aktívne 12 mesiacov od poslednej platby.
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
                          <button onClick={() => { setCancelConfirm(false); setSaved(true); setTimeout(() => setSaved(false), 2500); }}
                            style={{ padding: '10px 18px', border: '1px solid var(--rule-2)', background: 'var(--ink)', color: 'var(--bg)', fontFamily: 'var(--sans)', fontSize: 14, cursor: 'pointer' }}>
                            Áno, zrušiť
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
                    <div className="field">
                      <label>Aktuálne heslo</label>
                      <input type="password" placeholder="••••••••" />
                    </div>
                    <div className="field">
                      <label>Nové heslo</label>
                      <input type="password" placeholder="min. 8 znakov" />
                    </div>
                    <div className="field">
                      <label>Potvrdiť nové heslo</label>
                      <input type="password" placeholder="••••••••" />
                    </div>
                    <button className="btn btn-primary" style={{ borderRadius: 0 }}>Zmeniť heslo →</button>
                  </div>
                  <div style={{ paddingTop: 28, borderTop: '1px solid var(--rule)' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 12px' }}>Dáta a súkromie</h3>
                    <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 16px' }}>
                      Teraplan spracúva vaše dáta v súlade s GDPR. Konverzácie s AI poradcom slúžia výhradne na odporučenie terapeuta a nie sú viazané na vaše meno.
                    </p>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="btn btn-ghost" style={{ borderRadius: 0, fontSize: 13 }}>Stiahnuť moje dáta</button>
                      <button className="btn btn-ghost" style={{ borderRadius: 0, fontSize: 13, color: '#8b3232', borderColor: '#e8b4b4' }}>Vymazať účet</button>
                    </div>
                  </div>
                </div>
              )}

              {section === 'fakturacia' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--serif)', fontSize: 28, margin: '0 0 24px', letterSpacing: '-0.01em', fontWeight: 400 }}>Faktúry</h2>
                  <div style={{ border: '1px solid var(--rule)', borderBottom: 'none' }}>
                    {[
                      { date: '2026-05-01', desc: 'Plán Stabilita · Máj 2026', amount: '32,90 €', status: 'Zaplatená' },
                      { date: '2026-04-01', desc: 'Plán Stabilita · Apríl 2026', amount: '32,90 €', status: 'Zaplatená' },
                      { date: '2026-04-20', desc: 'Dokup · 17 kreditov', amount: '17,00 €', status: 'Zaplatená' },
                      { date: '2026-03-01', desc: 'Plán Stabilita · Marec 2026', amount: '32,90 €', status: 'Zaplatená' },
                      { date: '2026-02-01', desc: 'Plán Stabilita · Február 2026', amount: '32,90 €', status: 'Zaplatená' },
                      { date: '2026-01-01', desc: 'Aktivácia · Plán Stabilita', amount: '32,90 €', status: 'Zaplatená' },
                    ].map((f, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr auto 80px', gap: 16, padding: '14px 20px', borderBottom: '1px solid var(--rule)', alignItems: 'center', fontSize: 14 }}>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>{f.date}</span>
                        <span>{f.desc}</span>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--accent-ink)' }}>{f.status}</span>
                        <span style={{ fontFamily: 'var(--serif)', fontSize: 16, textAlign: 'right' }}>{f.amount}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 16, fontSize: 13, color: 'var(--muted)' }}>
                    Faktúry sú zasielané na {user.email} po každej platbe.
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
