'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/dashboard', icon: '▣', label: 'Prehľad' },
  { href: '/ai', icon: '◈', label: 'AI' },
  { href: '/poukazky', icon: '◻', label: 'Poukazy' },
  { href: '/dokup', icon: '+', label: 'Dokup' },
  { href: '/nastavenia', icon: '◦', label: 'Účet' },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="mobile-nav">
      <div className="mobile-nav-inner">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={`mobile-nav-link ${pathname === n.href ? 'active' : ''}`}>
            <span className="mn-icon">{n.icon}</span>
            <span>{n.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
