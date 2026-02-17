/**
 * Age Verification Provider
 *
 * Step 1: Date of birth check (site entry gate) - must be 21+
 * Step 2: ID verification for cannabis/delta orders (at checkout/delivery)
 *
 * This module is designed to be replaceable with a real ID verification
 * provider like Veriff, Jumio, or a state API when the operator is ready.
 */

export interface AgeVerificationResult {
  passed: boolean;
  reason?: string;
}

export interface AgeVerificationProvider {
  /** Step 1: Check DOB is 21+ */
  verifyStep1(dob: Date): AgeVerificationResult;
  /** Step 2: Placeholder for ID scan verification */
  verifyStep2(userId: string, idData: unknown): Promise<AgeVerificationResult>;
}

const MIN_AGE = 21;

function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

class DefaultAgeVerificationProvider implements AgeVerificationProvider {
  verifyStep1(dob: Date): AgeVerificationResult {
    const age = calculateAge(dob);
    if (age >= MIN_AGE) {
      return { passed: true };
    }
    return { passed: false, reason: `Must be at least ${MIN_AGE} years old.` };
  }

  async verifyStep2(
    _userId: string,
    _idData: unknown
  ): Promise<AgeVerificationResult> {
    // Placeholder: in production, integrate with a real ID verification service
    return { passed: true };
  }
}

let provider: AgeVerificationProvider | null = null;

export function getAgeVerificationProvider(): AgeVerificationProvider {
  if (!provider) {
    provider = new DefaultAgeVerificationProvider();
  }
  return provider;
}

export function setAgeVerificationProvider(p: AgeVerificationProvider) {
  provider = p;
}
