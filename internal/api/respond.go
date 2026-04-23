package api

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/jackc/pgx/v5/pgconn"
)

func respondWithJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		log.Printf("respondWithJSON encode error: %v", err)
	}
}

func respondWithError(w http.ResponseWriter, status int, msg string) {
	respondWithJSON(w, status, map[string]string{"error": msg})
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}
