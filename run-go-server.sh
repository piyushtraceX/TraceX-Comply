#!/bin/bash

# Check if we're in development or production mode
mode=${1:-dev}
echo "Running in $mode mode..."

# Build frontend in production mode
if [ "$mode" = "prod" ]; then
  echo "Building React frontend for production..."
  cd client
  echo "Installing frontend dependencies..."
  npm install
  
  echo "Building frontend..."
  npm run build
  
  cd ..
  echo "Frontend build complete."
fi

# Navigate to the Go server directory
cd go-server

# Get dependencies
echo "Fetching Go dependencies..."
go mod tidy

# Build the Go server
echo "Building Go server..."
go build -o server .

# Run the server
echo "Starting Go server on port 8081..."
GO_PORT=8081 ./server