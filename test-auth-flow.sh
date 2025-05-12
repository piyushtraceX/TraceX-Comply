#!/bin/bash

echo "==== Testing EUDR Complimate Authentication Flow ===="
echo "1. Testing Authentication Redirects"
# Test the old /auth/casdoor route (handled by Express)
OLD_ROUTE_REDIRECT=$(curl -s -I -X GET http://localhost:5000/auth/casdoor | grep Location)
echo "Old route redirect (/auth/casdoor): $OLD_ROUTE_REDIRECT"

# Test the new direct /api/auth/casdoor route - this should redirect directly to Casdoor
NEW_ROUTE_STATUS=$(curl -s -I -X GET http://localhost:5000/api/auth/casdoor | grep -E "HTTP/[0-9.]+ [0-9]+" || echo "No status found")
echo "New route status (/api/auth/casdoor): $NEW_ROUTE_STATUS"

echo ""
echo "2. Testing Go Server OAuth Handling"
GO_OAUTH_REDIRECT=$(curl -s -I -X GET http://localhost:8081/api/auth/casdoor | grep Location)
echo "Go OAuth redirect: $GO_OAUTH_REDIRECT"

echo ""
echo "3. Checking Callback URL Configuration"
echo "Accessing Go server /api/health endpoint to see logs..."
curl -s -X GET http://localhost:8081/api/health > /dev/null

echo ""
echo "4. Done! Check logs for any callback URL setup and redirection settings."