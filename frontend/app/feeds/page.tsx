"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getFeeds, getFeedFollows, followFeed, unfollowFeed } from "@/lib/api"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Check, Rss, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function FeedsPage() {
  const authed = useAuthGuard()
  const qc = useQueryClient()

  // Track which individual feed is currently mutating so only that row is disabled
  const [pendingFeedId, setPendingFeedId] = useState<string | null>(null)

  const [mutationError, setMutationError] = useState<string | null>(null)

  const { data: feeds, isLoading: feedsLoading, isError: feedsError } = useQuery({
    queryKey: ["feeds"],
    queryFn: getFeeds,
    enabled: authed,
  })

  const { data: follows } = useQuery({
    queryKey: ["feed_follows"],
    queryFn: getFeedFollows,
    enabled: authed,
  })

  const followedFeedIds = useMemo(
    () => new Set(follows?.map((f) => f.feed_id) ?? []),
    [follows]
  )
  const followIdByFeedId = useMemo(
    () => new Map(follows?.map((f) => [f.feed_id, f.id]) ?? []),
    [follows]
  )

  const followMutation = useMutation({
    mutationFn: (feedId: string) => followFeed(feedId),
    onMutate: (feedId) => { setMutationError(null); setPendingFeedId(feedId) },
    onError: (err) => setMutationError(err instanceof Error ? err.message : "Failed to follow feed"),
    onSettled: () => {
      setPendingFeedId(null)
      qc.invalidateQueries({ queryKey: ["feed_follows"] })
    },
  })

  const unfollowMutation = useMutation({
    mutationFn: (args: { followId: string; feedId: string }) => unfollowFeed(args.followId),
    onMutate: (args) => { setMutationError(null); setPendingFeedId(args.feedId) },
    onError: (err) => setMutationError(err instanceof Error ? err.message : "Failed to unfollow feed"),
    onSettled: () => {
      setPendingFeedId(null)
      qc.invalidateQueries({ queryKey: ["feed_follows"] })
      qc.invalidateQueries({ queryKey: ["posts"] })
    },
  })

  const followedCount = followedFeedIds.size

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Nav />
      <main className="mx-auto w-full max-w-3xl px-4 py-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">All Feeds</h1>
            {!feedsLoading && feeds && feeds.length > 0 && (
              <p className="text-sm text-slate-500 mt-0.5">
                Following {followedCount} of {feeds.length}
              </p>
            )}
          </div>
          <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5">
            <Link href="/feeds/add">
              <Plus className="h-4 w-4" />
              Add Feed
            </Link>
          </Button>
        </div>

        {mutationError && (
          <p role="alert" className="mb-4 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-3 py-2">
            {mutationError}
          </p>
        )}

        {feedsError && (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="font-medium text-slate-800">Could not load feeds</p>
              <p className="text-sm text-slate-500 mt-1">Check your connection and try refreshing.</p>
            </div>
          </div>
        )}

        {feedsLoading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="bg-white border-slate-200 py-0 gap-0">
                <CardContent className="flex items-center justify-between py-3.5 px-4">
                  <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <Skeleton className="h-8 w-20 shrink-0 rounded-md" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!feedsLoading && feeds?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50">
              <Rss className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <p className="font-medium text-slate-800">No feeds yet</p>
              <p className="text-sm text-slate-500 mt-1">Be the first to add an RSS feed to the directory.</p>
            </div>
            <Link href="/feeds/add">
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                Add a feed
              </Button>
            </Link>
          </div>
        )}

        {feeds && feeds.length > 0 && (
          <div className="space-y-2">
            {feeds.map((feed) => {
              const isFollowing = followedFeedIds.has(feed.id)
              const followId = followIdByFeedId.get(feed.id)
              const isThisPending = pendingFeedId === feed.id

              return (
                <Card
                  key={feed.id}
                  className="bg-white border-slate-200 hover:shadow-sm transition-shadow duration-150 py-0 gap-0"
                >
                  <CardContent className="flex items-center justify-between py-3.5 px-4">
                    <div className="min-w-0 flex-1 pr-4">
                      <p className="font-semibold text-base text-slate-900 truncate">{feed.name}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{feed.url}</p>
                    </div>

                    {isFollowing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isThisPending || !followId}
                        className="border-green-200 text-green-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shrink-0 min-w-[90px]"
                        onClick={() => followId && unfollowMutation.mutate({ followId, feedId: feed.id })}
                        aria-label={`Unfollow ${feed.name}`}
                      >
                        {isThisPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <Check className="mr-1.5 h-3.5 w-3.5" />
                            Following
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled={isThisPending}
                        className="bg-orange-500 hover:bg-orange-600 text-white shrink-0 min-w-[90px]"
                        onClick={() => followMutation.mutate(feed.id)}
                        aria-label={`Follow ${feed.name}`}
                      >
                        {isThisPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          "Follow"
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
