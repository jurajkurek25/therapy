'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppNav from '@/components/AppNav';
import AppSidebar from '@/components/AppSidebar';
import MobileNav from '@/components/MobileNav';
import { isLoggedIn, getUser, getTransactions, PLAN_LABELS, type Transaction, type User } from '@/lib/store';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/prihlasenie'); return; }
    setUser(getUser());
    setTransactions(getTransactions());
  }, [router]);

  if (!user) return null;

  const planCredits = user.plan === 'start' ? 9 : user.plan === 'stabilita' ? 30 : user.plan === 'rytmus' ? 60 : user.customAmount;
  const sessionCost = 60;
  const sessionsAvailable = Math.floor(user.credits / sessionCost);
  const progressToSession = Math.min(100, (user.credits / sessionCost) * 100);

  return (
    <>
      <AppNav />
      <div className="dashboard-layout">
        <AppSidebar />
        <main className="main-content">
          <div style={{ marginBottom: 32 }}>
            <span className="eyebrow">Peňaženka</span>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(36px, 4vw, 52px)', lineHeight: 1, letterSpacing: '-0.02em', margin: '8px 0 4px', fontWeight: 400 }}>
              Dobrý deň, <em style={{ fontStyle: 'italic', color: 'var(--accent-ink)' }}>{user.name.split(' ')[0]}.</em>
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>
              Plán: <strong style={{ color: 'var(--ink)' }}>{PLAN_LABELS[user.plan]}</strong> · {planCredits} kreditov / mesiac
            </p>
          </div>

          {/* Balance + actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
            <div style={{ gridColumn: '1 / -1', background: 'var(--ink)', color: 'var(--bg)', padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.6, marginBottom: 12 }}>
                    Dostupné kredity
                  </div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(56px, 8vw, 96px)', lineHeight: 1, letterSpacing: '-0.03em' }}>
                    {user.credits}
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 12, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 8 }}>
                    kreditov · 1 kredit = 1 €
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 180 }}>
                  <Link href="/poukazky" className="btn btn-primary" style={{ background: 'var(--accent)', color: 'var(--ink)', borderRadius: 0, justifyContent: 'center' }}>
                    Generovať kód →
                  </Link>
                  <Link href="/dokup" className="btn" style={{ border: '1px solid rgba(255,255,255,0.3)', color: 'var(--bg)', borderRadius: 0, justifyContent: 'center' }}>
                    + Dokúpiť kredity
                  </Link>
                </div>
              </div>
              {/* Progress to session */}
              <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Postup k sedeniu (60 kreditov)
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, opacity: 0.6 }}>
                    {user.credits}/{sessionCost} kr.
                  </span>
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.15)', position: 'relative' }}>
                  <div style={{ height: '100%', width: `${progressToSession}%`, background: 'var(--accent)', transition: 'width 0.5s ease' }} />
                </div>
                {sessionsAvailable > 0 && (
                  <div style={{ marginTop: 10, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)' }}>
                    ✓ Máte dosť na {sessionsAvailable} sedenie{sessionsAvailable > 1 ? 'a' : ''}
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-label" style={{ marginBottom: 8 }}>Tento mesiac</div>
              <div className="card-value" style={{ fontSize: 36 }}>+{planCredits}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>kreditov pridaných</div>
            </div>
            <div className="card">
              <div className="card-label" style={{ marginBottom: 8 }}>Celkom minulý rok</div>
              <div className="card-value" style={{ fontSize: 36 }}>
                {transactions.filter(t => t.type === 'debit').reduce((s, t) => s + Math.abs(t.delta), 0)}
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>kreditov čerpaných</div>
            </div>
            <div className="card">
              <div className="card-label" style={{ marginBottom: 8 }}>Ďalšia platba</div>
              <div className="card-value" style={{ fontSize: 36 }}>1. 6.</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>2026 · {planCredits} kreditov</div>
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 16 }}>
              Rýchle akcie
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {(['Hedepy', 'Ksebe', 'Mojra'] as const).map((partner) => (
                <Link key={partner} href={`/poukazky?partner=${partner}`}
                  style={{ padding: '12px 20px', border: '1px solid var(--rule-2)', background: 'var(--paper)', display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140, transition: 'all 0.15s' }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 22, letterSpacing: '-0.01em' }}>{partner}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)' }}>→ Generovať kód</span>
                </Link>
              ))}
              <Link href="/ai"
                style={{ padding: '12px 20px', border: '1px solid var(--accent)', background: 'var(--accent-tint)', display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140 }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 22, letterSpacing: '-0.01em', color: 'var(--accent-ink)' }}>AI poradca</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-ink)' }}>→ Nájsť terapeuta</span>
              </Link>
            </div>
          </div>

          {/* Transactions */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)' }}>
                História transakcií
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>{transactions.length} záznamov</span>
            </div>
            <div style={{ border: '1px solid var(--rule)', borderBottom: 'none' }}>
              {[...transactions].reverse().map((t) => (
                <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '90px 1fr auto 80px', gap: 16, padding: '14px 20px', borderBottom: '1px solid var(--rule)', alignItems: 'center', fontSize: 14 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>{t.date}</span>
                  <span>{t.description}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: t.delta > 0 ? 'var(--accent-ink)' : 'var(--muted-2)', fontWeight: 500 }}>
                    {t.delta > 0 ? '+' : ''}{t.delta}
                  </span>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 18, textAlign: 'right' }}>{t.balance}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
      <MobileNav />
    </>
  );
}
