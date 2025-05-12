package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"go-server/middleware"
	"go-server/models"
)

// GetTenants gets all tenants
func GetTenants(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get tenants
		tenants, err := models.GetAllTenants(db)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get tenants: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"tenants": tenants})
	}
}

// GetTenant gets a tenant by ID
func GetTenant(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get tenant ID from path
		idStr := c.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID"})
			return
		}

		// Get tenant
		tenant, err := models.GetTenantByID(db, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get tenant: " + err.Error()})
			return
		}
		if tenant == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Tenant not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"tenant": tenant})
	}
}

// CreateTenant creates a new tenant
func CreateTenant(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if user has permission
		isSuperAdmin, exists := c.Get("isSuperAdmin")
		if !exists || !isSuperAdmin.(bool) {
			userID, _ := middleware.GetUserIDFromContext(c)
			if !middleware.CheckPermissionForRequest(c, userID, "tenants", "create", db) {
				c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
				return
			}
		}

		// Parse request
		var input models.CreateTenantInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Check if tenant name already exists
		existingTenant, err := models.GetTenantByName(db, input.Name)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check tenant name: " + err.Error()})
			return
		}
		if existingTenant != nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Tenant name already exists"})
			return
		}

		// Create tenant
		tenant, err := models.CreateTenant(db, input)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create tenant: " + err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"tenant": tenant})
	}
}

// UpdateTenant updates a tenant
func UpdateTenant(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get tenant ID from path
		idStr := c.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID"})
			return
		}

		// Check if tenant exists
		tenant, err := models.GetTenantByID(db, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get tenant: " + err.Error()})
			return
		}
		if tenant == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Tenant not found"})
			return
		}

		// Parse request
		var input models.UpdateTenantInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Check if tenant name is being changed and already exists
		if input.Name != nil && *input.Name != tenant.Name {
			existingTenant, err := models.GetTenantByName(db, *input.Name)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check tenant name: " + err.Error()})
				return
			}
			if existingTenant != nil {
				c.JSON(http.StatusConflict, gin.H{"error": "Tenant name already exists"})
				return
			}
		}

		// Update tenant
		updatedTenant, err := models.UpdateTenant(db, id, input)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update tenant: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"tenant": updatedTenant})
	}
}

// DeleteTenant deletes a tenant
func DeleteTenant(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get tenant ID from path
		idStr := c.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID"})
			return
		}

		// Check if tenant exists
		tenant, err := models.GetTenantByID(db, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get tenant: " + err.Error()})
			return
		}
		if tenant == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Tenant not found"})
			return
		}

		// Delete tenant
		err = models.DeleteTenant(db, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete tenant: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Tenant deleted successfully"})
	}
}

// GetTenantUserCounts gets the number of users for each tenant
func GetTenantUserCounts(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user counts
		counts, err := models.GetTenantUserCounts(db)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user counts: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"counts": counts})
	}
}