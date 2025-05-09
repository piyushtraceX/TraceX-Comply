package models

import (
	"database/sql"
	"errors"
	"time"

	"github.com/lib/pq"
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

// CreateTenant creates a new tenant in the database
func CreateTenant(db *sql.DB, tenant *Tenant) (*Tenant, error) {
	// Set defaults
	now := time.Now()
	tenant.CreatedAt = now
	tenant.UpdatedAt = now

	// Insert the tenant into the database
	query := `
		INSERT INTO tenants (name, display_name, description, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`
	err := db.QueryRow(
		query,
		tenant.Name,
		tenant.DisplayName,
		tenant.Description,
		tenant.CreatedAt,
		tenant.UpdatedAt,
	).Scan(&tenant.ID)

	if err != nil {
		// Check for unique constraint violation
		if pqErr, ok := err.(*pq.Error); ok {
			if pqErr.Code == "23505" { // unique_violation
				return nil, errors.New("tenant name already exists")
			}
		}
		return nil, err
	}

	return tenant, nil
}

// GetTenantByID retrieves a tenant by its ID
func GetTenantByID(id int) (*Tenant, error) {
	// TODO: Implement database access
	// This is a placeholder for demonstration
	if id == 1 {
		return &Tenant{
			ID:          1,
			Name:        "default",
			DisplayName: "Default Tenant",
			Description: "Default tenant for system users",
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}, nil
	}
	return nil, errors.New("tenant not found")
}

// GetTenantByName retrieves a tenant by its name
func GetTenantByName(db *sql.DB, name string) (*Tenant, error) {
	query := `
		SELECT id, name, display_name, description, created_at, updated_at
		FROM tenants
		WHERE name = $1
	`
	var tenant Tenant

	err := db.QueryRow(query, name).Scan(
		&tenant.ID,
		&tenant.Name,
		&tenant.DisplayName,
		&tenant.Description,
		&tenant.CreatedAt,
		&tenant.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("tenant not found")
		}
		return nil, err
	}

	return &tenant, nil
}

// ListTenants retrieves all tenants
func ListTenants(db *sql.DB) ([]Tenant, error) {
	query := `
		SELECT id, name, display_name, description, created_at, updated_at
		FROM tenants
		ORDER BY id
	`
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

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

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return tenants, nil
}

// UpdateTenant updates a tenant in the database
func UpdateTenant(db *sql.DB, tenant *Tenant) (*Tenant, error) {
	// Update timestamp
	tenant.UpdatedAt = time.Now()

	// Update the tenant in the database
	query := `
		UPDATE tenants
		SET name = $1, display_name = $2, description = $3, updated_at = $4
		WHERE id = $5
		RETURNING id
	`
	err := db.QueryRow(
		query,
		tenant.Name,
		tenant.DisplayName,
		tenant.Description,
		tenant.UpdatedAt,
		tenant.ID,
	).Scan(&tenant.ID)

	if err != nil {
		// Check for unique constraint violation
		if pqErr, ok := err.(*pq.Error); ok {
			if pqErr.Code == "23505" { // unique_violation
				return nil, errors.New("tenant name already exists")
			}
		}
		return nil, err
	}

	return tenant, nil
}

// DeleteTenant deletes a tenant from the database
func DeleteTenant(db *sql.DB, id int) error {
	// Check if the tenant has users
	var userCount int
	countQuery := `SELECT COUNT(*) FROM users WHERE tenant_id = $1`
	err := db.QueryRow(countQuery, id).Scan(&userCount)
	if err != nil {
		return err
	}
	
	if userCount > 0 {
		return errors.New("cannot delete tenant with associated users")
	}

	// Delete the tenant
	query := `DELETE FROM tenants WHERE id = $1`
	result, err := db.Exec(query, id)
	if err != nil {
		return err
	}

	// Check if any rows were affected
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	
	if rowsAffected == 0 {
		return errors.New("tenant not found")
	}

	return nil
}

// GetTenantUserCount gets the count of users in a tenant
func GetTenantUserCount(db *sql.DB, tenantID int) (int, error) {
	query := `SELECT COUNT(*) FROM users WHERE tenant_id = $1`
	var count int
	err := db.QueryRow(query, tenantID).Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}

// GetTenantUserCounts gets the count of users for all tenants
func GetTenantUserCounts(db *sql.DB) (map[int]int, error) {
	query := `
		SELECT tenant_id, COUNT(*) as user_count
		FROM users
		GROUP BY tenant_id
	`
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	counts := make(map[int]int)
	for rows.Next() {
		var tenantID, count int
		err := rows.Scan(&tenantID, &count)
		if err != nil {
			return nil, err
		}
		counts[tenantID] = count
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return counts, nil
}