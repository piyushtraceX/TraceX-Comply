#!/bin/bash

echo "Restarting application with Go server only..."

# Kill any existing Go processes
pkill -f bin/api || true

# Kill any Express.js server (from the 'Start application' workflow)
pkill -f "node.*dev" || true

# Stop the workflow if running
workflow_id=$(replit workflow list --json | jq -r '.workflows[] | select(.name == "Start application") | .id')
if [ ! -z "$workflow_id" ]; then
  echo "Stopping 'Start application' workflow..."
  replit workflow stop $workflow_id || true
fi

# Build the Go server
cd go-server && go build -o bin/api simplified.go

# Start the Go server pointing to the client dist directory
NODE_ENV=development ./bin/api > ../go-server.log 2>&1 &
go_pid=$!
echo $go_pid > ../go.pid
echo "Go server started with PID $go_pid"

# Notify user
echo "----------------------------------------------------"
echo "Go server started on port 5000."
echo "Express.js has been removed completely."
echo "All requests are now handled by the Go server directly."
echo "----------------------------------------------------"