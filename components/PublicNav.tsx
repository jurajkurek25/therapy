import Link from 'next/link';
import Brand from './Brand';

export default function PublicNav() {
  return (
    <nav className="top">
      <div className="nav-inner">
        <Brand />
        <div className="nav-links">
          <a href="#how">Ako to funguje</a>
          <a href="#ai">AI poradca</a>
          <a href="#partners">Partneri</a>
          <a href="#pricing">Plány</a>
          <a href="#support">Podpora</a>
          <a href="#faq">Otázky</a>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/prihlasenie" style={{ fontSize: 13, color: 'var(--muted)' }}>Prihlásiť sa</Link>
          <Link href="/registracia" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 13 }}>
            Začať šetriť →
          </Link>
        </div>
      </div>
    </nav>
  );
}
