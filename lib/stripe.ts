import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.warn('Stripe publishable key not found');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

export interface CreateCheckoutSessionRequest {
  orderId: string;
  amount: number;
  currency?: string;
}

export const createCheckoutSession = async (data: CreateCheckoutSessionRequest) => {
  const response = await fetch('/api/checkout/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  return response.json();
};

export const redirectToCheckout = async (sessionId: string) => {
  const stripe = await getStripe();
  if (!stripe) {
    throw new Error('Stripe not initialized');
  }

  const { error } = await (stripe as any).redirectToCheckout({ sessionId });
  
  if (error) {
    throw error;
  }
};
