"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createFeed } from "@/lib/api"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Rss } from "lucide-react"
import Link from "next/link"

export default function AddFeedPage() {
  useAuthGuard()
  const router = useRouter()
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await createFeed(name, url)
      router.push("/feeds")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add feed. Please check the URL and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Nav />
      <main className="mx-auto w-full max-w-lg px-4 py-8 flex-1">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <Link
            href="/feeds"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to feeds
          </Link>
        </nav>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                <Rss className="h-5 w-5 text-orange-500" />
              </div>
              <CardTitle className="text-xl font-bold tracking-tight">Add RSS Feed</CardTitle>
            </div>
            <CardDescription className="pl-12">
              Enter the name and URL of an RSS or Atom feed to add it to the directory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="name">Feed name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Go Blog"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                  aria-describedby={error ? "add-feed-error" : "name-hint"}
                />
                <p id="name-hint" className="text-xs text-slate-400">
                  A short, recognisable label for this feed
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="url">Feed URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com/feed.xml"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                  required
                />
                <p className="text-xs text-slate-400">
                  Must be a valid RSS or Atom URL (ends in .xml, .rss, or /feed)
                </p>
              </div>

              {error && (
                <p
                  id="add-feed-error"
                  role="alert"
                  className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-3 py-2"
                >
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding feed…
                    </>
                  ) : (
                    "Add Feed"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-200 text-slate-600"
                  disabled={loading}
                  onClick={() => router.push("/feeds")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
