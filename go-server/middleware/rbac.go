package middleware

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
)

// EnforcerContext is a context key type
type EnforcerContext string

// EnforcerKey is the key used to store the enforcer in the context
const EnforcerKey EnforcerContext = "enforcer"

// InitCasbinEnforcer initializes the casbin enforcer
func InitCasbinEnforcer() (*casbin.Enforcer, error) {
	enforcer, err := casbin.NewEnforcer("config/rbac_model.conf", "config/rbac_policy.csv")
	if err != nil {
		return nil, err
	}
	return enforcer, nil
}

// Authorize checks if a user has the required permission
func Authorize(sub, obj, act string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get enforcer from context
		e, exists := c.Get(string(EnforcerKey))
		if !exists {
			log.Println("Enforcer not found in context, creating new enforcer")
			var err error
			e, err = InitCasbinEnforcer()
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initialize enforcer"})
				c.Abort()
				return
			}
			c.Set(string(EnforcerKey), e)
		}
		enforcer := e.(*casbin.Enforcer)

		// Check permission
		ok, err := enforcer.Enforce(sub, obj, act)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to enforce policy"})
			c.Abort()
			return
		}
		if !ok {
			c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// CheckPermissionForRequest checks if a user has the required permission for the current request
func CheckPermissionForRequest(c *gin.Context, userID int, resource, action string, db *sql.DB) bool {
	// Get roles for user
	rows, err := db.Query("SELECT r.name FROM roles r INNER JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = $1", userID)
	if err != nil {
		log.Printf("Error getting roles for user: %v", err)
		return false
	}
	defer rows.Close()

	// Get permissions for roles
	var roles []string
	for rows.Next() {
		var role string
		if err := rows.Scan(&role); err != nil {
			log.Printf("Error scanning role: %v", err)
			continue
		}
		roles = append(roles, role)
	}

	// Check if user has any permissions
	if len(roles) == 0 {
		return false
	}

	// Check if any role has the required permission
	for _, role := range roles {
		result, err := db.Query(`
			SELECT COUNT(*) 
			FROM permissions p 
			INNER JOIN roles r ON p.role_id = r.id 
			INNER JOIN resources res ON p.resource_id = res.id 
			INNER JOIN actions a ON p.action_id = a.id 
			WHERE r.name = $1 AND res.name = $2 AND a.name = $3
		`, role, resource, action)
		if err != nil {
			log.Printf("Error checking permission: %v", err)
			continue
		}
		defer result.Close()

		var count int
		if result.Next() {
			if err := result.Scan(&count); err != nil {
				log.Printf("Error scanning permission count: %v", err)
				continue
			}
		}

		if count > 0 {
			return true
		}
	}

	return false
}