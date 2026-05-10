import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function isAdmin(req: NextRequest) {
  const pw = req.headers.get('x-admin-password');
  return !!process.env.ADMIN_PASSWORD && pw === process.env.ADMIN_PASSWORD;
}

// GET /api/admin/vouchers — catalog stats + full list
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const vouchers = await prisma.voucher.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true } } },
  });

  // Stats per partner
  const statsMap: Record<string, { partnerId: string; partnerName: string; available: number; claimed: number; used: number }> = {};
  for (const v of vouchers) {
    if (!statsMap[v.partnerId]) {
      statsMap[v.partnerId] = { partnerId: v.partnerId, partnerName: v.partnerName, available: 0, claimed: 0, used: 0 };
    }
    if (v.used) statsMap[v.partnerId].used++;
    else if (v.userId) statsMap[v.partnerId].claimed++;
    else statsMap[v.partnerId].available++;
  }

  return NextResponse.json({ stats: Object.values(statsMap), vouchers });
}

// POST /api/admin/vouchers — add codes to pool
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { partnerId, partnerName, amount, codes } = await req.json();
  if (!partnerId || !partnerName || !amount || !Array.isArray(codes) || codes.length === 0) {
    return NextResponse.json({ error: 'Chýbajú polia.' }, { status: 400 });
  }

  const rows = codes
    .map((c: string) => c.trim())
    .filter(Boolean)
    .map((code: string) => ({ partnerId: partnerId.toLowerCase(), partnerName, code, amount: Number(amount) }));

  const result = await prisma.$transaction(
    rows.map((r) => prisma.voucher.upsert({ where: { code: r.code }, update: {}, create: r }))
  );

  return NextResponse.json({ added: result.length });
}

// DELETE /api/admin/vouchers — remove unclaimed code
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  const voucher = await prisma.voucher.findUnique({ where: { id } });
  if (!voucher) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (voucher.userId) return NextResponse.json({ error: 'Kód už bol vyplatený.' }, { status: 400 });

  await prisma.voucher.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
