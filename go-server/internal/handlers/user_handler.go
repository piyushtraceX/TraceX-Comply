package handlers

import (
	"net/http"
	"strconv"

	"github.com/eudrcomply/api/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// UserHandler handles user-related requests
type UserHandler struct {
	db *gorm.DB
}

// NewUserHandler creates a new UserHandler
func NewUserHandler(db *gorm.DB) *UserHandler {
	return &UserHandler{db: db}
}

// List returns all users
func (h *UserHandler) List(c *gin.Context) {
	// In a real implementation, we would fetch users from the database
	// and filter by tenant if specified
	
	// For development, return mock users
	users := []gin.H{
		{
			"id":          1,
			"username":    "admin",
			"name":        "Admin User",
			"email":       "admin@example.com",
			"tenantId":    1,
			"isSuperAdmin": true,
			"createdAt":   "2025-01-01T00:00:00Z",
			"updatedAt":   "2025-01-01T00:00:00Z",
		},
		{
			"id":          2,
			"username":    "user",
			"name":        "Regular User",
			"email":       "user@example.com",
			"tenantId":    1,
			"isSuperAdmin": false,
			"createdAt":   "2025-01-01T00:00:00Z",
			"updatedAt":   "2025-01-01T00:00:00Z",
		},
	}

	c.JSON(http.StatusOK, users)
}

// Get returns a user by id
func (h *UserHandler) Get(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// In a real implementation, we would fetch the user from the database
	
	// Mock users map for development
	users := map[int]gin.H{
		1: {
			"id":          1,
			"username":    "admin",
			"name":        "Admin User",
			"email":       "admin@example.com",
			"tenantId":    1,
			"isSuperAdmin": true,
			"createdAt":   "2025-01-01T00:00:00Z",
			"updatedAt":   "2025-01-01T00:00:00Z",
			"roles":       []string{"admin", "user"},
		},
		2: {
			"id":          2,
			"username":    "user",
			"name":        "Regular User",
			"email":       "user@example.com",
			"tenantId":    1,
			"isSuperAdmin": false,
			"createdAt":   "2025-01-01T00:00:00Z",
			"updatedAt":   "2025-01-01T00:00:00Z",
			"roles":       []string{"user"},
		},
	}

	user, exists := users[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// Create creates a new user
func (h *UserHandler) Create(c *gin.Context) {
	var req models.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// In a real implementation, we would:
	// 1. Check if username or email already exists
	// 2. Hash the password
	// 3. Create the user in the database
	// 4. Return the created user

	// Mock implementation
	hashedPassword, err := hashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Create the user (mock response)
	user := gin.H{
		"id":           3, // Assuming the new user gets ID 3
		"username":     req.Username,
		"name":         req.Name,
		"email":        req.Email,
		"tenantId":     req.TenantID,
		"isSuperAdmin": req.IsSuperAdmin,
		"password":     hashedPassword, // This would normally not be sent back to client
		"createdAt":    "2025-05-08T00:00:00Z",
		"updatedAt":    "2025-05-08T00:00:00Z",
	}

	c.JSON(http.StatusCreated, user)
}

// Update updates a user
func (h *UserHandler) Update(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req models.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// In a real implementation, we would:
	// 1. Check if the user exists
	// 2. Update the user in the database
	// 3. Return the updated user

	// Mock users map for development
	users := map[int]gin.H{
		1: {
			"id":          1,
			"username":    "admin",
			"name":        "Admin User",
			"email":       "admin@example.com",
			"tenantId":    1,
			"isSuperAdmin": true,
		},
		2: {
			"id":          2,
			"username":    "user",
			"name":        "Regular User",
			"email":       "user@example.com",
			"tenantId":    1,
			"isSuperAdmin": false,
		},
	}

	user, exists := users[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Update user fields
	if req.Name != "" {
		user["name"] = req.Name
	}
	if req.Email != "" {
		user["email"] = req.Email
	}
	if req.TenantID != nil {
		user["tenantId"] = req.TenantID
	}
	user["isSuperAdmin"] = req.IsSuperAdmin
	user["updatedAt"] = "2025-05-08T00:00:00Z"

	c.JSON(http.StatusOK, user)
}

// Delete deletes a user
func (h *UserHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// In a real implementation, we would:
	// 1. Check if the user exists
	// 2. Delete the user from the database (usually a soft delete)

	// Mock users map for development
	users := map[int]bool{
		1: true,
		2: true,
	}

	if _, exists := users[id]; !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Delete user
	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

// AssignRole assigns a role to a user
func (h *UserHandler) AssignRole(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req models.UserRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// In a real implementation, we would:
	// 1. Check if the user exists
	// 2. Check if the role exists
	// 3. Check if the user already has the role
	// 4. Assign the role to the user

	// Mock users map for development
	users := map[int]bool{
		1: true,
		2: true,
	}

	if _, exists := users[id]; !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Roles map for development
	roles := map[uint]bool{
		1: true, // Admin role
		2: true, // User role
	}

	if _, exists := roles[req.RoleID]; !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
		return
	}

	// Return success
	c.JSON(http.StatusOK, gin.H{
		"message": "Role assigned successfully",
		"userRole": gin.H{
			"userId":   id,
			"roleId":   req.RoleID,
			"tenantId": req.TenantID,
		},
	})
}

// RemoveRole removes a role from a user
func (h *UserHandler) RemoveRole(c *gin.Context) {
	userId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	roleId, err := strconv.Atoi(c.Param("roleId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role ID"})
		return
	}

	// In a real implementation, we would:
	// 1. Check if the user exists
	// 2. Check if the role exists
	// 3. Check if the user has the role
	// 4. Remove the role from the user

	// Mock users map for development
	users := map[int]bool{
		1: true,
		2: true,
	}

	if _, exists := users[userId]; !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Roles map for development
	roles := map[int]bool{
		1: true, // Admin role
		2: true, // User role
	}

	if _, exists := roles[roleId]; !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
		return
	}

	// Return success
	c.JSON(http.StatusOK, gin.H{
		"message": "Role removed successfully",
	})
}