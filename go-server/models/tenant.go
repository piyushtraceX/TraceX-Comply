package models

import (
	"database/sql"
	"fmt"
	"time"
)

// Tenant represents a tenant in the system
type Tenant struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	DisplayName string    `json:"displayName"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// CreateTenantInput represents the input for creating a tenant
type CreateTenantInput struct {
	Name        string `json:"name" binding:"required"`
	DisplayName string `json:"displayName" binding:"required"`
	Description string `json:"description" binding:"required"`
}

// UpdateTenantInput represents the input for updating a tenant
type UpdateTenantInput struct {
	Name        *string `json:"name"`
	DisplayName *string `json:"displayName"`
	Description *string `json:"description"`
}

// GetTenantByID gets a tenant by ID
func GetTenantByID(db *sql.DB, id int) (*Tenant, error) {
	// Query tenant
	row := db.QueryRow(`
		SELECT id, name, display_name, description, created_at, updated_at
		FROM tenants
		WHERE id = $1
	`, id)

	// Scan row into tenant
	var tenant Tenant
	err := row.Scan(
		&tenant.ID,
		&tenant.Name,
		&tenant.DisplayName,
		&tenant.Description,
		&tenant.CreatedAt,
		&tenant.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &tenant, nil
}

// GetTenantByName gets a tenant by name
func GetTenantByName(db *sql.DB, name string) (*Tenant, error) {
	// Query tenant
	row := db.QueryRow(`
		SELECT id, name, display_name, description, created_at, updated_at
		FROM tenants
		WHERE name = $1
	`, name)

	// Scan row into tenant
	var tenant Tenant
	err := row.Scan(
		&tenant.ID,
		&tenant.Name,
		&tenant.DisplayName,
		&tenant.Description,
		&tenant.CreatedAt,
		&tenant.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &tenant, nil
}

// GetAllTenants gets all tenants
func GetAllTenants(db *sql.DB) ([]Tenant, error) {
	// Query tenants
	rows, err := db.Query(`
		SELECT id, name, display_name, description, created_at, updated_at
		FROM tenants
		ORDER BY id
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Scan rows into tenants
	var tenants []Tenant
	for rows.Next() {
		var tenant Tenant
		err := rows.Scan(
			&tenant.ID,
			&tenant.Name,
			&tenant.DisplayName,
			&tenant.Description,
			&tenant.CreatedAt,
			&tenant.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		tenants = append(tenants, tenant)
	}

	return tenants, nil
}

// CreateTenant creates a new tenant
func CreateTenant(db *sql.DB, input CreateTenantInput) (*Tenant, error) {
	// Insert tenant
	var tenant Tenant
	err := db.QueryRow(`
		INSERT INTO tenants (
			name, display_name, description, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5
		) RETURNING id, name, display_name, description, created_at, updated_at
	`,
		input.Name,
		input.DisplayName,
		input.Description,
		time.Now(),
		time.Now(),
	).Scan(
		&tenant.ID,
		&tenant.Name,
		&tenant.DisplayName,
		&tenant.Description,
		&tenant.CreatedAt,
		&tenant.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &tenant, nil
}

// UpdateTenant updates a tenant
func UpdateTenant(db *sql.DB, id int, input UpdateTenantInput) (*Tenant, error) {
	// Get current tenant
	tenant, err := GetTenantByID(db, id)
	if err != nil {
		return nil, err
	}
	if tenant == nil {
		return nil, fmt.Errorf("tenant not found")
	}

	// Build query
	query := "UPDATE tenants SET updated_at = $1"
	args := []interface{}{time.Now()}
	argCount := 2

	// Add fields to update
	if input.Name != nil {
		query += fmt.Sprintf(", name = $%d", argCount)
		args = append(args, *input.Name)
		argCount++
	}
	if input.DisplayName != nil {
		query += fmt.Sprintf(", display_name = $%d", argCount)
		args = append(args, *input.DisplayName)
		argCount++
	}
	if input.Description != nil {
		query += fmt.Sprintf(", description = $%d", argCount)
		args = append(args, *input.Description)
		argCount++
	}

	// Add where clause
	query += fmt.Sprintf(" WHERE id = $%d RETURNING id, name, display_name, description, created_at, updated_at", argCount)
	args = append(args, id)

	// Execute query
	row := db.QueryRow(query, args...)
	err = row.Scan(
		&tenant.ID,
		&tenant.Name,
		&tenant.DisplayName,
		&tenant.Description,
		&tenant.CreatedAt,
		&tenant.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return tenant, nil
}

// DeleteTenant deletes a tenant
func DeleteTenant(db *sql.DB, id int) error {
	// Delete tenant
	_, err := db.Exec("DELETE FROM tenants WHERE id = $1", id)
	return err
}

// GetTenantUserCounts gets the number of users for each tenant
func GetTenantUserCounts(db *sql.DB) (map[int]int, error) {
	// Query user counts
	rows, err := db.Query(`
		SELECT tenant_id, COUNT(*) as user_count
		FROM users
		GROUP BY tenant_id
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Scan rows into map
	counts := make(map[int]int)
	for rows.Next() {
		var tenantID int
		var count int
		err := rows.Scan(&tenantID, &count)
		if err != nil {
			return nil, err
		}
		counts[tenantID] = count
	}

	return counts, nil
}