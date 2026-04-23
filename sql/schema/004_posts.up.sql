CREATE TABLE posts (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    feed_id      UUID        NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
    title        TEXT        NOT NULL,
    url          TEXT        NOT NULL UNIQUE,
    description  TEXT,
    published_at TIMESTAMP,
    created_at   TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX posts_feed_id_idx      ON posts(feed_id);
CREATE INDEX posts_published_at_idx ON posts(published_at DESC);
