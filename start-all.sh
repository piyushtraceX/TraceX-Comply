#!/bin/bash

# Start both the Express.js frontend server and Go API server
# This script uses concurrently to run both processes

# Command to start the Express frontend server in dev mode
FRONTEND_CMD="npm run dev"

# Command to start the Go server
GO_CMD="./start-go-server.sh"

# Run both commands concurrently
echo "Starting both frontend and Go API servers..."
npx concurrently "$FRONTEND_CMD" "$GO_CMD"