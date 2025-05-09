#!/bin/bash

echo "Building and running Go server alongside Express server..."

# Set environment variables if not already set
export GO_PORT=${GO_PORT:-8081}
export PORT=${PORT:-3000}
export SESSION_SECRET=${SESSION_SECRET:-"dev-session-secret-replace-in-production"}

if [ -z "$DATABASE_URL" ]; then
  echo "Using default database URL since DATABASE_URL is not set"
  export DATABASE_URL=${DATABASE_URL:-"postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable"}
fi
export JWT_SECRET=${JWT_SECRET:-"default-dev-secret-change-in-production"}

# Go to the project root directory
cd "$(dirname "$0")"

# Check if Go is installed
if ! command -v go &> /dev/null; then
  echo "Go is not installed. Please install Go to run this server."
  exit 1
fi

# Create bin directory if it doesn't exist
mkdir -p bin

# Download Go dependencies
echo "Downloading Go dependencies..."
cd go-server && go mod download && cd ..

# Build the Go server
echo "Building the Go server..."
go build -o bin/eudr-comply-server go-server/main.go

# Start the Go server in the background
echo "Starting the Go server on port $GO_PORT..."
PORT=$GO_PORT ./bin/eudr-comply-server &
GO_PID=$!

# Start the React/Express app
echo "Starting the Express server on port $PORT..."
npm run dev &
EXPRESS_PID=$!

# Handle termination
trap 'echo "Shutting down servers..."; kill $GO_PID $EXPRESS_PID; exit 0' SIGINT SIGTERM

# Wait for both processes
wait