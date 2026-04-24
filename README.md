# RSS Aggregator

A production-ready RSS feed aggregator built with Go and Next.js. Follow RSS feeds from across the web and read all your posts in one place.

Live demo: [rss.kittipoom.dev](https://rss.kittipoom.dev)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| API | Go 1.25, chi v5, pgx/v5 |
| Auth | JWT (golang-jwt/v5), bcrypt |
| Database | PostgreSQL, golang-migrate |
| Scraper | gofeed, goroutine worker pool |
| Frontend | Next.js 14 (App Router), shadcn/ui, TanStack Query v5 |
| Hosting | Railway (API) + Neon.tech (PostgreSQL) + Vercel (frontend) |

---

## Features

- Register and log in with email + password
- Add any RSS or Atom feed by URL
- Follow / unfollow feeds from a shared directory
- Paginated post feed aggregated from all followed feeds
- Background scraper refreshes feeds every 60 seconds using a goroutine worker pool
- Demo account with automatic 24-hour data reset
- JWT authentication with per-IP rate-limited login endpoint
- CORS-restricted API, security headers on the frontend

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
| POST | `/v1/login` | — | Login → JWT (rate limited) |
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

---

## Environment Variables

### Backend (`.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `PORT` | Port the server listens on (default `8080`) |
| `SCRAPER_CONCURRENCY` | Number of parallel feed scrapers (default `10`) |
| `SCRAPER_INTERVAL` | How often to scrape feeds (default `60s`) |
| `CORS_ORIGINS` | Comma-separated list of allowed frontend origins |
| `DEMO_EMAIL` | Email for the demo account (optional) |
| `DEMO_PASSWORD` | Password for the demo account (optional) |

### Frontend (`.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Full URL of the Go API |
| `NEXT_PUBLIC_DEMO_EMAIL` | Shows "Try Demo Account" button when set |
| `API_URL` | Server-only API URL for the demo-login route handler |
| `DEMO_EMAIL` | Server-only demo email (never exposed to the browser) |
| `DEMO_PASSWORD` | Server-only demo password (never exposed to the browser) |

---

## Deployment

| Service | Purpose
|---------|---------|------|
| [Railway](https://railway.app) | Go API + Docker |
| [Neon.tech](https://neon.tech) | PostgreSQL |
| [Vercel](https://vercel.com) | Next.js frontend |
