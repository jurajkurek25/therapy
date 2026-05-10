import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: {
      transactions: { orderBy: { createdAt: 'desc' }, take: 30 },
      vouchers:     { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { password: _, ...safe } = user;
  return NextResponse.json(safe);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name } = await req.json();
  const user = await prisma.user.update({
    where: { id: (session.user as any).id },
    data: { name },
  });
  const { password: _, ...safe } = user;
  return NextResponse.json(safe);
}
