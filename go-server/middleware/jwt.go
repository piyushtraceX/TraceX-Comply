package middleware

import (
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JWTClaims struct {
	UserID    int    `json:"userId"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	Name      string `json:"name"`
	TenantID  int    `json:"tenantId"`
	IsSuperAdmin bool `json:"isSuperAdmin"`
	jwt.RegisteredClaims
}

// GenerateJWT creates a new JWT token for a user
func GenerateJWT(userID int, username, email, name string, tenantID int, isSuperAdmin bool) (string, error) {
	// Get token secret from environment
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "", fmt.Errorf("JWT_SECRET is required")
	}

	// Create claims
	claims := JWTClaims{
		UserID:    userID,
		Username:  username,
		Email:     email,
		Name:      name,
		TenantID:  tenantID,
		IsSuperAdmin: isSuperAdmin,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "eudr-comply",
			Subject:   fmt.Sprintf("%d", userID),
		},
	}

	// Create token with claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Generate encoded token
	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// ParseJWT parses and validates a JWT token
func ParseJWT(tokenString string) (*JWTClaims, error) {
	// Get token secret from environment
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return nil, fmt.Errorf("JWT_SECRET is required")
	}

	// Parse token
	claims := &JWTClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		// Validate signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})

	// Check for parsing errors
	if err != nil {
		return nil, err
	}

	// Validate token
	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return claims, nil
}