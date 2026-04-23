package api

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/kittipoom332/go-rss-aggregator/internal/database"
)

func (cfg *apiConfig) handlerCreateFeedFollow(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	var body struct {
		FeedID uuid.UUID `json:"feed_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	user := userFromContext(r)

	// verify feed exists
	if _, err := cfg.db.GetFeedByID(r.Context(), body.FeedID); err != nil {
		respondWithError(w, http.StatusNotFound, "feed not found")
		return
	}

	follow, err := cfg.db.CreateFeedFollow(r.Context(), user.ID, body.FeedID)
	if err != nil {
		if isUniqueViolation(err) {
			respondWithError(w, http.StatusConflict, "already following this feed")
		} else {
			respondWithError(w, http.StatusInternalServerError, "failed to create feed follow")
		}
		return
	}

	respondWithJSON(w, http.StatusCreated, follow)
}

func (cfg *apiConfig) handlerGetFeedFollows(w http.ResponseWriter, r *http.Request) {
	user := userFromContext(r)
	follows, err := cfg.db.GetFeedFollowsForUser(r.Context(), user.ID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to get feed follows")
		return
	}
	if follows == nil {
		follows = []database.FeedFollow{}
	}
	respondWithJSON(w, http.StatusOK, follows)
}

func (cfg *apiConfig) handlerDeleteFeedFollow(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "feedFollowID")
	id, err := uuid.Parse(idStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid feed follow id")
		return
	}

	user := userFromContext(r)

	affected, err := cfg.db.DeleteFeedFollow(r.Context(), id, user.ID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to delete feed follow")
		return
	}
	if affected == 0 {
		respondWithError(w, http.StatusNotFound, "feed follow not found")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
