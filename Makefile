MIGRATE=migrate -path sql/schema -database "$(DATABASE_URL)"

.PHONY: build run migrate-up migrate-down sqlc test docker-up docker-down

build:
	go build -o bin/server ./cmd/server

run:
	go run ./cmd/server

migrate-up:
	$(MIGRATE) up

migrate-down:
	$(MIGRATE) down 1

test:
	go test ./... -v

docker-up:
	docker compose up -d postgres

docker-down:
	docker compose down
