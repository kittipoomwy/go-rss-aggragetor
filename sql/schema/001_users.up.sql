CREATE TABLE users (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email            TEXT        NOT NULL UNIQUE,
    hashed_password  TEXT        NOT NULL,
    created_at       TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP   NOT NULL DEFAULT NOW()
);
