-- name: CreatePost :one
INSERT INTO posts (feed_id, title, url, description, published_at)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (url) DO NOTHING
RETURNING *;

-- name: GetPostsForUser :many
SELECT p.*
FROM   posts p
JOIN   feed_follows ff ON ff.feed_id = p.feed_id
WHERE  ff.user_id = $1
ORDER BY p.published_at DESC NULLS LAST
LIMIT  $2
OFFSET $3;
