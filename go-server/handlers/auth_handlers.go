package handlers

import (
	"database/sql"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"eudr-comply/go-server/middleware"
	"eudr-comply/go-server/models"
)

// Login handles user login
func Login(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Parse request
		var input struct {
			Username string `json:"username" binding:"required"`
			Password string `json:"password" binding:"required"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Get user
		user, err := models.GetUserByUsername(db, input.Username)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting user: " + err.Error()})
			return
		}
		if user == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
			return
		}

		// Verify password
		ok, err := models.ComparePasswords(input.Password, user.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error comparing passwords: " + err.Error()})
			return
		}
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
			return
		}

		// Check if user is active
		if !user.IsActive {
			c.JSON(http.StatusForbidden, gin.H{"error": "User is not active"})
			return
		}

		// Update last login
		err = models.UpdateUserLastLogin(db, user.ID)
		if err != nil {
			log.Printf("Error updating last login: %v", err)
		}

		// Get tenant
		tenant, err := models.GetTenantByID(db, user.TenantID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting tenant: " + err.Error()})
			return
		}
		if tenant == nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Tenant not found"})
			return
		}

		// Get roles
		roles, err := models.GetUserRoles(db, user.ID, &user.TenantID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting roles: " + err.Error()})
			return
		}

		// Create role names array
		roleNames := make([]string, len(roles))
		for i, role := range roles {
			roleNames[i] = role.Name
		}

		// Generate JWT token
		token, err := middleware.GenerateJWT(
			user.ID,
			user.Username,
			user.Email,
			user.DisplayName,
			user.TenantID,
			user.IsSuperAdmin,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generating token: " + err.Error()})
			return
		}

		// Return response
		c.JSON(http.StatusOK, gin.H{
			"user": map[string]interface{}{
				"id":           user.ID,
				"username":     user.Username,
				"email":        user.Email,
				"displayName":  user.DisplayName,
				"avatar":       user.Avatar,
				"tenantId":     user.TenantID,
				"isActive":     user.IsActive,
				"isSuperAdmin": user.IsSuperAdmin,
				"lastLogin":    user.LastLogin,
				"createdAt":    user.CreatedAt,
				"updatedAt":    user.UpdatedAt,
			},
			"tenant": tenant,
			"roles":  roleNames,
			"token":  token,
		})
	}
}

// Register handles user registration
func Register(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Parse request
		var input models.CreateUserInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Check if username already exists
		existingUser, err := models.GetUserByUsername(db, input.Username)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error checking username: " + err.Error()})
			return
		}
		if existingUser != nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
			return
		}

		// Check if tenant exists
		tenant, err := models.GetTenantByID(db, input.TenantID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error checking tenant: " + err.Error()})
			return
		}
		if tenant == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Tenant not found"})
			return
		}

		// Create user
		user, err := models.CreateUser(db, input)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating user: " + err.Error()})
			return
		}

		// Return response
		c.JSON(http.StatusCreated, gin.H{
			"user": user,
		})
	}
}

// GetCurrentUser gets the current authenticated user
func GetCurrentUser(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from context
		userID, exists := middleware.GetUserIDFromContext(c)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		// Get user
		user, err := models.GetUserByID(db, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting user: " + err.Error()})
			return
		}
		if user == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		// Get tenant
		tenant, err := models.GetTenantByID(db, user.TenantID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting tenant: " + err.Error()})
			return
		}

		// Get roles
		roles, err := models.GetUserRoles(db, user.ID, &user.TenantID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting roles: " + err.Error()})
			return
		}

		// Create role names array
		roleNames := make([]string, len(roles))
		for i, role := range roles {
			roleNames[i] = role.Name
		}

		// Return response
		c.JSON(http.StatusOK, gin.H{
			"user":   user,
			"tenant": tenant,
			"roles":  roleNames,
		})
	}
}

// Logout handles user logout
func Logout(c *gin.Context) {
	// No need to do anything on server side with JWT
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// SwitchTenant switches the user's active tenant
func SwitchTenant(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from context
		userID, exists := middleware.GetUserIDFromContext(c)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		// Parse request
		var input struct {
			TenantID int `json:"tenantId" binding:"required"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Check if tenant exists
		tenant, err := models.GetTenantByID(db, input.TenantID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error checking tenant: " + err.Error()})
			return
		}
		if tenant == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Tenant not found"})
			return
		}

		// Get user
		user, err := models.GetUserByID(db, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting user: " + err.Error()})
			return
		}
		if user == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		// Check if user is super admin
		if !user.IsSuperAdmin && user.TenantID != input.TenantID {
			// Check if user has roles in the tenant
			count := 0
			err = db.QueryRow(`
				SELECT COUNT(*)
				FROM user_roles
				WHERE user_id = $1 AND tenant_id = $2
			`, userID, input.TenantID).Scan(&count)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error checking user roles: " + err.Error()})
				return
			}
			if count == 0 {
				c.JSON(http.StatusForbidden, gin.H{"error": "User does not have access to this tenant"})
				return
			}
		}

		// Update user's tenant
		updatedUser, err := models.UpdateUser(db, userID, models.UpdateUserInput{
			TenantID: &input.TenantID,
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating user: " + err.Error()})
			return
		}

		// Get roles for new tenant
		roles, err := models.GetUserRoles(db, userID, &input.TenantID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting roles: " + err.Error()})
			return
		}

		// Create role names array
		roleNames := make([]string, len(roles))
		for i, role := range roles {
			roleNames[i] = role.Name
		}

		// Generate new JWT token
		token, err := middleware.GenerateJWT(
			updatedUser.ID,
			updatedUser.Username,
			updatedUser.Email,
			updatedUser.DisplayName,
			updatedUser.TenantID,
			updatedUser.IsSuperAdmin,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generating token: " + err.Error()})
			return
		}

		// Return response
		c.JSON(http.StatusOK, gin.H{
			"user":   updatedUser,
			"tenant": tenant,
			"roles":  roleNames,
			"token":  token,
		})
	}
}

// SeedDemoUser creates a demo user for testing
func SeedDemoUser(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Create default tenant if it doesn't exist
		var tenant *models.Tenant
		tenant, err := models.GetTenantByName(db, "default")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error checking tenant: " + err.Error()})
			return
		}

		if tenant == nil {
			tenant, err = models.CreateTenant(db, models.CreateTenantInput{
				Name:        "default",
				DisplayName: "Default Tenant",
				Description: "Default tenant for system users",
			})
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating tenant: " + err.Error()})
				return
			}
		}

		// Check if user already exists
		existingUser, err := models.GetUserByUsername(db, "demouser")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error checking user: " + err.Error()})
			return
		}

		var user *models.User
		if existingUser != nil {
			user = existingUser
		} else {
			// Create demo user
			user, err = models.CreateUser(db, models.CreateUserInput{
				Username:    "demouser",
				Password:    "demouser",
				Email:       "demo@example.com",
				DisplayName: "Demo User",
				TenantID:    tenant.ID,
				IsActive:    true,
				IsSuperAdmin: false,
			})
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating user: " + err.Error()})
				return
			}

			// Create user role if it doesn't exist
			var role *models.Role
			role, err = models.GetRoleByName(db, "user", &tenant.ID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error checking role: " + err.Error()})
				return
			}

			if role == nil {
				role, err = models.CreateRole(db, models.CreateRoleInput{
					Name:        "user",
					DisplayName: "User",
					Description: "Regular user with basic permissions",
					TenantID:    tenant.ID,
				})
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating role: " + err.Error()})
					return
				}
			}

			// Assign role to user
			_, err = models.AssignRoleToUser(db, models.CreateUserRoleInput{
				UserID:   user.ID,
				RoleID:   role.ID,
				TenantID: tenant.ID,
			})
			if err != nil {
				log.Printf("Error assigning role to user: %v", err)
			}
		}

		// Update last login
		err = models.UpdateUserLastLogin(db, user.ID)
		if err != nil {
			log.Printf("Error updating last login: %v", err)
		}

		// Get roles
		roles, err := models.GetUserRoles(db, user.ID, &user.TenantID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting roles: " + err.Error()})
			return
		}

		// Create role names array
		roleNames := make([]string, len(roles))
		for i, role := range roles {
			roleNames[i] = role.Name
		}

		// Generate JWT token
		token, err := middleware.GenerateJWT(
			user.ID,
			user.Username,
			user.Email,
			user.DisplayName,
			user.TenantID,
			user.IsSuperAdmin,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generating token: " + err.Error()})
			return
		}

		// Return response
		c.JSON(http.StatusOK, gin.H{
			"user": map[string]interface{}{
				"id":           user.ID,
				"username":     user.Username,
				"email":        user.Email,
				"displayName":  user.DisplayName,
				"avatar":       user.Avatar,
				"tenantId":     user.TenantID,
				"isActive":     user.IsActive,
				"isSuperAdmin": user.IsSuperAdmin,
				"lastLogin":    time.Now(),
				"createdAt":    user.CreatedAt,
				"updatedAt":    user.UpdatedAt,
			},
			"tenant": tenant,
			"roles":  roleNames,
			"token":  token,
		})
	}
}