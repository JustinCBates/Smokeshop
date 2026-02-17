import "server-only";

import Stripe from "stripe";

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    
    if (!apiKey) {
      throw new Error(
        "STRIPE_SECRET_KEY is not defined in environment variables. " +
        "Please add it to your .env file or deployment environment."
      );
    }
    
    stripeInstance = new Stripe(apiKey, {
      apiVersion: "2024-11-20.acacia",
      typescript: true,
    });
  }
  
  return stripeInstance;
}

export const stripe = new Proxy({} as Stripe, {
  get: (target, prop) => {
    const instance = getStripe();
    const value = instance[prop as keyof Stripe];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});
