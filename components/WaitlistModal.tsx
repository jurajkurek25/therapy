'use client';
import { useState, useEffect } from 'react';

export default function WaitlistModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    try {
      const url = 'https://docs.google.com/forms/d/e/1FAIpQLScpufBINHDezdEymlN8xvoQlqWO-uHpNPXgBjijgnVOhewHSQ/formResponse';
      const body = new FormData();
      body.append('entry.375531769', email);
      await fetch(url, { method: 'POST', mode: 'no-cors', body });
    } catch (_) {}
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="wl-overlay" onClick={onClose}>
      <div className="wl-panel" onClick={(e) => e.stopPropagation()}>
        <button className="wl-close" onClick={onClose} aria-label="Zavrieť">×</button>
        {!submitted ? (
          <>
            <div className="eyebrow">TP—WAITLIST</div>
            <h2 className="wl-heading">Ešte sme<br /><em>nespustili.</em></h2>
            <p className="wl-body">
              Teraplan sa chystá spustiť. Zanechajte nám e-mail — ozveme sa vám ako prví s prístupom a informáciou o štarte.
            </p>
            <form className="wl-form" onSubmit={handleSubmit}>
              <input
                className="wl-input"
                type="email"
                placeholder="vas@email.sk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
              <button type="submit" className="btn btn-primary wl-submit" disabled={loading}>
                {loading ? 'Odosielam…' : 'Dajte mi vedieť →'}
              </button>
            </form>
            <p className="wl-note">Žiadny spam. Jeden e-mail keď spustíme.</p>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-ink)', marginBottom: 8 }}>
              <span className="live-dot" />Zapísané
            </div>
            <h2 className="wl-heading">Ozveme<br /><em>sa vám.</em></h2>
            <p className="wl-body">Dostali sme váš e-mail. Hneď ako Teraplan spustí, budete prví, ktorí sa dozvedia.</p>
            <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={onClose}>Zavrieť</button>
          </>
        )}
      </div>
    </div>
  );
}
