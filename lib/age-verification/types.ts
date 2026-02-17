export interface Step2Data {
  imageFile?: File
  userId?: string
}

export interface AgeVerificationProvider {
  name: string
  verifyStep1(dob: Date): { passed: boolean; minAge: number }
  verifyStep2(data: Step2Data): Promise<{
    status: "approved" | "pending_review" | "rejected"
  }>
}
