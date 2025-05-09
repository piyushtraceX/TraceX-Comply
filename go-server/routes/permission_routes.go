package routes

import (
	"database/sql"
	"github.com/gin-gonic/gin"
	"go-server/handlers"
	"go-server/middleware"
)

// RegisterPermissionRoutes registers all permission related routes
func RegisterPermissionRoutes(router *gin.RouterGroup, db *sql.DB) {
	// Resources
	router.GET("/resources", middleware.RequirePermission("resources", "read"), handlers.ListResources(db))
	router.POST("/resources", middleware.RequirePermission("resources", "create"), handlers.CreateResource(db))
	
	// Actions
	router.GET("/actions", middleware.RequirePermission("actions", "read"), handlers.ListActions(db))
	router.POST("/actions", middleware.RequirePermission("actions", "create"), handlers.CreateAction(db))
	
	// Permissions
	router.GET("/permissions", middleware.RequirePermission("permissions", "read"), handlers.ListPermissions(db))
	router.POST("/permissions", middleware.RequirePermission("permissions", "create"), handlers.CreatePermission(db))
	router.DELETE("/permissions/:id", middleware.RequirePermission("permissions", "delete"), handlers.DeletePermission(db))
}