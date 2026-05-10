'use client';
import { useState, useEffect } from 'react';
import Brand from '@/components/Brand';

const KNOWN_PARTNERS = [
  { id: 'hedepy', name: 'Hedepy' },
  { id: 'ksebe',  name: 'Ksebe' },
  { id: 'mojra',  name: 'Mojra' },
];

type Stat = { partnerId: string; partnerName: string; available: number; claimed: number; used: number };
type Voucher = { id: string; partnerId: string; partnerName: string; code: string; amount: number; used: boolean; claimedAt: string | null; createdAt: string; user: { name: string; email: string } | null };

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');

  const [stats, setStats] = useState<Stat[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);

  const [partner, setPartner] = useState(KNOWN_PARTNERS[0].id);
  const [partnerName, setPartnerName] = useState(KNOWN_PARTNERS[0].name);
  const [amount, setAmount] = useState(60);
  const [codesText, setCodesText] = useState('');
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState('');

  const [filterPartner, setFilterPartner] = useState('all');

  const headers = { 'Content-Type': 'application/json', 'x-admin-password': password };

  const load = async (pw = password) => {
    setLoading(true);
    const res = await fetch('/api/admin/vouchers', { headers: { 'x-admin-password': pw } });
    if (res.status === 401) { setAuthed(false); setAuthError('Nesprávne heslo.'); setLoading(false); return; }
    const data = await res.json();
    setStats(data.stats || []);
    setVouchers(data.vouchers || []);
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const res = await fetch('/api/admin/vouchers', { headers: { 'x-admin-password': password } });
    if (res.status === 401) { setAuthError('Nesprávne heslo.'); return; }
    const data = await res.json();
    setStats(data.stats || []);
    setVouchers(data.vouchers || []);
    setAuthed(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setAddMsg('');
    const codes = codesText.split('\n').map(c => c.trim()).filter(Boolean);
    if (codes.length === 0) { setAddMsg('Žiadne kódy.'); setAdding(false); return; }

    const res = await fetch('/api/admin/vouchers', {
      method: 'POST',
      headers,
      body: JSON.stringify({ partnerId: partner, partnerName, amount, codes }),
    });
    const data = await res.json();
    setAdding(false);
    if (!res.ok) { setAddMsg(`Chyba: ${data.error}`); return; }
    setAddMsg(`✓ Pridaných ${data.added} kódov`);
    setCodesText('');
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Vymazať kód?')) return;
    await fetch('/api/admin/vouchers', { method: 'DELETE', headers, body: JSON.stringify({ id }) });
    load();
  };

  const filtered = filterPartner === 'all' ? vouchers : vouchers.filter(v => v.partnerId === filterPartner);

  if (!authed) {
    return (
      <div className="auth-wrap">
        <div className="auth-left">
          <Brand dark />
          <p style={{ fontFamily: 'var(--serif)', fontSize: 28, lineHeight: 1.2, letterSpacing: '-0.02em', margin: 0 }}>
            Admin panel
          </p>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            © 2026 Teraplan s.r.o.
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-form">
            <span className="eyebrow" style={{ display: 'block', marginBottom: 20 }}>Teraplan Admin</span>
            <h1>Prístup</h1>
            {authError && <div className="status-bar error" style={{ marginBottom: 16 }}>⚠ {authError}</div>}
            <form onSubmit={handleLogin}>
              <div className="field">
                <label>Admin heslo</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoFocus />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', borderRadius: 0 }}>
                Prihlásiť sa →
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 48px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
          <div>
            <span className="eyebrow">Teraplan Admin</span>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 40, letterSpacing: '-0.02em', margin: '8px 0 0', fontWeight: 400 }}>
              Správa kódov
            </h1>
          </div>
          <button onClick={() => setAuthed(false)} style={{ padding: '8px 16px', border: '1px solid var(--rule-2)', background: 'none', fontFamily: 'var(--mono)', fontSize: 11, cursor: 'pointer', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Odhlásiť
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 48 }}>
          {stats.map(s => (
            <div key={s.partnerId} style={{ padding: '20px 24px', border: '1px solid var(--rule-2)', background: 'var(--paper)' }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22, letterSpacing: '-0.01em', marginBottom: 12 }}>{s.partnerName}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <div>
                  <div style={{ fontSize: 24, fontFamily: 'var(--serif)', color: 'var(--accent-ink)', letterSpacing: '-0.01em' }}>{s.available}</div>
                  <div style={{ color: 'var(--muted)', marginTop: 2 }}>Voľné</div>
                </div>
                <div>
                  <div style={{ fontSize: 24, fontFamily: 'var(--serif)', letterSpacing: '-0.01em' }}>{s.claimed}</div>
                  <div style={{ color: 'var(--muted)', marginTop: 2 }}>Vyplatené</div>
                </div>
                <div>
                  <div style={{ fontSize: 24, fontFamily: 'var(--serif)', color: 'var(--muted)', letterSpacing: '-0.01em' }}>{s.used}</div>
                  <div style={{ color: 'var(--muted)', marginTop: 2 }}>Použité</div>
                </div>
              </div>
            </div>
          ))}
          {stats.length === 0 && (
            <div style={{ padding: '20px 24px', border: '1px dashed var(--rule-2)', color: 'var(--muted)', fontSize: 14 }}>
              Žiadne kódy v systéme.
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 48 }}>
          {/* Add codes form */}
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 20 }}>
              Pridať kódy
            </div>
            <form onSubmit={handleAdd}>
              <div className="field">
                <label>Partner</label>
                <select value={partner} onChange={e => {
                  setPartner(e.target.value);
                  setPartnerName(KNOWN_PARTNERS.find(p => p.id === e.target.value)?.name || e.target.value);
                }}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--rule-2)', background: 'var(--paper)', fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink)', appearance: 'none' }}>
                  {KNOWN_PARTNERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Cena v kreditoch</label>
                <input type="number" min="10" max="500" step="5" value={amount}
                  onChange={e => setAmount(Number(e.target.value))} required />
              </div>
              <div className="field">
                <label>Kódy (jeden riadok = jeden kód)</label>
                <textarea value={codesText} onChange={e => setCodesText(e.target.value)}
                  placeholder={'ABC123\nXYZ789\n...'}
                  rows={8} required
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--rule-2)', background: 'var(--paper)', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink)', resize: 'vertical', boxSizing: 'border-box' }} />
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                  {codesText.split('\n').filter(l => l.trim()).length} kódov
                </div>
              </div>
              {addMsg && <div className="status-bar success" style={{ marginBottom: 12 }}>{addMsg}</div>}
              <button type="submit" disabled={adding} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', borderRadius: 0 }}>
                {adding ? 'Pridávam…' : 'Pridať kódy →'}
              </button>
            </form>
          </div>

          {/* Voucher list */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)' }}>
                Kódy ({filtered.length})
              </div>
              <select value={filterPartner} onChange={e => setFilterPartner(e.target.value)}
                style={{ padding: '6px 12px', border: '1px solid var(--rule-2)', background: 'var(--paper)', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer' }}>
                <option value="all">Všetci partneri</option>
                {KNOWN_PARTNERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={{ border: '1px solid var(--rule)', borderBottom: 'none', maxHeight: 600, overflowY: 'auto' }}>
              {filtered.slice(0, 100).map(v => (
                <div key={v.id} style={{ display: 'grid', gridTemplateColumns: '80px 100px 1fr 140px 80px', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--rule)', alignItems: 'center', fontSize: 13, opacity: v.used ? 0.4 : 1 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {v.partnerName}
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{v.amount} kr.</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.1em' }}>{v.code}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                    {v.used ? `Použitý` : v.userId ? `Vyplatený · ${v.user?.name || ''}` : 'Voľný'}
                  </span>
                  {!v.userId && (
                    <button onClick={() => handleDelete(v.id)}
                      style={{ padding: '4px 10px', border: '1px solid var(--rule-2)', background: 'none', fontFamily: 'var(--mono)', fontSize: 10, cursor: 'pointer', color: '#8b3232', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Zmazať
                    </button>
                  )}
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ padding: '24px 16px', color: 'var(--muted)', fontSize: 14, borderBottom: '1px solid var(--rule)' }}>
                  Žiadne kódy.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
