package routes

import (
	"database/sql"
	"github.com/gin-gonic/gin"
	"go-server/handlers"
	"go-server/middleware"
)

// RegisterTenantRoutes registers all tenant related routes
func RegisterTenantRoutes(router *gin.RouterGroup, db *sql.DB) {
	// Tenants CRUD operations
	router.GET("/tenants", middleware.RequirePermission("tenants", "read"), handlers.ListTenants(db))
	router.GET("/tenants/:id", middleware.RequirePermission("tenants", "read"), handlers.GetTenant(db))
	router.POST("/tenants", middleware.RequirePermission("tenants", "create"), handlers.CreateTenant(db))
	router.PUT("/tenants/:id", middleware.RequirePermission("tenants", "update"), handlers.UpdateTenant(db))
	router.DELETE("/tenants/:id", middleware.RequirePermission("tenants", "delete"), handlers.DeleteTenant(db))
	
	// Additional tenant routes
	router.GET("/tenants/user-counts", middleware.RequirePermission("tenants", "read"), handlers.GetTenantUserCounts(db))
}