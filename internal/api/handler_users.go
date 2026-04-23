package api

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/kittipoom332/go-rss-aggregator/internal/auth"
	"github.com/kittipoom332/go-rss-aggregator/internal/database"
)

type userResponse struct {
	database.User
	Token string `json:"token"`
}

func (cfg *apiConfig) handlerCreateUser(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	body.Email = strings.ToLower(strings.TrimSpace(body.Email))
	if body.Email == "" || body.Password == "" {
		respondWithError(w, http.StatusBadRequest, "email and password are required")
		return
	}
	if len(body.Password) < 8 {
		respondWithError(w, http.StatusBadRequest, "password must be at least 8 characters")
		return
	}

	hash, err := auth.HashPassword(body.Password)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to hash password")
		return
	}

	user, err := cfg.db.CreateUser(r.Context(), body.Email, hash)
	if err != nil {
		if isUniqueViolation(err) {
			respondWithError(w, http.StatusConflict, "email already exists")
		} else {
			respondWithError(w, http.StatusInternalServerError, "failed to create user")
		}
		return
	}

	token, err := auth.MakeJWT(user.ID, cfg.jwtSecret)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to create token")
		return
	}

	respondWithJSON(w, http.StatusCreated, userResponse{User: user, Token: token})
}

func (cfg *apiConfig) handlerLogin(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	body.Email = strings.ToLower(strings.TrimSpace(body.Email))

	user, err := cfg.db.GetUserByEmail(r.Context(), body.Email)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	if err := auth.CheckPasswordHash(body.Password, user.HashedPassword); err != nil {
		respondWithError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	token, err := auth.MakeJWT(user.ID, cfg.jwtSecret)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to create token")
		return
	}

	respondWithJSON(w, http.StatusOK, userResponse{User: user, Token: token})
}

func (cfg *apiConfig) handlerGetCurrentUser(w http.ResponseWriter, r *http.Request) {
	respondWithJSON(w, http.StatusOK, userFromContext(r))
}
