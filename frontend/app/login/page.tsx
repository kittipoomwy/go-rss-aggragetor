"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { login } from "@/lib/api"
import { setToken } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Rss, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react"

const SHOW_DEMO = !!process.env.NEXT_PUBLIC_DEMO_EMAIL

function friendlyError(raw: string): string {
  const msg = raw.toLowerCase()
  if (msg.includes("invalid credentials") || msg.includes("unauthorized")) return "Incorrect email or password."
  if (msg.includes("user not found")) return "No account found with that email."
  if (msg.includes("network") || msg.includes("fetch")) return "Could not reach the server. Check your connection."
  return raw
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await login(email, password)
      setToken(res.token)
      router.push("/dashboard")
    } catch (err: unknown) {
      setError(friendlyError(err instanceof Error ? err.message : "Login failed."))
    } finally {
      setLoading(false)
    }
  }

  async function handleDemoLogin() {
    setError("")
    setDemoLoading(true)
    try {
      const res = await fetch("/api/demo-login", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Demo login failed")
      setToken(data.token)
      router.push("/dashboard")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Demo login failed.")
    } finally {
      setDemoLoading(false)
    }
  }

  const anyLoading = loading || demoLoading

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
              <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
            </CardTitle>
            <CardDescription>Enter your credentials to access your feed</CardDescription>
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
                  disabled={anyLoading}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError("") }}
                    disabled={anyLoading}
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
                disabled={anyLoading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Signing in…
                  </>
                ) : "Sign in"}
              </Button>
            </form>

            {SHOW_DEMO && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-400 tracking-wider">or</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-slate-200 text-slate-700 hover:bg-slate-50"
                  disabled={anyLoading}
                  onClick={handleDemoLogin}
                >
                  {demoLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Loading demo…
                    </>
                  ) : "Try Demo Account"}
                </Button>
              </>
            )}

            <p className="text-center text-sm text-slate-500">
              No account?{" "}
              <Link
                href="/register"
                className="font-medium text-orange-500 hover:text-orange-600 underline-offset-4 hover:underline transition-colors"
              >
                Create one free
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
