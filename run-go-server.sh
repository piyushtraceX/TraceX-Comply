#!/bin/bash

echo "Building and running Go server..."

# Set environment variables if not already set
export PORT=${PORT:-8080}
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

# Download dependencies
echo "Downloading dependencies..."
go mod download

# Build the server
echo "Building the server..."
go build -o bin/eudr-comply-server go-server/main.go

# Run the server
echo "Starting the server on port $PORT..."
./bin/eudr-comply-server