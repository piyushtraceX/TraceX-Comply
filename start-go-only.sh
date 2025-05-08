#!/bin/bash

echo "Starting application with Go server only..."

# Kill any existing Go processes
pkill -f bin/api || true

# Kill any Express.js server (from the 'Start application' workflow)
pkill -f "node.*dev" || true

# Build the Go server
cd go-server && go build -o bin/api simplified.go

# Start the Go server pointing to the client dist directory
STATIC_DIR="../client/dist" ./bin/api