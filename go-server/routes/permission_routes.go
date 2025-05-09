package routes

import (
	"database/sql"

	"github.com/gin-gonic/gin"

	"eudr-comply/go-server/handlers"
	"eudr-comply/go-server/middleware"
)

// RegisterPermissionRoutes registers permission-related routes
func RegisterPermissionRoutes(router *gin.RouterGroup, db *sql.DB) {
	// Resource routes
	router.GET("/resources", handlers.GetResources(db))
	router.POST("/resources", middleware.RequireSuperAdmin(), handlers.CreateResource(db))
	
	// Action routes
	router.GET("/actions", handlers.GetActions(db))
	router.POST("/actions", middleware.RequireSuperAdmin(), handlers.CreateAction(db))
	
	// Permission routes
	router.GET("/permissions", handlers.GetPermissions(db))
	router.POST("/permissions", handlers.CreatePermission(db))
	router.DELETE("/permissions/:id", middleware.RequireSuperAdmin(), handlers.DeletePermission(db))
}