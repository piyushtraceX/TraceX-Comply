#!/bin/bash

# This script runs the entire application with Go as the backend
# Express.js only serves the frontend static files

# Set environment variables for the Go server
export GO_SERVER_PORT=8080
export GO_API_URL="http://localhost:$GO_SERVER_PORT/api"
export DATABASE_URL=$DATABASE_URL
export NODE_ENV=development

# Display important information
echo "======================================================"
echo "🚀 Starting EUDR Compliance Platform with Go Backend"
echo "======================================================"
echo "Frontend Express Server: http://localhost:5000"
echo "Go API Server:           http://localhost:$GO_SERVER_PORT/api"
echo "======================================================"
echo "NOTE: All API requests will be handled by the Go server"
echo "Express.js is only serving the frontend static files"
echo "======================================================"

# Build the Go server in the background
echo "Building Go server..."
(cd go-server && go build -o ./bin/api ./cmd/api/) &
GO_BUILD_PID=$!

# Wait for Go server to build
wait $GO_BUILD_PID
if [ $? -ne 0 ]; then
  echo "Error: Failed to build Go server"
  exit 1
fi

# Run both servers using concurrently
npx concurrently \
  --names "FRONTEND,GO-API" \
  --prefix-colors "blue.bold,green.bold" \
  --prefix "[{name}]" \
  --kill-others \
  "npm run dev" \
  "cd go-server && ./bin/api"