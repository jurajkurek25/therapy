import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Webhook signature invalid' }, { status: 400 });
  }

  const PLAN_CREDITS: Record<string, number> = { start: 9, stabilita: 30, rytmus: 60 };

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    if (session.metadata?.type === 'topup') {
      const credits = parseFloat(session.metadata.credits);
      const userId = session.metadata.userId;
      await prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: credits } },
      });
      await prisma.transaction.create({
        data: { userId, amount: credits, type: 'credit', description: `Dokúpené kredity (+${credits})` },
      });
      return NextResponse.json({ ok: true });
    }

    const userId = session.metadata?.userId;
    const credits = parseFloat(session.metadata?.credits || '30');
    const plan = session.metadata?.plan || 'stabilita';

    if (!userId) return NextResponse.json({ ok: true });

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'active',
        stripeSubscriptionId: session.subscription,
        credits: { increment: credits },
        memberMonths: { increment: 1 },
      },
    });
    await prisma.transaction.create({
      data: { userId, amount: credits, type: 'credit', description: `Predplatné ${plan} aktivované` },
    });
  }

  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as any;
    if (invoice.billing_reason === 'subscription_create') return NextResponse.json({ ok: true });

    const customerId = invoice.customer;
    const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
    if (!user) return NextResponse.json({ ok: true });

    const credits = PLAN_CREDITS[user.plan] ?? 30;

    // Repay SOS debt first, then add remaining credits
    const debtRepay = Math.min(user.sosDebt, credits);
    const netCredits = credits - debtRepay;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: { increment: netCredits },
        sosDebt: { decrement: debtRepay },
        memberMonths: { increment: 1 },
      },
    });
    await prisma.transaction.create({
      data: { userId: user.id, amount: credits, type: 'credit', description: `Mesačné kredity · ${user.plan}${debtRepay > 0 ? ` (−${debtRepay} kr. splátka SOS)` : ''}` },
    });
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as any;
    await prisma.user.updateMany({
      where: { stripeCustomerId: sub.customer },
      data: { subscriptionStatus: 'canceled' },
    });
  }

  return NextResponse.json({ ok: true });
}
