package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"eudr-comply/go-server/middleware"
	"eudr-comply/go-server/models"
)

// GetUsers gets all users
func GetUsers(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if tenant filter is provided
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

		// Get users
		users, err := models.GetAllUsers(db, tenantID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get users: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"users": users})
	}
}

// GetUser gets a user by ID
func GetUser(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from path
		idStr := c.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		// Get user
		user, err := models.GetUserByID(db, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user: " + err.Error()})
			return
		}
		if user == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"user": user})
	}
}

// CreateUser creates a new user
func CreateUser(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if user has permission
		isSuperAdmin, exists := c.Get("isSuperAdmin")
		if !exists || !isSuperAdmin.(bool) {
			userID, _ := middleware.GetUserIDFromContext(c)
			tenantID, _ := middleware.GetTenantIDFromContext(c)
			if !middleware.CheckPermissionForRequest(c, userID, "users", "create", db) {
				c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
				return
			}
		}

		// Parse request
		var input models.CreateUserInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Check if username already exists
		existingUser, err := models.GetUserByUsername(db, input.Username)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check username: " + err.Error()})
			return
		}
		if existingUser != nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
			return
		}

		// Check if tenant exists
		tenant, err := models.GetTenantByID(db, input.TenantID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check tenant: " + err.Error()})
			return
		}
		if tenant == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Tenant not found"})
			return
		}

		// Create user
		user, err := models.CreateUser(db, input)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user: " + err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"user": user})
	}
}

// UpdateUser updates a user
func UpdateUser(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from path
		idStr := c.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		// Check if user exists
		user, err := models.GetUserByID(db, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user: " + err.Error()})
			return
		}
		if user == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		// Check if user has permission
		currentUserID, _ := middleware.GetUserIDFromContext(c)
		isSuperAdmin, exists := c.Get("isSuperAdmin")
		if (id != currentUserID) && (!exists || !isSuperAdmin.(bool)) {
			if !middleware.CheckPermissionForRequest(c, currentUserID, "users", "update", db) {
				c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
				return
			}
		}

		// Parse request
		var input models.UpdateUserInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Check if username is being changed and already exists
		if input.Username != nil && *input.Username != user.Username {
			existingUser, err := models.GetUserByUsername(db, *input.Username)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check username: " + err.Error()})
				return
			}
			if existingUser != nil {
				c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
				return
			}
		}

		// Check if tenant is being changed and exists
		if input.TenantID != nil {
			tenant, err := models.GetTenantByID(db, *input.TenantID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check tenant: " + err.Error()})
				return
			}
			if tenant == nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Tenant not found"})
				return
			}
		}

		// Non-admin users can't make themselves admins
		if input.IsSuperAdmin != nil && *input.IsSuperAdmin && (!exists || !isSuperAdmin.(bool)) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Only admins can grant admin privileges"})
			return
		}

		// Update user
		updatedUser, err := models.UpdateUser(db, id, input)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"user": updatedUser})
	}
}

// DeleteUser deletes a user
func DeleteUser(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from path
		idStr := c.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		// Check if user exists
		user, err := models.GetUserByID(db, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user: " + err.Error()})
			return
		}
		if user == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		// Delete user
		err = models.DeleteUser(db, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
	}
}

// GetUserRoles gets all roles for a user
func GetUserRoles(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from path
		userIDStr := c.Param("userId")
		userID, err := strconv.Atoi(userIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		// Check if tenant filter is provided
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

		// Get roles
		roles, err := models.GetUserRoles(db, userID, tenantID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get roles: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"roles": roles})
	}
}

// AssignRoleToUser assigns a role to a user
func AssignRoleToUser(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if user has permission
		isSuperAdmin, exists := c.Get("isSuperAdmin")
		if !exists || !isSuperAdmin.(bool) {
			userID, _ := middleware.GetUserIDFromContext(c)
			if !middleware.CheckPermissionForRequest(c, userID, "roles", "assign", db) {
				c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
				return
			}
		}

		// Parse request
		var input models.CreateUserRoleInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Assign role
		userRole, err := models.AssignRoleToUser(db, input)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign role: " + err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"userRole": userRole})
	}
}

// RemoveRoleFromUser removes a role from a user
func RemoveRoleFromUser(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID and role ID from path
		userIDStr := c.Param("userId")
		userID, err := strconv.Atoi(userIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		roleIDStr := c.Param("roleId")
		roleID, err := strconv.Atoi(roleIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role ID"})
			return
		}

		// Check if tenant filter is provided
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

		// Remove role
		err = models.RemoveRoleFromUser(db, userID, roleID, tenantID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove role: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Role removed successfully"})
	}
}