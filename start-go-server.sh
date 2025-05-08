#!/bin/bash

# This script builds and starts the Go API server
# Makes it easier to test the Go backend alongside the existing Express.js server

# Set environment variables 
export PORT=8080
export ENV=development
export DATABASE_URL=$DATABASE_URL  # Use the same database as Express.js backend

echo "Building the Go API server..."
cd go-server

# Make directories if they don't exist
mkdir -p bin

# Get Go dependencies if needed
go mod tidy

# Build the go server
go build -o ./bin/api ./cmd/api/

echo "Starting the Go API server on port $PORT..."
./bin/api