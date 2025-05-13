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

echo -e "\n==== EUDR Complimate Authentication Flow Test ====\n"

# Function to display section headers
section() {
  echo -e "\n\033[1;36m$1\033[0m"
}

# Function to run a test and display results
test_endpoint() {
  local name="$1"
  local url="$2"
  local method="${3:-GET}"
  
  echo -e "\033[1;33m→ Testing $name\033[0m"
  echo -e "  URL: $url"
  echo -e "  Method: $method"
  echo -e "  Response:"
  echo -e "  ----------"

  if [[ "$4" == "headers" ]]; then
    curl -s -I -X "$method" "$url" | head -10
  elif [[ "$4" == "verbose" ]]; then
    curl -s -v -X "$method" "$url" 2>&1 | grep -E "^([<>]|HTTP/)" | head -10
  else
    curl -s -X "$method" "$url" | head -20
  fi
  
  echo -e "  ----------"
  echo ""
}

# Test API health and Go server connectivity
section "1. API Health & Connectivity Tests"
test_endpoint "Go API health endpoint" "$DOMAIN/api/health" "GET" "headers"

# Test Authentication Endpoints
section "2. Authentication Endpoints Tests"
test_endpoint "Current User" "$DOMAIN/api/auth/me" "GET"
test_endpoint "OAuth Casdoor Redirect" "$DOMAIN/api/auth/casdoor" "GET" "headers"
test_endpoint "Auth Callback (simulated)" "$DOMAIN/api/auth/callback" "GET" "verbose"

# Test Express Redirects
section "3. Express Redirect Tests"
test_endpoint "/auth/casdoor redirect" "$DOMAIN/auth/casdoor" "GET" "headers"
test_endpoint "/auth/me redirect" "$DOMAIN/auth/me" "GET" "headers"

# Summary and next steps
section "4. Summary"
echo "Authentication flow test completed."
echo "Verify that:"
echo "  ✓ The Go API health endpoint returns 200 OK"
echo "  ✓ The Casdoor OAuth endpoint redirects to Casdoor login (307 redirect)"
echo "  ✓ The Auth callback endpoint handles requests properly (should reject without code)"
echo "  ✓ Express correctly redirects /auth/* routes to /api/auth/*"
echo ""
echo "To test the full flow, visit the login page at:"
echo "  $DOMAIN/auth"
echo ""
echo "Check server logs for detailed authentication flow information."