package models

import (
	"database/sql"
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

// CreateTenantInput represents the input for creating a new tenant
type CreateTenantInput struct {
	Name        string `json:"name" binding:"required"`
	DisplayName string `json:"displayName" binding:"required"`
	Description string `json:"description"`
}

// UpdateTenantInput represents the input for updating a tenant
type UpdateTenantInput struct {
	Name        *string `json:"name"`
	DisplayName *string `json:"displayName"`
	Description *string `json:"description"`
}

// CreateTenant creates a new tenant in the database
func CreateTenant(db *sql.DB, input CreateTenantInput) (*Tenant, error) {
	var tenant Tenant
	query := `
		INSERT INTO tenants (name, display_name, description, created_at, updated_at)
		VALUES ($1, $2, $3, NOW(), NOW())
		RETURNING id, name, display_name, description, created_at, updated_at
	`

	err := db.QueryRow(
		query,
		input.Name,
		input.DisplayName,
		input.Description,
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

// GetTenantByID gets a tenant by ID
func GetTenantByID(db *sql.DB, id int) (*Tenant, error) {
	var tenant Tenant
	query := `
		SELECT id, name, display_name, description, created_at, updated_at
		FROM tenants
		WHERE id = $1
	`

	err := db.QueryRow(query, id).Scan(
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

// GetTenantByName gets a tenant by name
func GetTenantByName(db *sql.DB, name string) (*Tenant, error) {
	var tenant Tenant
	query := `
		SELECT id, name, display_name, description, created_at, updated_at
		FROM tenants
		WHERE name = $1
	`

	err := db.QueryRow(query, name).Scan(
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

// GetAllTenants gets all tenants
func GetAllTenants(db *sql.DB) ([]Tenant, error) {
	var tenants []Tenant
	query := `
		SELECT id, name, display_name, description, created_at, updated_at
		FROM tenants
	`

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

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

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return tenants, nil
}

// GetTenantUserCount gets the count of users for each tenant
func GetTenantUserCount(db *sql.DB) (map[int]int, error) {
	counts := make(map[int]int)
	query := `
		SELECT tenant_id, COUNT(*) as count
		FROM users
		WHERE tenant_id IS NOT NULL
		GROUP BY tenant_id
	`

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var tenantID int
		var count int
		err := rows.Scan(&tenantID, &count)
		if err != nil {
			return nil, err
		}
		counts[tenantID] = count
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return counts, nil
}

// UpdateTenant updates a tenant
func UpdateTenant(db *sql.DB, id int, input UpdateTenantInput) (*Tenant, error) {
	query := `
		UPDATE tenants
		SET 
			name = COALESCE($1, name),
			display_name = COALESCE($2, display_name),
			description = COALESCE($3, description),
			updated_at = NOW()
		WHERE id = $4
		RETURNING id, name, display_name, description, created_at, updated_at
	`

	var tenant Tenant
	err := db.QueryRow(
		query,
		input.Name,
		input.DisplayName,
		input.Description,
		id,
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

// DeleteTenant deletes a tenant
func DeleteTenant(db *sql.DB, id int) error {
	query := `DELETE FROM tenants WHERE id = $1`
	_, err := db.Exec(query, id)
	return err
}