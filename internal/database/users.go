package database

import (
	"context"

	"github.com/google/uuid"
)

func (q *Queries) CreateUser(ctx context.Context, email, hashedPassword string) (User, error) {
	row := q.pool.QueryRow(ctx,
		`INSERT INTO users (email, hashed_password) VALUES ($1, $2)
		 RETURNING id, email, hashed_password, created_at, updated_at`,
		email, hashedPassword,
	)
	var u User
	err := row.Scan(&u.ID, &u.Email, &u.HashedPassword, &u.CreatedAt, &u.UpdatedAt)
	return u, err
}

func (q *Queries) GetUserByEmail(ctx context.Context, email string) (User, error) {
	row := q.pool.QueryRow(ctx,
		`SELECT id, email, hashed_password, created_at, updated_at FROM users WHERE email = $1`,
		email,
	)
	var u User
	err := row.Scan(&u.ID, &u.Email, &u.HashedPassword, &u.CreatedAt, &u.UpdatedAt)
	return u, err
}

func (q *Queries) GetUserByID(ctx context.Context, id uuid.UUID) (User, error) {
	row := q.pool.QueryRow(ctx,
		`SELECT id, email, hashed_password, created_at, updated_at FROM users WHERE id = $1`,
		id,
	)
	var u User
	err := row.Scan(&u.ID, &u.Email, &u.HashedPassword, &u.CreatedAt, &u.UpdatedAt)
	return u, err
}
