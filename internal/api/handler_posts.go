package api

import (
	"net/http"
	"strconv"

	"github.com/kittipoom332/go-rss-aggregator/internal/database"
)

func (cfg *apiConfig) handlerGetPosts(w http.ResponseWriter, r *http.Request) {
	limit := queryInt(r, "limit", 20, 100)
	page := queryInt(r, "page", 1, 1000)
	offset := (page - 1) * limit

	user := userFromContext(r)

	posts, err := cfg.db.GetPostsForUser(r.Context(), user.ID, limit, offset)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to get posts")
		return
	}
	if posts == nil {
		posts = []database.Post{}
	}
	respondWithJSON(w, http.StatusOK, posts)
}

func queryInt(r *http.Request, key string, def, max int) int {
	v := r.URL.Query().Get(key)
	if v == "" {
		return def
	}
	n, err := strconv.Atoi(v)
	if err != nil || n < 1 {
		return def
	}
	if n > max {
		return max
	}
	return n
}
