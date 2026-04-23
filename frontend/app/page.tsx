"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { Rss } from "lucide-react"

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    router.replace(isAuthenticated() ? "/dashboard" : "/login")
  }, [router])
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Rss className="h-8 w-8 text-orange-500 animate-pulse" />
    </div>
  )
}
