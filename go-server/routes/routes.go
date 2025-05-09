package routes

import (
	"database/sql"

	"github.com/gin-gonic/gin"
)

// RegisterAllRoutes registers all API routes
func RegisterAllRoutes(router *gin.RouterGroup, db *sql.DB) {
	// Register authentication routes
	RegisterAuthRoutes(router, db)
	
	// Register user routes
	RegisterUserRoutes(router, db)
	
	// Register role routes
	RegisterRoleRoutes(router, db)
	
	// Register tenant routes
	RegisterTenantRoutes(router, db)
	
	// Register permission routes
	RegisterPermissionRoutes(router, db)
}