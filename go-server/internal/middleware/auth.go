package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/sessions"
)

var store = sessions.NewCookieStore([]byte("secret-key")) // Note: In production, use an environment variable for this

// AuthRequired is a middleware that checks if the user is authenticated
func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the session
		session, err := store.Get(c.Request, "session")
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Session invalid"})
			c.Abort()
			return
		}

		// Check if user is authenticated
		userId, ok := session.Values["userId"]
		if !ok || userId == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Authentication required"})
			c.Abort()
			return
		}

		// For development with direct login, create a demo user
		user := gin.H{
			"id":          userId,
			"username":    "demouser",
			"name":        "Demo User",
			"email":       "demo@example.com",
			"tenantId":    session.Values["tenantId"],
			"isSuperAdmin": userId == 1, // Admin if ID is 1
		}

		// Set tenant
		tenant := gin.H{
			"id":          session.Values["tenantId"],
			"name":        "Demo Tenant",
			"description": "A tenant for demonstration purposes",
		}

		// Add user and tenant to context
		c.Set("user", user)
		c.Set("tenant", tenant)

		c.Next()
	}
}

// RequireTenant middleware requires access to a specific tenant
func RequireTenant(tenantId int) gin.HandlerFunc {
	return func(c *gin.Context) {
		user, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Authentication required"})
			c.Abort()
			return
		}

		userData := user.(gin.H)
		
		// Super admins can access any tenant
		if userData["isSuperAdmin"] == true {
			c.Next()
			return
		}

		// Check if user belongs to the required tenant
		userTenantId := userData["tenantId"]
		if userTenantId != tenantId {
			c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: No access to this tenant"})
			c.Abort()
			return
		}

		c.Next()
	}
}