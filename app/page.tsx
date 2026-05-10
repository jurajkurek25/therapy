import PublicNav from '@/components/PublicNav';
import Footer from '@/components/Footer';
import PricingSection from '@/components/PricingSection';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <PublicNav />

      {/* Hero */}
      <header className="hero">
        <div className="wrap">
          <div className="hero-eyebrow-row">
            <span className="eyebrow"><span className="live-dot" />Slovensko · 2026</span>
            <span className="num">TP—001</span>
          </div>
          <div className="hero-grid">
            <div>
              <h1>
                Šetrite na seba.<br />
                <em>1 €</em> mesačne =<br />
                <em>1 kredit</em> na terapiu.
              </h1>
            </div>
            <div>
              <p className="hero-sub">
                Teraplan je predplatné, ktoré z bežného mesačného poplatku tvorí kredity. Z kreditov si zameníte darčekový kód pre Hedepy, Ksebe alebo Mojra a sedenie si rezervujete rovno u partnera. Bez katalógu, bez stresu z výberu.
              </p>
              <div className="hero-cta">
                <Link href="/registracia" className="btn btn-primary">Vybrať plán →</Link>
                <a href="#how" className="btn btn-ghost">Ako to funguje</a>
              </div>
            </div>
          </div>

          {/* Equation */}
          <div className="equation">
            <div className="eq-cell">
              <div className="eq-val">1 €</div>
              <div className="eq-label">zaplatíte</div>
            </div>
            <div className="eq-cell"><span className="eq-op">=</span></div>
            <div className="eq-cell">
              <div className="eq-val">1 kredit</div>
              <div className="eq-label">každý mesiac</div>
            </div>
            <div className="eq-cell"><span className="eq-op">→</span></div>
            <div className="eq-cell">
              <div className="eq-val">Hedepy · Ksebe<br />Mojra</div>
              <div className="eq-label">darčekový kód</div>
            </div>
          </div>

          <div className="hero-meta">
            <div className="stat"><div className="v">1 € = 1 kredit</div><div className="l">priehľadný prepočet</div></div>
            <div className="stat"><div className="v">3 partneri</div><div className="l">Hedepy · Ksebe · Mojra</div></div>
            <div className="stat"><div className="v">AI</div><div className="l">odporučenie terapeuta</div></div>
            <div className="stat"><div className="v">Dokup</div><div className="l">kreditov kedykoľvek</div></div>
          </div>
        </div>
      </header>

      {/* Problem */}
      <section className="problem wrap" id="problem">
        <div className="section-head">
          <h2>Prečo<br /><em className="serif" style={{ fontStyle: 'italic', color: 'var(--accent-ink)' }}>nezačíname.</em></h2>
          <div className="section-meta">
            <span className="eyebrow">§ 01 · Realita</span>
            <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: 16, maxWidth: '52ch' }}>
              Tri prekážky stoja medzi človekom a terapeutom. Žiadna z nich nie je o ochote pomôcť si.
            </p>
          </div>
        </div>
        <div className="problem-grid">
          <div className="problem-cell">
            <div className="num" style={{ marginBottom: 12 }}>01 — Finančný šok</div>
            <div className="big">240 €</div>
            <h4>Cena štyroch sedení.</h4>
            <p>Pre bežný rozpočet zásah, ktorý nedokáže absorbovať zo dňa na deň. Výsledok: odklad pomoci až do bodu, kedy je drahšia.</p>
          </div>
          <div className="problem-cell">
            <div className="num" style={{ marginBottom: 12 }}>02 — Paralýza výberu</div>
            <div className="big">200+</div>
            <h4>Profilov v katalógu.</h4>
            <p>Vybrať terapeuta, keď máte úzkosť, je rovnaké ako vybrať si chirurga počas záchvatu paniky. Nechcete listovať. Chcete usmernenie.</p>
          </div>
          <div className="problem-cell">
            <div className="num" style={{ marginBottom: 12 }}>03 — Dotazníky 0–10</div>
            <div className="big">42 ot.</div>
            <h4>Než začnete.</h4>
            <p>Klikať škály namiesto rozhovoru je únavné a neprirodzené. Potrebujete sa porozprávať, nie vyplniť formulár.</p>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="solution">
        <div className="wrap">
          <div className="solution-grid">
            <div>
              <span className="eyebrow">§ 02 · Riešenie</span>
              <h2 style={{ marginTop: 16 }}>
                Vaša mesačná<br />
                <em style={{ fontStyle: 'italic', color: 'var(--accent-ink)' }}>kreditná peňaženka</em><br />
                pre duševné zdravie.
              </h2>
              <p>
                Vyberiete si plán a každý mesiac vám pribudnú kredity v pomere <strong>1 € = 1 kredit</strong>. Keď chcete sedenie, premeníte kredity na darčekový kód pre <strong>Hedepy</strong>, <strong>Ksebe</strong> alebo <strong>Mojra</strong> a uplatníte ho priamo u nich.
              </p>
              <p style={{ marginTop: 20 }}>
                Ak vám kreditov nestačí na sedenie, ktoré chcete teraz, jednoducho si dokúpite presne toľko, koľko vám chýba. Žiadny minimálny balík, žiadna viazanosť.
              </p>
              <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/registracia" className="btn btn-primary">Začať šetriť →</Link>
                <a href="#partners" className="btn btn-ghost">Naši partneri</a>
              </div>
            </div>
            <div className="voucher">
              <div className="v-head">
                <span className="num">Darčekový kód</span>
                <span className="num">Teraplan</span>
              </div>
              <div>
                <div className="v-partner">→ Hedepy.sk</div>
                <div className="v-amount">60<sup>€</sup></div>
                <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>1 sedenie · uplatnenie pri rezervácii</div>
              </div>
              <div>
                <div className="v-code">TP—7K2M—9X4F</div>
                <div className="v-foot">
                  <span>Platnosť 12 mes.</span>
                  <span>Z kreditov: 60</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="steps wrap" id="how">
        <div className="section-head">
          <h2>Ako to<br />funguje.</h2>
          <div className="section-meta">
            <span className="eyebrow">§ 03 · Proces</span>
            <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: 16, maxWidth: '52ch' }}>
              Od prvého kliknutia po sedenie u terapeuta. Päť krokov, žiadny z nich nezaberie viac ako pár minút.
            </p>
          </div>
        </div>
        <div style={{ marginTop: 32 }}>
          {STEPS.map((s) => (
            <div key={s.n} className="step-row">
              <div className="step-num">{s.n}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
              <div className="step-tag">{s.tag}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features" id="ai">
        <div className="wrap">
          <div className="section-head" style={{ borderBottom: 'none', paddingBottom: 16 }}>
            <h2>Čo robí Teraplan iným.</h2>
            <div className="section-meta">
              <span className="eyebrow">§ 04 · Mechanizmy</span>
              <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: 16, maxWidth: '52ch' }}>
                AI poradca namiesto škál a kumulujúce kredity namiesto strateného predplatného.
              </p>
            </div>
          </div>

          <div className="feature">
            <div>
              <span className="num">Pilier I</span>
              <h3>AI poradca,<br />nie dotazník.</h3>
              <p>
                Náš nástroj umelej inteligencie nahrádza otázky typu „ohodnoťte úzkosť od 0 do 10". Napíšete mu vlastnými slovami, čo prežívate — ako kamarátovi. Z konverzácie vyhodnotí špecializáciu, prístup a jazyk a odporučí konkrétneho terapeuta na <strong>Hedepy</strong> alebo <strong>Ksebe</strong>.
              </p>
            </div>
            <div className="ai-mock">
              <div className="ai-head">
                <span className="l"><span className="live-dot" />Teraplan AI · poradca</span>
                <span className="l">živý chat</span>
              </div>
              <div className="msg">
                <div className="who">Vy</div>
                <div className="body">Posledné dva mesiace mám problémy so spánkom. V práci som pod tlakom kvôli reorganizácii a doma to vyúsťuje do hádok s partnerom.</div>
              </div>
              <div className="msg ai">
                <div className="who">Teraplan AI</div>
                <div className="body">Z toho, čo opisujete, vidím dve roviny: <em>chronický pracovný stres</em> a jeho prelievanie do vzťahu. Začal by som individuálne.</div>
                <div className="recommendation">
                  <div>
                    <div className="name">Mgr. Lucia K.</div>
                    <div className="meta">KBT · vyhorenie · spánková hygiena · 4 voľné termíny</div>
                  </div>
                  <div className="platform">Hedepy →</div>
                </div>
              </div>
              <div className="composer">
                <div className="input">Napíšte ďalšie detaily alebo otázku…</div>
                <button className="send">↵</button>
              </div>
            </div>
          </div>

          <div className="feature reverse">
            <div>
              <span className="num">Pilier II</span>
              <h3>Kredity sa<br />nestrácajú.</h3>
              <p>
                Stream, ktorý mesiac nepozriete, sú peniaze v koši. Teraplan je naopak: každé euro sa premieňa na kredit, ktorý ostáva váš dovtedy, kým ho použijete. A keď potrebujete viac, dokúpite si ich na klik — rovnaký kurz <strong>1 € = 1 kredit</strong>.
              </p>
            </div>
            <div className="credits-mock">
              <div className="c-head">
                <span className="l">Kreditová peňaženka</span>
                <span className="l">TP—42891</span>
              </div>
              <div className="c-row">
                <span className="d">Január 2026 · plán Stabilita</span>
                <span className="y">+ 30</span>
                <span className="v">30</span>
              </div>
              <div className="c-row">
                <span className="d">Február 2026 · plán Stabilita</span>
                <span className="y">+ 30</span>
                <span className="v">30</span>
              </div>
              <div className="c-row">
                <span className="d">Kód → Hedepy · sedenie</span>
                <span className="y">— 60</span>
                <span className="v minus">−60</span>
              </div>
              <div className="c-total">
                <span className="l">Dostupné</span>
                <span className="v">30<sup>kreditov</sup></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="partners wrap" id="partners">
        <div className="partners-grid">
          <div>
            <span className="eyebrow">§ 05 · Sieť terapeutov</span>
            <h3 style={{ marginTop: 16 }}>Sedenie u dôveryhodných partnerov.</h3>
            <p style={{ marginTop: 16, fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55 }}>
              Teraplan kredity sú konvertibilné na darčekové kódy troch etablovaných platforiem pôsobiacich na Slovensku.
            </p>
          </div>
          <div className="partners-list">
            {PARTNERS.map((p) => (
              <div key={p.name} className="partner-card">
                <div className="pname">{p.name}</div>
                <div className="purl">{p.url}</div>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <PricingSection />

      {/* Support */}
      <section className="support" id="support">
        <div className="wrap">
          <div className="section-head" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <h2>Tri kanály<br />podpory.</h2>
            <div className="section-meta">
              <span className="eyebrow">§ 07 · Pomoc</span>
              <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: 16, maxWidth: '52ch' }}>
                Ku každému plánu máte prístup k živým ľuďom — u nás aj u našich partnerov.
              </p>
            </div>
          </div>
          <div className="support-grid">
            <div className="support-cell">
              <div className="meta">Teraplan · e-mail</div>
              <div className="ch">hello@teraplan.eu</div>
              <p>Otázky o kreditoch, fakturácii alebo o tom, kde uplatniť kód. Odpoveď do 24 hodín v pracovných dňoch.</p>
            </div>
            <div className="support-cell">
              <div className="meta">Teraplan · telefón</div>
              <div className="ch">+421 2 123 456</div>
              <p>Po–Pia 9:00–18:00. Poradíme s výberom plánu, dokupom kreditov alebo ak vám AI niečo nesedí.</p>
            </div>
            <div className="support-cell">
              <div className="meta">Partneri · priamo</div>
              <div className="ch">Hedepy · Ksebe · Mojra</div>
              <p>Pre samotné sedenie, technickú podporu pri videohovore alebo zmenu termínu kontaktujte priamo platformu.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq" id="faq">
        <div className="wrap-narrow">
          <div className="section-head" style={{ gridTemplateColumns: '1fr', borderBottom: 'none', paddingBottom: 0 }}>
            <span className="eyebrow">§ 08 · Časté otázky</span>
            <h2 style={{ marginTop: 16 }}>Rozumieme,<br />že máte otázky.</h2>
          </div>
          <div className="faq-list">
            {FAQS.map((f, i) => (
              <details key={i} className="faq-item">
                <summary>
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                  <span>{f.q}</span>
                  <span className="toggle">+</span>
                </summary>
                <div className="faq-body">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-final wrap-narrow">
        <h2>Začnite šetriť<br />na <em>seba</em>.</h2>
        <p style={{ fontSize: 17, color: 'var(--ink-2)', maxWidth: '48ch', margin: '0 auto 40px' }}>
          Aktivácia trvá pod päť minút. Prvý kredit dostanete okamžite po prvej platbe — a od dnes začínate.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/registracia" className="btn btn-primary">Vybrať plán →</Link>
          <a href="#how" className="btn btn-ghost">Ako to funguje</a>
        </div>
      </section>

      <Footer />
    </>
  );
}

const STEPS = [
  { n: '01', tag: 'Setup · 2 min', title: 'Vyberiete si plán', desc: 'Mesačná suma, ktorú vám sedí — od 11,90 € do 62,90 €. Z každého základu sa 1 € pretáva na 1 kredit, plus jeden transparentný servisný poplatok 2,90 €. Bez viazanosti.' },
  { n: '02', tag: 'Mesačne automaticky', title: 'Kredity pribúdajú', desc: 'Každý mesiac sa vám stav peňaženky navýši o sumu plánu. Kredity sa kumulujú a neprepadávajú, dokým je predplatné aktívne.' },
  { n: '03', tag: 'AI · 5 min rozhovor', title: 'Porozprávate sa s AI', desc: 'Žiadne škály od 0 do 10. Napíšete vlastnými slovami, čo riešite — stres, vzťahy, vyhorenie. AI vám odporučí konkrétneho terapeuta u Hedepy, Ksebe alebo Mojra.' },
  { n: '04', tag: 'Premena', title: 'Kód pre Hedepy, Ksebe alebo Mojra', desc: 'Premeníte kredity na darčekový kód v hodnote sedenia. Kód zadáte priamo na hedepy.sk, ksebe.sk alebo mojra.sk pri rezervácii.' },
  { n: '05', tag: 'Voliteľne', title: 'Dokup, ak chýba', desc: 'Potrebujete sedenie hneď a ešte nemáte dosť nasporené? Dokúpite presne toľko kreditov, koľko vám chýba. 1 € = 1 kredit, rovnaký kurz.' },
];

const PARTNERS = [
  { name: 'Hedepy', url: 'hedepy.sk', desc: 'Online psychoterapia s výberom z desiatok certifikovaných terapeutov. Sedenie cez videohovor, kód uplatníte pri rezervácii.' },
  { name: 'Ksebe', url: 'ksebe.sk', desc: 'Slovenská platforma zameraná na dostupnú online terapiu a koučing. Profil terapeuta, rezervácia termínu a uplatnenie kódu — všetko na jednom mieste.' },
  { name: 'Mojra', url: 'mojra.sk', desc: 'Mojra spája klientov so psychológmi a psychoterapeutmi naprieč Slovenskom. Online aj prezenčné sedenia, kód uplatníte pri online rezervácii.' },
];

const FAQS = [
  { q: 'Čo presne znamená „1 € = 1 kredit"?', a: 'Každé euro, ktoré pôjde do vašej peňaženky, sa pretaví na 1 kredit. V pláne Stabilita zaplatíte 32,90 € mesačne — z toho 30 € putuje 1:1 do vašich kreditov a 2,90 € je servisný poplatok za chod platformy.' },
  { q: 'Prečo ešte aj servisný poplatok 2,90 €?', a: 'Aby Teraplan o pár mesiacov nezhasol. Z kreditov nezarábame ani cent — tie sú vaše. Poplatok 2,90 € platí doménu, server, AI poradcu a podporu.' },
  { q: 'Kde absolvujem samotné sedenie?', a: 'Sedenie absolvujete priamo na hedepy.sk, ksebe.sk alebo mojra.sk. Teraplan generuje darčekový kód v hodnote, ktorú si vyberiete, a tento kód zadáte u partnera pri rezervácii.' },
  { q: 'Ako funguje AI nástroj na výber terapeuta?', a: 'Otvoríte si chat a opíšete vlastnými slovami, čo riešite. AI z konverzácie vyhodnotí špecializáciu, prístup a preferencie a odporučí konkrétneho terapeuta, ktorý má voľné termíny.' },
  { q: 'Čo ak mi nestačí počet kreditov?', a: 'Žiadny problém — môžete si dokúpiť presne toľko kreditov, koľko vám chýba. Kurz ostáva 1 € = 1 kredit, žiadny príplatok za rýchlosť.' },
  { q: 'Môžem zmeniť plán alebo zrušiť predplatné?', a: 'Áno, kedykoľvek bez výpovednej lehoty. Zmena plánu sa prejaví od ďalšieho zúčtovacieho obdobia, zrušenie je okamžité. Naakumulované kredity ostávajú aktívne 12 mesiacov.' },
  { q: 'Ako dlho platí darčekový kód?', a: 'Vygenerovaný kód platí 12 mesiacov od dátumu vystavenia. Ak ho do tohto času neuplatníte, kredity sa vrátia späť do vašej peňaženky.' },
  { q: 'Sú moje dáta a chat s AI v bezpečí?', a: 'Áno. Konverzácia s AI poradcom slúži výhradne na odporučenie terapeuta. Samotná terapia prebieha priamo medzi vami a terapeutom u partnera. Súlad s GDPR.' },
];
