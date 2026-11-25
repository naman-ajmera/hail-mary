import { loadStripe, type Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null> | null = null
let currentKey: string | null = null

/**
 * Returns a cached Stripe instance for the given publishable key.
 * If the key is a placeholder or not provided, returns null to allow test simulator mode.
 */
export function getStripe(publishableKey?: string): Promise<Stripe | null> {
  const envKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined
  const keyToUse =
    publishableKey && !publishableKey.includes('placeholder')
      ? publishableKey
      : envKey && !envKey.includes('placeholder')
      ? envKey
      : null

  if (!keyToUse) {
    return Promise.resolve(null)
  }

  if (!stripePromise || currentKey !== keyToUse) {
    currentKey = keyToUse
    stripePromise = loadStripe(keyToUse)
  }

  return stripePromise
}
