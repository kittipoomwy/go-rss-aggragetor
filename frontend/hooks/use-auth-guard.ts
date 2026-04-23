"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"

export function useAuthGuard(): boolean {
  const router = useRouter()
  // Initialise to false — queries stay disabled until we confirm auth on client
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    if (isAuthenticated()) {
      setAuthed(true)
    } else {
      router.replace("/login")
    }
  }, [router])

  return authed
}
