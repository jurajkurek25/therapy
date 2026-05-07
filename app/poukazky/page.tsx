'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import AppNav from '@/components/AppNav';
import AppSidebar from '@/components/AppSidebar';
import MobileNav from '@/components/MobileNav';
import {
  isLoggedIn, getUser, saveUser, getVouchers, saveVouchers, getTransactions, saveTransactions,
  generateCode, addMonths, isSosEligible, SOS_LIMIT,
  type Voucher, type Partner, type User, type Transaction,
} from '@/lib/store';

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
  const [newCodeSos, setNewCodeSos] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/prihlasenie'); return; }
    setUser(getUser());
    setVouchers(getVouchers());
    const p = searchParams.get('partner') as Partner | null;
    if (p && PARTNERS.includes(p)) setPartner(p);
  }, [router, searchParams]);

  const doGenerate = async (useSos = false) => {
    if (!user) return;
    setError('');

    if (useSos) {
      if (!isSosEligible(user)) return;
      if (user.sosDebt > 0) { setError('Máte nesplatený SOS dlh. Počkajte na jeho uhradenie.'); return; }
    } else {
      if (user.credits < amount) {
        setError(`Nemáte dostatok kreditov. Chýba vám ${amount - user.credits} kreditov.`);
        return;
      }
    }

    setGenerating(true);
    await new Promise((r) => setTimeout(r, 800));
    const code = generateCode();
    const today = new Date().toISOString().slice(0, 10);
    const sessionAmount = useSos ? SOS_LIMIT : amount;

    const newVoucher: Voucher = {
      id: Date.now().toString(),
      code,
      partner,
      amount: sessionAmount,
      createdAt: today,
      expiresAt: addMonths(today, 12),
      used: false,
    };

    let updatedUser: User;
    let tx: Transaction;

    if (useSos) {
      updatedUser = { ...user, sosDebt: SOS_LIMIT };
      tx = {
        id: Date.now().toString(),
        date: today,
        description: `SOS Kód → ${partner} · sedenie na dlh`,
        delta: -SOS_LIMIT,
        balance: user.credits, // credits unchanged, debt added
        type: 'debit',
      };
    } else {
      const newCredits = user.credits - amount;
      updatedUser = { ...user, credits: newCredits };
      tx = {
        id: Date.now().toString(),
        date: today,
        description: `Kód → ${partner} · sedenie`,
        delta: -amount,
        balance: newCredits,
        type: 'debit',
      };
    }

    const updatedVouchers = [...vouchers, newVoucher];
    saveUser(updatedUser);
    saveVouchers(updatedVouchers);
    saveTransactions([...getTransactions(), tx]);
    setUser(updatedUser);
    setVouchers(updatedVouchers);
    setNewCode(code);
    setNewCodeSos(useSos);
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

  const sosEligible = isSosEligible(user);
  const notEnough = user.credits < amount;
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
              Dostupné kredity:{' '}
              <strong style={{ color: user.credits < 0 ? 'var(--accent-ink)' : 'var(--ink)', fontFamily: 'var(--serif)', fontSize: 18 }}>
                {user.credits}
              </strong>{' '}
              kreditov
              {user.sosDebt > 0 && (
                <span style={{ marginLeft: 12, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent-ink)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  · SOS dlh: −{user.sosDebt} kr.
                </span>
              )}
            </p>
          </div>

          {/* Generator */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 48 }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 20 }}>
                Generovať nový kód
              </div>

              {/* Platform picker */}
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

              {/* Amount picker */}
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
                  <input type="number" min="10" max="200" step="5" value={amount}
                    onChange={(e) => setAmount(Math.max(10, Number(e.target.value) || 10))}
                    style={{ flex: 1, border: 'none', background: 'transparent', fontFamily: 'var(--serif)', fontSize: 28, color: 'var(--ink)', outline: 'none' }} />
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>kreditov</span>
                </div>
              </div>

              {error && <div className="status-bar error" style={{ marginBottom: 16 }}>⚠ {error}</div>}

              {/* Balance preview */}
              {!notEnough ? (
                <div style={{ padding: '12px 16px', background: 'var(--accent-tint)', border: '1px solid var(--accent)', fontSize: 13, color: 'var(--accent-ink)', marginBottom: 16 }}>
                  Zostatok po generovaní:{' '}
                  <strong style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>{user.credits - amount}</strong> kreditov
                </div>
              ) : (
                <div style={{ padding: '12px 16px', background: 'var(--bg-2)', border: '1px solid var(--rule-2)', fontSize: 13, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.55 }}>
                  Chýba vám <strong>{amount - user.credits}</strong> kreditov.{' '}
                  <a href="/dokup" style={{ color: 'var(--accent-ink)', textDecoration: 'underline' }}>Dokúpiť →</a>
                </div>
              )}

              {/* Primary generate button */}
              <button
                onClick={() => doGenerate(false)}
                disabled={generating || notEnough}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', borderRadius: 0, opacity: (generating || notEnough) ? 0.45 : 1 }}>
                {generating ? 'Generujem kód…' : `Generovať kód pre ${partner} →`}
              </button>

              {/* SOS button — shown only when not enough credits */}
              {notEnough && (
                <div style={{ marginTop: 12 }}>
                  {sosEligible && user.sosDebt === 0 ? (
                    <div style={{ border: '1px solid var(--ink)', background: 'var(--ink)', color: 'var(--bg)' }}>
                      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: 4 }}>
                          ✓ SOS Mínus dostupné
                        </div>
                        <div style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.5 }}>
                          Chýba vám <strong>{amount - user.credits} kreditov</strong>, ale máte odomknutý SOS Mínus.
                          Idete do záporného zostatku o {SOS_LIMIT} kreditov — dlh sa automaticky spláca z predplatného.
                        </div>
                      </div>
                      <button
                        onClick={() => doGenerate(true)}
                        disabled={generating}
                        style={{ width: '100%', padding: '14px', background: 'var(--accent)', color: 'var(--ink)', border: 'none', fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}>
                        {generating ? 'Generujem…' : `SOS: Sedenie na dlh → ${partner}`}
                      </button>
                    </div>
                  ) : sosEligible === false && user.memberMonths < 3 ? (
                    <div style={{ padding: '12px 16px', border: '1px dashed var(--rule-2)', fontSize: 13, color: 'var(--muted)', lineHeight: 1.55 }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>
                        SOS Mínus · zamknuté
                      </span>
                      Odomkne sa po {3 - user.memberMonths} {3 - user.memberMonths === 1 ? 'mesiaci' : 'mesiacoch'} lojality. Zatiaľ{' '}
                      <a href="/dokup" style={{ color: 'var(--accent-ink)', textDecoration: 'underline' }}>dokúpte kredity →</a>
                    </div>
                  ) : user.sosDebt > 0 ? (
                    <div style={{ padding: '12px 16px', border: '1px dashed var(--rule-2)', fontSize: 13, color: 'var(--muted)', lineHeight: 1.55 }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>
                        SOS Mínus · splácate dlh
                      </span>
                      Váš SOS dlh {user.sosDebt} kr. sa spláca z predplatného. Ďalší SOS kód bude dostupný po úplnom splatení.
                    </div>
                  ) : null}
                </div>
              )}

              {/* Generated code result */}
              {newCode && (
                <div style={{ marginTop: 20, padding: '20px', border: `1px solid ${newCodeSos ? 'var(--accent-ink)' : 'var(--ink)'}`, background: 'var(--paper)' }}>
                  {newCodeSos && (
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-ink)', marginBottom: 8, padding: '6px 10px', background: 'var(--accent-tint)', border: '1px solid var(--accent)' }}>
                      SOS kód · dlh −{SOS_LIMIT} kr. sa spláca automaticky
                    </div>
                  )}
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
            </div>

            {/* Preview voucher */}
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 20 }}>
                Náhľad
              </div>
              <div className="voucher" style={{ maxWidth: 340 }}>
                <div className="v-head">
                  <span className="num">Darčekový kód{newCodeSos ? ' · SOS' : ''}</span>
                  <span className="num">Teraplan</span>
                </div>
                <div>
                  <div className="v-partner">→ {partner}.sk</div>
                  <div className="v-amount">{newCodeSos ? SOS_LIMIT : amount}<sup>€</sup></div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    1 sedenie · uplatnenie pri rezervácii
                  </div>
                </div>
                <div>
                  <div className="v-code">{newCode || 'TP—XXXX—XXXX'}</div>
                  <div className="v-foot">
                    <span>Platnosť 12 mes.</span>
                    <span>{newCodeSos ? 'SOS dlh' : `Z kreditov: ${amount}`}</span>
                  </div>
                </div>
              </div>

              {/* SOS info card */}
              {sosEligible && user.sosDebt === 0 && (
                <div style={{ marginTop: 16, padding: '16px', border: '1px solid var(--ink)', background: 'var(--ink)', color: 'var(--bg)' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: 8 }}>
                    ✓ SOS Mínus aktívny
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.55 }}>
                    Ak nemáte dosť kreditov, môžete ísť do záporného zostatku o {SOS_LIMIT} kreditov. Dlh sa spláca z ďalšieho predplatného.
                  </div>
                </div>
              )}
              {!sosEligible && user.sosDebt === 0 && (
                <div style={{ marginTop: 16, padding: '16px', border: '1px dashed var(--rule-2)', fontSize: 13, color: 'var(--muted)', lineHeight: 1.55 }}>
                  <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: 4 }}>SOS Mínus</strong>
                  Záchranné koleso pre krízové momenty. Odomkne sa po {3 - user.memberMonths} {3 - user.memberMonths === 1 ? 'mesiaci' : 'mesiacoch'} lojality.
                </div>
              )}
              {user.sosDebt > 0 && (
                <div style={{ marginTop: 16, padding: '16px', border: '1px solid var(--accent)', background: 'var(--accent-tint)' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-ink)', marginBottom: 6 }}>
                    SOS dlh: −{user.sosDebt} kr.
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--accent-ink)', lineHeight: 1.55 }}>
                    Váš dlh sa automaticky spláca z mesačného predplatného. Ďalší SOS kód bude dostupný po splatení.
                  </div>
                </div>
              )}
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
