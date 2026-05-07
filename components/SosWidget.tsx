'use client';
import Link from 'next/link';
import { type User, SOS_VESTING_MONTHS, SOS_LIMIT, isSosEligible, sosMonthsLeft } from '@/lib/store';

export default function SosWidget({ user }: { user: User }) {
  const eligible = isSosEligible(user);
  const monthsLeft = sosMonthsLeft(user);
  const hasDebt = user.sosDebt > 0;

  // locked — still in vesting
  if (!eligible && !hasDebt) {
    const done = user.memberMonths;
    const pct = Math.min(100, (done / SOS_VESTING_MONTHS) * 100);
    return (
      <div style={{ border: '1px solid var(--rule-2)', padding: 24, background: 'var(--paper)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 6 }}>
              SOS Mínus · zamknuté
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
              Odomkne sa o {monthsLeft} {monthsLeft === 1 ? 'mesiac' : monthsLeft < 5 ? 'mesiace' : 'mesiacov'}
            </div>
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 28, color: 'var(--rule-2)', lineHeight: 1, flexShrink: 0 }}>
            ◈
          </div>
        </div>
        {/* progress bar */}
        <div style={{ height: 3, background: 'var(--rule)', marginBottom: 10 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'var(--muted-2)', transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          <span>{done} / {SOS_VESTING_MONTHS} mesiace lojality</span>
          <span>{Math.round(pct)} %</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: '14px 0 0', lineHeight: 1.55 }}>
          Po {SOS_VESTING_MONTHS} mesiacoch platenia vám odomkneme možnosť ísť do záporného zostatku o jedno sedenie. Dôverujeme verným zákazníkom.
        </p>
      </div>
    );
  }

  // active debt — repaying
  if (hasDebt) {
    const repaid = SOS_LIMIT - user.sosDebt;
    const pct = Math.min(100, (repaid / SOS_LIMIT) * 100);
    return (
      <div style={{ border: '1px solid var(--rule-2)', padding: 24, background: 'var(--paper)', borderLeft: '3px solid var(--accent-ink)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-ink)', marginBottom: 6 }}>
              SOS Mínus · splácate
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
              Dlh: <span style={{ color: 'var(--accent-ink)' }}>−{user.sosDebt}</span> kreditov
            </div>
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 36, color: 'var(--accent-ink)', lineHeight: 1, flexShrink: 0 }}>
            −{user.sosDebt}
          </div>
        </div>
        <div style={{ height: 3, background: 'var(--rule)', marginBottom: 10 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent-ink)', transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          <span>Splatené {repaid} / {SOS_LIMIT} kr.</span>
          <span>{Math.round(pct)} %</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: '14px 0 0', lineHeight: 1.55 }}>
          Dlh sa automaticky spláca z mesačných kreditov predplatného. Ďalší SOS kredit bude dostupný po úplnom splatení.
        </p>
      </div>
    );
  }

  // fully unlocked, no debt
  return (
    <div style={{ border: '1px solid var(--ink)', padding: 24, background: 'var(--ink)', color: 'var(--bg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: 6 }}>
            ✓ SOS Mínus · odomknuté
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
            Sedenie aj keď<br />nemáte dosť kreditov
          </div>
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 40, color: 'var(--accent)', lineHeight: 1, flexShrink: 0 }}>
          ±{SOS_LIMIT}
        </div>
      </div>
      <p style={{ fontSize: 13, opacity: 0.7, margin: '0 0 16px', lineHeight: 1.55 }}>
        Môžete ísť do záporného zostatku až o {SOS_LIMIT} kreditov (jedno sedenie). Dlh sa automaticky spláca z ďalšieho predplatného.
      </p>
      <Link href="/poukazky" className="btn"
        style={{ background: 'var(--accent)', color: 'var(--ink)', borderRadius: 0, justifyContent: 'center', display: 'flex', fontSize: 13, border: 'none' }}>
        Generovať SOS kód →
      </Link>
    </div>
  );
}
