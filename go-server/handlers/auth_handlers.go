package handlers

import (
	"database/sql"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go-server/middleware"
	"go-server/models"
)

// Login handles user login
func Login(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var loginRequest struct {
			Username string `json:"username" binding:"required"`
			Password string `json:"password" binding:"required"`
		}

		if err := c.ShouldBindJSON(&loginRequest); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
			return
		}

		// Get user by username
		user, err := models.GetUserByUsername(db, loginRequest.Username)
		if err != nil {
			log.Printf("Login error for user %s: %v", loginRequest.Username, err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		// Check if user is active
		if !user.IsActive {
			c.JSON(http.StatusForbidden, gin.H{"error": "User account is inactive"})
			return
		}

		// Verify password
		if !models.VerifyPassword(user.Password, loginRequest.Password) {
			log.Printf("Invalid password for user %s", loginRequest.Username)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		// Update last login time
		err = models.UpdateLastLogin(db, user.ID)
		if err != nil {
			log.Printf("Error updating last login for user %s: %v", user.Username, err)
			// Not critical, continue
		}

		// Generate token
		token, err := middleware.GenerateToken(user)
		if err != nil {
			log.Printf("Error generating token for user %s: %v", user.Username, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate authentication token"})
			return
		}

		// Get user roles
		roles, err := models.GetUserRoles(user.ID)
		if err != nil {
			log.Printf("Error getting roles for user %s: %v", user.Username, err)
			// Not critical, continue with empty roles
			roles = []models.Role{}
		}

		// Get user's tenant
		tenant, err := models.GetTenantByID(user.TenantID)
		if err != nil {
			log.Printf("Error getting tenant for user %s: %v", user.Username, err)
			// Not critical, continue with nil tenant
		}

		// Convert roles to role names for the response
		roleNames := make([]string, len(roles))
		for i, role := range roles {
			roleNames[i] = role.Name
		}

		// Return successful login response
		c.JSON(http.StatusOK, gin.H{
			"user": gin.H{
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
		var registerRequest struct {
			Username    string `json:"username" binding:"required"`
			Password    string `json:"password" binding:"required"`
			Email       string `json:"email" binding:"required,email"`
			DisplayName string `json:"displayName" binding:"required"`
			TenantID    int    `json:"tenantId"`
		}

		if err := c.ShouldBindJSON(&registerRequest); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
			return
		}

		// Check if tenant exists
		tenantID := registerRequest.TenantID
		if tenantID == 0 {
			// Use default tenant if none specified
			tenant, err := models.GetTenantByName(db, "default")
			if err != nil {
				log.Printf("Error getting default tenant: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get default tenant"})
				return
			}
			tenantID = tenant.ID
		} else {
			// Verify the tenant exists
			_, err := models.GetTenantByID(tenantID)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID"})
				return
			}
		}

		// Create the user
		user := &models.User{
			Username:     registerRequest.Username,
			Password:     registerRequest.Password,
			Email:        registerRequest.Email,
			DisplayName:  registerRequest.DisplayName,
			TenantID:     tenantID,
			IsActive:     true,
			IsSuperAdmin: false,
			LastLogin:    time.Now(),
		}

		createdUser, err := models.CreateUser(db, user)
		if err != nil {
			log.Printf("Error creating user: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Assign default user role
		userRole, err := models.GetRoleByName(db, "user", tenantID)
		if err != nil {
			log.Printf("Error getting user role: %v", err)
			// Not critical, continue
		} else {
			err = models.AssignRoleToUser(db, createdUser.ID, userRole.ID, tenantID)
			if err != nil {
				log.Printf("Error assigning user role: %v", err)
				// Not critical, continue
			}
		}

		// Generate token
		token, err := middleware.GenerateToken(createdUser)
		if err != nil {
			log.Printf("Error generating token: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate authentication token"})
			return
		}

		// Get user's tenant
		tenant, err := models.GetTenantByID(createdUser.TenantID)
		if err != nil {
			log.Printf("Error getting tenant: %v", err)
			// Not critical, continue with nil tenant
		}

		// Return successful registration response
		c.JSON(http.StatusCreated, gin.H{
			"user":   createdUser,
			"tenant": tenant,
			"roles":  []string{"user"},
			"token":  token,
		})
	}
}

// GetCurrentUser returns the authenticated user's information
func GetCurrentUser(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// User should be set by the auth middleware
		userValue, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
			return
		}

		user, ok := userValue.(*models.User)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user in context"})
			return
		}

		// Get user roles
		roles, err := models.GetUserRoles(user.ID)
		if err != nil {
			log.Printf("Error getting roles for user %s: %v", user.Username, err)
			// Not critical, continue with empty roles
			roles = []models.Role{}
		}

		// Get user's tenant
		tenant, err := models.GetTenantByID(user.TenantID)
		if err != nil {
			log.Printf("Error getting tenant for user %s: %v", user.Username, err)
			// Not critical, continue with nil tenant
		}

		// Convert roles to role names for the response
		roleNames := make([]string, len(roles))
		for i, role := range roles {
			roleNames[i] = role.Name
		}

		// Return user information
		c.JSON(http.StatusOK, gin.H{
			"user":   user,
			"tenant": tenant,
			"roles":  roleNames,
		})
	}
}

// Logout handles user logout
func Logout(c *gin.Context) {
	// In a stateless JWT system, the client is responsible for discarding the token
	// So we just return a success message
	c.JSON(http.StatusOK, gin.H{"message": "Successfully logged out"})
}

// SwitchTenant switches the user's current tenant
func SwitchTenant(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var request struct {
			TenantID int `json:"tenantId" binding:"required"`
		}

		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
			return
		}

		// User should be set by the auth middleware
		userValue, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
			return
		}

		user, ok := userValue.(*models.User)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user in context"})
			return
		}

		// Check if tenant exists
		tenant, err := models.GetTenantByID(request.TenantID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID"})
			return
		}

		// Check if user has access to this tenant
		// For simplicity in this example, we allow superadmins to switch to any tenant
		// In a real application, you would check if the user has roles in the target tenant
		if !user.IsSuperAdmin {
			// Check if user has roles in the target tenant
			roles, err := models.GetUserRolesByUserID(db, user.ID, &request.TenantID)
			if err != nil {
				log.Printf("Error checking user roles in tenant: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check user roles"})
				return
			}

			if len(roles) == 0 {
				c.JSON(http.StatusForbidden, gin.H{"error": "User does not have access to this tenant"})
				return
			}
		}

		// Generate a new token with the new tenant ID
		userCopy := *user
		userCopy.TenantID = request.TenantID
		token, err := middleware.GenerateToken(&userCopy)
		if err != nil {
			log.Printf("Error generating token: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate authentication token"})
			return
		}

		// Get roles for the new tenant
		roles, err := models.GetUserRolesByUserID(db, user.ID, &request.TenantID)
		if err != nil {
			log.Printf("Error getting roles: %v", err)
			// Not critical, continue with empty roles
			roles = []models.Role{}
		}

		// Convert roles to role names for the response
		roleNames := make([]string, len(roles))
		for i, role := range roles {
			roleNames[i] = role.Name
		}

		// Return success response
		c.JSON(http.StatusOK, gin.H{
			"user":   userCopy,
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
		var defaultTenantID int
		err := db.QueryRow(`
			SELECT id FROM tenants WHERE name = 'default'
		`).Scan(&defaultTenantID)

		if err != nil {
			if err == sql.ErrNoRows {
				// Create default tenant
				err = db.QueryRow(`
					INSERT INTO tenants (name, display_name, description, created_at, updated_at)
					VALUES ('default', 'Default Tenant', 'Default tenant for new users', $1, $2)
					RETURNING id
				`, time.Now(), time.Now()).Scan(&defaultTenantID)
				if err != nil {
					log.Printf("Error creating default tenant: %v", err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create default tenant"})
					return
				}
				log.Printf("Created default tenant with ID %d", defaultTenantID)
			} else {
				log.Printf("Error getting default tenant: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get default tenant"})
				return
			}
		}

		// Check if demo user already exists
		var existingDemoUser models.User
		err = db.QueryRow(`
			SELECT id FROM users WHERE username = 'demouser'
		`).Scan(&existingDemoUser.ID)

		if err == nil {
			// User already exists, return it
			user, err := models.GetUserByUsername(db, "demouser")
			if err != nil {
				log.Printf("Error getting demo user: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get demo user"})
				return
			}

			// Get user roles
			roles, err := models.GetUserRoles(user.ID)
			if err != nil {
				log.Printf("Error getting roles for demo user: %v", err)
				// Not critical, continue with empty roles
				roles = []models.Role{}
			}

			// Get user's tenant
			tenant, err := models.GetTenantByID(user.TenantID)
			if err != nil {
				log.Printf("Error getting tenant for demo user: %v", err)
				// Not critical, continue with nil tenant
			}

			// Convert roles to role names for the response
			roleNames := make([]string, len(roles))
			for i, role := range roles {
				roleNames[i] = role.Name
			}

			// Return existing user
			c.JSON(http.StatusOK, gin.H{
				"user":    user,
				"tenant":  tenant,
				"roles":   roleNames,
				"message": "Demo user already exists",
			})
			return
		}

		// Create admin role if it doesn't exist
		var adminRoleID int
		err = db.QueryRow(`
			SELECT id FROM roles WHERE name = 'admin' AND tenant_id = $1
		`, defaultTenantID).Scan(&adminRoleID)

		if err != nil {
			if err == sql.ErrNoRows {
				// Create admin role
				err = db.QueryRow(`
					INSERT INTO roles (name, display_name, description, tenant_id, created_at, updated_at)
					VALUES ('admin', 'Administrator', 'Full administrator role', $1, $2, $3)
					RETURNING id
				`, defaultTenantID, time.Now(), time.Now()).Scan(&adminRoleID)
				if err != nil {
					log.Printf("Error creating admin role: %v", err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create admin role"})
					return
				}
				log.Printf("Created admin role with ID %d", adminRoleID)
			} else {
				log.Printf("Error getting admin role: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get admin role"})
				return
			}
		}

		// Create user role if it doesn't exist
		var userRoleID int
		err = db.QueryRow(`
			SELECT id FROM roles WHERE name = 'user' AND tenant_id = $1
		`, defaultTenantID).Scan(&userRoleID)

		if err != nil {
			if err == sql.ErrNoRows {
				// Create user role
				err = db.QueryRow(`
					INSERT INTO roles (name, display_name, description, tenant_id, created_at, updated_at)
					VALUES ('user', 'User', 'Basic user role', $1, $2, $3)
					RETURNING id
				`, defaultTenantID, time.Now(), time.Now()).Scan(&userRoleID)
				if err != nil {
					log.Printf("Error creating user role: %v", err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user role"})
					return
				}
				log.Printf("Created user role with ID %d", userRoleID)
			} else {
				log.Printf("Error getting user role: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user role"})
				return
			}
		}

		// Create the demo user
		demoUser := &models.User{
			Username:     "demouser",
			Password:     "password",
			Email:        "demo@example.com",
			DisplayName:  "Demo User",
			TenantID:     defaultTenantID,
			IsActive:     true,
			IsSuperAdmin: true, // Set to true for testing purposes
			LastLogin:    time.Now(),
		}

		createdUser, err := models.CreateUser(db, demoUser)
		if err != nil {
			log.Printf("Error creating demo user: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create demo user"})
			return
		}

		// Assign roles to the demo user
		err = models.AssignRoleToUser(db, createdUser.ID, adminRoleID, defaultTenantID)
		if err != nil {
			log.Printf("Error assigning admin role to demo user: %v", err)
			// Not critical, continue
		}

		err = models.AssignRoleToUser(db, createdUser.ID, userRoleID, defaultTenantID)
		if err != nil {
			log.Printf("Error assigning user role to demo user: %v", err)
			// Not critical, continue
		}

		// Get user's tenant
		tenant, err := models.GetTenantByID(createdUser.TenantID)
		if err != nil {
			log.Printf("Error getting tenant for demo user: %v", err)
			// Not critical, continue with nil tenant
		}

		// Return the created user
		c.JSON(http.StatusCreated, gin.H{
			"user":    createdUser,
			"tenant":  tenant,
			"roles":   []string{"admin", "user"},
			"message": "Demo user created successfully",
		})
	}
}