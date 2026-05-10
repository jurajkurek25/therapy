import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia' as any,
});

export const PLANS = {
  start:     { credits: 9,  monthly: 11.90, name: 'Štart' },
  stabilita: { credits: 30, monthly: 32.90, name: 'Stabilita' },
  rytmus:    { credits: 60, monthly: 62.90, name: 'Rytmus' },
} as const;

export type PlanId = keyof typeof PLANS;
