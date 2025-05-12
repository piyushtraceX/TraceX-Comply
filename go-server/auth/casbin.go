package auth

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/casbin/casbin/v2"
	"github.com/casbin/casbin/v2/model"
	"github.com/gin-gonic/gin"

	"go-server/middleware"
	"go-server/models"
)

// InitCasbin initializes the Casbin enforcer
func InitCasbin(db *sql.DB) (*casbin.Enforcer, error) {
	// Define the RBAC model as a string
	rbacModel := `
	[request_definition]
	r = sub, obj, act

	[policy_definition]
	p = sub, obj, act

	[role_definition]
	g = _, _

	[policy_effect]
	e = some(where (p.eft == allow))

	[matchers]
	m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act
	`

	// Create the model from the string
	m, err := model.NewModelFromString(rbacModel)
	if err != nil {
		return nil, err
	}

	// Create a database adapter that will load policies from our PostgreSQL database
	// For simplicity, we'll use in-memory adapter here and load policies programmatically
	// In a production environment, you'd want to use a persistent adapter
	enforcer, err := casbin.NewEnforcer(m)
	if err != nil {
		return nil, err
	}

	// Set the enforcer in the middleware
	middleware.SetupCasbin(enforcer)

	// Load policies from database
	err = loadPoliciesFromDB(db, enforcer)
	if err != nil {
		log.Printf("Failed to load policies from database: %v", err)
		// If we can't load policies, set some default policies
		setDefaultPolicies(enforcer)
	}

	return enforcer, nil
}

// loadPoliciesFromDB loads Casbin policies from the database
func loadPoliciesFromDB(db *sql.DB, enforcer *casbin.Enforcer) error {
	// Get all roles and permissions
	roles, err := models.GetAllRoles(db, nil)
	if err != nil {
		return err
	}

	// For each role, load its permissions
	for _, role := range roles {
		permissions, err := models.GetPermissionsByRoleID(db, role.ID)
		if err != nil {
			return err
		}

		for _, perm := range permissions {
			if perm.Resource == nil || perm.Action == nil {
				continue
			}
			
			// Add policy for role
			_, err = enforcer.AddPolicy(role.Name, perm.Resource.Name, perm.Action.Name)
			if err != nil {
				return err
			}
		}
	}

	// Load role inheritance (if applicable)
	// This would be implemented based on your role hierarchy design

	return nil
}

// setDefaultPolicies sets default policies if no policies are loaded
func setDefaultPolicies(enforcer *casbin.Enforcer) {
	// Admin role can do everything
	enforcer.AddPolicy("admin", "*", "*")

	// User role can view basic resources
	enforcer.AddPolicy("user", "dashboard", "view")
	enforcer.AddPolicy("user", "profile", "view")
	enforcer.AddPolicy("user", "profile", "edit")

	// More specific roles
	enforcer.AddPolicy("compliance_officer", "compliance", "view")
	enforcer.AddPolicy("compliance_officer", "declarations", "view")
	enforcer.AddPolicy("compliance_officer", "declarations", "create")
	enforcer.AddPolicy("compliance_officer", "declarations", "edit")

	enforcer.AddPolicy("supplier_manager", "suppliers", "view")
	enforcer.AddPolicy("supplier_manager", "suppliers", "create")
	enforcer.AddPolicy("supplier_manager", "suppliers", "edit")
	
	// Save changes
	enforcer.SavePolicy()
}

// AuthorizeMiddleware is a middleware for checking if the user has the required permissions
func AuthorizeMiddleware(resource, action string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip if in development mode and permission check is disabled
		if os.Getenv("DISABLE_AUTHORIZATION") == "true" {
			c.Next()
			return
		}

		// Get user roles from context
		rolesList, exists := c.Get("roles")
		if !exists || rolesList == nil {
			c.JSON(401, gin.H{"error": "Unauthorized"})
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
			c.JSON(500, gin.H{"error": "Invalid roles format"})
			c.Abort()
			return
		}

		// Check if Casbin enforcer is initialized
		if middleware.Enforcer == nil {
			log.Println("Casbin enforcer not initialized, allowing access")
			c.Next()
			return
		}

		// Check if any role has the required permission
		for _, role := range roles {
			allowed, err := middleware.Enforcer.Enforce(role, resource, action)
			if err != nil {
				log.Printf("Casbin enforcement error: %v", err)
				c.JSON(500, gin.H{"error": "Authorization check failed"})
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
		c.JSON(403, gin.H{"error": fmt.Sprintf("Access denied: %s %s", resource, action)})
		c.Abort()
	}
}