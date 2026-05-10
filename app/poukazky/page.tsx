'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import AppNav from '@/components/AppNav';
import AppSidebar from '@/components/AppSidebar';
import MobileNav from '@/components/MobileNav';

const SOS_LIMIT = 60;

type CatalogItem = { partnerId: string; partnerName: string; amount: number; stock: number };
type Voucher = { id: string; partnerId: string; partnerName: string; code: string; amount: number; used: boolean; claimedAt: string; createdAt: string };

function VouchersContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [selected, setSelected] = useState<CatalogItem | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [newCode, setNewCode] = useState<{ code: string; partner: string; amount: number; sos: boolean } | null>(null);
  const [error, setError] = useState('');

  const loadAll = async () => {
    const [uRes, cRes] = await Promise.all([
      fetch('/api/user'),
      fetch('/api/voucher'),
    ]);
    const uData = await uRes.json();
    const cData = await cRes.json();
    setUser(uData);
    setCatalog(cData.catalog || []);
    if (!selected && cData.catalog?.length > 0) setSelected(cData.catalog[0]);
  };

  useEffect(() => {
    if (status === 'authenticated') loadAll();
  }, [status]);

  useEffect(() => {
    const p = searchParams.get('partner');
    if (p && catalog.length > 0) {
      const match = catalog.find(c => c.partnerId === p.toLowerCase());
      if (match) setSelected(match);
    }
  }, [searchParams, catalog]);

  const doClaim = async (useSos = false) => {
    if (!selected || claiming) return;
    setError('');
    setClaiming(true);
    const res = await fetch('/api/voucher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partnerId: selected.partnerId, amount: selected.amount, useSos }),
    });
    const data = await res.json();
    setClaiming(false);
    if (!res.ok) { setError(data.error); return; }
    setNewCode({ code: data.code, partner: selected.partnerName, amount: data.amount, sos: data.sos });
    await loadAll();
  };

  const markUsed = async (id: string) => {
    await fetch('/api/voucher', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voucherId: id }),
    });
    await loadAll();
  };

  const copyCode = (code: string) => navigator.clipboard.writeText(code).catch(() => {});
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('sk-SK');

  if (status === 'loading' || !user) return null;

  const sosEligible = user.memberMonths >= 3 && user.sosDebt === 0;
  const notEnough = selected ? user.credits < selected.amount : false;
  const noStock = selected ? selected.stock === 0 : true;
  const myVouchers: Voucher[] = user.vouchers || [];
  const activeVouchers = myVouchers.filter(v => !v.used);
  const usedVouchers = myVouchers.filter(v => v.used);

  const partnerUrl = (id: string) =>
    id === 'hedepy' ? 'hedepy.sk' : id === 'ksebe' ? 'ksebe.sk' : id === 'mojra' ? 'mojra.sk' : `${id}.sk`;

  return (
    <>
      <AppNav credits={user.credits} />
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
              <strong style={{ color: 'var(--ink)', fontFamily: 'var(--serif)', fontSize: 18 }}>{user.credits}</strong> kreditov
              {user.sosDebt > 0 && (
                <span style={{ marginLeft: 12, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent-ink)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  · SOS dlh: −{user.sosDebt} kr.
                </span>
              )}
            </p>
          </div>

          {catalog.length === 0 ? (
            <div style={{ padding: '32px', border: '1px dashed var(--rule-2)', color: 'var(--muted)', fontSize: 14, marginBottom: 48, textAlign: 'center' }}>
              Momentálne nie sú k dispozícii žiadne poukazy. Skúste neskôr.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 48 }}>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 20 }}>
                  Dostupné poukazy
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {catalog.map(item => (
                    <button key={`${item.partnerId}:${item.amount}`}
                      onClick={() => { setSelected(item); setNewCode(null); setError(''); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', textAlign: 'left',
                        border: `1px solid ${selected?.partnerId === item.partnerId && selected?.amount === item.amount ? 'var(--ink)' : 'var(--rule-2)'}`,
                        background: selected?.partnerId === item.partnerId && selected?.amount === item.amount ? 'var(--paper)' : 'transparent',
                        cursor: 'pointer', transition: 'all 0.15s',
                        opacity: item.stock === 0 ? 0.5 : 1,
                      }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--serif)', fontSize: 20, letterSpacing: '-0.01em' }}>{item.partnerName}</div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                          → {partnerUrl(item.partnerId)}
                          {' · '}
                          <span style={{ color: item.stock > 0 ? 'var(--accent-ink)' : 'inherit' }}>
                            {item.stock > 0 ? `${item.stock} dostupných` : 'Vypredané'}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>{item.amount}</div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>kreditov</div>
                      </div>
                    </button>
                  ))}
                </div>

                {selected && (
                  <>
                    {error && <div className="status-bar error" style={{ marginBottom: 16 }}>⚠ {error}</div>}

                    {noStock ? (
                      <div style={{ padding: '12px 16px', background: 'var(--bg-2)', border: '1px solid var(--rule-2)', fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
                        Tento poukaz je momentálne vypredaný.
                      </div>
                    ) : !notEnough ? (
                      <div style={{ padding: '12px 16px', background: 'var(--accent-tint)', border: '1px solid var(--accent)', fontSize: 13, color: 'var(--accent-ink)', marginBottom: 16 }}>
                        Zostatok po vyplatení: <strong style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>{user.credits - selected.amount}</strong> kreditov
                      </div>
                    ) : (
                      <div style={{ padding: '12px 16px', background: 'var(--bg-2)', border: '1px solid var(--rule-2)', fontSize: 13, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.55 }}>
                        Chýba vám <strong>{selected.amount - user.credits}</strong> kreditov.{' '}
                        <a href="/dokup" style={{ color: 'var(--accent-ink)', textDecoration: 'underline' }}>Dokúpiť →</a>
                      </div>
                    )}

                    <button onClick={() => doClaim(false)} disabled={claiming || notEnough || noStock}
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center', borderRadius: 0, opacity: (claiming || notEnough || noStock) ? 0.45 : 1 }}>
                      {claiming ? 'Vyplácam kód…' : `Vymeniť za kód → ${selected.partnerName}`}
                    </button>

                    {notEnough && !noStock && (
                      <div style={{ marginTop: 12 }}>
                        {sosEligible ? (
                          <div style={{ border: '1px solid var(--ink)', background: 'var(--ink)', color: 'var(--bg)' }}>
                            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
                              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: 4 }}>
                                ✓ SOS Mínus dostupné
                              </div>
                              <div style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.5 }}>
                                Chýba vám <strong>{selected.amount - user.credits} kreditov</strong>, ale máte odomknutý SOS Mínus.
                                Idete do záporného zostatku o {SOS_LIMIT} kreditov.
                              </div>
                            </div>
                            <button onClick={() => doClaim(true)} disabled={claiming}
                              style={{ width: '100%', padding: '14px', background: 'var(--accent)', color: 'var(--ink)', border: 'none', fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}>
                              {claiming ? 'Vyplácam…' : `SOS: Sedenie na dlh → ${selected.partnerName}`}
                            </button>
                          </div>
                        ) : user.memberMonths < 3 ? (
                          <div style={{ padding: '12px 16px', border: '1px dashed var(--rule-2)', fontSize: 13, color: 'var(--muted)', lineHeight: 1.55 }}>
                            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>
                              SOS Mínus · zamknuté
                            </span>
                            Odomkne sa po {3 - user.memberMonths} {3 - user.memberMonths === 1 ? 'mesiaci' : 'mesiacoch'} lojality.
                          </div>
                        ) : user.sosDebt > 0 ? (
                          <div style={{ padding: '12px 16px', border: '1px dashed var(--rule-2)', fontSize: 13, color: 'var(--muted)', lineHeight: 1.55 }}>
                            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>
                              SOS Mínus · splácate dlh
                            </span>
                            Dlh {user.sosDebt} kr. sa spláca z predplatného.
                          </div>
                        ) : null}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 20 }}>
                  Náhľad
                </div>
                {newCode ? (
                  <div style={{ padding: '24px', border: `1px solid ${newCode.sos ? 'var(--accent-ink)' : 'var(--ink)'}`, background: 'var(--paper)' }}>
                    {newCode.sos && (
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-ink)', marginBottom: 10, padding: '6px 10px', background: 'var(--accent-tint)', border: '1px solid var(--accent)' }}>
                        SOS kód · dlh −{SOS_LIMIT} kr. sa spláca automaticky
                      </div>
                    )}
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-ink)', marginBottom: 8 }}>
                      ✓ Kód vyplatený
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      → {selected ? partnerUrl(selected.partnerId) : ''}
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 22, letterSpacing: '0.15em', padding: '14px 0', borderTop: '1px dashed var(--rule-2)', borderBottom: '1px dashed var(--rule-2)', textAlign: 'center', margin: '10px 0', wordBreak: 'break-all' }}>
                      {newCode.code}
                    </div>
                    <button onClick={() => copyCode(newCode.code)}
                      style={{ width: '100%', padding: '10px', background: 'none', border: '1px solid var(--rule-2)', fontFamily: 'var(--mono)', fontSize: 12, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginTop: 8 }}>
                      Kopírovať kód
                    </button>
                    <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.5 }}>
                      Uplatnite na {selected ? partnerUrl(selected.partnerId) : ''} pri rezervácii.
                    </div>
                  </div>
                ) : (
                  <div className="voucher" style={{ maxWidth: 340, opacity: 0.6 }}>
                    <div className="v-head">
                      <span className="num">Darčekový kód</span>
                      <span className="num">Teraplan</span>
                    </div>
                    <div>
                      <div className="v-partner">→ {selected ? partnerUrl(selected.partnerId) : '...'}</div>
                      <div className="v-amount">{selected?.amount ?? '–'}<sup>kr.</sup></div>
                    </div>
                    <div>
                      <div className="v-code">– – – – – – –</div>
                      <div className="v-foot"><span>Platnosť 12 mes.</span><span>1 kr. = 1 €</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeVouchers.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 16 }}>
                Aktívne kódy ({activeVouchers.length})
              </div>
              <div className="voucher-grid">
                {activeVouchers.map((v: Voucher) => (
                  <div key={v.id} className="voucher-card">
                    <div className="vc-partner">→ {v.partnerName}</div>
                    <div className="vc-amount">{v.amount}<sup style={{ fontSize: 18 }}>kr.</sup></div>
                    <div className="vc-code" style={{ wordBreak: 'break-all' }}>{v.code}</div>
                    <div className="vc-meta">{fmtDate(v.claimedAt || v.createdAt)}</div>
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

          {usedVouchers.length > 0 && (
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 16 }}>
                Použité kódy ({usedVouchers.length})
              </div>
              <div className="voucher-grid">
                {usedVouchers.map((v: Voucher) => (
                  <div key={v.id} className="voucher-card used">
                    <div className="vc-partner">→ {v.partnerName}</div>
                    <div className="vc-amount">{v.amount}<sup style={{ fontSize: 18 }}>kr.</sup></div>
                    <div className="vc-code" style={{ wordBreak: 'break-all' }}>{v.code}</div>
                    <div className="vc-meta">Použitý · {fmtDate(v.claimedAt || v.createdAt)}</div>
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
