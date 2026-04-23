package api

import "github.com/kittipoom332/go-rss-aggregator/internal/database"

type apiConfig struct {
	db        *database.Queries
	jwtSecret string
}
