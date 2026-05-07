'use client';
import { useState } from 'react';
import WaitlistModal from './WaitlistModal';

const PLANS = [
  {
    name: 'Štart', tag: 'Pre tých, ktorí chcú začať postupne.', monthly: 9,
    feats: [
      ['9 kreditov mesačne (1 € = 1 kredit)', true],
      ['Kumulujú sa, neprepadávajú', false],
      ['AI poradca pre výber terapeuta', false],
      ['Kódy pre Hedepy, Ksebe a Mojra', false],
      ['E-mailová podpora', false],
      ['Dokup kreditov kedykoľvek', false],
    ],
    cta: 'Začať so Štartom',
  },
  {
    name: 'Stabilita', tag: 'Sedenie každé dva mesiace bez dokupu.', monthly: 30, featured: true,
    feats: [
      ['30 kreditov mesačne (1 € = 1 kredit)', true],
      ['Kumulujú sa, neprepadávajú', false],
      ['AI poradca + prioritné odporúčania', true],
      ['Kódy pre Hedepy, Ksebe a Mojra', false],
      ['E-mailová + telefonická podpora', true],
      ['Dokup kreditov kedykoľvek', false],
    ],
    cta: 'Aktivovať Stabilitu',
  },
  {
    name: 'Rytmus', tag: 'Sedenie každý mesiac — pravidelná hygiena.', monthly: 60,
    feats: [
      ['60 kreditov mesačne (1 € = 1 kredit)', true],
      ['Kumulujú sa, neprepadávajú', false],
      ['AI poradca + zmena terapeuta bez čakania', true],
      ['Kódy pre Hedepy, Ksebe a Mojra', false],
      ['Telefonická podpora · prednostne', true],
      ['Dokup kreditov kedykoľvek', false],
    ],
    cta: 'Aktivovať Rytmus',
  },
];
const SERVICE_FEE = 2.90;
const fmt = (n: number) => (Math.round(n * 100) / 100).toFixed(2).replace('.', ',');

export default function PricingSection() {
  const [custom, setCustom] = useState(45);
  const [open, setOpen] = useState(false);
  const presets = [15, 25, 45, 75, 100];

  return (
    <section className="pricing wrap" id="pricing">
      <div className="section-head">
        <h2>Tri plány<br />+ vlastná suma.</h2>
        <div className="section-meta">
          <span className="eyebrow">§ 06 · Plány</span>
          <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: 16, maxWidth: '52ch' }}>
            Každý plán je o tom, koľko mesačne odložíte do peňaženky. Kurz je rovnaký u všetkých: <strong>1 € = 1 kredit</strong>. K nemu servisný poplatok <strong>2,90 €</strong>.
          </p>
        </div>
      </div>

      <div className="pricing-grid">
        {PLANS.map((p) => {
          const total = p.monthly + SERVICE_FEE;
          return (
            <div key={p.name} className={`plan ${p.featured ? 'featured' : ''}`}>
              <div className="plan-head">
                <div className="plan-name">{p.name}</div>
                <p className="plan-tag">{p.tag}</p>
              </div>
              <div className="plan-price">
                <div>
                  <span className="amt">{fmt(total)}</span>
                  <span className="euro"> €</span>
                </div>
                <div className="per">/ mesiac · vrátane všetkého</div>
                <div className="credits">→ {p.monthly} kreditov mesačne</div>
                <div className="plan-breakdown">
                  <div className="row">
                    <span className="label">Do peňaženky <small>1 € = 1 kredit, vaše peniaze</small></span>
                    <span className="val">{p.monthly},00 €</span>
                  </div>
                  <div className="row fee">
                    <span className="label">Servisný poplatok <small>chod platformy, AI, podpora</small></span>
                    <span className="val">+ 2,90 €</span>
                  </div>
                </div>
              </div>
              <ul className="plan-feats">
                {p.feats.map(([label, bold], i) => (
                  <li key={i}><span>{bold ? <strong>{label}</strong> : label}</span></li>
                ))}
              </ul>
              <button className="plan-cta" onClick={() => setOpen(true)}>{p.cta} · {fmt(total)} €/mes.</button>
            </div>
          );
        })}

        {/* Custom plan */}
        <div className="plan custom">
          <div className="plan-head">
            <div className="plan-name">Vlastná suma</div>
            <p className="plan-tag">Nastavte si presne to, čo vám sedí.</p>
          </div>
          <div className="plan-price">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '4px 0 14px' }}>
              <input
                type="number" min="5" max="200" step="1"
                value={custom}
                onChange={(e) => setCustom(Math.max(5, Math.min(200, Number(e.target.value) || 0)))}
                style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.3)', color: 'var(--bg)', fontFamily: 'var(--serif)', fontSize: 56, lineHeight: 1, letterSpacing: '-0.02em', padding: '4px 0', outline: 'none', MozAppearance: 'textfield' } as React.CSSProperties}
              />
              <span style={{ fontFamily: 'var(--serif)', fontSize: 28, opacity: 0.5 }}>€</span>
            </div>
            <input
              type="range" min="5" max="200" step="1" value={custom}
              onChange={(e) => setCustom(Number(e.target.value))}
              style={{ WebkitAppearance: 'none', appearance: 'none', width: '100%', height: 2, background: 'rgba(255,255,255,0.2)', margin: '8px 0 16px', outline: 'none' } as React.CSSProperties}
            />
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              {presets.map((p) => (
                <button key={p} onClick={() => setCustom(p)}
                  style={{ flex: 1, textAlign: 'center', padding: '8px 0', border: `1px solid ${custom === p ? 'var(--accent)' : 'rgba(255,255,255,0.2)'}`, fontFamily: 'var(--mono)', fontSize: 11, color: custom === p ? 'var(--ink)' : 'rgba(255,255,255,0.7)', background: custom === p ? 'var(--accent)' : 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
                  {p} €
                </button>
              ))}
            </div>
            <div className="per" style={{ color: 'rgba(255,255,255,0.6)' }}>/ mesiac · vrátane všetkého</div>
            <div className="credits">→ {custom} kreditov mesačne</div>
            <div className="plan-breakdown">
              <div className="row">
                <span className="label">Do peňaženky <small>1 € = 1 kredit, vaše peniaze</small></span>
                <span className="val">{custom},00 €</span>
              </div>
              <div className="row fee">
                <span className="label">Servisný poplatok <small>chod platformy, AI, podpora</small></span>
                <span className="val">+ 2,90 €</span>
              </div>
            </div>
          </div>
          <ul className="plan-feats">
            <li><span><strong>{custom} kreditov mesačne</strong> (1 € = 1 kredit)</span></li>
            <li><span>Kumulujú sa, neprepadávajú</span></li>
            <li><span>AI poradca pre výber terapeuta</span></li>
            <li><span>Kódy pre Hedepy, Ksebe a Mojra</span></li>
            <li><span>E-mailová + telefonická podpora</span></li>
            <li><span>Zmena sumy kedykoľvek</span></li>
          </ul>
          <button className="plan-cta" onClick={() => setOpen(true)}>Aktivovať za {fmt(custom + SERVICE_FEE)} €/mes.</button>
        </div>
      </div>

      <div className="pricing-foot">
        <div><strong>Prečo 2,90 € servisný poplatok?</strong> Z kreditov nezarábame ani cent — tie sú vaše a putujú 1:1 k terapeutovi. Poplatok platí doménu, server, AI poradcu a ľudskú podporu.</div>
        <div><strong>Sedenie u Hedepy, Ksebe a Mojra stojí ~50–70 € / 50 min.</strong> Pri pláne Stabilita si nasporíte na sedenie každé dva mesiace. Pri Rytme každý mesiac.</div>
        <div><strong>Bez viazanosti, bez prepadu.</strong> Predplatné zrušíte kedykoľvek. Naakumulované kredity ostávajú vaše ďalších 12 mesiacov.</div>
      </div>

      {open && <WaitlistModal onClose={() => setOpen(false)} />}
    </section>
  );
}
