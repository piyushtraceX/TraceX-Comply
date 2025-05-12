#!/bin/bash

# Make sure the script is executable
chmod +x run-go-server.sh

# Start Go server in the background
echo "Starting Go server in development mode..."
./run-go-server.sh dev &
GO_SERVER_PID=$!

# Start Vite development server
echo "Starting Vite development server..."
cd client
npm install
npm run dev &
VITE_SERVER_PID=$!

# Handle script termination
function cleanup {
  echo "Stopping servers..."
  kill $GO_SERVER_PID
  kill $VITE_SERVER_PID
  exit 0
}

# Register the cleanup function for when the script is terminated
trap cleanup SIGINT SIGTERM

echo "Development environment running. Press Ctrl+C to stop."
echo "Go server is available at http://localhost:8081"
echo "Frontend dev server is available through Vite URL (check console output)"
echo "Use the frontend URL for development, as it has hot reloading enabled."

# Wait for key press
wait