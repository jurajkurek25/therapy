'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Brand from './Brand';

export default function AppNav({ credits }: { credits?: number }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(' ')[0] ?? 'Účet';

  return (
    <nav className="top">
      <div className="nav-inner">
        <Brand href="/dashboard" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/dashboard" style={{ fontFamily: 'var(--mono)', fontSize: 13, color: pathname === '/dashboard' ? 'var(--accent-ink)' : 'var(--muted)' }}>
            Peňaženka
          </Link>
          <Link href="/ai" style={{ fontFamily: 'var(--mono)', fontSize: 13, color: pathname === '/ai' ? 'var(--accent-ink)' : 'var(--muted)' }}>
            AI poradca
          </Link>
          <Link href="/poukazky" style={{ fontFamily: 'var(--mono)', fontSize: 13, color: pathname === '/poukazky' ? 'var(--accent-ink)' : 'var(--muted)' }}>
            Poukazy
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {credits !== undefined && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, padding: '8px 14px', background: 'var(--accent-tint)', border: '1px solid var(--accent)' }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--accent-ink)' }}>{credits}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-ink)' }}>kreditov</span>
            </div>
          )}
          <Link href="/nastavenia" style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', padding: '8px 12px', border: '1px solid var(--rule-2)' }}>
            {firstName}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', padding: '8px 12px', border: '1px solid var(--rule-2)', cursor: 'pointer', background: 'none' }}>
            Odhlásiť
          </button>
        </div>
      </div>
    </nav>
  );
}
