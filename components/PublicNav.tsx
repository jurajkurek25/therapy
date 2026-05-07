'use client';
import { useState } from 'react';
import Brand from './Brand';
import WaitlistModal from './WaitlistModal';

export default function PublicNav() {
  const [open, setOpen] = useState(false);
  return (
    <>
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
          <button onClick={() => setOpen(true)} className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 13 }}>
            Začať šetriť →
          </button>
        </div>
      </nav>
      {open && <WaitlistModal onClose={() => setOpen(false)} />}
    </>
  );
}
