'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Brand from '@/components/Brand';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', { email, password, redirect: false });
    if (res?.error) {
      setError('Nesprávny e-mail alebo heslo.');
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <Brand dark />
        <div>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px, 3vw, 40px)', lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 20px' }}>
            &ldquo;Každé euro sa pretáva na kredit, ktorý ostáva váš dovtedy, kým ho použijete.&rdquo;
          </p>
          <div style={{ display: 'flex', gap: 32 }}>
            {[['1 € = 1', 'kredit'], ['3', 'partneri'], ['AI', 'poradca']].map(([val, lbl]) => (
              <div key={lbl}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 36, lineHeight: 1 }}>{val}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginTop: 6 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          © 2026 Teraplan s.r.o.
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form">
          <span className="eyebrow" style={{ display: 'block', marginBottom: 20 }}>Prihlásenie</span>
          <h1>Vitajte<br /><em>späť.</em></h1>
          <p className="subtitle">Prihláste sa do svojej kreditovej peňaženky.</p>

          {error && <div className="status-bar error" style={{ marginBottom: 20 }}>⚠ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>E-mail</label>
              <input type="email" placeholder="vas@email.sk" value={email}
                onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </div>
            <div className="field">
              <label>Heslo</label>
              <input type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', borderRadius: 0 }} disabled={loading}>
              {loading ? 'Prihlasujem…' : 'Prihlásiť sa →'}
            </button>
          </form>

          <div style={{ marginTop: 28, paddingTop: 28, borderTop: '1px solid var(--rule)', textAlign: 'center', fontSize: 14, color: 'var(--muted)' }}>
            Nemáte účet?{' '}
            <Link href="/registracia" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>Zaregistrovať sa</Link>
          </div>
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Link href="/" style={{ fontSize: 13, color: 'var(--muted)' }}>← Späť na úvod</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
