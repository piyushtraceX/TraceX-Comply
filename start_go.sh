#!/bin/bash

echo "Building and starting the application with Go server..."

# Build React app
cd client
echo "Building React application..."
npm run build
cd ..

# Run Go server
cd go-server
echo "Building Go server..."
go mod tidy
go build -o server main.go
echo "Starting Go server..."
./server