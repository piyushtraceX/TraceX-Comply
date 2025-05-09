package routes

import (
	"database/sql"
	"github.com/gin-gonic/gin"
	"go-server/handlers"
	"go-server/middleware"
)

// RegisterRoleRoutes registers all role related routes
func RegisterRoleRoutes(router *gin.RouterGroup, db *sql.DB) {
	// Roles CRUD operations
	router.GET("/roles", middleware.RequirePermission("roles", "read"), handlers.ListRoles(db))
	router.GET("/roles/:id", middleware.RequirePermission("roles", "read"), handlers.GetRole(db))
	router.POST("/roles", middleware.RequirePermission("roles", "create"), handlers.CreateRole(db))
	router.PUT("/roles/:id", middleware.RequirePermission("roles", "update"), handlers.UpdateRole(db))
	router.DELETE("/roles/:id", middleware.RequirePermission("roles", "delete"), handlers.DeleteRole(db))
	
	// Role assignments
	router.POST("/user-roles", middleware.RequirePermission("roles", "assign"), handlers.AssignRoleToUser(db))
	router.DELETE("/user-roles/:userId/:roleId", middleware.RequirePermission("roles", "assign"), handlers.RemoveRoleFromUser(db))
}