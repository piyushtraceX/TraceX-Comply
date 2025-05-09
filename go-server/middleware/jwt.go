package middleware

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go-server/models"
)

// JWTClaims represents the claims in the JWT
type JWTClaims struct {
	UserID    int    `json:"userId"`
	Username  string `json:"username"`
	TenantID  int    `json:"tenantId"`
	SuperAdmin bool  `json:"isSuperAdmin"`
	jwt.RegisteredClaims
}

// Generate a JWT token for a user
func GenerateToken(user *models.User) (string, error) {
	// Get JWT secret from environment
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		return "", errors.New("JWT_SECRET environment variable not set")
	}

	// Create the JWT claims
	claims := JWTClaims{
		UserID:    user.ID,
		Username:  user.Username,
		TenantID:  user.TenantID,
		SuperAdmin: user.IsSuperAdmin,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "eudr-comply-server",
			Subject:   fmt.Sprintf("%d", user.ID),
		},
	}

	// Create the token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign the token with the secret key
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// Authenticate a user based on the JWT token
func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			c.Abort()
			return
		}

		// Check if the header has the Bearer prefix
		headerParts := strings.Split(authHeader, " ")
		if len(headerParts) != 2 || headerParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header format must be Bearer {token}"})
			c.Abort()
			return
		}

		// Get the token
		tokenString := headerParts[1]

		// Parse the token
		token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
			// Validate the alg is what we expect
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}

			// Get the secret key
			jwtSecret := os.Getenv("JWT_SECRET")
			if jwtSecret == "" {
				return nil, errors.New("JWT_SECRET environment variable not set")
			}

			return []byte(jwtSecret), nil
		})

		if err != nil {
			log.Printf("Error parsing token: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Validate the token
		claims, ok := token.Claims.(*JWTClaims)
		if !ok || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		// Get the user from the database
		user, err := models.GetUserByID(claims.UserID)
		if err != nil {
			log.Printf("Error getting user: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			c.Abort()
			return
		}

		// Check if the user is active
		if !user.IsActive {
			c.JSON(http.StatusForbidden, gin.H{"error": "User account is inactive"})
			c.Abort()
			return
		}

		// Set the user in the context
		c.Set("user", user)

		// Set the tenant in the context
		tenant, err := models.GetTenantByID(user.TenantID)
		if err != nil {
			log.Printf("Error getting tenant: %v", err)
			// Not fatal, just log it and continue
		} else {
			c.Set("tenant", tenant)
		}

		// Continue processing the request
		c.Next()
	}
}