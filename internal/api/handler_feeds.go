package api

import (
	"encoding/json"
	"net/http"

	"github.com/kittipoom332/go-rss-aggregator/internal/database"
)

func (cfg *apiConfig) handlerCreateFeed(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	var body struct {
		Name string `json:"name"`
		URL  string `json:"url"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if body.Name == "" || body.URL == "" {
		respondWithError(w, http.StatusBadRequest, "name and url are required")
		return
	}

	user := userFromContext(r)

	feed, err := cfg.db.CreateFeed(r.Context(), body.Name, body.URL, user.ID)
	if err != nil {
		if isUniqueViolation(err) {
			respondWithError(w, http.StatusConflict, "feed url already exists")
		} else {
			respondWithError(w, http.StatusInternalServerError, "failed to create feed")
		}
		return
	}

	follow, err := cfg.db.CreateFeedFollow(r.Context(), user.ID, feed.ID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to follow feed")
		return
	}

	respondWithJSON(w, http.StatusCreated, map[string]any{
		"feed":        feed,
		"feed_follow": follow,
	})
}

func (cfg *apiConfig) handlerGetFeeds(w http.ResponseWriter, r *http.Request) {
	feeds, err := cfg.db.GetFeeds(r.Context())
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to get feeds")
		return
	}
	if feeds == nil {
		feeds = []database.Feed{}
	}
	respondWithJSON(w, http.StatusOK, feeds)
}
