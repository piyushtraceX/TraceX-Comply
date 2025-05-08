#!/bin/bash

echo "Starting Go server and removing Express.js..."

# Create bin directory if it doesn't exist
mkdir -p go-server/bin

# Build and run the simplified Go server
cd go-server
go build -o bin/api simplified.go

if [ $? -eq 0 ]; then
    echo "✅ Go server built successfully!"
    echo "Starting server on port 8080..."
    
    # Run the Go server
    ./bin/api &
    GO_PID=$!
    
    echo "✅ Go server running with PID: $GO_PID"
    
    # Modify the client-side configuration to point to the Go server
    cd ..
    cat > client/src/lib/api-config.ts << EOF
// API Configuration
// This file exports the base URL for API requests

// In a real production environment, this would be configured
// based on environment variables or build configuration
export const API_BASE_URL = 'http://localhost:8080/api';

// Export functions to ensure all API requests go to the Go server
export const getApiUrl = (path: string): string => {
  // Make sure path starts with a forward slash
  const cleanPath = path.startsWith('/') ? path : \`/\${path}\`;
  
  // Check if it's a relative URL
  if (cleanPath.startsWith('/api/')) {
    // Extract the path after /api/
    const apiPath = cleanPath.substring(5);
    return \`\${API_BASE_URL}/\${apiPath}\`;
  }
  
  // If it's not an API URL, return as is
  return cleanPath;
};
EOF
    
    # Update the API router to always use Go
    sed -i 's/let currentApiType: ApiType = .*$/let currentApiType: ApiType = '\''go'\'';/' client/src/lib/api-router.ts
    
    # Stop the Express.js server if it's running
    ps aux | grep "NODE_ENV=development tsx server/index.ts" | grep -v grep | awk '{print $2}' | xargs -r kill -9
    
    echo "✅ Express.js server stopped"
    echo "✅ Configuration updated to use Go server"
    echo "✅ Go server is now handling both API and static file serving"
    
    # Keep this script running to keep the Go server alive
    wait $GO_PID
else
    echo "❌ Go server build failed. See errors above."
    exit 1
fi