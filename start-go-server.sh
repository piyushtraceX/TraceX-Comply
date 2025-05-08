#!/bin/bash

# This script builds and starts the Go API server as the standalone backend
# Express.js is no longer used for API functionality

# Set environment variables
export PORT=8080
export ENV=development
export DATABASE_URL=$DATABASE_URL
export GO_SERVER_URL="http://localhost:8080/api"

echo "========================================================"
echo "🚀 Starting standalone Go backend server"
echo "========================================================"
echo "- All API requests will be handled by the Go server"
echo "- Express.js is only used to serve the frontend assets"
echo "- API URL: $GO_SERVER_URL"
echo "========================================================"

# Go to the go-server directory
cd go-server

# Create the bin directory if it doesn't exist
mkdir -p bin

# Update Go dependencies (with a timeout to prevent hanging)
echo "Installing Go dependencies..."
timeout 30s go mod tidy || echo "Warning: go mod tidy timed out, continuing anyway"

# Build the Go server
echo "Building Go API server..."
go build -o ./bin/api ./cmd/api/

# Run the Go server
echo "Starting Go API server on port $PORT..."
./bin/api