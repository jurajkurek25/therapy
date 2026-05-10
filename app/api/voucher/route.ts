import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const PARTNERS: Record<string, { name: string; amount: number }> = {
  hedepy: { name: 'Hedepy', amount: 60 },
  ksebe:  { name: 'Ksebe',  amount: 60 },
  mojra:  { name: 'Mojra',  amount: 60 },
};

const SOS_LIMIT = 60;
const SOS_VESTING = 3;

function genCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `TP-${seg()}-${seg()}-${seg()}`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { partnerId, amount, useSos } = await req.json();
  const partner = PARTNERS[partnerId?.toLowerCase()];
  if (!partner) return NextResponse.json({ error: 'Neplatný partner.' }, { status: 400 });

  const voucherAmount = amount || partner.amount;
  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: 'Používateľ nenájdený.' }, { status: 404 });

  if (useSos) {
    if (user.memberMonths < SOS_VESTING) {
      return NextResponse.json({ error: `SOS Mínus je dostupný po ${SOS_VESTING} mesiacoch.` }, { status: 403 });
    }
    if (user.sosDebt > 0) {
      return NextResponse.json({ error: 'Máte nesplatený SOS dlh.' }, { status: 403 });
    }

    const code = genCode();
    const [voucher] = await prisma.$transaction([
      prisma.voucher.create({
        data: { userId, partnerId: partnerId.toLowerCase(), partnerName: partner.name, code, amount: SOS_LIMIT },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { sosDebt: { increment: SOS_LIMIT } },
      }),
      prisma.transaction.create({
        data: { userId, amount: SOS_LIMIT, type: 'sos', description: `SOS kód → ${partner.name} · sedenie na dlh` },
      }),
    ]);
    return NextResponse.json({ code: voucher.code, amount: SOS_LIMIT, sos: true });
  }

  if (user.credits < voucherAmount) {
    return NextResponse.json({ error: `Nedostatok kreditov. Chýba ${voucherAmount - user.credits} kr.` }, { status: 403 });
  }

  const code = genCode();
  const [voucher] = await prisma.$transaction([
    prisma.voucher.create({
      data: { userId, partnerId: partnerId.toLowerCase(), partnerName: partner.name, code, amount: voucherAmount },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: voucherAmount } },
    }),
    prisma.transaction.create({
      data: { userId, amount: -voucherAmount, type: 'debit', description: `Kód → ${partner.name}` },
    }),
  ]);
  return NextResponse.json({ code: voucher.code, amount: voucherAmount, sos: false });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { voucherId } = await req.json();
  const userId = (session.user as any).id;
  const voucher = await prisma.voucher.findFirst({ where: { id: voucherId, userId } });
  if (!voucher) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.voucher.update({ where: { id: voucherId }, data: { used: true } });
  return NextResponse.json({ ok: true });
}
