#!/bin/bash

# This script sets up and troubleshoots the Go API server

echo "======================================================"
echo "🔧 Go API Server Setup and Troubleshooting"
echo "======================================================"

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed. Please install Go first."
    exit 1
fi

echo "✅ Go is installed: $(go version)"

# Navigate to go-server directory
cd go-server

# Check module dependencies
echo "📦 Checking Go module dependencies..."
go mod tidy

# Check if module is initialized correctly
if ! grep -q "module" go.mod; then
    echo "⚠️ Module not initialized correctly in go.mod"
    echo "Attempting to fix..."
    
    # Initialize module if needed
    MODULE_NAME="eudr-comply"
    echo "module $MODULE_NAME" > go.mod.new
    echo "" >> go.mod.new
    echo "go 1.19" >> go.mod.new
    echo "" >> go.mod.new
    
    # Add required dependencies
    echo "require (" >> go.mod.new
    echo '  github.com/gin-contrib/cors v1.4.0' >> go.mod.new
    echo '  github.com/gin-gonic/gin v1.9.1' >> go.mod.new
    echo ')' >> go.mod.new
    
    # Replace old go.mod
    mv go.mod.new go.mod
fi

# Check for required dependencies
echo "🔎 Checking for required dependencies..."
for dep in "github.com/gin-contrib/cors" "github.com/gin-gonic/gin"; do
    if ! grep -q "$dep" go.mod; then
        echo "Adding dependency: $dep"
        go get $dep
    fi
done

# Update go.sum if needed
echo "🔄 Updating go.sum..."
go mod tidy

# Fix import paths if needed
echo "🔧 Fixing import paths in main.go..."
sed -i 's/eudr-comply\/cmd\/api/github.com\/gin-gonic\/gin/g' cmd/api/main.go 2>/dev/null || :

# Create .env file if needed
if [ ! -f .env ]; then
    echo "📄 Creating .env file..."
    echo "PORT=8080" > .env
    echo "DATABASE_URL=$DATABASE_URL" >> .env
fi

# Build the Go server to verify it compiles
echo "🔨 Building Go server to check for compilation errors..."
mkdir -p bin
go build -o bin/api cmd/api/main.go

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Go server built successfully!"
    
    echo "======================================================"
    echo "🚀 To start the Go server, run:"
    echo "./bin/api"
    echo ""
    echo "Or run the go-only.sh script:"
    echo "../go-only.sh"
    echo "======================================================"
else
    echo "❌ Go server build failed. See errors above."
    echo "Try fixing the issues manually before running this script again."
    exit 1
fi