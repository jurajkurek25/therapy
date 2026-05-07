'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/dashboard', icon: '▣', label: 'Dashboard' },
  { href: '/ai', icon: '◈', label: 'AI poradca' },
  { href: '/poukazky', icon: '◻', label: 'Poukazy' },
  { href: '/dokup', icon: '+', label: 'Dokúpiť kredity' },
  { href: '/nastavenia', icon: '◦', label: 'Nastavenia' },
];

export default function AppSidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <div className="sidebar-nav">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={`sidebar-link ${pathname === n.href ? 'active' : ''}`}>
            <span className="icon">{n.icon}</span>
            <span>{n.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
