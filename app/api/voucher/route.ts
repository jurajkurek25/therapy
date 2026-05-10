import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const SOS_LIMIT = 60;
const SOS_VESTING = 3;

// GET — available catalog (what users can claim)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const available = await prisma.voucher.findMany({
    where: { userId: null, used: false },
    select: { partnerId: true, partnerName: true, amount: true },
  });

  // Group by partnerId + amount, count stock
  const map: Record<string, { partnerId: string; partnerName: string; amount: number; stock: number }> = {};
  for (const v of available) {
    const key = `${v.partnerId}:${v.amount}`;
    if (!map[key]) map[key] = { partnerId: v.partnerId, partnerName: v.partnerName, amount: v.amount, stock: 0 };
    map[key].stock++;
  }

  return NextResponse.json({ catalog: Object.values(map) });
}

// POST — claim a voucher from pool
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { partnerId, amount, useSos } = await req.json();
  if (!partnerId) return NextResponse.json({ error: 'Chýba partner.' }, { status: 400 });

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: 'Používateľ nenájdený.' }, { status: 404 });

  // Find next available voucher in pool
  const where: any = { userId: null, used: false, partnerId: partnerId.toLowerCase() };
  if (amount) where.amount = Number(amount);

  const pool = await prisma.voucher.findFirst({ where, orderBy: { createdAt: 'asc' } });
  if (!pool) return NextResponse.json({ error: 'Kódy pre tohto partnera momentálne nie sú k dispozícii.' }, { status: 404 });

  const voucherAmount = pool.amount;

  if (useSos) {
    if (user.memberMonths < SOS_VESTING) {
      return NextResponse.json({ error: `SOS Mínus je dostupný po ${SOS_VESTING} mesiacoch.` }, { status: 403 });
    }
    if (user.sosDebt > 0) {
      return NextResponse.json({ error: 'Máte nesplatený SOS dlh.' }, { status: 403 });
    }

    const [voucher] = await prisma.$transaction([
      prisma.voucher.update({
        where: { id: pool.id },
        data: { userId, claimedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { sosDebt: { increment: SOS_LIMIT } },
      }),
      prisma.transaction.create({
        data: { userId, amount: SOS_LIMIT, type: 'sos', description: `SOS kód → ${pool.partnerName} · sedenie na dlh` },
      }),
    ]);
    return NextResponse.json({ code: pool.code, amount: SOS_LIMIT, sos: true, voucherId: pool.id });
  }

  if (user.credits < voucherAmount) {
    return NextResponse.json({ error: `Nedostatok kreditov. Chýba ${voucherAmount - user.credits} kr.` }, { status: 403 });
  }

  await prisma.$transaction([
    prisma.voucher.update({
      where: { id: pool.id },
      data: { userId, claimedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: voucherAmount } },
    }),
    prisma.transaction.create({
      data: { userId, amount: -voucherAmount, type: 'debit', description: `Kód → ${pool.partnerName}` },
    }),
  ]);

  return NextResponse.json({ code: pool.code, amount: voucherAmount, sos: false, voucherId: pool.id });
}

// PATCH — mark voucher as used
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
