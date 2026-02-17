"use client"

import { useState, useEffect } from "react"
import { siteConfig } from "@/lib/site-config"
import { getAgeVerificationProvider } from "@/lib/age-verification"
import { ShieldCheck, AlertTriangle } from "lucide-react"

const AGE_GATE_KEY = "age_gate_passed"

export function AgeGateStep1() {
  const [visible, setVisible] = useState(false)
  const [month, setMonth] = useState("")
  const [day, setDay] = useState("")
  const [year, setYear] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    const passed = localStorage.getItem(AGE_GATE_KEY)
    if (passed !== "true") {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const m = parseInt(month, 10)
    const d = parseInt(day, 10)
    const y = parseInt(year, 10)

    if (!m || !d || !y || y < 1900 || y > new Date().getFullYear()) {
      setError("Please enter a valid date of birth.")
      return
    }

    const dob = new Date(y, m - 1, d)
    const provider = getAgeVerificationProvider()
    const result = provider.verifyStep1(dob)

    if (result.passed) {
      localStorage.setItem(AGE_GATE_KEY, "true")
      setVisible(false)
    } else {
      setDenied(true)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/98 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-xl border border-border bg-card p-8">
        {denied ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
            <p className="text-sm text-muted-foreground">
              You must be 21 or older to access this site.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-col items-center gap-3 text-center">
              <ShieldCheck className="h-10 w-10 text-primary" />
              <h2 className="text-xl font-bold text-foreground">
                Age Verification
              </h2>
              <p className="text-sm text-muted-foreground">
                You must be 21 or older to enter{" "}
                <span className="text-primary">{siteConfig.name}</span>. Please
                enter your date of birth.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label
                    htmlFor="age-month"
                    className="mb-1 block text-xs font-medium text-muted-foreground"
                  >
                    Month
                  </label>
                  <input
                    id="age-month"
                    type="number"
                    min="1"
                    max="12"
                    placeholder="MM"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-center text-foreground outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="age-day"
                    className="mb-1 block text-xs font-medium text-muted-foreground"
                  >
                    Day
                  </label>
                  <input
                    id="age-day"
                    type="number"
                    min="1"
                    max="31"
                    placeholder="DD"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-center text-foreground outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="age-year"
                    className="mb-1 block text-xs font-medium text-muted-foreground"
                  >
                    Year
                  </label>
                  <input
                    id="age-year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    placeholder="YYYY"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-center text-foreground outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-center text-sm text-destructive">{error}</p>
              )}

              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Verify My Age
              </button>

              <p className="text-center text-xs text-muted-foreground">
                By entering, you confirm you are at least 21 years of age.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
