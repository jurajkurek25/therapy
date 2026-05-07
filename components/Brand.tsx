import Link from 'next/link';

export default function Brand({ href = '/', dark = false }: { href?: string; dark?: boolean }) {
  return (
    <Link href={href} className="brand" style={dark ? { color: 'var(--bg)' } : {}}>
      <span className="dot" style={dark ? { background: 'var(--accent)' } : {}} />
      <span>Teraplan</span>
    </Link>
  );
}
