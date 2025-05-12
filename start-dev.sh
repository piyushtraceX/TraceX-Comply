#!/bin/bash

# Stop any existing servers
echo "Stopping any existing servers..."
pkill -f server || true
pkill -f node || true
pkill -f npm || true
sleep 1

# Build and start the Go server
echo "Building Go server..."
cd go-server
go build -o server main.go
echo "Starting Go server on port 8081..."
GO_PORT=8081 ./server > ../go-server.log 2>&1 &
cd ..
sleep 2

# Start the React frontend in development mode
echo "Starting React frontend..."
cd client
npm run dev > ../react-dev.log 2>&1 &
cd ..
sleep 2

# Start the Express proxy server
echo "Starting Express proxy server..."
NODE_ENV=development tsx server/index.ts > proxy-server.log 2>&1 &

# Print success message
echo ""
echo "===========================================" 
echo "✅ Development environment is now running!"
echo "===========================================" 
echo ""
echo "🌐 Access the application at: http://localhost:5000"
echo "   (This will proxy/redirect to the appropriate servers)"
echo ""
echo "📋 Server details:"
echo "  - Go API server: http://localhost:8081/api"
echo "  - React frontend: http://localhost:5173"
echo "  - Express proxy: http://localhost:5000"
echo ""
echo "📊 Log files:"
echo "  - Go server: go-server.log"
echo "  - React frontend: react-dev.log"
echo "  - Express proxy: proxy-server.log"
echo ""
echo "⚠️  Press Ctrl+C to stop all servers"

# Keep the script running
wait