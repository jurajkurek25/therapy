import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.stripeSubscriptionId) {
    return NextResponse.json({ error: 'Žiadne aktívne predplatné.' }, { status: 404 });
  }

  await stripe.subscriptions.cancel(user.stripeSubscriptionId);
  await prisma.user.update({
    where: { id: userId },
    data: { subscriptionStatus: 'canceled' },
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { plan } = await req.json();
  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user?.stripeSubscriptionId) {
    return NextResponse.json({ error: 'Žiadne aktívne predplatné.' }, { status: 404 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer:   user.stripeCustomerId!,
    return_url: `${process.env.NEXTAUTH_URL}/nastavenia`,
  });

  return NextResponse.json({ portalUrl: portalSession.url });
}
