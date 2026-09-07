# Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code and build binary
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o server .

# Production stage
FROM alpine:latest
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

# Copy compiled binary and static assets
COPY --from=builder /app/server .
COPY --from=builder /app/data ./data
RUN mkdir -p uploads/woods

EXPOSE 8080
ENV PORT=8080

CMD ["./server"]
