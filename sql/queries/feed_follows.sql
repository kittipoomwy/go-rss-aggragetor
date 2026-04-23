-- name: CreateFeedFollow :one
INSERT INTO feed_follows (user_id, feed_id)
VALUES ($1, $2)
RETURNING *;

-- name: GetFeedFollowsForUser :many
SELECT * FROM feed_follows
WHERE user_id = $1
ORDER BY created_at DESC;

-- name: GetFeedFollow :one
SELECT * FROM feed_follows
WHERE id = $1
  AND user_id = $2;

-- name: DeleteFeedFollow :exec
DELETE FROM feed_follows
WHERE id = $1
  AND user_id = $2;
