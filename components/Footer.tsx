import Brand from './Brand';

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Brand dark />
            <p>Predplatné, ktoré z mesačných eur tvorí kredity na terapiu u Hedepy, Ksebe a Mojra. 1 € = 1 kredit.</p>
          </div>
          <div>
            <h5>Produkt</h5>
            <ul>
              <li><a href="/#how">Ako to funguje</a></li>
              <li><a href="/#ai">AI poradca</a></li>
              <li><a href="/#partners">Partneri</a></li>
              <li><a href="/#pricing">Plány</a></li>
              <li><a href="/#faq">Otázky</a></li>
            </ul>
          </div>
          <div>
            <h5>Spoločnosť</h5>
            <ul>
              <li><a href="#">O nás</a></li>
              <li><a href="#">Pre firmy</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Kariéra</a></li>
            </ul>
          </div>
          <div>
            <h5>Kontakt</h5>
            <ul>
              <li><a href="mailto:hello@teraplan.eu">hello@teraplan.eu</a></li>
              <li><a href="tel:+421212345">+421 2 123 456</a></li>
              <li><a href="#">GDPR</a></li>
              <li><a href="#">Obchodné podmienky</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bot">
          <span>© 2026 Teraplan s.r.o. · Bratislava, SK</span>
          <span className="mono">teraplan.eu</span>
        </div>
        <div className="disclaimer">
          Upozornenie: Teraplan je predplatená kreditová peňaženka určená na nákup darčekových kódov u partnerských platforiem (Hedepy, Ksebe, Mojra). Nie je poskytovateľom psychologických služieb a nespadá pod reguláciu NBS. Sedenia vykonávajú certifikovaní odborníci u našich partnerov. V prípade akútnej krízy kontaktujte Linku dôvery Nezábudka 0800 800 566.
        </div>
      </div>
    </footer>
  );
}
