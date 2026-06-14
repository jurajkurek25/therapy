import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { amount } = await req.json();
  if (!amount || Number(amount) < 5) {
    return NextResponse.json({ error: 'Minimálne 5 kreditov.' }, { status: 400 });
  }

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const checkoutSession = await stripe.checkout.sessions.create({
    customer:       user.stripeCustomerId ?? undefined,
    customer_email: !user.stripeCustomerId ? user.email : undefined,
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: { name: `Teraplan Kredity +${amount}` },
        unit_amount: Math.round(Number(amount) * 100),
      },
      quantity: 1,
    }],
    metadata: { userId, credits: amount.toString(), type: 'topup' },
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?topup=1`,
    cancel_url:  `${process.env.NEXTAUTH_URL}/dokup`,
  });

  return NextResponse.json({ checkoutUrl: checkoutSession.url });
}
