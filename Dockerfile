FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download && go mod verify
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /server ./cmd/server

FROM alpine:3.19
RUN apk --no-cache add ca-certificates tzdata && \
    addgroup -S app && adduser -S -G app app
WORKDIR /app
COPY --from=builder /server .
RUN chown app:app /app/server
USER app
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:8080/v1/healthz || exit 1
CMD ["./server"]
