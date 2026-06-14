import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe, PLANS, type PlanId } from '@/lib/stripe';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, plan, customAmount } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Vyplňte všetky polia.' }, { status: 400 });
    }

    const isCustom = plan === 'custom' && customAmount;
    const credits = isCustom ? Number(customAmount) : (PLANS[plan as PlanId]?.credits ?? 30);
    const monthly = isCustom ? Number(customAmount) + 2.90 : (PLANS[plan as PlanId]?.monthly ?? 32.90);
    const planName = isCustom ? `Vlastná (${customAmount} €)` : (PLANS[plan as PlanId]?.name ?? 'Stabilita');

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      // Registered but never paid — let them retry checkout with the same credentials
      if (existing.subscriptionStatus === 'pending') {
        const validPassword = await bcrypt.compare(password, existing.password);
        if (!validPassword) {
          return NextResponse.json({ error: 'Nesprávne heslo. Prihláste sa cez prihlasenie.' }, { status: 400 });
        }
        // Update plan choice in case they picked a different one
        await prisma.user.update({ where: { id: existing.id }, data: { plan: plan || 'stabilita' } });

        const retrySession = await stripe.checkout.sessions.create({
          customer: existing.stripeCustomerId!,
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Teraplan ${planName}`,
                description: `${credits} kreditov mesačne · 1 € = 1 kredit`,
              },
              unit_amount: Math.round(monthly * 100),
              recurring: { interval: 'month' },
            },
            quantity: 1,
          }],
          metadata: {
            userId: existing.id,
            credits: credits.toString(),
            plan: plan || 'stabilita',
          },
          success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=1`,
          cancel_url:  `${process.env.NEXTAUTH_URL}/registracia?canceled=1`,
        });
        return NextResponse.json({ checkoutUrl: retrySession.url, userId: existing.id });
      }
      return NextResponse.json({ error: 'Tento e-mail je už zaregistrovaný.' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);

    const customer = await stripe.customers.create({ email, name });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        plan: plan || 'stabilita',
        credits: 0,
        subscriptionStatus: 'pending',
        stripeCustomerId: customer.id,
      },
    });

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Teraplan ${planName}`,
            description: `${credits} kreditov mesačne · 1 € = 1 kredit`,
          },
          unit_amount: Math.round(monthly * 100),
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      metadata: {
        userId: user.id,
        credits: credits.toString(),
        plan: plan || 'stabilita',
      },
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=1`,
      cancel_url:  `${process.env.NEXTAUTH_URL}/registracia?canceled=1`,
    });

    return NextResponse.json({ checkoutUrl: session.url, userId: user.id });
  } catch (err: any) {
    console.error('Register error:', err);
    return NextResponse.json(
      { error: err?.message || 'Interná chyba servera.' },
      { status: 500 }
    );
  }
}
