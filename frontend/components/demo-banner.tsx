"use client"

import { useQuery } from "@tanstack/react-query"
import { getMe } from "@/lib/api"
import { Info } from "lucide-react"

export function DemoBanner() {
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false,
  })

  const demoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL
  if (!user || !demoEmail || user.email !== demoEmail) return null

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
      <div className="mx-auto max-w-5xl flex items-center justify-center gap-2 text-sm text-amber-800">
        <Info className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden="true" />
        <span>
          <span className="font-medium">Demo account</span> — data resets every 24 hours.
          Changes you make will not be saved permanently.
        </span>
      </div>
    </div>
  )
}
