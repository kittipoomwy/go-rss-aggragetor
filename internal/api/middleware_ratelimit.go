package api

import (
	"net"
	"net/http"
	"sync"
	"time"
)

type rateLimiter struct {
	mu      sync.Mutex
	entries map[string][]time.Time
	max     int
	window  time.Duration
}

func newRateLimiter(max int, window time.Duration) *rateLimiter {
	rl := &rateLimiter{
		entries: make(map[string][]time.Time),
		max:     max,
		window:  window,
	}
	go rl.cleanup()
	return rl
}

func (rl *rateLimiter) allow(ip string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	cutoff := now.Add(-rl.window)

	prev := rl.entries[ip]
	valid := prev[:0]
	for _, t := range prev {
		if t.After(cutoff) {
			valid = append(valid, t)
		}
	}

	if len(valid) >= rl.max {
		rl.entries[ip] = valid
		return false
	}

	rl.entries[ip] = append(valid, now)
	return true
}

func (rl *rateLimiter) cleanup() {
	ticker := time.NewTicker(rl.window)
	defer ticker.Stop()
	for range ticker.C {
		rl.mu.Lock()
		cutoff := time.Now().Add(-rl.window)
		for ip, times := range rl.entries {
			valid := times[:0]
			for _, t := range times {
				if t.After(cutoff) {
					valid = append(valid, t)
				}
			}
			if len(valid) == 0 {
				delete(rl.entries, ip)
			} else {
				rl.entries[ip] = valid
			}
		}
		rl.mu.Unlock()
	}
}

func (rl *rateLimiter) middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip, _, err := net.SplitHostPort(r.RemoteAddr)
		if err != nil {
			ip = r.RemoteAddr
		}
		if fwd := r.Header.Get("X-Forwarded-For"); fwd != "" {
			ip = fwd
		}
		if !rl.allow(ip) {
			respondWithError(w, http.StatusTooManyRequests, "too many requests, slow down")
			return
		}
		next.ServeHTTP(w, r)
	})
}
