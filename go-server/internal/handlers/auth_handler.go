package handlers

import (
	"log"
	"net/http"

	"github.com/eudrcomply/api/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/sessions"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var store = sessions.NewCookieStore([]byte("secret-key")) // Note: In production, use an environment variable for this

// AuthHandler handles authentication related requests
type AuthHandler struct {
	db *gorm.DB
}

// NewAuthHandler creates a new AuthHandler
func NewAuthHandler(db *gorm.DB) *AuthHandler {
	return &AuthHandler{db: db}
}

// Login handles user login
func (h *AuthHandler) Login(c *gin.Context) {
	var loginReq models.LoginRequest
	if err := c.ShouldBindJSON(&loginReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// For development purposes, accept any credentials
	// In production, this would validate against the database
	user := gin.H{
		"id":           1,
		"username":     loginReq.Username,
		"name":         "Demo User",
		"email":        loginReq.Username + "@example.com",
		"tenantId":     1,
		"isSuperAdmin": loginReq.Username == "admin",
	}

	// Create a new session
	session, _ := store.Get(c.Request, "session")
	session.Values["userId"] = user["id"]
	session.Values["tenantId"] = user["tenantId"]
	session.Save(c.Request, c.Writer)

	c.JSON(http.StatusOK, gin.H{"user": user})
}

// Logout handles user logout
func (h *AuthHandler) Logout(c *gin.Context) {
	session, err := store.Get(c.Request, "session")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get session"})
		return
	}

	// Clear session
	session.Values = make(map[interface{}]interface{})
	session.Options.MaxAge = -1
	err = session.Save(c.Request, c.Writer)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear session"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// GetCurrentUser returns the current authenticated user
func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
	user, _ := c.Get("user")
	tenant, _ := c.Get("tenant")

	// In a real implementation, we would fetch user roles from the database
	roles := []string{"user"}
	if user.(gin.H)["isSuperAdmin"] == true {
		roles = append(roles, "admin")
	}

	c.JSON(http.StatusOK, gin.H{
		"user":   user,
		"tenant": tenant,
		"roles":  roles,
	})
}

// SwitchTenant handles tenant switching
func (h *AuthHandler) SwitchTenant(c *gin.Context) {
	var req models.SwitchTenantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, _ := c.Get("user")
	userData := user.(gin.H)

	// For development, create demo tenants
	tenants := map[uint]gin.H{
		1: {
			"id":          uint(1),
			"name":        "Main Tenant",
			"description": "Main tenant for the organization",
		},
		2: {
			"id":          uint(2),
			"name":        "Secondary Tenant",
			"description": "Secondary tenant for testing",
		},
	}

	// Check if requested tenant exists
	tenant, exists := tenants[req.TenantID]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tenant not found"})
		return
	}

	// Super admins can access any tenant
	if userData["isSuperAdmin"] == true {
		// Update session
		session, _ := store.Get(c.Request, "session")
		session.Values["tenantId"] = tenant["id"]
		session.Save(c.Request, c.Writer)

		c.JSON(http.StatusOK, gin.H{
			"message": "Tenant switched successfully",
			"tenant":  tenant,
		})
		return
	}

	// Regular users can only access their assigned tenant
	if userData["tenantId"] != tenant["id"] {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: No access to this tenant"})
		return
	}

	// Update session
	session, _ := store.Get(c.Request, "session")
	session.Values["tenantId"] = tenant["id"]
	session.Save(c.Request, c.Writer)

	c.JSON(http.StatusOK, gin.H{
		"message": "Tenant switched successfully",
		"tenant":  tenant,
	})
}

// hashPassword hashes a password using bcrypt
func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// checkPasswordHash checks if a password matches a hash
func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}