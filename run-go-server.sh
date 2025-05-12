#!/bin/bash

echo "Building and running the Go server..."

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
./server