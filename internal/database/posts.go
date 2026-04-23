package database

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type CreatePostParams struct {
	FeedID      uuid.UUID
	Title       string
	URL         string
	Description *string
	PublishedAt *time.Time
}

func (q *Queries) CreatePost(ctx context.Context, p CreatePostParams) (Post, error) {
	row := q.pool.QueryRow(ctx,
		`INSERT INTO posts (feed_id, title, url, description, published_at)
		 VALUES ($1, $2, $3, $4, $5)
		 ON CONFLICT (url) DO NOTHING
		 RETURNING id, feed_id, title, url, description, published_at, created_at, updated_at`,
		p.FeedID, p.Title, p.URL, p.Description, p.PublishedAt,
	)
	return scanPost(row)
}

func (q *Queries) GetPostsForUser(ctx context.Context, userID uuid.UUID, limit, offset int) ([]Post, error) {
	rows, err := q.pool.Query(ctx,
		`SELECT p.id, p.feed_id, p.title, p.url, p.description, p.published_at, p.created_at, p.updated_at
		 FROM posts p
		 JOIN feed_follows ff ON ff.feed_id = p.feed_id
		 WHERE ff.user_id = $1
		 ORDER BY p.published_at DESC NULLS LAST
		 LIMIT $2 OFFSET $3`,
		userID, limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var posts []Post
	for rows.Next() {
		post, err := scanPost(rows)
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}
	return posts, rows.Err()
}

func scanPost(s scanner) (Post, error) {
	var p Post
	err := s.Scan(&p.ID, &p.FeedID, &p.Title, &p.URL, &p.Description, &p.PublishedAt, &p.CreatedAt, &p.UpdatedAt)
	return p, err
}
