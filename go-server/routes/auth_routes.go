package routes

import (
	"database/sql"

	"github.com/gin-gonic/gin"

	"eudr-comply/go-server/handlers"
)

// RegisterAuthRoutes registers authentication-related routes
func RegisterAuthRoutes(router *gin.RouterGroup, db *sql.DB) {
	// Authentication routes
	auth := router.Group("/auth")
	{
		auth.POST("/login", handlers.Login(db))
		auth.POST("/register", handlers.Register(db))
		auth.POST("/seed-demo-user", handlers.SeedDemoUser(db))
		
		// The following routes require authentication
		auth.GET("/me", handlers.GetCurrentUser(db))
		auth.POST("/logout", handlers.Logout)
		auth.POST("/switch-tenant", handlers.SwitchTenant(db))
	}
}