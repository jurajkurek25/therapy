'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Brand from '@/components/Brand';
import { setLoggedIn, saveUser, getUser } from '@/lib/store';

const PLANS = [
  { id: 'start', label: 'Štart', monthly: 9, total: '11,90', credits: 9 },
  { id: 'stabilita', label: 'Stabilita', monthly: 30, total: '32,90', credits: 30 },
  { id: 'rytmus', label: 'Rytmus', monthly: 60, total: '62,90', credits: 60 },
];

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState<'start' | 'stabilita' | 'rytmus'>('stabilita');

  useEffect(() => {
    const p = searchParams.get('plan');
    if (p === 'start' || p === 'stabilita' || p === 'rytmus') setPlan(p);
  }, [searchParams]);
  const [loading, setLoading] = useState(false);

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const user = getUser();
    saveUser({ ...user, name, email, plan });
    setLoggedIn(true);
    router.push('/dashboard');
  };

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <Brand dark />
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.6, marginBottom: 20 }}>
            Krok {step} z 2
          </div>
          <div style={{ height: 2, background: 'rgba(255,255,255,0.15)', marginBottom: 40, position: 'relative' }}>
            <div style={{ height: '100%', width: `${step === 1 ? 50 : 100}%`, background: 'var(--accent)', transition: 'width 0.4s ease' }} />
          </div>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(24px, 2.5vw, 36px)', lineHeight: 1.15, letterSpacing: '-0.02em', margin: 0 }}>
            {step === 1 ? 'Vytvorte si účet a začnite šetriť na seba.' : 'Vyberte si plán, ktorý vám sedí.'}
          </p>
          <p style={{ marginTop: 20, fontSize: 14, opacity: 0.6, lineHeight: 1.55 }}>
            {step === 1
              ? 'Registrácia trvá menej ako dve minúty. Žiadna kreditná karta, kým si nevyberiete plán.'
              : 'Kurz je rovnaký u všetkých plánov: 1 € = 1 kredit. Plán môžete kedykoľvek zmeniť.'}
          </p>
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          © 2026 Teraplan s.r.o.
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form">
          {step === 1 ? (
            <>
              <span className="eyebrow" style={{ display: 'block', marginBottom: 20 }}>Registrácia · Krok 1</span>
              <h1>Nový<br /><em>účet.</em></h1>
              <p className="subtitle">Základné údaje pre vašu peňaženku.</p>
              <form onSubmit={handleStep1}>
                <div className="field">
                  <label>Celé meno</label>
                  <input type="text" placeholder="Jana Nováková" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
                </div>
                <div className="field">
                  <label>E-mail</label>
                  <input type="email" placeholder="vas@email.sk" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="field">
                  <label>Heslo</label>
                  <input type="password" placeholder="min. 8 znakov" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', borderRadius: 0, marginTop: 8 }}>
                  Pokračovať →
                </button>
              </form>
            </>
          ) : (
            <>
              <span className="eyebrow" style={{ display: 'block', marginBottom: 20 }}>Registrácia · Krok 2</span>
              <h1>Váš<br /><em>plán.</em></h1>
              <p className="subtitle">Vyberte si mesačný príspevok do peňaženky.</p>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {PLANS.map((p) => (
                    <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', border: `1px solid ${plan === p.id ? 'var(--ink)' : 'var(--rule-2)'}`, background: plan === p.id ? 'var(--paper)' : 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
                      <input type="radio" name="plan" value={p.id} checked={plan === p.id} onChange={() => setPlan(p.id as typeof plan)} style={{ accentColor: 'var(--accent-ink)' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--serif)', fontSize: 20, letterSpacing: '-0.01em' }}>{p.label}</div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>→ {p.credits} kreditov mesačne</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>{p.total} €</div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>/mes.</div>
                      </div>
                    </label>
                  ))}
                </div>
                <div style={{ padding: '14px', background: 'var(--accent-tint)', border: '1px solid var(--accent)', marginBottom: 20, fontSize: 13, color: 'var(--accent-ink)', lineHeight: 1.5 }}>
                  Z {PLANS.find(p => p.id === plan)?.monthly},00 € putuje celých {PLANS.find(p => p.id === plan)?.monthly} kreditov priamo do vašej peňaženky. 2,90 € = servisný poplatok.
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-ghost" style={{ borderRadius: 0 }} onClick={() => setStep(1)}>← Späť</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', borderRadius: 0 }} disabled={loading}>
                    {loading ? 'Vytváram účet…' : 'Aktivovať plán →'}
                  </button>
                </div>
              </form>
            </>
          )}

          <div style={{ marginTop: 28, paddingTop: 28, borderTop: '1px solid var(--rule)', textAlign: 'center', fontSize: 14, color: 'var(--muted)' }}>
            Máte účet?{' '}
            <Link href="/prihlasenie" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>Prihlásiť sa</Link>
          </div>
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Link href="/" style={{ fontSize: 13, color: 'var(--muted)' }}>← Späť na úvod</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterContent />
    </Suspense>
  );
}
