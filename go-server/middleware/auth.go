package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// AuthRequired is a middleware that checks if a user is authenticated
func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			c.Abort()
			return
		}

		// Extract and validate token
		claims, err := ExtractAndValidateToken(authHeader)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token: " + err.Error()})
			c.Abort()
			return
		}

		// Store user info in context
		c.Set("userId", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("email", claims.Email)
		c.Set("name", claims.Name)
		c.Set("tenantId", claims.TenantID)
		c.Set("isSuperAdmin", claims.IsSuperAdmin)

		c.Next()
	}
}

// GetUserIDFromContext gets the user ID from the context
func GetUserIDFromContext(c *gin.Context) (int, bool) {
	userID, exists := c.Get("userId")
	if !exists {
		return 0, false
	}
	return userID.(int), true
}

// GetTenantIDFromContext gets the tenant ID from the context
func GetTenantIDFromContext(c *gin.Context) (int, bool) {
	tenantID, exists := c.Get("tenantId")
	if !exists {
		return 0, false
	}
	return tenantID.(int), true
}

// RequireSuperAdmin is a middleware that checks if a user is a super admin
func RequireSuperAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if user is super admin
		isSuperAdmin, exists := c.Get("isSuperAdmin")
		if !exists || !isSuperAdmin.(bool) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Superadmin privileges required"})
			c.Abort()
			return
		}

		c.Next()
	}
}