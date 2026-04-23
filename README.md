# RSS Aggregator

A production-ready RSS feed aggregator built with Go and Next.js. Follow RSS feeds from across the web and read all your posts in one place.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| API | Go 1.25, chi v5, pgx/v5 |
| Auth | JWT (golang-jwt/v5), bcrypt |
| Database | PostgreSQL, golang-migrate |
| Scraper | gofeed, goroutine worker pool |
| Frontend | Next.js 14 (App Router), shadcn/ui, TanStack Query v5 |
| Hosting | Railway (API) + Neon.tech (PostgreSQL) + Vercel (frontend) — **$0/mo** |

---

## Features

- Register and log in with email + password
- Add any RSS or Atom feed by URL
- Follow / unfollow feeds from a shared directory
- Paginated post feed aggregated from all followed feeds
- Background scraper refreshes feeds every 60 seconds using a goroutine worker pool
- Demo account with automatic 24-hour data reset
- JWT authentication with rate-limited login endpoint

---

## Project Structure

```
.
├── cmd/server/          # Entry point — wires config, DB, router, scraper
├── internal/
│   ├── api/             # chi router, handlers, auth middleware, rate limiter
│   ├── auth/            # JWT creation/validation, bcrypt helpers
│   ├── config/          # Env var loading with validation
│   ├── database/        # Hand-written type-safe query layer (pgx/v5)
│   ├── demo/            # Demo account seeder + 24h reset goroutine
│   └── scraper/         # Worker pool RSS scraper
├── sql/
│   ├── schema/          # golang-migrate versioned migrations
│   └── queries/         # SQL queries (reference for database layer)
└── frontend/            # Next.js app
    ├── app/             # Pages: login, register, dashboard, feeds
    ├── components/      # Nav, footer, demo banner, shadcn/ui
    ├── hooks/           # useAuthGuard
    └── lib/             # Typed API client, auth helpers
```

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/healthz` | — | Health check |
| POST | `/v1/users` | — | Register |
| POST | `/v1/login` | — | Login → JWT |
| GET | `/v1/users/me` | JWT | Current user |
| POST | `/v1/feeds` | JWT | Create feed + auto-follow |
| GET | `/v1/feeds` | JWT | All feeds |
| POST | `/v1/feed_follows` | JWT | Follow a feed |
| GET | `/v1/feed_follows` | JWT | Followed feeds |
| DELETE | `/v1/feed_follows/{id}` | JWT | Unfollow |
| GET | `/v1/posts` | JWT | Posts from followed feeds (`?page=1&limit=20`) |

---

## Running Locally

**Prerequisites:** Go 1.24+, Docker, [golang-migrate](https://github.com/golang-migrate/migrate)

```bash
# 1. Clone and set up env
git clone https://github.com/kittipoom332/go-rss-aggregator
cd go-rss-aggregator
cp .env.example .env        # edit values as needed

# 2. Start PostgreSQL
make docker-up

# 3. Run migrations
make migrate-up

# 4. Start the API
make run

# 5. Start the frontend
cd frontend
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL=http://localhost:8080
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
