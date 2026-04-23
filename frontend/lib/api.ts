import { getToken } from "./auth"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })
  if (res.status === 204) return undefined as T
  const text = await res.text()
  if (!res.ok) {
    let msg = text
    try { msg = JSON.parse(text).error ?? text } catch {}
    throw new ApiError(res.status, msg)
  }
  return (text ? JSON.parse(text) : undefined) as T
}

// --- Types ---

export type User = {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export type AuthResponse = User & { token: string }

export type Feed = {
  id: string
  name: string
  url: string
  user_id: string
  created_at: string
  updated_at: string
  last_fetched_at: string | null
}

export type FeedFollow = {
  id: string
  user_id: string
  feed_id: string
  created_at: string
  updated_at: string
}

export type Post = {
  id: string
  feed_id: string
  title: string
  url: string
  description: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

// --- Auth ---

export const register = (email: string, password: string) =>
  apiFetch<AuthResponse>("/v1/users", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })

export const login = (email: string, password: string) =>
  apiFetch<AuthResponse>("/v1/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })

export const getMe = () => apiFetch<User>("/v1/users/me")

// --- Feeds ---

export const getFeeds = () => apiFetch<Feed[]>("/v1/feeds")

export const createFeed = (name: string, url: string) =>
  apiFetch<{ feed: Feed; feed_follow: FeedFollow }>("/v1/feeds", {
    method: "POST",
    body: JSON.stringify({ name, url }),
  })

// --- Feed Follows ---

export const getFeedFollows = () => apiFetch<FeedFollow[]>("/v1/feed_follows")

export const followFeed = (feedId: string) =>
  apiFetch<FeedFollow>("/v1/feed_follows", {
    method: "POST",
    body: JSON.stringify({ feed_id: feedId }),
  })

export const unfollowFeed = (feedFollowId: string) =>
  apiFetch<void>(`/v1/feed_follows/${feedFollowId}`, { method: "DELETE" })

// --- Posts ---

export const getPosts = (page = 1, limit = 20) =>
  apiFetch<Post[]>(`/v1/posts?page=${page}&limit=${limit}`)
