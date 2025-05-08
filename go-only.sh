#!/bin/bash

# This script runs only the Go server and uses the Express server 
# only for serving the frontend static files

# Set environment variables
export GO_SERVER_PORT=8080
export GO_API_URL="http://localhost:$GO_SERVER_PORT/api"
export DATABASE_URL=$DATABASE_URL

echo "======================================================"
echo "🚀 Starting standalone Go API server"
echo "======================================================"
echo "Go API Server URL: $GO_API_URL"
echo "======================================================"
echo "Note: The Express server is still needed for the frontend"
echo "but all API functionality is handled by the Go server"
echo "======================================================"

# Ensure the bin directory exists
mkdir -p go-server/bin

# Build the Go server
echo "Building Go server..."
(cd go-server && go build -o ./bin/api ./cmd/api/)

# Check if build was successful
if [ $? -ne 0 ]; then
  echo "Error: Failed to build Go server"
  exit 1
fi

# Run the Go server
echo "Starting Go server..."
(cd go-server && ./bin/api)