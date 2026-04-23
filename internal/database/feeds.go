package database

import (
	"context"

	"github.com/google/uuid"
)

func (q *Queries) CreateFeed(ctx context.Context, name, url string, userID uuid.UUID) (Feed, error) {
	row := q.pool.QueryRow(ctx,
		`INSERT INTO feeds (name, url, user_id) VALUES ($1, $2, $3)
		 RETURNING id, name, url, user_id, created_at, updated_at, last_fetched_at`,
		name, url, userID,
	)
	return scanFeed(row)
}

func (q *Queries) GetFeeds(ctx context.Context) ([]Feed, error) {
	rows, err := q.pool.Query(ctx,
		`SELECT id, name, url, user_id, created_at, updated_at, last_fetched_at
		 FROM feeds ORDER BY created_at DESC LIMIT 500`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var feeds []Feed
	for rows.Next() {
		f, err := scanFeed(rows)
		if err != nil {
			return nil, err
		}
		feeds = append(feeds, f)
	}
	return feeds, rows.Err()
}

func (q *Queries) GetFeedByID(ctx context.Context, id uuid.UUID) (Feed, error) {
	row := q.pool.QueryRow(ctx,
		`SELECT id, name, url, user_id, created_at, updated_at, last_fetched_at
		 FROM feeds WHERE id = $1`,
		id,
	)
	return scanFeed(row)
}

func (q *Queries) GetFeedByURL(ctx context.Context, url string) (Feed, error) {
	row := q.pool.QueryRow(ctx,
		`SELECT id, name, url, user_id, created_at, updated_at, last_fetched_at
		 FROM feeds WHERE url = $1`,
		url,
	)
	return scanFeed(row)
}

func (q *Queries) GetNextFeedsToFetch(ctx context.Context, limit int) ([]Feed, error) {
	rows, err := q.pool.Query(ctx,
		`SELECT id, name, url, user_id, created_at, updated_at, last_fetched_at
		 FROM feeds ORDER BY last_fetched_at ASC NULLS FIRST LIMIT $1`,
		limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var feeds []Feed
	for rows.Next() {
		f, err := scanFeed(rows)
		if err != nil {
			return nil, err
		}
		feeds = append(feeds, f)
	}
	return feeds, rows.Err()
}

func (q *Queries) MarkFeedFetched(ctx context.Context, id uuid.UUID) (Feed, error) {
	row := q.pool.QueryRow(ctx,
		`UPDATE feeds SET last_fetched_at = NOW(), updated_at = NOW()
		 WHERE id = $1
		 RETURNING id, name, url, user_id, created_at, updated_at, last_fetched_at`,
		id,
	)
	return scanFeed(row)
}

type scanner interface {
	Scan(dest ...any) error
}

func scanFeed(s scanner) (Feed, error) {
	var f Feed
	err := s.Scan(&f.ID, &f.Name, &f.URL, &f.UserID, &f.CreatedAt, &f.UpdatedAt, &f.LastFetchedAt)
	return f, err
}
