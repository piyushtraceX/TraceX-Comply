package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"go-server/middleware"
	"go-server/models"
)

// GetRoles gets all roles
func GetRoles(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if tenant filter is provided
		tenantIDStr := c.Query("tenantId")
		var tenantID *int
		if tenantIDStr != "" {
			id, err := strconv.Atoi(tenantIDStr)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID"})
				return
			}
			tenantID = &id
		}

		// Get roles
		roles, err := models.GetAllRoles(db, tenantID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get roles: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"roles": roles})
	}
}

// GetRole gets a role by ID
func GetRole(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get role ID from path
		idStr := c.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role ID"})
			return
		}

		// Get role
		role, err := models.GetRoleByID(db, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get role: " + err.Error()})
			return
		}
		if role == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"role": role})
	}
}

// CreateRole creates a new role
func CreateRole(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if user has permission
		isSuperAdmin, exists := c.Get("isSuperAdmin")
		if !exists || !isSuperAdmin.(bool) {
			userID, _ := middleware.GetUserIDFromContext(c)
			if !middleware.CheckPermissionForRequest(c, userID, "roles", "create", db) {
				c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
				return
			}
		}

		// Parse request
		var input models.CreateRoleInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Check if role name already exists in this tenant
		existingRole, err := models.GetRoleByName(db, input.Name, &input.TenantID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check role name: " + err.Error()})
			return
		}
		if existingRole != nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Role name already exists in this tenant"})
			return
		}

		// Check if tenant exists
		tenant, err := models.GetTenantByID(db, input.TenantID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check tenant: " + err.Error()})
			return
		}
		if tenant == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Tenant not found"})
			return
		}

		// Create role
		role, err := models.CreateRole(db, input)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create role: " + err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"role": role})
	}
}

// UpdateRole updates a role
func UpdateRole(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get role ID from path
		idStr := c.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role ID"})
			return
		}

		// Check if role exists
		role, err := models.GetRoleByID(db, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get role: " + err.Error()})
			return
		}
		if role == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
			return
		}

		// Parse request
		var input models.UpdateRoleInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Check if role name is being changed and already exists in this tenant
		if input.Name != nil && *input.Name != role.Name {
			tenantID := role.TenantID
			if input.TenantID != nil {
				tenantID = *input.TenantID
			}
			existingRole, err := models.GetRoleByName(db, *input.Name, &tenantID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check role name: " + err.Error()})
				return
			}
			if existingRole != nil {
				c.JSON(http.StatusConflict, gin.H{"error": "Role name already exists in this tenant"})
				return
			}
		}

		// Check if tenant is being changed and exists
		if input.TenantID != nil {
			tenant, err := models.GetTenantByID(db, *input.TenantID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check tenant: " + err.Error()})
				return
			}
			if tenant == nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Tenant not found"})
				return
			}
		}

		// Update role
		updatedRole, err := models.UpdateRole(db, id, input)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update role: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"role": updatedRole})
	}
}

// DeleteRole deletes a role
func DeleteRole(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get role ID from path
		idStr := c.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role ID"})
			return
		}

		// Check if role exists
		role, err := models.GetRoleByID(db, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get role: " + err.Error()})
			return
		}
		if role == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
			return
		}

		// Delete role
		err = models.DeleteRole(db, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete role: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Role deleted successfully"})
	}
}