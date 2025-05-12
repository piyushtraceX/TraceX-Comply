#!/bin/bash

# Make sure the script is executable
chmod +x run-go-server.sh

echo "Starting production build and deployment..."

# Run the Go server in production mode
./run-go-server.sh prod

# This will build the React app and run the Go server
# The Go server will serve the built React app