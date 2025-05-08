#!/bin/bash

# This script builds and starts the Go API server
# It handles common configuration and makes it easy to test the Go backend

# Set environment variables
export PORT=8080
export ENV=development
export DATABASE_URL=$DATABASE_URL  # Use the existing DATABASE_URL env var

echo "Building the Go API server..."
cd "$(dirname "$0")/.."

# Build the go server
go build -o ./bin/api ./cmd/api/

echo "Starting the Go API server on port $PORT..."
./bin/api