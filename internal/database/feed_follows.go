package database

import (
	"context"

	"github.com/google/uuid"
)

func (q *Queries) CreateFeedFollow(ctx context.Context, userID, feedID uuid.UUID) (FeedFollow, error) {
	row := q.pool.QueryRow(ctx,
		`INSERT INTO feed_follows (user_id, feed_id) VALUES ($1, $2)
		 RETURNING id, user_id, feed_id, created_at, updated_at`,
		userID, feedID,
	)
	return scanFeedFollow(row)
}

func (q *Queries) GetFeedFollowsForUser(ctx context.Context, userID uuid.UUID) ([]FeedFollow, error) {
	rows, err := q.pool.Query(ctx,
		`SELECT id, user_id, feed_id, created_at, updated_at
		 FROM feed_follows WHERE user_id = $1 ORDER BY created_at DESC`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var follows []FeedFollow
	for rows.Next() {
		ff, err := scanFeedFollow(rows)
		if err != nil {
			return nil, err
		}
		follows = append(follows, ff)
	}
	return follows, rows.Err()
}

func (q *Queries) GetFeedFollow(ctx context.Context, id, userID uuid.UUID) (FeedFollow, error) {
	row := q.pool.QueryRow(ctx,
		`SELECT id, user_id, feed_id, created_at, updated_at
		 FROM feed_follows WHERE id = $1 AND user_id = $2`,
		id, userID,
	)
	return scanFeedFollow(row)
}

func (q *Queries) DeleteFeedFollow(ctx context.Context, id, userID uuid.UUID) (int64, error) {
	tag, err := q.pool.Exec(ctx,
		`DELETE FROM feed_follows WHERE id = $1 AND user_id = $2`,
		id, userID,
	)
	return tag.RowsAffected(), err
}

func (q *Queries) DeleteAllFeedFollowsForUser(ctx context.Context, userID uuid.UUID) error {
	_, err := q.pool.Exec(ctx,
		`DELETE FROM feed_follows WHERE user_id = $1`,
		userID,
	)
	return err
}

func scanFeedFollow(s scanner) (FeedFollow, error) {
	var ff FeedFollow
	err := s.Scan(&ff.ID, &ff.UserID, &ff.FeedID, &ff.CreatedAt, &ff.UpdatedAt)
	return ff, err
}
