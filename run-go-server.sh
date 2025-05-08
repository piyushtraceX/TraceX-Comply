#!/bin/bash

# This script runs the simplified Go API server

echo "======================================================"
echo "🚀 Starting simplified Go API server"
echo "======================================================"

# Set environment variables
export PORT=8080

# Navigate to go-server directory
cd go-server

# Run the simplified Go server
echo "Building and running simplified Go server..."
go run simplified.go

# If the server exits, print a message
echo "Go server has stopped."