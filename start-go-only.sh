#!/bin/bash

# Kill any existing Go or Node.js processes
pkill -f bin/api || true
pkill -f "node.*dev" || true

# Build the Go server 
cd go-server
go build -o bin/api simplified.go

# Start the Go server
NODE_ENV=development ./bin/api > ../go-server.log 2>&1 &
go_pid=$!
echo $go_pid > ../go.pid
echo "Go server started with PID $go_pid"

# Notify user
echo "----------------------------------------------------"
echo "Go server started on port 5000."
echo "Express.js has been completely disabled."
echo "All requests are now handled by the Go server."
echo "----------------------------------------------------"

# Keep the script running
tail -f ../go-server.log