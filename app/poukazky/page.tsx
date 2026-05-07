'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppNav from '@/components/AppNav';
import AppSidebar from '@/components/AppSidebar';
import MobileNav from '@/components/MobileNav';
import {
  isLoggedIn, getUser, saveUser, getVouchers, saveVouchers, getTransactions, saveTransactions,
  generateCode, addMonths, type Voucher, type Partner, type User, type Transaction,
} from '@/lib/store';
import { Suspense } from 'react';

const PARTNERS: Partner[] = ['Hedepy', 'Ksebe', 'Mojra'];
const SESSION_COST = 60;

function VouchersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [partner, setPartner] = useState<Partner>('Hedepy');
  const [amount, setAmount] = useState(SESSION_COST);
  const [generating, setGenerating] = useState(false);
  const [newCode, setNewCode] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/prihlasenie'); return; }
    setUser(getUser());
    setVouchers(getVouchers());
    const p = searchParams.get('partner') as Partner | null;
    if (p && PARTNERS.includes(p)) setPartner(p);
  }, [router, searchParams]);

  const generate = async () => {
    if (!user) return;
    if (user.credits < amount) { setError(`Nemáte dostatok kreditov. Chýba vám ${amount - user.credits} kreditov.`); return; }
    setError('');
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 800));
    const code = generateCode();
    const today = new Date().toISOString().slice(0, 10);
    const newVoucher: Voucher = {
      id: Date.now().toString(),
      code,
      partner,
      amount,
      createdAt: today,
      expiresAt: addMonths(today, 12),
      used: false,
    };
    const newCredits = user.credits - amount;
    const updatedUser = { ...user, credits: newCredits };
    const tx: Transaction = {
      id: Date.now().toString(),
      date: today,
      description: `Kód → ${partner} · sedenie`,
      delta: -amount,
      balance: newCredits,
      type: 'debit',
    };
    const updatedVouchers = [...vouchers, newVoucher];
    const updatedTx = [...getTransactions(), tx];
    saveUser(updatedUser);
    saveVouchers(updatedVouchers);
    saveTransactions(updatedTx);
    setUser(updatedUser);
    setVouchers(updatedVouchers);
    setNewCode(code);
    setGenerating(false);
  };

  const markUsed = (id: string) => {
    const updated = vouchers.map((v) => v.id === id ? { ...v, used: true } : v);
    saveVouchers(updated);
    setVouchers(updated);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
  };

  if (!user) return null;

  const activeVouchers = vouchers.filter((v) => !v.used);
  const usedVouchers = vouchers.filter((v) => v.used);

  return (
    <>
      <AppNav />
      <div className="dashboard-layout">
        <AppSidebar />
        <main className="main-content">
          <div style={{ marginBottom: 32 }}>
            <span className="eyebrow">Darčekové poukazy</span>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(36px, 4vw, 52px)', lineHeight: 1, letterSpacing: '-0.02em', margin: '8px 0 4px', fontWeight: 400 }}>
              Premeňte kredity<br />na <em style={{ fontStyle: 'italic', color: 'var(--accent-ink)' }}>sedenie.</em>
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>
              Dostupné kredity: <strong style={{ color: 'var(--ink)', fontFamily: 'var(--serif)', fontSize: 18 }}>{user.credits}</strong> kreditov
            </p>
          </div>

          {/* Generator */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 48 }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 20 }}>
                Generovať nový kód
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 10 }}>Platforma</label>
                <div style={{ display: 'flex', gap: 0, border: '1px solid var(--rule-2)' }}>
                  {PARTNERS.map((p) => (
                    <button key={p} onClick={() => setPartner(p)}
                      style={{ flex: 1, padding: '12px 0', fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 500, background: partner === p ? 'var(--ink)' : 'var(--paper)', color: partner === p ? 'var(--bg)' : 'var(--ink)', border: 'none', borderRight: p !== 'Mojra' ? '1px solid var(--rule-2)' : 'none', cursor: 'pointer', transition: 'all 0.15s' }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 10 }}>Hodnota kódu (v kreditoch)</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  {[50, 60, 70, 80].map((a) => (
                    <button key={a} onClick={() => setAmount(a)}
                      style={{ flex: 1, padding: '10px 0', fontFamily: 'var(--mono)', fontSize: 12, background: amount === a ? 'var(--ink)' : 'var(--paper)', color: amount === a ? 'var(--bg)' : 'var(--ink)', border: '1px solid var(--rule-2)', cursor: 'pointer', transition: 'all 0.15s' }}>
                      {a} kr.
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '10px 14px', background: 'var(--paper)', border: '1px solid var(--rule-2)' }}>
                  <input type="number" min="10" max={user.credits} step="5" value={amount}
                    onChange={(e) => setAmount(Math.max(10, Math.min(user.credits, Number(e.target.value) || 0)))}
                    style={{ flex: 1, border: 'none', background: 'transparent', fontFamily: 'var(--serif)', fontSize: 28, color: 'var(--ink)', outline: 'none' }} />
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>kreditov</span>
                </div>
              </div>

              {error && <div className="status-bar error" style={{ marginBottom: 16 }}>⚠ {error}</div>}

              <div style={{ padding: '12px 16px', background: 'var(--accent-tint)', border: '1px solid var(--accent)', fontSize: 13, color: 'var(--accent-ink)', marginBottom: 16 }}>
                Zostatok po generovaní: <strong style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>{Math.max(0, user.credits - amount)}</strong> kreditov
              </div>

              <button onClick={generate} disabled={generating || user.credits < amount}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', borderRadius: 0, opacity: (generating || user.credits < amount) ? 0.6 : 1 }}>
                {generating ? 'Generujem kód…' : `Generovať kód pre ${partner} →`}
              </button>

              {newCode && (
                <div style={{ marginTop: 20, padding: '20px', border: '1px solid var(--ink)', background: 'var(--paper)' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-ink)', marginBottom: 8 }}>
                    ✓ Kód vygenerovaný
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 22, letterSpacing: '0.2em', padding: '12px 0', borderTop: '1px dashed var(--rule-2)', borderBottom: '1px dashed var(--rule-2)', textAlign: 'center', margin: '8px 0' }}>
                    {newCode}
                  </div>
                  <button onClick={() => copyCode(newCode)}
                    style={{ width: '100%', padding: '10px', background: 'none', border: '1px solid var(--rule-2)', fontFamily: 'var(--mono)', fontSize: 12, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginTop: 8 }}>
                    Kopírovať kód
                  </button>
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.5 }}>
                    Uplatnite na {partner === 'Hedepy' ? 'hedepy.sk' : partner === 'Ksebe' ? 'ksebe.sk' : 'mojra.sk'} pri rezervácii. Platnosť 12 mesiacov.
                  </div>
                </div>
              )}

              {user.credits < SESSION_COST && (
                <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--bg-2)', border: '1px solid var(--rule-2)', fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
                  Chýba vám {SESSION_COST - user.credits} kreditov na sedenie.{' '}
                  <a href="/dokup" style={{ color: 'var(--accent-ink)', textDecoration: 'underline' }}>Dokúpte ich tu →</a>
                </div>
              )}
            </div>

            {/* Preview voucher */}
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 20 }}>
                Náhľad
              </div>
              <div className="voucher" style={{ maxWidth: 340 }}>
                <div className="v-head">
                  <span className="num">Darčekový kód</span>
                  <span className="num">Teraplan</span>
                </div>
                <div>
                  <div className="v-partner">→ {partner}.{partner === 'Hedepy' ? 'sk' : 'sk'}</div>
                  <div className="v-amount">{amount}<sup>€</sup></div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>1 sedenie · uplatnenie pri rezervácii</div>
                </div>
                <div>
                  <div className="v-code">{newCode || 'TP—XXXX—XXXX'}</div>
                  <div className="v-foot">
                    <span>Platnosť 12 mes.</span>
                    <span>Z kreditov: {amount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active vouchers */}
          {activeVouchers.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 16 }}>
                Aktívne kódy ({activeVouchers.length})
              </div>
              <div className="voucher-grid">
                {activeVouchers.map((v) => (
                  <div key={v.id} className="voucher-card">
                    <div className="vc-partner">→ {v.partner}</div>
                    <div className="vc-amount">{v.amount}<sup style={{ fontSize: 18 }}>€</sup></div>
                    <div className="vc-code">{v.code}</div>
                    <div className="vc-meta" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Platí do {v.expiresAt}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                      <button onClick={() => copyCode(v.code)}
                        style={{ flex: 1, padding: '8px 0', border: '1px solid var(--rule-2)', background: 'none', fontFamily: 'var(--mono)', fontSize: 11, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)' }}>
                        Kopírovať
                      </button>
                      <button onClick={() => markUsed(v.id)}
                        style={{ flex: 1, padding: '8px 0', border: '1px solid var(--rule-2)', background: 'none', fontFamily: 'var(--mono)', fontSize: 11, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)' }}>
                        Označiť použitý
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Used vouchers */}
          {usedVouchers.length > 0 && (
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 16 }}>
                Použité kódy ({usedVouchers.length})
              </div>
              <div className="voucher-grid">
                {usedVouchers.map((v) => (
                  <div key={v.id} className="voucher-card used">
                    <div className="vc-partner">→ {v.partner}</div>
                    <div className="vc-amount">{v.amount}<sup style={{ fontSize: 18 }}>€</sup></div>
                    <div className="vc-code">{v.code}</div>
                    <div className="vc-meta">Použitý · {v.createdAt}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
      <MobileNav />
    </>
  );
}

export default function VouchersPage() {
  return (
    <Suspense fallback={null}>
      <VouchersContent />
    </Suspense>
  );
}
