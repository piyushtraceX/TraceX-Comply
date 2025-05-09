package middleware

import (
	"net/http"

	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
)

// Enforcer is the global casbin enforcer
var Enforcer *casbin.Enforcer

// SetupCasbin initializes the casbin enforcer
func SetupCasbin(enforcer *casbin.Enforcer) {
	Enforcer = enforcer
}

// RBACMiddleware is a middleware for RBAC authorization
func RBACMiddleware(resource, action string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip if enforcer is not initialized
		if Enforcer == nil {
			c.Next()
			return
		}

		// Get user roles from context
		rolesList, exists := c.Get("roles")
		if !exists || rolesList == nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "No roles defined for user"})
			c.Abort()
			return
		}

		// Check if user is super admin
		isSuperAdmin, exists := c.Get("isSuperAdmin")
		if exists && isSuperAdmin.(bool) {
			// Super admins can do anything
			c.Next()
			return
		}

		// Convert to string slice
		roles, ok := rolesList.([]string)
		if !ok {
			c.JSON(http.StatusForbidden, gin.H{"error": "Invalid roles format"})
			c.Abort()
			return
		}

		// Check if any role has the required permission
		for _, role := range roles {
			allowed, err := Enforcer.Enforce(role, resource, action)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Authorization check failed"})
				c.Abort()
				return
			}

			if allowed {
				// Permission granted
				c.Next()
				return
			}
		}

		// No role has the required permission
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: insufficient permissions"})
		c.Abort()
	}
}

// RequireSuperAdmin middleware checks if the user is a super admin
func RequireSuperAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		isSuperAdmin, exists := c.Get("isSuperAdmin")
		if !exists || !isSuperAdmin.(bool) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Superadmin privileges required"})
			c.Abort()
			return
		}
		c.Next()
	}
}

// RequireTenant middleware checks if the user belongs to the specified tenant
func RequireTenant(tenantParamName string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Super admins can access any tenant
		isSuperAdmin, exists := c.Get("isSuperAdmin")
		if exists && isSuperAdmin.(bool) {
			c.Next()
			return
		}

		// Get user's tenant ID from context
		userTenantID, exists := c.Get("tenantID")
		if !exists || userTenantID == nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "No tenant assigned to user"})
			c.Abort()
			return
		}

		// Get requested tenant ID from path parameter
		requestedTenantID := c.Param(tenantParamName)
		if requestedTenantID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Tenant ID parameter required"})
			c.Abort()
			return
		}

		// Compare tenant IDs
		if userTenantID.(int) != 0 && userTenantID.(int) != c.GetInt(requestedTenantID) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access to this tenant denied"})
			c.Abort()
			return
		}

		c.Next()
	}
}