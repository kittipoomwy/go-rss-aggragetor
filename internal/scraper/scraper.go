package scraper

import (
	"context"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/kittipoom332/go-rss-aggregator/internal/database"
	"github.com/mmcdole/gofeed"
)

var httpClient = &http.Client{Timeout: 30 * time.Second}

func StartScraper(ctx context.Context, db *database.Queries, concurrency int, interval time.Duration) {
	log.Printf("scraper: starting — concurrency=%d interval=%s", concurrency, interval)
	ticker := time.NewTicker(interval)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			log.Println("scraper: stopping")
			return
		case <-ticker.C:
			feeds, err := db.GetNextFeedsToFetch(ctx, concurrency)
			if err != nil {
				log.Printf("scraper: failed to fetch feeds: %v", err)
				continue
			}
			log.Printf("scraper: fetching %d feeds", len(feeds))
			var wg sync.WaitGroup
			for _, feed := range feeds {
				wg.Add(1)
				go scrapeFeed(ctx, db, feed, &wg)
			}
			wg.Wait()
		}
	}
}

func scrapeFeed(ctx context.Context, db *database.Queries, feed database.Feed, wg *sync.WaitGroup) {
	defer wg.Done()
	defer func() {
		if _, err := db.MarkFeedFetched(ctx, feed.ID); err != nil {
			log.Printf("scraper: failed to mark feed %s fetched: %v", feed.ID, err)
		}
	}()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, feed.URL, nil)
	if err != nil {
		log.Printf("scraper: build request %s error: %v", feed.URL, err)
		return
	}
	resp, err := httpClient.Do(req)
	if err != nil {
		log.Printf("scraper: GET %s error: %v", feed.URL, err)
		return
	}
	defer resp.Body.Close()

	parsed, err := gofeed.NewParser().Parse(resp.Body)
	if err != nil {
		log.Printf("scraper: parse %s error: %v", feed.URL, err)
		return
	}

	saved := 0
	for _, item := range parsed.Items {
		if item.Link == "" {
			continue
		}
		_, err := db.CreatePost(ctx, database.CreatePostParams{
			FeedID:      feed.ID,
			Title:       item.Title,
			URL:         item.Link,
			Description: nilIfEmpty(item.Description),
			PublishedAt: item.PublishedParsed,
		})
		if err == nil {
			saved++
		} else if err.Error() != "no rows in result set" {
			log.Printf("scraper: failed to save post %s: %v", item.Link, err)
		}
	}
	log.Printf("scraper: %s — saved %d new posts", feed.Name, saved)
}

func nilIfEmpty(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
