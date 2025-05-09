package routes

import (
	"database/sql"

	"github.com/gin-gonic/gin"
)

// RegisterAuthRoutes registers all authentication related routes
func RegisterAuthRoutes(router *gin.RouterGroup, db *sql.DB) {
	// No need to add auth middlewares to these routes as they're for authentication
	
	// Keep the existing auth endpoints that are defined in main.go
	// These are:
	// POST /auth/login
	// POST /auth/register
	// GET /auth/me
	// POST /auth/logout
	// POST /auth/switch-tenant
	// POST /auth/seed-demo-user
	
	// We'll implement additional auth endpoints here if needed
}