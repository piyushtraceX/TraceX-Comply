package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/casbin/casbin/v2"
	"go-server/models"
	"net/http"
	"fmt"
	"log"
)

var enforcer *casbin.Enforcer

// InitEnforcer initializes the Casbin enforcer
func InitEnforcer() {
	var err error
	enforcer, err = casbin.NewEnforcer("config/rbac_model.conf", "config/rbac_policy.csv")
	if err != nil {
		log.Fatalf("Failed to initialize Casbin enforcer: %v", err)
	}
}

// RequirePermission checks if the user has the required permission
func RequirePermission(resource string, action string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the user from context (set by AuthRequired middleware)
		userValue, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		user, ok := userValue.(*models.User)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user in context"})
			c.Abort()
			return
		}

		// Super admins bypass permission checks
		if user.IsSuperAdmin {
			c.Next()
			return
		}

		// Check if the user has the required permission through their roles
		roles, err := models.GetUserRoles(user.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user roles"})
			c.Abort()
			return
		}

		// Check if any of the user's roles have the required permission
		for _, role := range roles {
			// Check permission using Casbin
			allowed, err := enforcer.Enforce(role.Name, resource, action)
			if err != nil {
				log.Printf("Casbin enforcement error: %v", err)
				continue
			}

			if allowed {
				// Permission granted, continue request
				c.Next()
				return
			}
		}

		// No role with the required permission was found
		c.JSON(http.StatusForbidden, gin.H{
			"error": fmt.Sprintf("User lacks permission to %s on %s", action, resource),
		})
		c.Abort()
	}
}