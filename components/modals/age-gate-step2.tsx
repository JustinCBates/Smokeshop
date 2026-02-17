"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Upload, CheckCircle, Loader2 } from "lucide-react"

interface AgeGateStep2Props {
  userId: string
  onVerified: () => void
}

export function AgeGateStep2({ userId, onVerified }: AgeGateStep2Props) {
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    setUploading(true)
    setError(null)
    const supabase = createClient()

    try {
      const ext = file.name.split(".").pop()
      const filePath = `${userId}/id-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("age-verification-ids")
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          id_photo_url: filePath,
          id_review_status: "pending",
          age_verification_method: "photo_id",
        })
        .eq("id", userId)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(onVerified, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("File must be under 10MB")
        return
      }
      handleUpload(file)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center">
        <CheckCircle className="h-12 w-12 text-success" />
        <h3 className="text-lg font-semibold text-foreground">ID Submitted</h3>
        <p className="text-sm text-muted-foreground">
          Your ID has been submitted for review. You can proceed with your order
          while we verify.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-8">
      <h3 className="text-lg font-semibold text-foreground">
        Photo ID Verification
      </h3>
      <p className="text-sm text-muted-foreground">
        Please upload a photo of a government-issued ID (driver&apos;s license,
        passport, or state ID) to complete your age verification.
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload ID photo"
      />

      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="flex items-center justify-center gap-2 rounded-md border border-dashed border-border bg-background px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
      >
        {uploading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-5 w-5" />
            Click to upload your ID
          </>
        )}
      </button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <p className="text-xs text-muted-foreground">
        Accepted formats: JPG, PNG, HEIC. Max size: 10MB. Your ID photo is stored
        securely and only used for age verification.
      </p>
    </div>
  )
}
