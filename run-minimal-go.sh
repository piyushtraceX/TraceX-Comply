#!/bin/bash

# Start the Go server in development mode
cd go-server

# Remove the oauth2 provider references that are causing issues
sed -i 's/oauth2\.//g' auth/auth.go
sed -i 's/\/providers\/oauth2//g' auth/auth.go

# Fix the module reference
sed -i 's/eudr-comply\/go-server/go-server/g' *.go
find . -name "*.go" -exec sed -i 's/eudr-comply\/go-server/go-server/g' {} \;

# Fix the imports
echo "Fixing Go imports..."
go mod tidy
go get github.com/gin-contrib/cors@v1.3.1
go get github.com/gin-contrib/static@v0.0.1
go get github.com/gin-gonic/gin@v1.7.7
go get github.com/lib/pq@v1.10.7
go get github.com/golang-jwt/jwt/v5@v5.0.0
go get golang.org/x/crypto/bcrypt@v0.0.0-20220525230936-793ad666bf5e

echo "Building Go server..."
go build -o server .

echo "Starting Go server on port 8081..."
GO_PORT=8081 ./server
