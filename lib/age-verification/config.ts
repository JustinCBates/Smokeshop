export const AGE_VERIFICATION_CONFIG = {
  minimumAge: 21,
  provider:
    (process.env.AGE_VERIFICATION_PROVIDER as "dob-photo" | "third-party") ||
    "dob-photo",
  requireStep2ForCheckout: true,
  allowPendingOrders: true,
} as const
