import type { AgeVerificationProvider } from "../types"
import { AGE_VERIFICATION_CONFIG } from "../config"

export const dobPhotoProvider: AgeVerificationProvider = {
  name: "dob-photo",

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
    // For launch: photo upload triggers manual review
    return { status: "pending_review" as const }
  },
}
