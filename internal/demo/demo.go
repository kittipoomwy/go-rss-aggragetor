package demo

import (
	"context"
	"log"
	"time"

	"github.com/kittipoom332/go-rss-aggregator/internal/auth"
	"github.com/kittipoom332/go-rss-aggregator/internal/database"
)

type seedFeed struct {
	name string
	url  string
}

// autoFollowFeeds are followed by the demo account automatically
var autoFollowFeeds = []seedFeed{
	{name: "Hacker News", url: "https://news.ycombinator.com/rss"},
	{name: "GitHub Blog", url: "https://github.blog/feed/"},
	{name: "CSS-Tricks", url: "https://css-tricks.com/feed/"},
	{name: "Go Blog", url: "https://go.dev/blog/feed.atom"},
}

// templateFeeds are created globally so any user can discover and follow them
var templateFeeds = []seedFeed{
	{name: "The Pragmatic Engineer", url: "https://newsletter.pragmaticengineer.com/feed"},
	{name: "Netflix Tech Blog", url: "https://netflixtechblog.com/feed"},
	{name: "Uber Engineering", url: "https://www.uber.com/en-US/blog/engineering/rss/"},
	{name: "Cloudflare Blog", url: "https://blog.cloudflare.com/rss/"},
	{name: "Docker Blog", url: "https://www.docker.com/blog/feed/"},
	{name: "Dev.to", url: "https://dev.to/feed"},
}

// seedFeeds is the combined list used for the demo auto-follow
var seedFeeds = autoFollowFeeds

const resetInterval = 24 * time.Hour

func StartDemoManager(ctx context.Context, db *database.Queries, email, password string) {
	if email == "" || password == "" {
		log.Println("demo: DEMO_EMAIL or DEMO_PASSWORD not set, skipping demo setup")
		return
	}

	log.Printf("demo: managing demo account <%s>", email)

	if err := seedDemo(ctx, db, email, password); err != nil {
		log.Printf("demo: initial seed failed: %v", err)
	}

	ticker := time.NewTicker(resetInterval)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			log.Println("demo: resetting demo account")
			if err := resetDemo(ctx, db, email, password); err != nil {
				log.Printf("demo: reset failed: %v", err)
			}
		}
	}
}

func seedDemo(ctx context.Context, db *database.Queries, email, password string) error {
	user, err := getOrCreateUser(ctx, db, email, password)
	if err != nil {
		return err
	}
	ensureTemplateFeeds(ctx, db, user)
	return ensureFollows(ctx, db, user)
}

func ensureTemplateFeeds(ctx context.Context, db *database.Queries, user database.User) {
	for _, sf := range templateFeeds {
		if _, err := db.CreateFeed(ctx, sf.name, sf.url, user.ID); err != nil {
			// already exists — fine
		}
	}
	log.Printf("demo: ensured %d template feeds", len(templateFeeds))
}

func resetDemo(ctx context.Context, db *database.Queries, email, password string) error {
	user, err := db.GetUserByEmail(ctx, email)
	if err != nil {
		return seedDemo(ctx, db, email, password)
	}
	if err := db.DeleteAllFeedFollowsForUser(ctx, user.ID); err != nil {
		return err
	}
	return ensureFollows(ctx, db, user)
}

func getOrCreateUser(ctx context.Context, db *database.Queries, email, password string) (database.User, error) {
	user, err := db.GetUserByEmail(ctx, email)
	if err == nil {
		return user, nil
	}
	hash, err := auth.HashPassword(password)
	if err != nil {
		return database.User{}, err
	}
	return db.CreateUser(ctx, email, hash)
}

func ensureFollows(ctx context.Context, db *database.Queries, user database.User) error {
	for _, sf := range seedFeeds {
		feed, err := db.CreateFeed(ctx, sf.name, sf.url, user.ID)
		if err != nil {
			feed, err = db.GetFeedByURL(ctx, sf.url)
			if err != nil {
				log.Printf("demo: could not get feed %s: %v", sf.url, err)
				continue
			}
		}
		if _, err := db.CreateFeedFollow(ctx, user.ID, feed.ID); err != nil {
			// already following — fine
		}
	}
	log.Printf("demo: account <%s> seeded with %d feeds", user.Email, len(seedFeeds))
	return nil
}
