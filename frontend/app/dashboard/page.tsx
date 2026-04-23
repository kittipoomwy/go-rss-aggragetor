"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { getPosts, getFeeds, type Post } from "@/lib/api"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Rss, AlertCircle, ChevronLeft, ChevronRight, Settings2, Plus } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const LIMIT = 20

export default function DashboardPage() {
  const authed = useAuthGuard()
  const [page, setPage] = useState(1)

  const { data: posts, isLoading, isError } = useQuery({
    enabled: authed,
    queryKey: ["posts", page],
    queryFn: () => getPosts(page, LIMIT),
  })

  // Fetch feeds to resolve feed names for each post
  const { data: feeds } = useQuery({
    enabled: authed,
    queryKey: ["feeds"],
    queryFn: getFeeds,
  })

  const feedNameById = useMemo(
    () => new Map(feeds?.map((f) => [f.id, f.name]) ?? []),
    [feeds]
  )

  const hasNextPage = posts && posts.length === LIMIT
  const hasPrevPage = page > 1

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Nav />
      <main className="mx-auto w-full max-w-3xl px-4 py-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your Feed</h1>
            <p className="text-sm text-slate-500 mt-0.5">Latest posts from your followed feeds</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-100 gap-1.5">
              <Link href="/feeds">
                <Settings2 className="h-4 w-4" />
                <span className="hidden sm:inline">Manage Feeds</span>
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5">
              <Link href="/feeds/add">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Feed</span>
              </Link>
            </Button>
          </div>
        </div>

        {isLoading && <PostsSkeleton />}

        {isError && (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="font-medium text-slate-800">Could not load posts</p>
              <p className="text-sm text-slate-500 mt-1">
                Make sure you are following at least one feed, or try refreshing.
              </p>
            </div>
            <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
              <Link href="/feeds">Browse feeds</Link>
            </Button>
          </div>
        )}

        {!isLoading && !isError && posts?.length === 0 && page > 1 && (
          <p className="text-center text-sm text-slate-500 py-16">
            No more posts on this page.{" "}
            <button className="text-orange-500 hover:underline" onClick={() => setPage(1)}>
              Back to start
            </button>
          </p>
        )}

        {!isLoading && !isError && posts?.length === 0 && page === 1 && (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50">
              <Rss className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <p className="font-medium text-slate-800">Nothing here yet</p>
              <p className="text-sm text-slate-500 mt-1">
                Follow some feeds to start seeing posts in your reader.
              </p>
            </div>
            <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
              <Link href="/feeds">Browse feeds</Link>
            </Button>
          </div>
        )}

        {posts && posts.length > 0 && (
          <>
            <div className="space-y-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} feedName={feedNameById.get(post.feed_id)} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasPrevPage}
                onClick={() => setPage((p) => p - 1)}
                className="border-slate-200 gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <span className="text-sm text-slate-500 tabular-nums">Page {page}</span>

              <Button
                variant="outline"
                size="sm"
                disabled={!hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                className="border-slate-200 gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

function PostCard({ post, feedName }: { post: Post; feedName?: string }) {
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null

  const stripped = post.description ? stripHtml(post.description) : null
  const description = stripped && stripped.length > 15 ? stripped : null

  return (
    <Card className="bg-white hover:shadow-md transition-shadow duration-150 border-slate-200 group py-0 gap-0">
      <CardHeader className={cn("px-4 pt-3", description ? "pb-1" : "pb-3")}>
        <div className="flex items-start justify-between gap-3">
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-semibold leading-snug text-slate-900 hover:text-orange-500 transition-colors flex-1 group-hover:text-orange-500"
          >
            {post.title}
          </a>
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-hidden="true"
            tabIndex={-1}
            className="shrink-0 text-slate-300 hover:text-orange-500 transition-colors mt-0.5 opacity-0 group-hover:opacity-100"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {feedName && (
            <Badge
              variant="secondary"
              className="text-xs font-normal text-slate-500 bg-slate-100 border-0 px-2 py-0"
            >
              {feedName}
            </Badge>
          )}
          {date && (
            <span className="text-xs text-slate-400">{date}</span>
          )}
        </div>
      </CardHeader>

      {description && (
        <CardContent className="px-4 pt-1.5 pb-3">
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{description}</p>
        </CardContent>
      )}
    </Card>
  )
}

function PostsSkeleton() {
  // Mix of cards with and without descriptions to match realistic content
  const shapes = [true, false, true, true, false]
  return (
    <div className="space-y-3">
      {shapes.map((hasDesc, i) => (
        <Card key={i} className="bg-white border-slate-200 py-0 gap-0">
          <CardHeader className="px-4 pt-3 pb-1">
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center gap-2 mt-2">
              <Skeleton className="h-3 w-16 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </CardHeader>
          {hasDesc && (
            <CardContent className="px-4 pt-1.5 pb-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6 mt-1.5" />
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}
