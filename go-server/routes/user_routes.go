package routes

import (
	"database/sql"

	"github.com/gin-gonic/gin"

	"eudr-comply/go-server/handlers"
	"eudr-comply/go-server/middleware"
)

// RegisterUserRoutes registers user-related routes
func RegisterUserRoutes(router *gin.RouterGroup, db *sql.DB) {
	// User routes
	users := router.Group("/users")
	{
		users.GET("", handlers.GetUsers(db))
		users.POST("", handlers.CreateUser(db))
		users.GET("/:id", handlers.GetUser(db))
		users.PATCH("/:id", handlers.UpdateUser(db))
		users.DELETE("/:id", middleware.RequireSuperAdmin(), handlers.DeleteUser(db))
		
		// User roles routes
		users.GET("/:userId/roles", handlers.GetUserRoles(db))
	}

	// User roles routes (outside the users group for REST convention)
	router.POST("/user-roles", handlers.AssignRoleToUser(db))
	router.DELETE("/user-roles/:userId/:roleId", middleware.RequireSuperAdmin(), handlers.RemoveRoleFromUser(db))
}