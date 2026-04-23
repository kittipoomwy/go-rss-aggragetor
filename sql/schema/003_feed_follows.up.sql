CREATE TABLE feed_follows (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feed_id     UUID        NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, feed_id)
);
