'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import AppNav from '@/components/AppNav';
import AppSidebar from '@/components/AppSidebar';
import MobileNav from '@/components/MobileNav';
import SosWidget from '@/components/SosWidget';

const PLAN_LABELS: Record<string, string> = {
  start: 'Štart', stabilita: 'Stabilita', rytmus: 'Rytmus',
};
const PLAN_CREDITS: Record<string, number> = {
  start: 9, stabilita: 30, rytmus: 60,
};

function DashboardContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (searchParams.get('success') === '1') setSuccessMsg('Predplatné bolo úspešne aktivované!');
    if (searchParams.get('topup') === '1') setSuccessMsg('Kredity boli úspešne pridané!');
  }, [searchParams]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/user').then(r => r.json()).then(setUser);
    }
  }, [status]);

  if (status === 'loading' || !user) return null;

  const planCredits = PLAN_CREDITS[user.plan] ?? 30;
  const sessionCost = 60;
  const sessionsAvailable = Math.floor(user.credits / sessionCost);
  const progressToSession = Math.min(100, (user.credits / sessionCost) * 100);
  const spentTotal = user.transactions
    .filter((t: any) => t.type === 'debit')
    .reduce((s: number, t: any) => s + Math.abs(t.amount), 0);

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('sk-SK', { day: 'numeric', month: 'numeric' });

  return (
    <>
      <AppNav credits={user.credits} />
      <div className="dashboard-layout">
        <AppSidebar />
        <main className="main-content">
          {successMsg && (
            <div className="status-bar" style={{ marginBottom: 24, background: 'var(--accent-tint)', border: '1px solid var(--accent)', color: 'var(--accent-ink)', padding: '14px 18px', fontFamily: 'var(--mono)', fontSize: 13 }}>
              ✓ {successMsg}
            </div>
          )}

          {user.subscriptionStatus === 'pending' && (
            <div style={{ marginBottom: 24, padding: '20px 24px', background: 'var(--ink)', color: 'var(--bg)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: 8 }}>
                Predplatné čaká na platbu
              </div>
              <p style={{ fontSize: 14, opacity: 0.8, margin: '0 0 16px' }}>
                Vaše predplatné ešte nie je aktívne. Dokončite platbu cez Stripe.
              </p>
              <a href="/api/auth/register" className="btn" style={{ background: 'var(--accent)', color: 'var(--ink)', borderRadius: 0 }}>
                Dokončiť platbu →
              </a>
            </div>
          )}

          <div style={{ marginBottom: 32 }}>
            <span className="eyebrow">Peňaženka</span>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(36px, 4vw, 52px)', lineHeight: 1, letterSpacing: '-0.02em', margin: '8px 0 4px', fontWeight: 400 }}>
              Dobrý deň, <em style={{ fontStyle: 'italic', color: 'var(--accent-ink)' }}>{user.name.split(' ')[0]}.</em>
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>
              Plán: <strong style={{ color: 'var(--ink)' }}>{PLAN_LABELS[user.plan] ?? user.plan}</strong> · {planCredits} kreditov / mesiac
            </p>
          </div>

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
              <div className="card-label" style={{ marginBottom: 8 }}>Mesačné kredity</div>
              <div className="card-value" style={{ fontSize: 36 }}>+{planCredits}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>kreditov / mesiac</div>
            </div>
            <div className="card">
              <div className="card-label" style={{ marginBottom: 8 }}>Celkom čerpané</div>
              <div className="card-value" style={{ fontSize: 36 }}>{spentTotal}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>kreditov využitých</div>
            </div>
            <div className="card">
              <div className="card-label" style={{ marginBottom: 8 }}>Členstvo</div>
              <div className="card-value" style={{ fontSize: 36 }}>{user.memberMonths}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>mesiacov</div>
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 16 }}>
              SOS Mínus · záchranné koleso
            </div>
            <SosWidget user={user} />
          </div>

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 16 }}>
              Rýchle akcie
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {['Hedepy', 'Ksebe', 'Mojra'].map((partner) => (
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

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)' }}>
                História transakcií
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>{user.transactions.length} záznamov</span>
            </div>
            <div style={{ border: '1px solid var(--rule)', borderBottom: 'none' }}>
              {user.transactions.length === 0 ? (
                <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
                  Zatiaľ žiadne transakcie.
                </div>
              ) : user.transactions.map((t: any) => (
                <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '90px 1fr auto', gap: 16, padding: '14px 20px', borderBottom: '1px solid var(--rule)', alignItems: 'center', fontSize: 14 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>{fmtDate(t.createdAt)}</span>
                  <span>{t.description}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: t.amount > 0 ? 'var(--accent-ink)' : 'var(--muted-2)', fontWeight: 500 }}>
                    {t.amount > 0 ? '+' : ''}{t.amount} kr.
                  </span>
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

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
