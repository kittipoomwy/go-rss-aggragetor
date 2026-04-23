package database

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID             uuid.UUID `json:"id"`
	Email          string    `json:"email"`
	HashedPassword string    `json:"-"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type Feed struct {
	ID             uuid.UUID  `json:"id"`
	Name           string     `json:"name"`
	URL            string     `json:"url"`
	UserID         uuid.UUID  `json:"user_id"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
	LastFetchedAt  *time.Time `json:"last_fetched_at"`
}

type FeedFollow struct {
	ID        uuid.UUID `json:"id"`
	UserID    uuid.UUID `json:"user_id"`
	FeedID    uuid.UUID `json:"feed_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Post struct {
	ID          uuid.UUID  `json:"id"`
	FeedID      uuid.UUID  `json:"feed_id"`
	Title       string     `json:"title"`
	URL         string     `json:"url"`
	Description *string    `json:"description"`
	PublishedAt *time.Time `json:"published_at"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}
