package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kittipoom332/go-rss-aggregator/internal/api"
	"github.com/kittipoom332/go-rss-aggregator/internal/config"
	"github.com/kittipoom332/go-rss-aggregator/internal/database"
	"github.com/kittipoom332/go-rss-aggregator/internal/demo"
	"github.com/kittipoom332/go-rss-aggregator/internal/scraper"
)

func main() {
	cfg := config.LoadConfig()

	pool, err := pgxpool.New(context.Background(), cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(context.Background()); err != nil {
		log.Fatalf("database ping failed: %v", err)
	}
	log.Println("database connection established")

	db := database.New(pool)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go scraper.StartScraper(ctx, db, cfg.ScraperConcurrency, cfg.ScraperInterval)
	go demo.StartDemoManager(ctx, db, cfg.DemoEmail, cfg.DemoPassword)

	router := api.NewRouter(db, cfg.JWTSecret)

	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: router,
	}

	go func() {
		quit := make(chan os.Signal, 1)
		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
		<-quit
		log.Println("shutdown signal received")
		cancel()
		shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer shutdownCancel()
		if err := srv.Shutdown(shutdownCtx); err != nil {
			log.Printf("server shutdown error: %v", err)
		}
	}()

	log.Printf("server listening on :%s", cfg.Port)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("server error: %v", err)
	}
	log.Println("server stopped")
}
