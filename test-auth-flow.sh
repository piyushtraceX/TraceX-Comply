#!/bin/bash

# Get the Replit domain from environment variable or use localhost for local testing
REPLIT_DOMAIN="${REPLIT_DOMAIN:-https://8d9e1fd6-0f97-43eb-adcd-2f98ad7d8288-00-3o9u7z9m8zzsa.worf.replit.dev}"
LOCAL_DOMAIN="http://localhost:5000"

# Determine which domain to use based on environment
if [[ "$REPLIT_DOMAIN" == *"replit"* ]]; then
  DOMAIN="$REPLIT_DOMAIN"
  echo "Testing in Replit environment: $DOMAIN"
else
  DOMAIN="$LOCAL_DOMAIN"
  echo "Testing in local environment: $DOMAIN"
fi

echo "==== Testing EUDR Complimate Authentication Flow ===="
echo "1. Testing API Routes"

echo "Testing /api/health endpoint:"
curl -s -I -X GET "$DOMAIN/api/health" | head -1
echo ""

echo "Testing /api/auth/casdoor endpoint (direct):"
curl -s -v -X GET "$DOMAIN/api/auth/casdoor" 2>&1 | grep -E "^([<>]|HTTP/)" | head -10
echo ""

echo "2. Testing Authentication Callback Handling"
echo "Simulating a callback from Casdoor (without code parameter):"
curl -s -v -X GET "$DOMAIN/api/auth/callback" 2>&1 | grep -E "^([<>]|HTTP/)" | head -10

echo ""
echo "3. Testing auth routes on the Express server"
echo "Testing /auth/casdoor redirect:"
curl -s -I -X GET "$DOMAIN/auth/casdoor" | grep -E "^(HTTP|Location)"

echo ""
echo "4. Done! Check the results and server logs for authentication flow details."