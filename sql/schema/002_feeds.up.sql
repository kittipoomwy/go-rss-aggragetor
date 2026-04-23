CREATE TABLE feeds (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT        NOT NULL,
    url             TEXT        NOT NULL UNIQUE,
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    last_fetched_at TIMESTAMP
);
