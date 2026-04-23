package api

import (
	"context"
	"net/http"
	"strings"

	"github.com/kittipoom332/go-rss-aggregator/internal/auth"
	"github.com/kittipoom332/go-rss-aggregator/internal/database"
)

type contextKey string

const userKey contextKey = "user"

func (cfg *apiConfig) middlewareAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			respondWithError(w, http.StatusUnauthorized, "missing bearer token")
			return
		}
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		userID, err := auth.ValidateJWT(tokenStr, cfg.jwtSecret)
		if err != nil {
			respondWithError(w, http.StatusUnauthorized, "invalid token")
			return
		}

		user, err := cfg.db.GetUserByID(r.Context(), userID)
		if err != nil {
			respondWithError(w, http.StatusUnauthorized, "user not found")
			return
		}

		ctx := context.WithValue(r.Context(), userKey, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func userFromContext(r *http.Request) database.User {
	user, _ := r.Context().Value(userKey).(database.User)
	return user
}
