package middleware

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	"go-server/models"
)

// RequireRole checks if the user has a specific role
func RequireRole(db *sql.DB, roleName string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user from context (set by JWTAuth middleware)
		userVal, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		user, ok := userVal.(*models.User)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user data"})
			c.Abort()
			return
		}

		// Super admins bypass role checks
		if user.IsSuperAdmin {
			c.Next()
			return
		}

		// Get user roles
		roles, err := models.GetUserRolesByUserID(db, user.ID, &user.TenantID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user roles"})
			c.Abort()
			return
		}

		// Check if user has the required role
		hasRole := false
		for _, role := range roles {
			if role.Name == roleName {
				hasRole = true
				break
			}
		}

		if !hasRole {
			c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequirePermission checks if the user has permission to access a resource
func RequirePermission(db *sql.DB, resourceType string, resourceName string, actionName string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user from context (set by JWTAuth middleware)
		userVal, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		user, ok := userVal.(*models.User)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user data"})
			c.Abort()
			return
		}

		// Super admins bypass permission checks
		if user.IsSuperAdmin {
			c.Next()
			return
		}

		// Get user roles
		roles, err := models.GetUserRolesByUserID(db, user.ID, &user.TenantID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user roles"})
			c.Abort()
			return
		}

		// Get resource ID
		resource, err := models.GetResourceByTypeAndName(db, resourceType, resourceName)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Resource not found"})
			c.Abort()
			return
		}

		// Get action ID
		action, err := models.GetActionByName(db, actionName)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Action not found"})
			c.Abort()
			return
		}

		// Check if user has permission through any of their roles
		hasPermission := false
		for _, role := range roles {
			permission, err := models.GetPermissionByRoleResourceAction(db, role.ID, resource.ID, action.ID, user.TenantID)
			if err == nil && permission != nil {
				hasPermission = true
				break
			}
		}

		if !hasPermission {
			c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireSuperAdmin checks if the user is a super admin
func RequireSuperAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user from context (set by JWTAuth middleware)
		userVal, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		user, ok := userVal.(*models.User)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user data"})
			c.Abort()
			return
		}

		if !user.IsSuperAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Super admin privileges required"})
			c.Abort()
			return
		}

		c.Next()
	}
}