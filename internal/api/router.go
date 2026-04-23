package api

import (
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/kittipoom332/go-rss-aggregator/internal/database"
)

func NewRouter(db *database.Queries, jwtSecret string) http.Handler {
	cfg := &apiConfig{db: db, jwtSecret: jwtSecret}

	// 10 requests per minute per IP on auth endpoints
	authLimiter := newRateLimiter(10, time.Minute)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(corsMiddleware())

	r.Get("/v1/healthz", cfg.handlerHealthz)
	r.With(authLimiter.middleware).Post("/v1/users", cfg.handlerCreateUser)
	r.With(authLimiter.middleware).Post("/v1/login", cfg.handlerLogin)

	r.Group(func(r chi.Router) {
		r.Use(cfg.middlewareAuth)
		r.Get("/v1/users/me", cfg.handlerGetCurrentUser)
		r.Post("/v1/feeds", cfg.handlerCreateFeed)
		r.Get("/v1/feeds", cfg.handlerGetFeeds)
		r.Post("/v1/feed_follows", cfg.handlerCreateFeedFollow)
		r.Get("/v1/feed_follows", cfg.handlerGetFeedFollows)
		r.Delete("/v1/feed_follows/{feedFollowID}", cfg.handlerDeleteFeedFollow)
		r.Get("/v1/posts", cfg.handlerGetPosts)
	})

	return r
}

func corsMiddleware() func(http.Handler) http.Handler {
	origins := []string{"http://localhost:3000"}
	if v := os.Getenv("CORS_ORIGINS"); v != "" {
		origins = append(origins, strings.Split(v, ",")...)
	}
	return cors.Handler(cors.Options{
		AllowedOrigins: origins,
		AllowedMethods: []string{"GET", "POST", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Authorization", "Content-Type"},
	})
}
