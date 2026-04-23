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
import { Rss, Loader2 } from "lucide-react"

const SHOW_DEMO = !!process.env.NEXT_PUBLIC_DEMO_EMAIL

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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
      setError(err instanceof Error ? err.message : "Login failed. Please check your credentials.")
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
      setError(err instanceof Error ? err.message : "Demo login failed")
    } finally {
      setDemoLoading(false)
    }
  }

  const anyLoading = loading || demoLoading

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm">
        {/* Brand mark */}
        <div className="flex flex-col items-center mb-8 gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 shadow-sm">
            <Rss className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">RSS Aggregator</span>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl tracking-tight"><h1 className="text-xl font-semibold tracking-tight">Sign in</h1></CardTitle>
            <CardDescription>Enter your credentials to access your feed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={anyLoading}
                  required
                  aria-describedby={error ? "login-error" : undefined}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={anyLoading}
                  required
                />
              </div>

              {error && (
                <p
                  id="login-error"
                  role="alert"
                  className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-3 py-2"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={anyLoading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
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
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading demo…
                    </>
                  ) : (
                    "Try Demo Account"
                  )}
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
