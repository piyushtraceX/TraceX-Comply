package middleware

import (
	"fmt"
	"strings"
)

// ExtractAndValidateToken extracts and validates a JWT token from an Authorization header
func ExtractAndValidateToken(authHeader string) (*JWTClaims, error) {
	// Check if header has the correct format
	if len(authHeader) < 7 || authHeader[:7] != "Bearer " {
		return nil, fmt.Errorf("invalid authorization header format")
	}

	// Extract token
	tokenString := authHeader[7:]

	// Parse and validate token
	claims, err := ParseJWT(tokenString)
	if err != nil {
		return nil, err
	}

	return claims, nil
}

// ExtractTokenFromHeader extracts the token from the Authorization header
func ExtractTokenFromHeader(authHeader string) (string, error) {
	// Check if header is empty
	if authHeader == "" {
		return "", fmt.Errorf("authorization header is empty")
	}

	// Check if header has the correct format
	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return "", fmt.Errorf("invalid authorization header format")
	}

	// Return token
	return parts[1], nil
}