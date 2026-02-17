import { AGE_VERIFICATION_CONFIG } from "./config"
import { dobPhotoProvider } from "./providers/dob-photo"
import { thirdPartyProvider } from "./providers/third-party"
import type { AgeVerificationProvider } from "./types"

export function getAgeVerificationProvider(): AgeVerificationProvider {
  switch (AGE_VERIFICATION_CONFIG.provider) {
    case "third-party":
      return thirdPartyProvider
    case "dob-photo":
    default:
      return dobPhotoProvider
  }
}

export { AGE_VERIFICATION_CONFIG } from "./config"
export type { AgeVerificationProvider, Step2Data } from "./types"
