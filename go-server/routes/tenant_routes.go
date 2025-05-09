package routes

import (
	"database/sql"

	"github.com/gin-gonic/gin"

	"eudr-comply/go-server/handlers"
	"eudr-comply/go-server/middleware"
)

// RegisterTenantRoutes registers tenant-related routes
func RegisterTenantRoutes(router *gin.RouterGroup, db *sql.DB) {
	// Tenant routes
	tenants := router.Group("/tenants")
	{
		tenants.GET("", handlers.GetTenants(db))
		tenants.POST("", handlers.CreateTenant(db))
		tenants.GET("/:id", handlers.GetTenant(db))
		tenants.PATCH("/:id", middleware.RequireSuperAdmin(), handlers.UpdateTenant(db))
		tenants.DELETE("/:id", middleware.RequireSuperAdmin(), handlers.DeleteTenant(db))
		
		// Tenant user counts
		tenants.GET("/user-counts", middleware.RequireSuperAdmin(), handlers.GetTenantUserCounts(db))
	}
}