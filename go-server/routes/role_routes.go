package routes

import (
	"database/sql"

	"github.com/gin-gonic/gin"

	"eudr-comply/go-server/handlers"
	"eudr-comply/go-server/middleware"
)

// RegisterRoleRoutes registers role-related routes
func RegisterRoleRoutes(router *gin.RouterGroup, db *sql.DB) {
	// Role routes
	roles := router.Group("/roles")
	{
		roles.GET("", handlers.GetRoles(db))
		roles.POST("", handlers.CreateRole(db))
		roles.GET("/:id", handlers.GetRole(db))
		roles.PATCH("/:id", middleware.RequireSuperAdmin(), handlers.UpdateRole(db))
		roles.DELETE("/:id", middleware.RequireSuperAdmin(), handlers.DeleteRole(db))
	}
}