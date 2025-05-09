package handlers

import (
	"database/sql"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go-server/models"
	"go-server/middleware"
)

// ListUsers returns a list of all users
func ListUsers(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get tenant query parameter
		tenantIDStr := c.Query("tenantId")
		var tenantID *int
		if tenantIDStr != "" {
			id, err := strconv.Atoi(tenantIDStr)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID"})
				return
			}
			tenantID = &id
		}

		// Get users from database
		users, err := models.GetUsers(db, tenantID)
		if err != nil {
			log.Printf("Error getting users: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting users"})
			return
		}

		// Return users
		c.JSON(http.StatusOK, users)
	}
}

// GetUser returns a single user by ID
func GetUser(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from path parameter
		userID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		// Get user from database
		user, err := models.GetUserByID(userID)
		if err != nil {
			log.Printf("Error getting user: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting user"})
			return
		}

		// Return user
		c.JSON(http.StatusOK, user)
	}
}

// CreateUser creates a new user
func CreateUser(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Parse request body
		var user models.User
		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Validate required fields
		if user.Username == "" || user.Password == "" || user.Email == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username, password, and email are required"})
			return
		}

		// Check if username already exists
		existingUser, err := models.GetUserByUsername(user.Username)
		if err == nil && existingUser != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username already exists"})
			return
		}

		// Create user
		createdUser, err := models.CreateUser(db, &user)
		if err != nil {
			log.Printf("Error creating user: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating user"})
			return
		}

		// Return created user
		c.JSON(http.StatusCreated, createdUser)
	}
}

// UpdateUser updates an existing user
func UpdateUser(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from path parameter
		userID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		// Get current user from context
		currentUser, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}
		currentUserObj := currentUser.(*models.User)

		// Only allow users to update their own account or super admins to update any account
		if currentUserObj.ID != userID && !currentUserObj.IsSuperAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "You can only update your own account"})
			return
		}

		// Parse request body
		var updateData models.User
		if err := c.ShouldBindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Get existing user
		existingUser, err := models.GetUserByID(userID)
		if err != nil {
			log.Printf("Error getting user: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting user"})
			return
		}
		if existingUser == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		// Non-super admins cannot change their own super admin status
		if !currentUserObj.IsSuperAdmin && currentUserObj.ID == userID && updateData.IsSuperAdmin != existingUser.IsSuperAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "You cannot change your own admin status"})
			return
		}

		// Update user
		updatedUser, err := models.UpdateUser(db, userID, &updateData)
		if err != nil {
			log.Printf("Error updating user: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating user"})
			return
		}

		// Return updated user
		c.JSON(http.StatusOK, updatedUser)
	}
}

// DeleteUser deletes a user
func DeleteUser(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from path parameter
		userID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		// Get current user from context
		currentUser, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}
		currentUserObj := currentUser.(*models.User)

		// Only allow super admins to delete users and prevent self-deletion
		if !currentUserObj.IsSuperAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Only administrators can delete users"})
			return
		}

		if currentUserObj.ID == userID {
			c.JSON(http.StatusForbidden, gin.H{"error": "You cannot delete your own account"})
			return
		}

		// Delete user
		err = models.DeleteUser(db, userID)
		if err != nil {
			log.Printf("Error deleting user: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting user"})
			return
		}

		// Return success
		c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
	}
}

// GetCurrentUser returns the currently authenticated user
func GetCurrentUser(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user from context (set by AuthRequired middleware)
		userValue, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		user, ok := userValue.(*models.User)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user in context"})
			return
		}

		// Get tenant from context
		tenantValue, exists := c.Get("tenant")
		tenant, ok := tenantValue.(*models.Tenant)
		
		// Get user roles
		roles, err := models.GetUserRoles(user.ID)
		if err != nil {
			log.Printf("Error getting user roles: %v", err)
			// Not fatal, just log it
		}

		// Map roles to role names
		roleNames := make([]string, 0, len(roles))
		for _, role := range roles {
			roleNames = append(roleNames, role.Name)
		}

		// Build response
		response := gin.H{
			"user":  user,
			"roles": roleNames,
		}

		if exists && ok && tenant != nil {
			response["tenant"] = tenant
		}

		// Return user
		c.JSON(http.StatusOK, response)
	}
}

// Logout logs out the current user
func Logout(c *gin.Context) {
	// Not much to do for token-based auth, just return success
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// SwitchTenant switches the current user's tenant
func SwitchTenant(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user from context
		userValue, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		user, ok := userValue.(*models.User)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user in context"})
			return
		}

		// Parse request body
		var requestBody struct {
			TenantID int `json:"tenantId" binding:"required"`
		}
		if err := c.ShouldBindJSON(&requestBody); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Validate tenant exists
		tenant, err := models.GetTenantByID(requestBody.TenantID)
		if err != nil {
			log.Printf("Error getting tenant: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting tenant"})
			return
		}
		if tenant == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Tenant not found"})
			return
		}

		// Check if user belongs to tenant
		if user.TenantID != tenant.ID && !user.IsSuperAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "You do not belong to this tenant"})
			return
		}

		// Update user's tenant
		updateData := models.User{
			TenantID: tenant.ID,
		}
		updatedUser, err := models.UpdateUser(db, user.ID, &updateData)
		if err != nil {
			log.Printf("Error updating user tenant: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating user tenant"})
			return
		}

		// Generate new token with updated tenant
		token, err := middleware.GenerateToken(updatedUser)
		if err != nil {
			log.Printf("Error generating token: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generating token"})
			return
		}

		// Get user roles
		roles, err := models.GetUserRoles(updatedUser.ID)
		if err != nil {
			log.Printf("Error getting user roles: %v", err)
			// Not fatal, just log it
		}

		// Map roles to role names
		roleNames := make([]string, 0, len(roles))
		for _, role := range roles {
			roleNames = append(roleNames, role.Name)
		}

		// Return success
		c.JSON(http.StatusOK, gin.H{
			"message": "Tenant switched successfully",
			"user":    updatedUser,
			"tenant":  tenant,
			"roles":   roleNames,
			"token":   token,
		})
	}
}

// GetUserRoles returns the roles for a user
func GetUserRoles(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from path parameter
		userID, err := strconv.Atoi(c.Param("userId"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		// Get tenant query parameter
		tenantIDStr := c.Query("tenantId")
		var tenantID *int
		if tenantIDStr != "" {
			id, err := strconv.Atoi(tenantIDStr)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID"})
				return
			}
			tenantID = &id
		}

		// Get user roles
		roles, err := models.GetUserRoles(userID)
		if err != nil {
			log.Printf("Error getting user roles: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting user roles"})
			return
		}

		// Filter roles by tenant if specified
		if tenantID != nil {
			filteredRoles := make([]*models.Role, 0)
			for _, role := range roles {
				if role.TenantID == *tenantID {
					filteredRoles = append(filteredRoles, role)
				}
			}
			roles = filteredRoles
		}

		// Return roles
		c.JSON(http.StatusOK, roles)
	}
}