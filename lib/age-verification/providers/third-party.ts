import type { AgeVerificationProvider } from "../types"
import { AGE_VERIFICATION_CONFIG } from "../config"

export const thirdPartyProvider: AgeVerificationProvider = {
  name: "third-party",

  verifyStep1(dob: Date) {
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--
    }
    return {
      passed: age >= AGE_VERIFICATION_CONFIG.minimumAge,
      minAge: AGE_VERIFICATION_CONFIG.minimumAge,
    }
  },

  async verifyStep2() {
    // Future: call AgeChecker.net or similar API here
    // const response = await fetch('https://api.agechecker.net/v1/verify', { ... })
    throw new Error(
      "Third-party age verification is not yet configured. Set AGECHECKER_API_KEY."
    )
  },
}
