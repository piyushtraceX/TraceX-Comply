package routes

import (
	"database/sql"
	"github.com/gin-gonic/gin"
	"go-server/handlers"
	"go-server/middleware"
)

// RegisterUserRoutes registers all user related routes
func RegisterUserRoutes(router *gin.RouterGroup, db *sql.DB) {
	// All routes here already require authentication from the middleware set in main.go
	
	// Add routes for user management
	router.GET("/auth/me", handlers.GetCurrentUser(db))
	router.POST("/auth/logout", handlers.Logout)
	router.POST("/auth/switch-tenant", handlers.SwitchTenant(db))
	
	// Users CRUD operations
	router.GET("/users", middleware.RequirePermission("users", "read"), handlers.ListUsers(db))
	router.GET("/users/:id", middleware.RequirePermission("users", "read"), handlers.GetUser(db))
	router.POST("/users", middleware.RequirePermission("users", "create"), handlers.CreateUser(db))
	router.PUT("/users/:id", middleware.RequirePermission("users", "update"), handlers.UpdateUser(db))
	router.DELETE("/users/:id", middleware.RequirePermission("users", "delete"), handlers.DeleteUser(db))
	
	// User roles management
	router.GET("/users/:userId/roles", middleware.RequirePermission("users", "read"), handlers.GetUserRoles(db))
}