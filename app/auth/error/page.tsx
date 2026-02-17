import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm text-center">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-bold text-foreground">
          Something Went Wrong
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {params?.error
            ? `Error: ${params.error}`
            : "An unspecified error occurred."}
        </p>
        <Link
          href="/auth/login"
          className="mt-6 inline-block rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}
