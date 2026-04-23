package config

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL        string
	JWTSecret          string
	Port               string
	ScraperConcurrency int
	ScraperInterval    time.Duration
	DemoEmail          string
	DemoPassword       string
}

func LoadConfig() *Config {
	_ = godotenv.Load()

	cfg := &Config{
		DatabaseURL:        mustEnv("DATABASE_URL"),
		JWTSecret:          mustEnv("JWT_SECRET"),
		Port:               envOrDefault("PORT", "8080"),
		ScraperConcurrency: envInt("SCRAPER_CONCURRENCY", 10),
		ScraperInterval:    envDuration("SCRAPER_INTERVAL", 60*time.Second),
		DemoEmail:          os.Getenv("DEMO_EMAIL"),
		DemoPassword:       os.Getenv("DEMO_PASSWORD"),
	}
	if len(cfg.JWTSecret) < 32 {
		log.Fatalf("JWT_SECRET must be at least 32 characters")
	}
	return cfg
}

func mustEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		log.Fatalf("required env var %s is not set", key)
	}
	return v
}

func envOrDefault(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func envInt(key string, def int) int {
	if v := os.Getenv(key); v != "" {
		n, err := strconv.Atoi(v)
		if err == nil {
			return n
		}
	}
	return def
}

func envDuration(key string, def time.Duration) time.Duration {
	if v := os.Getenv(key); v != "" {
		d, err := time.ParseDuration(v)
		if err == nil {
			return d
		}
	}
	return def
}
