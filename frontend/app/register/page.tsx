"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { register } from "@/lib/api"
import { setToken } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Rss, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react"

function friendlyError(raw: string): string {
  const msg = raw.toLowerCase()
  if (msg.includes("already exists") || msg.includes("duplicate") || msg.includes("409") || msg.includes("conflict")) return "An account with that email already exists."
  if (msg.includes("invalid email")) return "Please enter a valid email address."
  if (msg.includes("password") && (msg.includes("short") || msg.includes("least"))) return "Password must be at least 8 characters."
  if (msg.includes("network") || msg.includes("fetch")) return "Could not reach the server. Check your connection."
  return raw
}

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await register(email, password)
      setToken(res.token)
      router.push("/dashboard")
    } catch (err: unknown) {
      setError(friendlyError(err instanceof Error ? err.message : "Registration failed. Please try again."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8 gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 shadow-sm">
            <Rss className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">RSS Aggregator</span>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl tracking-tight">
              <h1 className="text-xl font-semibold tracking-tight">Create account</h1>
            </CardTitle>
            <CardDescription>Start following RSS feeds — it&apos;s free</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 px-3 py-2.5"
              >
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError("") }}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError("") }}
                    disabled={loading}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Creating account…
                  </>
                ) : "Create account"}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-orange-500 hover:text-orange-600 underline-offset-4 hover:underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
