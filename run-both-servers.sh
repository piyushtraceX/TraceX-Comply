#!/bin/bash

# This script runs both the Go API server and the Vite dev server

# Kill any existing servers
pkill -f go-server || true
pkill -f vite || true

# Start the Go server in the background
echo "Starting Go server on port 8081..."
cd go-server
go build -o server main.go
GO_PORT=8081 ./server &
GO_PID=$!
cd ..

# Give the Go server time to start
sleep 2

# Start the Vite dev server
echo "Starting Vite dev server..."
cd client 
npm run dev &
VITE_PID=$!
cd ..

# Function to kill both servers on exit
function cleanup {
  echo "Shutting down servers..."
  kill $GO_PID
  kill $VITE_PID
  exit 0
}

# Set up trap to catch Ctrl+C and other termination signals
trap cleanup SIGINT SIGTERM

echo "Both servers are running:"
echo "- Go API server on port 8081"
echo "- Vite dev server on port shown above"
echo "Press Ctrl+C to stop both servers"

# Keep the script running
wait $VITE_PID